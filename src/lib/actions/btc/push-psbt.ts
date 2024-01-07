import { Psbt, networks } from 'bitcoinjs-lib'
import { getNetwork } from '@/lib/network'

export async function process(psbtHex: string): Promise<string> {
  const networkType = await getNetwork()
  const psbtNetwork = networkType === 'mainnet' ? networks.bitcoin : networks.testnet
  return Psbt.fromHex(psbtHex, { network: psbtNetwork }).extractTransaction().getId()
}