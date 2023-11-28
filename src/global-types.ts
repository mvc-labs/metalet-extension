type SuccessResult = {
  status: 'success'
  txId: string
  recipient: string
  amount: number
  token: {
    symbol: string
    decimal: number
  }
}
type FailedResult = {
  status: 'failed'
  message: string
}
export type TransactionResult = SuccessResult | FailedResult
