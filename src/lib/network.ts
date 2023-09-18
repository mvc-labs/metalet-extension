import { ref } from 'vue'
import storage from './storage'
import { Network as BtcNetwork } from 'bitcoinjs-lib'

export type Network = 'mainnet' | 'testnet'

export const network = ref<Network>(await storage.get('network', { defaultValue: 'mainnet' }))

export async function setNetwork(_network: Network) {
  await storage.set('network', _network)
  network.value = _network
}

export async function getNetwork(): Promise<Network> {
  return network.value
}

export async function getBtcNetwork(): Promise<BtcNetwork> {
  const btcNetwork: unknown = network.value === 'mainnet' ? 'bitcoin' : 'testnet'

  return btcNetwork as BtcNetwork

}
