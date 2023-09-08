import { API_NET, API_TARGET, Wallet } from 'meta-contract'
import { getNetwork } from '../network'
import { getAddress, getPrivateKey } from '../account'
import { FEEB } from '@/data/config'
import { getApiHost } from '../host'

export async function process() {
  const network: API_NET = (await getNetwork()) as API_NET
  const purse = await getPrivateKey("mvc")
  const apiHost = await getApiHost()

  const wallet = new Wallet(purse, network, FEEB, API_TARGET.MVC, apiHost)

  type TransferResult = {
    id: number
    txid: string
    txHex: string
    routeCheckTxHex?: string
  }
  const results: TransferResult[] = []
  const txids: string[] = []

  const mergeRes = await wallet.merge()
  results.push({
    id: 1,
    txid: mergeRes.txId,
    txHex: mergeRes.txHex,
  })
  txids.push(mergeRes.txId)

  return { res: results, txids, broadcasted: true }
}
