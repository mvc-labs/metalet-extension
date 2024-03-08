import Decimal from 'decimal.js'
import { BtcWallet } from '@/lib/wallets/btc'
import { getBTCTRate } from '@/queries/transaction'

interface TransferParameters {
  toAddress: string
  satoshis: string
  options?: { noBroadcast: boolean; feeRate: string | number }
}

export async function process(params: TransferParameters): Promise<{ txId: string } | { txHex: string }> {
  const wallet = await BtcWallet.create()

  let feeRate = params.options?.feeRate

  if (!feeRate) {
    const { list } = await getBTCTRate()
    feeRate = list.find((item) => item.title === 'Avg')?.feeRate
    throw Error('Request feeRate Error')
  }

  feeRate = Number(feeRate)

  if (params.options?.noBroadcast) {
    return await wallet.send(params.toAddress, new Decimal(params.satoshis), feeRate)
  }
  const { psbt } = await wallet.getFeeAndPsbt(params.toAddress, new Decimal(params.satoshis), feeRate)
  return { txHex: psbt.extractTransaction().toHex() }
}
