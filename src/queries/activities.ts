import { useQuery } from '@tanstack/vue-query'
import { metasvApi } from './request'
import { ComputedRef, Ref } from 'vue'
import type { Token } from './tokens'

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

export const fetchActivities = async (address: string): Promise<Activities> => {
  const unconfirmed: any = metasvApi(`/address/${address}/tx?confirmed=false`).get()
  const confirmed: any = metasvApi(`/address/${address}/tx?confirmed=true`).get()

  const [unconfirmedActivities, confirmedActivities] = await Promise.all([unconfirmed, confirmed])

  return [...unconfirmedActivities, ...confirmedActivities]
}

export const fetchTokenActivities = async (address: string, asset: Token): Promise<TokenActivities> => {
  const activities: any = await metasvApi(`/contract/ft/address/${address}/${asset.codehash}/${asset.genesis}/tx`).get()

  return activities
}

export const useActivitiesQuery = (address: Ref, params: any, options?: { enabled: ComputedRef<boolean> }) =>
  useQuery({
    queryKey: ['activities', address],
    queryFn: () => {
      if (params.asset) {
        return fetchTokenActivities(address.value, params.asset)
      }

      return fetchActivities(address.value)
    },
    ...options,
  })
