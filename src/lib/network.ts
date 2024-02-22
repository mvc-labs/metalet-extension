import { ref } from 'vue'
import useStorage from './storage'
import { networks } from 'bitcoinjs-lib'
import { type Chain } from '@/lib/account'
import { notifyContent } from '@/lib/notify-content'

export type Service = Chain | 'all'

export type Network = 'mainnet' | 'testnet'

export const Service_Network_Key = 'service_network'

const storage = useStorage()

export async function setServiceNetwork(_service: Service) {
  await storage.set(Service_Network_Key, _service)
}

export async function getServiceNetwork(): Promise<Service> {
  return await storage.get(Service_Network_Key, { defaultValue: 'all' })
}

export async function hasServiceNetwork(): Promise<boolean> {
  return !!(await storage.get(Service_Network_Key))
}

export async function setNetwork(_network: Network) {
  await storage.set('network', _network)
  notifyContent('networkChanged')(_network)
}

export async function getNetwork(): Promise<Network> {
  return await storage.get('network', { defaultValue: 'mainnet' })
}

export async function getBtcNetwork() {
  const network = await getNetwork()
  return network === 'mainnet' ? networks.bitcoin : networks.testnet
}

type Net = 'livenet' | 'testnet'

export async function getNet(): Promise<Net> {
  const network = await getNetwork()
  return network === 'mainnet' ? 'livenet' : network
}
