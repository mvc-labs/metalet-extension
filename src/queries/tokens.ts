import { useQuery } from '@tanstack/vue-query'
import { metasvApi } from './request'
import { ComputedRef, Ref } from 'vue'
import type { Token } from '../data/tokens'
import tokens from '../data/tokens'

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
        // 查找token的图标
        const tokenInfo = tokens.find((item) => item.genesis === token.genesis)
        return {
          ...token,
          logo: tokenInfo?.logo || '',
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
      // 查找token的图标
      const tokenInfo = tokens.find((item) => item.genesis === token.genesis)

      return {
        ...token,
        logo: tokenInfo?.logo || '',
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
