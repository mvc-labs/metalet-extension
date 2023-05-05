import { getNetwork } from './network'
import { TX_BROWSER_TESTNET_HOST, TX_BROWSER_HOST, METASV_HOST, METASV_TESTNET_HOST } from '../data/hosts'

export async function getBrowserHost() {
  const network = await getNetwork()

  return network === 'testnet' ? TX_BROWSER_TESTNET_HOST : TX_BROWSER_HOST
}

export async function getApiHost() {
  const network = await getNetwork()

  return network === 'testnet' ? METASV_TESTNET_HOST : METASV_HOST
}
