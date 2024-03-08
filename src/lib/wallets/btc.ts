import Decimal from 'decimal.js'
import { raise } from '../helpers'
import { getBtcNetwork } from '../network'
import { getXOnlyPublicKey } from '../btc-util'
import { createPayment } from '../bip32-deriver'
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

  async getBRCFeeAndPsbt(recipient: string, utxo: UTXO, feeRate: number) {
    const amount = getTotalSatoshi([utxo])
    if (!this.account) throw new Error('no account')
    const btcNetwork = await getBtcNetwork()
    const address = await getAddress('btc')
    const addressType = await getAddressType('btc')
    const payment = await createPayment(addressType)
    const utxos = ((await getBtcUtxos(address)) || []).filter((btcUtxo) => btcUtxo.txId !== utxo.txId)

    if (!utxos.length) {
      throw new Error('your account currently has no available UTXO.')
    }
    utxos.sort((a, b) => b.satoshis - a.satoshis)

    const buildPsbt = async (selectedUtxos: UTXO[], change: Decimal) => {
      const psbt = new Psbt({ network: btcNetwork })

      const payInput = await createPayInput({ utxo, payment, addressType })

      psbt.addInput(payInput)
      psbt.addOutput({
        value: utxo.satoshis,
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
      const signer = await getSigner('btc')
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
    return { fee, psbt }
    // return await this.broadcast(psbt)
  }

  async merge(feeRate: number) {
    const btcNetwork = await getBtcNetwork()
    const address = await getAddress('btc')
    const addressType = await getAddressType('btc')
    const payment = await createPayment(addressType)
    const utxos = (await getBtcUtxos(address)) || []

    const buildPsbt = async (utxos: UTXO[], amount: Decimal) => {
      const psbt = new Psbt({ network: btcNetwork }).addOutput({
        value: amount.toNumber(),
        address: address,
      })

      for (const utxo of utxos) {
        try {
          const payInput = await createPayInput({ utxo, payment, addressType })
          psbt.addInput(payInput)
        } catch (e: any) {
          throw new Error(e.message)
        }
      }

      const signer = await getSigner('btc')
      psbt.signAllInputs(signer).finalizeAllInputs()
      return psbt
    }

    let total = getTotalSatoshi(utxos)

    let psbt = await buildPsbt(utxos, total.minus(546))

    let fee = calculateFee(psbt, feeRate)

    psbt = await buildPsbt(utxos, total.minus(fee))

    return await this.broadcast(psbt)
  }

  async sendBRC(recipient: string, utxo: UTXO, feeRate: number) {
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
    utxos.sort((a, b) => b.satoshis - a.satoshis)

    const buildPsbt = async (selectedUtxos: UTXO[], change: Decimal) => {
      const psbt = new Psbt({ network: btcNetwork })

      const payInput = await createPayInput({ utxo, payment, addressType })
      psbt.addInput(payInput)
      psbt.addOutput({
        value: utxo.satoshis,
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
      const signer = await getSigner('btc')
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

    return await this.broadcast(psbt)
  }

  async send(recipient: string, amount: number | Decimal, feeRate = 1) {
    if (typeof amount === 'number') {
      amount = new Decimal(amount)
    }
    if (!this.account) throw new Error('no account')
    const { psbt } = await getPsbtAndSelectUtxos(recipient, amount, feeRate)
    return await this.broadcast(psbt)
  }

  async getFeeAndPsbt(recipient: string, amount: Decimal, feeRate = 1) {
    if (typeof amount === 'number') {
      amount = new Decimal(amount)
    }
    const { psbt, selecedtUTXOs } = await getPsbtAndSelectUtxos(recipient, amount, feeRate)
    const fee = calculateFee(psbt, feeRate)
    return { fee, psbt, selecedtUTXOs }
  }

  async commitInscribe(orderId: string, psbt: Psbt) {
    const tx = psbt.extractTransaction()
    const rawTx = tx.toHex()
    const address = await getAddress('btc')
    return await commitInscribe(address, orderId, rawTx)
  }

  async broadcast(psbt: Psbt) {
    const tx = psbt.extractTransaction()

    const rawTx = tx.toHex()

    const txId = await broadcastBTCTx(rawTx)
    return { txId }
  }
}

async function getPsbtAndSelectUtxos(recipient: string, amount: Decimal, feeRate: number) {
  const btcNetwork = await getBtcNetwork()
  const address = await getAddress('btc')
  const addressType = await getAddressType('btc')
  const payment = await createPayment(addressType)
  const utxos = (await getBtcUtxos(address)) || []

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
      try {
        const payInput = await createPayInput({ utxo, payment, addressType })
        psbt.addInput(payInput)
      } catch (e: any) {
        throw new Error(e.message)
      }
    }

    const signer = await getSigner('btc')
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
  psbt = await buildPsbt(selecedtUTXOs, change)
  console.log({ selecedtUTXOs })
  return { psbt, selecedtUTXOs }
}

const selectUTXOs = (utxos: UTXO[], targetAmount: Decimal): UTXO[] => {
  let totalAmount = new Decimal(0)
  const selectedUtxos: typeof utxos = []
  for (const utxo of utxos) {
    selectedUtxos.push(utxo)
    totalAmount = totalAmount.add(utxo.satoshis)

    if (totalAmount.gte(targetAmount)) {
      break
    }
  }

  if (totalAmount.lt(targetAmount)) {
    throw new Error('Insufficient funds to reach the target amount')
  }

  return selectedUtxos
}

function calculateFee(psbt: Psbt, feeRate: number): number {
  const tx = psbt.extractTransaction()

  const size = tx.virtualSize()

  return size * feeRate
}

function getTotalSatoshi(utxos: UTXO[]): Decimal {
  return utxos.reduce((total, utxo) => total.add(utxo.satoshis), new Decimal(0))
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
  const payInput: any = {
    hash: utxo.txId,
    index: utxo.outputIndex,
  }

  if (['P2SH-P2WPKH', 'P2WPKH'].includes(addressType)) {
    payInput['witnessUtxo'] = {
      script: payment.output,
      value: utxo.satoshis,
    }
  }

  if (['P2TR'].includes(addressType)) {
    payInput['tapInternalKey'] = await getXOnlyPublicKey()
    payInput['witnessUtxo'] = { value: utxo.satoshis, script: payment.output }
  }

  if (['P2PKH'].includes(addressType)) {
    const rawTx = await fetchBtcTxHex(utxo.txId)
    const tx = Transaction.fromHex(rawTx)
    payInput['nonWitnessUtxo'] = tx.toBuffer()
  }

  if (['P2SH-P2WPKH'].includes(addressType)) {
    payInput['redeemScript'] = payment.redeem?.output
  }

  return payInput
}
