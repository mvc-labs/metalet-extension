import { ref } from 'vue'
import storage from './storage'

export type Network = 'mainnet' | 'testnet'

export const network = ref<Network>((await storage.get('network')) || 'mainnet')

export async function setNetwork(_network: Network) {
  await storage.set('network', _network)
  network.value = _network
}

export async function getNetwork(): Promise<Network> {
  return network.value
}
