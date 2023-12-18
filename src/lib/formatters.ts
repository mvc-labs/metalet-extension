import dayjs from 'dayjs'
import Decimal from 'decimal.js'

export const prettifyTimestamp = (timestamp: number, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(timestamp).format(format)
}

export const prettifyTxId = (txId: string, useDigits = 6) => {
  return `${txId.slice(0, useDigits)}...${txId.slice(-useDigits)}`
}

export const prettifyBalance = (balance: number, symbol: string = 'SPACE'): string => {
  if (!balance) return `0 ${symbol}`

  return `${new Decimal(balance).dividedBy(1e8)} ${symbol}`
}

export const prettifyTokenBalance = (balance: number, decimal: number, useRound = false, symbol?: string): string => {
  // If useRound is true, then round the balance
  let numberPart
  if (useRound) {
    const roundedBalance = Math.round(balance / 10 ** decimal)
    if (roundedBalance === 0) {
      numberPart = '< 1'
    } else {
      numberPart = `≈ ${roundedBalance}`
    }

    return symbol ? `${numberPart} ${symbol}` : numberPart
  }

  // 小数点多于8位，则只显示约等于4位小数
  if (decimal > 8) return `≈ ${(balance / 10 ** decimal).toFixed(4)}` + (symbol ? ` ${symbol}` : '')

  // If every decimal is 0, then do not show decimal
  if (balance % 10 ** decimal === 0) return `${balance / 10 ** decimal}` + (symbol ? ` ${symbol}` : '')

  return `${(balance / 10 ** decimal).toFixed(decimal)}` + (symbol ? ` ${symbol}` : '')
}

export const prettifyTokenGenesis = (genesis: string) => {
  return `${genesis.slice(0, 6)}...${genesis.slice(-6)}`
}

export const shortestAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}
