import Decimal from 'decimal.js'
import { raise } from '../helpers'
import { getBtcNetwork } from '../network'
import { createPayment } from '../bip32-deriver'
import { getXOnlyPublicKey } from '../btc-util'
import { commitInscribe } from '@/queries/inscribe'
import { getBtcUtxos, type UTXO } from '@/queries/utxos'
import { Payment, Psbt, Transaction } from 'bitcoinjs-lib'
import { fetchBtcTxHex, broadcastBTCTx } from '@/queries/transaction'
import { Account, getCurrentAccount, getAddressType, getAddress, getSigner } from '@/lib/account'

export class BtcWallet {
  private account?: Account = undefined

  constructor() {}

  static async create() {
    const wallet = new BtcWallet()

    wallet.account = (await getCurrentAccount()) ?? raise('No account found')

    return wallet
  }

  async sendBRC(recipient: string, utxo: UTXO, feeRate = 2) {
    const amount = getTotalSatoshi([utxo])
    if (!this.account) throw new Error('no account')
    const btcNetwork = await getBtcNetwork()
    const address = await getAddress('btc')
    const addressType = await getAddressType('btc')
    const payment = await createPayment(addressType)
    const utxos = (await getBtcUtxos(address)) || []
    if (!utxos.length) {
      throw new Error('your account currently has no available UTXO.')
    }
    utxos.sort((a, b) => b.satoshi - a.satoshi)

    const buildPsbt = async (selectedUtxos: UTXO[], change: Decimal) => {
      const psbt = new Psbt({ network: btcNetwork })

      const payInput = await createPayInput({ utxo, payment, addressType })
      psbt.addInput(payInput)
      psbt.addOutput({
        value: utxo.satoshi,
        address: recipient,
      })

      if (change.gt(546)) {
        psbt.addOutput({
          value: change.toNumber(),
          address,
        })
      }

      // for (const utxo of brcUtxos) {
      //   const payInput = await createPayInput({ utxo: utxo as any, payment, addressType })
      //   psbt.addInput(payInput)
      //   psbt.addOutput({
      //     value: utxo.satoshi,
      //     address: recipient,
      //   })
      // }

      for (const utxo of selectedUtxos) {
        const payInput = await createPayInput({ utxo, payment, addressType })
        psbt.addInput(payInput)
      }
      const signer = await getSigner('btc', addressType)
      psbt.signAllInputs(signer).finalizeAllInputs()
      return psbt
    }

    let selecedtUTXOs = [utxos[0]]
    let total = getTotalSatoshi(selecedtUTXOs)
    let psbt = await buildPsbt(selecedtUTXOs, total.minus(amount))
    let fee = calculateFee(psbt, feeRate)

    while (getTotalSatoshi(selecedtUTXOs).lt(amount.add(fee))) {
      if (selecedtUTXOs.length === utxos.length) {
        throw new Error('Insufficient funds')
      }
      selecedtUTXOs = selectUTXOs(utxos, amount.add(fee))
      total = getTotalSatoshi(selecedtUTXOs)
      const psbt = await buildPsbt(selecedtUTXOs, total.minus(amount).minus(fee))
      fee = calculateFee(psbt, feeRate)
    }

    psbt = await buildPsbt(selecedtUTXOs, total.minus(amount).minus(fee))

    const txId = await this.broadcast(psbt)
    return { txId }
  }

  async send(recipient: string, amount: number | Decimal, feeRate = 2) {
    if (typeof amount === 'number') {
      amount = new Decimal(amount)
    }
    if (!this.account) throw new Error('no account')
    const psbt = await getPsbt(recipient, amount, feeRate)
    return await this.broadcast(psbt)
  }

  async getFeeAndPsbt(recipient: string, amount: number | Decimal, feeRate = 2) {
    if (typeof amount === 'number') {
      amount = new Decimal(amount)
    }
    const psbt = await getPsbt(recipient, amount, feeRate)
    const fee = calculateFee(psbt, feeRate)
    return { fee, psbt }
  }

  async commitInscribe(orderId: string, psbt: Psbt) {
    const tx = psbt.extractTransaction()
    const rawTx = tx.toHex()
    const address = await getAddress('btc')
    return await commitInscribe(address, orderId, rawTx)
  }

  async broadcast(psbt: Psbt) {
    const tx = psbt.extractTransaction()
    console.log({ tx })

    const rawTx = tx.toHex()
    console.log({ rawTx })

    const txId = await broadcastBTCTx(rawTx)
    return { txId }
  }
}

async function getPsbt(recipient: string, amount: Decimal, feeRate: number) {
  const btcNetwork = await getBtcNetwork()
  const address = await getAddress('btc')
  const addressType = await getAddressType('btc')
  const payment = await createPayment(addressType)
  const utxos = (await getBtcUtxos(address)) || []
  utxos.sort((a, b) => b.satoshi - a.satoshi)

  const buildPsbt = async (selectedUtxos: UTXO[], change: Decimal) => {
    const psbt = new Psbt({ network: btcNetwork }).addOutput({
      value: amount.toNumber(),
      address: recipient,
    })
    if (change.gt(546)) {
      psbt.addOutput({
        value: change.toNumber(),
        address,
      })
    }

    for (const utxo of selectedUtxos) {
      const payInput = await createPayInput({ utxo, payment, addressType })
      psbt.addInput(payInput)
    }

    const signer = await getSigner('btc', addressType)
    psbt.signAllInputs(signer).finalizeAllInputs()
    return psbt
  }

  let selecedtUTXOs = selectUTXOs(utxos, amount)
  let total = getTotalSatoshi(selecedtUTXOs)
  let psbt = await buildPsbt(selecedtUTXOs, total.minus(amount))
  let fee = calculateFee(psbt, feeRate)

  while (total.lt(amount.add(fee))) {
    if (selecedtUTXOs.length === utxos.length) {
      throw new Error('Insufficient funds')
    }
    selecedtUTXOs = selectUTXOs(utxos, amount.add(fee))
    total = getTotalSatoshi(selecedtUTXOs)
    const psbt = await buildPsbt(selecedtUTXOs, total.minus(amount).minus(fee))
    fee = calculateFee(psbt, feeRate)
  }

  let change = total.minus(amount).minus(fee)
  return await buildPsbt(selecedtUTXOs, change)
}

const selectUTXOs = (utxos: UTXO[], targetAmount: Decimal): UTXO[] => {
  let totalAmount = new Decimal(0)
  const selectedUtxos: typeof utxos = []
  for (const utxo of utxos) {
    selectedUtxos.push(utxo)
    totalAmount = totalAmount.add(utxo.satoshi)

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

function calculateFee(psbt: Psbt, feeRate: number): number {
  const tx = psbt.extractTransaction()
  console.log({ tx })

  const size = tx.virtualSize()
  console.log({ size })

  return size * feeRate
}

function getTotalSatoshi(utxos: UTXO[]): Decimal {
  return utxos.reduce((total, utxo) => total.add(utxo.satoshi), new Decimal(0))
}

async function createPayInput({
  utxo,
  addressType,
  payment,
}: {
  payment: Payment
  utxo: UTXO
  addressType: string
}): Promise<any> {
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

  if (['P2SH-P2WPKH'].includes(addressType)) {
    payInput['redeemScript'] = payment.redeem?.output
  }

  return payInput
}
