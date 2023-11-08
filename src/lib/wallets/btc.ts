import Decimal from 'decimal.js'
import { Psbt, Transaction } from 'bitcoinjs-lib'
import { getBtcNetwork, getNetwork } from '../network'
import { type Utxo, fetchBtcUtxos } from '@/queries/utxos'
import { createPayment, deriveAddress, deriveBtcPrivateKey, derivePublicKey } from '../bip32-deriver'
import { Account, getAccount, getCurrentAccount, getAddressType, getAddress, getSigner } from '@/lib/account'
import { raise } from '../helpers'
import { fetchBtcTxHex, broadcastBTCTx } from '@/queries/transaction'
import { getTweakedPrivateKey, getXOnlyPublicKey, calcFee, sumOrNaN, DUST_UTXO_VALUE } from '../btc-util'

export class BtcWallet {
  private account?: Account = undefined

  constructor() {}

  static async create() {
    const wallet = new BtcWallet()

    wallet.account = (await getCurrentAccount()) ?? raise('No account found')

    return wallet
  }

  // send method
  public async send(recipient: string, amount: number) {
    if (!this.account) throw new Error('no account')

    const btcNetwork = await getBtcNetwork()
    const tweakedSigner = await getTweakedPrivateKey()
    console.log({ btcNetwork })

    let sendPsbt = new Psbt({ network: btcNetwork }).addOutput({
      value: amount,
      address: recipient,
    })

    sendPsbt = await this.pay(sendPsbt)

    sendPsbt.signInput(0, tweakedSigner).finalizeAllInputs()

    console.log('send psbt', sendPsbt)
  }

  async pay(psbt: Psbt) {
    if (!this.account) throw new Error('no account')

    const network = await getNetwork()
    const address = network === 'testnet' ? this.account.btc.testnetAddress : this.account.btc.mainnetAddress
    const utxos = await fetchBtcUtxos(address)
    const biggestUtxo = utxos.reduce((acc, utxo) => (utxo.satoshi > acc.satoshi ? utxo : acc))
    const rawTx = await fetchBtcTxHex(biggestUtxo.txid)
    const tx = Transaction.fromHex(rawTx)
    const xOnlyPublicKey = await getXOnlyPublicKey()

    const payInput = {
      hash: biggestUtxo.txid,
      index: biggestUtxo.outputIndex,
      witnessUtxo: tx.outs[biggestUtxo.outputIndex],
      tapInternalKey: xOnlyPublicKey,
    }

    psbt.addInput(payInput)

    // add change output
    const feeb = 10 // TODO: get feeb dynamically
    let fee = calcFee(psbt, feeb)
    const totalOutput = sumOrNaN(psbt.txOutputs)
    const totalInput = sumOrNaN(psbt.data.inputs.map((input) => input.witnessUtxo!))
    const changeValue = totalInput - totalOutput - fee

    if (changeValue < 0) {
      throw new Error('Insufficient balance')
    }

    if (changeValue >= DUST_UTXO_VALUE) {
      psbt.addOutput({
        address,
        value: changeValue,
      })
    } else {
      fee += changeValue
    }

    return psbt
  }

  async sendBRC(recipient: string, brcUtxos: Utxo[]) {
    const amount = brcUtxos.reduce((total, utxo) => total.add(utxo.satoshi), new Decimal(0))
    // TODO put this logic in `account.ts`
    if (!this.account) throw new Error('no account')
    const btcNetwork = await getBtcNetwork()
    let psbt = new Psbt({ network: btcNetwork })
    const address = await getAddress('btc')
    const addressType = await getAddressType('btc')
    const payment = await createPayment(addressType)
    const utxos = await fetchBtcUtxos(address)

    const buildPsbt = async (selectedUtxos: Utxo[], amount = 1) => {
      psbt = new Psbt({ network: btcNetwork })

      for (const utxo of brcUtxos) {
        const rawTx = await fetchBtcTxHex(utxo.txid)
        const tx = Transaction.fromHex(rawTx)

        const payInput: any = {
          hash: utxo.txid,
          index: utxo.outputIndex,
        }

        if (['P2SH-P2WPKH', 'P2WPKH'].includes(addressType)) {
          payInput['witnessUtxo'] = getWitnessUtxo(tx.outs[utxo.outputIndex])
        }

        if (['P2TR'].includes(addressType)) {
          payInput['tapInternalKey'] = await getXOnlyPublicKey()
          payInput['witnessUtxo'] = { value: amount, script: payment.output }
        }

        if (['P2PKH'].includes(addressType)) {
          payInput['nonWitnessUtxo'] = Buffer.from(rawTx)
        }

        // redeemScript
        if (['P2SH-P2WPKH'].includes(addressType)) {
          payInput['redeemScript'] = payment.redeem?.output
        }

        psbt.addInput(payInput)
        psbt.addOutput({
          value: utxo.satoshi,
          address: recipient,
        })
      }

      for (const utxo of selectedUtxos) {
        const rawTx = await fetchBtcTxHex(utxo.txid)
        const tx = Transaction.fromHex(rawTx)

        const payInput: any = {
          hash: utxo.txid,
          index: utxo.outputIndex,
        }

        if (['P2SH-P2WPKH', 'P2WPKH'].includes(addressType)) {
          payInput['witnessUtxo'] = getWitnessUtxo(tx.outs[utxo.outputIndex])
        }

        if (['P2TR'].includes(addressType)) {
          payInput['tapInternalKey'] = await getXOnlyPublicKey()
          payInput['witnessUtxo'] = { value: amount, script: payment.output }
        }

        if (['P2PKH'].includes(addressType)) {
          payInput['nonWitnessUtxo'] = Buffer.from(rawTx)
        }

        // redeemScript
        if (['P2SH-P2WPKH'].includes(addressType)) {
          payInput['redeemScript'] = payment.redeem?.output
        }

        psbt.addInput(payInput)
      }
      const signer = await getSigner('btc', addressType)
      psbt.signAllInputs(signer).finalizeAllInputs()
      return calculateFee(psbt)
    }

    let selecedtUTXOs = selectUTXOs(utxos, amount)
    let fee = await buildPsbt(selecedtUTXOs)

    while (getTotalSatoshi(selecedtUTXOs).lt(amount.add(fee))) {
      if (selecedtUTXOs.length === utxos.length) {
        throw new Error('Insufficient funds')
      }
      selecedtUTXOs = selectUTXOs(utxos, amount.add(fee))
      fee = await buildPsbt(selecedtUTXOs)
    }

    buildPsbt(selecedtUTXOs, amount.toNumber())

    // broadcast
    const tx = psbt.finalizeAllInputs().extractTransaction()
    const rawTx = tx.toHex()

    try {
      const response = await fetch('https://blockstream.info/testnet/api/tx', {
        method: 'POST',
        body: rawTx,
        headers: { 'Content-Type': 'text/plain' },
      })

      if (!response.ok) {
        throw new Error('Failed to broadcast transaction')
      }

      const txId = await response.text()
      console.log('Transaction ID:', txId)
    } catch (error) {
      console.error('Error broadcasting transaction:', error)
    }
  }

  async sendTest(recipient: string, amount: Decimal) {
    console.log({ amount })

    // TODO put this logic in `account.ts`
    if (!this.account) throw new Error('no account')
    const btcNetwork = await getBtcNetwork()
    const address = await getAddress('btc')
    const addressType = await getAddressType('btc')
    const payment = await createPayment(addressType)
    console.log({ payment })

    const utxos = await fetchBtcUtxos(address)
    utxos.sort((a, b) => b.satoshi - a.satoshi)
    console.log({ utxos })

    const total = getTotalSatoshi(utxos)
    console.log({ total })

    const buildPsbt = async (selectedUtxos: Utxo[], leave = new Decimal(1)) => {
      console.log({ selectedUtxos, leave })

      const psbt = new Psbt({ network: btcNetwork })
        .addOutput({
          value: amount.toNumber(),
          address: recipient,
        })
        .addOutput({
          value: leave.toNumber(),
          address,
        })

      for (const utxo of selectedUtxos) {
        const rawTx = await fetchBtcTxHex(utxo.txId)
        const tx = Transaction.fromHex(rawTx)

        const payInput: any = {
          hash: utxo.txId,
          index: utxo.vout,
        }

        if (['P2SH-P2WPKH', 'P2WPKH'].includes(addressType)) {
          payInput['witnessUtxo'] = getWitnessUtxo(tx.outs[utxo.vout])
        }

        if (['P2TR'].includes(addressType)) {
          payInput['tapInternalKey'] = await getXOnlyPublicKey()
          payInput['witnessUtxo'] = { value: utxo.satoshi, script: payment.output }
        }

        if (['P2PKH'].includes(addressType)) {
          payInput['nonWitnessUtxo'] = Buffer.from(rawTx)
        }

        // redeemScript
        if (['P2SH-P2WPKH'].includes(addressType)) {
          payInput['redeemScript'] = payment.redeem?.output
        }

        psbt.addInput(payInput)
      }

      const signer = await getSigner('btc', addressType)
      psbt.signAllInputs(signer).finalizeAllInputs()
      return psbt
    }

    let selecedtUTXOs = selectUTXOs(utxos, amount)
    let psbt = await buildPsbt(selecedtUTXOs)
    console.log({ psbt })

    let fee = calculateFee(psbt)
    console.log({ fee })

    while (getTotalSatoshi(selecedtUTXOs).lt(amount.add(fee))) {
      if (selecedtUTXOs.length === utxos.length) {
        throw new Error('Insufficient funds')
      }
      selecedtUTXOs = selectUTXOs(utxos, amount.add(fee))
      const psbt = await buildPsbt(selecedtUTXOs)
      fee = calculateFee(psbt)
      console.log({ fee })
    }

    psbt = await buildPsbt(selecedtUTXOs, getTotalSatoshi(selecedtUTXOs).minus(amount))

    const fee1 = calculateFee(psbt)
    console.log({ fee, fee1 })

    // broadcast
    const tx = psbt.extractTransaction()
    const rawTx = tx.toHex()

    console.log({ rawTx })

    const res = await broadcastBTCTx(rawTx)
    console.log({ res })
  }
}

const selectUTXOs = (utxos: Utxo[], targetAmount: Decimal): Utxo[] => {
  let totalAmount = new Decimal(0)
  const selectedUtxos: Utxo[] = []
  for (const utxo of utxos) {
    selectedUtxos.push(utxo)
    totalAmount = totalAmount.add(utxo.satoshi)
    console.log({ totalAmount, selectedUtxos, utxo })

    if (totalAmount.gte(targetAmount)) {
      break
    }
  }

  if (totalAmount.lt(targetAmount)) {
    throw new Error('Insufficient funds to reach the target amount')
  }

  return selectedUtxos
}

function getWitnessUtxo(out: any): any {
  delete out.address
  out.script = Buffer.from(out.script, 'hex')
  return out
}

function calculateFee(psbt: Psbt): number {
  const tx = psbt.extractTransaction()
  const size = tx.virtualSize()
  // TODO get feeb dynamically
  const feeRate = 2
  return size * feeRate
}

function getTotalSatoshi(utxos: Utxo[]): Decimal {
  return utxos.reduce((total, utxo) => total.add(utxo.satoshi), new Decimal(0))
}
