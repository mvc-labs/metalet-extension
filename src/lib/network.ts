import { ref } from 'vue'
import { networks } from 'bitcoinjs-lib'

import storage from './storage'
import { notifyContent } from '@/lib/notify-content'

export type Network = 'mainnet' | 'testnet'

export const network = ref<Network>(await storage.get('network', { defaultValue: 'mainnet' }))

export async function setNetwork(_network: Network) {
  await storage.set('network', _network)
  network.value = _network
  notifyContent('networkChanged')(_network)
}

export async function getNetwork(): Promise<Network> {
  return await storage.get('network', { defaultValue: 'mainnet' })
}

export async function getBtcNetwork() {
  const network = await getNetwork()
  return network === 'mainnet' ? networks.bitcoin : networks.testnet
}
