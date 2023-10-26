// import { getAddress } from '../account'
import { createEmit } from '../emitters'
import { setNetwork, getNetwork } from '../network'

export async function process(params: any, host: string) {
  const network = await getNetwork()
  let switched: 'mainnet' | 'testnet'
  if (network === 'mainnet') {
    await setNetwork('testnet')
    switched = 'testnet'
  } else {
    await setNetwork('mainnet')
    switched = 'mainnet'
  }

  // const address = await getAddress()
  const address = await createEmit<string>('getAddress')()

  return {
    status: 'ok',
    network: switched,
    address,
  }
}
