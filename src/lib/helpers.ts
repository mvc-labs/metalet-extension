import { getNet } from './network'
import { getBrowserHost } from './host'
import { MEMPOOL_HOST, MEMPOOL_TESTNET_HOST } from '@/data/hosts'

export const raise = (msg: string) => {
  throw new Error(msg)
}

export const toMempool = async (txid: string) => {
  const net = await await getNet()
  if (net === 'testnet') {
    window.open(`${MEMPOOL_TESTNET_HOST}/tx/${txid}`, '_blank')
  }
  window.open(`${MEMPOOL_HOST}/tx/${txid}`, '_blank')
}

export const toTx = async (txid: string) => {
  const browserHost = await getBrowserHost()
  window.open(`${browserHost}/tx/${txid}`, '_blank')
}

export const generateRandomString = (length: number = 32) => {
  let randomString = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return randomString
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
