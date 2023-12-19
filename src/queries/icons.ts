import { Chain } from '@/lib/account'
import { ComputedRef, ref } from 'vue'
import { metaletApiV3 } from './request'
import { useQuery } from '@tanstack/vue-query'

interface IconResult {
  brc20_coin: Record<string, string>
  ft_coin: Record<string, string>
}

// const icons = ref<IconResult>(await metaletApiV3<IconResult>(`/coin/icons`).get())
const icons = ref<IconResult>()

export const getIcon = (chain: Chain, name: string): string => {
  if (icons.value) {
    if (chain === 'btc') {
      return icons.value['brc20_coin'][name]
    } else if (chain === 'mvc') {
      return icons.value['ft_coin'][name]
    }
  }
  return ''
}

// export const useIconQuery = (chain: Chain, name: string, options: { enabled: ComputedRef<boolean> }) => {
//   return useQuery({
//     queryKey: ['icons'],
//     queryFn: () => getIcons(),
//     select: (result) => {
//       if (chain === 'btc') {
//         return result.brc20_coin[name]
//       } else {
//         return result.ft_coin[name]
//       }
//     },
//     ...options,
//   })
// }
