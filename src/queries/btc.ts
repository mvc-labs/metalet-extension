import dayjs from 'dayjs'
import { ordersApi, metaletApi } from '@/queries/request'
import { BRC20_Symbol_UC } from '@/lib/asset-symbol'

export const getBTCBalance = (address: string) => {
  return ordersApi('/balance').get({ address })
}

export interface Tx {
  txid: string
  type: 'input' | 'output'
  value: number
  timeStamp: number
  time: string
}

export const getBTActivities = async (address: string): Promise<Tx[]> => {
  const transactions = (await ordersApi('/activities').get({ address })) as any
  console.log('transactions', transactions)

  const txs: Tx[] = []

  for (let tx of transactions) {
    for (let input of tx.vin) {
      if (input.prevout.scriptpubkey_address === address) {
        txs.push({
          txid: tx.txid,
          type: 'output',
          value: input.prevout.value,
          timeStamp: tx.status.block_time,
          time: dayjs(tx.status.block_time * 1000).format('YYYY/MM/DD HH:mm'),
        })
      }
    }

    for (let output of tx.vout) {
      if (output.scriptpubkey_address === address) {
        txs.push({
          txid: tx.txid,
          type: 'input',
          value: output.value,
          timeStamp: tx.status.block_time,
          time: dayjs(tx.status.block_time * 1000).format('YYYY/MM/DD HH:mm'),
        })
      }
    }
  }
  txs.sort((a, b) => b.timeStamp - a.timeStamp)
  return txs
}

export const getBTCPrice = () => {
  return ordersApi('/btc-price').get()
}

type TokenType = 'BRC20'

interface Tick {
  token: BRC20_Symbol_UC
  tokenType: TokenType
  balance: string
  availableBalance: string
  transferBalance: string
}

export const fetchBtcAsset = async (address: string): Promise<string[]> => {
  const brc20Assets = await metaletApi(`/address/brc20/asset`)
    .get({ address, chain: 'btc' })
    .then((res) => {
      return res.data.tickList.map((tick: Tick) => tick.token)
    })

  return brc20Assets
}
