import { SymbolUC, BRC20_SYMBOLS } from '@/lib/asset-symbol'
import { useQuery } from '@tanstack/vue-query'
import Decimal from 'decimal.js'
import { ComputedRef, Ref } from 'vue'

import { metaletApi, mvcApi } from './request'
import { type Token } from './tokens'
import { type Asset } from '@/data/assets'

export type Activity = {
  address: string
  flag: string
  time: number
  height: number
  income: number
  outcome: number
  txid: string
}
export type TokenActivity = {
  codeHash: string
  genesis: string
} & Activity
type Activities = ReadonlyArray<Activity>
type TokenActivities = ReadonlyArray<TokenActivity>

type BtcRawActivity = {
  amount: string
  from: string
  height: string
  to: string
  txId: string
  txFee: string
  transactionTime: string
}

type BRC20RawActivity = {
  txId: string
  blockHeight: string
  state: string
  tokenType: string
  actionType: string
  fromAddress: string
  toAddress: string
  amount: string
  token: string
  inscriptionId: string
  inscriptionNumber: string
  index: string
  location: string
  msg: string
  time: string
}

export const fetchBtcActivities = async (address: string): Promise<Activities> => {
  return metaletApi(`/address/activities`)
    .get({
      address,
      chain: 'btc',
    })
    .then((res) => res.data.transactionList)
    .then((activities: BtcRawActivity[]) => {
      return activities.map((activity) => {
        return {
          address: activity.from,
          flag: '',
          time: Number(activity.transactionTime),
          height: Number(activity.height),
          income: new Decimal(activity.amount).times(1e8).toNumber(),
          outcome: 0,
          txid: activity.txId,
        }
      })
    })
}


export const fetchBRC20Activities = async (address: string, symbol: SymbolUC): Promise<Activities> => {
  return metaletApi(`/address/brc20/activities`)
    .get({
      address,
      chain: 'btc',
      tick: symbol,
    })
    .then((res) => res.data.inscriptionsList)
    .then((activities: BRC20RawActivity[]) => {
      return activities.map((activity) => {
        return {
          address: activity.fromAddress,
          flag: '',
          time: Number(activity.time),
          height: Number(activity.blockHeight),
          income: activity.toAddress === address ? Number(activity.amount) : 0,
          outcome: activity.fromAddress === address ? Number(activity.amount) : 0,
          txid: activity.txId,
        }
      })
    })
}

export const fetchSpaceActivities = async (address: string): Promise<Activities> => {
  const unconfirmed: any = mvcApi(`/address/${address}/tx?confirmed=false`).get()
  const confirmed: any = mvcApi(`/address/${address}/tx?confirmed=true`).get()

  const [unconfirmedActivities, confirmedActivities] = await Promise.all([unconfirmed, confirmed])

  return [...unconfirmedActivities, ...confirmedActivities]
}

export const fetchOneActivity = async (txid: string): Promise<Activity> => {
  const activity: any = await mvcApi(`/tx/${txid}`).get()

  // rename timestamp to time
  const detail = activity.txDetail
  detail.time = detail.timestamp * 1000 // convert to ms
  delete detail.timestamp

  return detail
}

export const fetchTokenActivities = async (address: string, asset: Token): Promise<TokenActivities> => {
  const activities: any = await mvcApi(`/contract/ft/address/${address}/${asset.codehash}/${asset.genesis}/tx`).get()

  return activities
}

export const useOneActivityQuery = (
  txid: Ref<string> | ComputedRef<string>,
  options?: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: [
      'activity',
      {
        txid: txid.value,
      },
    ],
    queryFn: () => fetchOneActivity(txid.value),
    select: (activity) => {
      return activity
    },
    ...options,
  })
}

export const useActivitiesQuery = (
  address: Ref,
  params:
    | {
        type: 'native'
        asset: Asset
      }
    | {
        type: 'token'
        token: Token
      },
  options?: { enabled: ComputedRef<boolean> }
) => {
  let queryKeyParams: any
  if (params.type === 'native') {
    queryKeyParams = {
      address: address.value,
      symbol: params.asset.symbol,
    }
  } else {
    queryKeyParams = {
      address: address.value,
      symbol: params.token.symbol,
      genesis: params.token.genesis,
    }
  }

  return useQuery({
    queryKey: ['activities', queryKeyParams],
    queryFn: async () => {
      if (params.type === 'token') {
        if (BRC20_SYMBOLS.includes(params.token.symbol)) {
          return fetchBRC20Activities(address.value, params.token.symbol)
        }
        return fetchTokenActivities(address.value, params.token)
      }

      if (params.asset.symbol === 'BTC') {
        return fetchBtcActivities(address.value)
      }

      return fetchSpaceActivities(address.value)
    },
    ...options,
  })
}
