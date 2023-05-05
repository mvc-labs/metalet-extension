import { useQuery } from '@tanstack/vue-query'
import { metasvApi } from './request'
import { ComputedRef, Ref } from 'vue'

export type Token = {
  codehash: string
  genesis: string
  name: string
  symbol: string
  decimal: number
  sensibleId: string
  utxoCount: number
  confirmed: number
  confirmedString: string
  unconfirmed: number
  unconfirmedString: string
}

export const fetchTokens = async (address: string): Promise<Token[]> => {
  const tokens: any = await metasvApi(`/contract/ft/address/${address}/balance`).get()

  return tokens.map((token: any) => {
    // 将codeHash改为小写
    token.codehash = token.codeHash
    delete token.codeHash
    return token
  })
}

export const useTokensQuery = (address: Ref, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['tokens', { address: address.value }],
    queryFn: () => fetchTokens(address.value),
    select: (data: Token[]) => {
      return data.map((token) => {
        return {
          ...token,
          logo: '',
          tokenName: token.name,
          isNative: false,
          color: 'bg-blue-100',
          chain: 'mvc' as const,
          queryable: false,
          total: token.confirmed + token.unconfirmed,
        }
      })
    },
    ...options,
  })
}

export const useTokenQuery = (address: Ref, symbol: string, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['tokens', { address: address.value }],
    queryFn: () => fetchTokens(address.value),
    select: (data: Token[]) => {
      const token = data.find((token) => token.symbol === symbol) as Token

      return {
        ...token,
        logo: '',
        tokenName: token!.name,
        isNative: false,
        color: 'bg-blue-100',
        chain: 'mvc' as const,
        queryable: false,
        total: token!.confirmed + token!.unconfirmed,
      }
    },
    ...options,
  })
}

export default useTokensQuery
