import { ref } from 'vue'
import storage from './storage'
import { createEmit } from '@/data/event-actions'

export type Network = 'mainnet' | 'testnet'

export const network = ref<Network>(await storage.get('network', { defaultValue: 'mainnet' }))

export async function setNetwork(_network: Network) {
  await storage.set('network', _network)
  network.value = _network
  createEmit('networkChanged')(_network)
}

export async function getNetwork(): Promise<Network> {
  return network.value
}

export async function getBtcNetwork(): Promise<Network> {
  return network.value
}