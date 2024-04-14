import { type Chain } from './lib/account'

type SuccessResult = {
  chain: Chain
  status: 'success'
  txId: string
  fromAddress: string
  toAdddress: string
  amount: number
  confirmText?: string
  token: {
    symbol: string
    decimal: number
  }
}
type FailedResult = {
  status: 'failed'
  message: string
  router?: string
  confirmText?: string
}
type WarningResult = {
  status: 'warning'
  message: string
  confirmText?: string
}
export type TransactionResult = SuccessResult | FailedResult | WarningResult
