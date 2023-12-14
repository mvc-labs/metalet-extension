import { mvcApi } from './request'
import { ComputedRef, Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { SymbolTicker } from '@/lib/asset-symbol'
import { type Asset, MVCAsset } from '@/data/assets'
import { Balance } from './balance'

export type Token = {
  codeHash: string
  genesis: string
  name: string
  symbol: SymbolTicker
  decimal: number
  sensibleId: string
  utxoCount: number
  confirmed: number
  confirmedString: string
  unconfirmed: number
  unconfirmedString: string
}

export const fetchMVCTokens = async (address: string): Promise<Token[]> => {
  return await mvcApi<Token[]>(`/contract/ft/address/${address}/balance`).get()
}

export const useMVCAssetsQuery = (addressRef: Ref<string>, options: { enabled: ComputedRef<boolean> }) => {
  return useQuery({
    queryKey: ['MVCTokens', { address: addressRef.value }],
    queryFn: () => fetchMVCTokens(addressRef.value),
    select: (tokens: Token[]) => [
      MVCAsset,
      ...tokens.map(
        (token) =>
          ({
            symbol: token.symbol,
            tokenName: token.name,
            isNative: false,
            chain: 'mvc',
            queryable: true,
            decimal: token.decimal,
            contract: 'MetaContract',
            codeHash: token.codeHash,
            genesis: token.genesis,
          }) as Asset
      ),
    ],
    ...options,
  })
}

export const useMVCTokenQuery = (
  addressRef: Ref<string>,
  genesis: string,
  options: { enabled: ComputedRef<boolean> }
) => {
  return useQuery({
    queryKey: ['MVCTokens', { address: addressRef.value }],
    queryFn: () => fetchMVCTokens(addressRef.value),
    select: (tokens: Token[]) => tokens.find((token) => token.genesis === genesis),
    ...options,
  })
}

export const fetchTokens = async (address: string): Promise<Token[]> => {
  const tokens: any = await mvcApi(`/contract/ft/address/${address}/balance`).get()

  return tokens.map((token: any) => {
    // 将codeHash改为小写
    token.codehash = token.codeHash
    delete token.codeHash
    return token
  })
}

export const fetchTokenBalance = async (address: string, genesis: string): Promise<Balance> => {
  const tokens = await mvcApi<Token[]>(`/contract/ft/address/${address}/balance`).get()

  const token = tokens.find((token) => token.genesis === genesis)
  const confirmed = token?.confirmed || 0
  const unconfirmed = token?.unconfirmed || 0
  return {
    address,
    confirmed,
    unconfirmed,
    total: confirmed + unconfirmed,
  }
}
