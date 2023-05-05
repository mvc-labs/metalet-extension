import { API_NET, API_TARGET, FtManager } from 'meta-contract'
import { getNetwork } from '../network'
import { getCurrentAccount, privateKey } from '../account'
import { FEEB } from '../../data/config'
import { METASV_HOST, METASV_TESTNET_HOST } from '../../data/hosts'

export async function process({
  codehash,
  genesis,
  receivers,
}: {
  codehash: string
  genesis: string
  receivers: {
    address: string
    amount: string
  }[]
}) {
  const network: API_NET = (await getNetwork()) as API_NET
  const purse = await getCurrentAccount().then((account) => privateKey.value)
  const apiHost = network === API_NET.MAIN ? METASV_HOST : METASV_TESTNET_HOST

  const ftManager = new FtManager({
    network,
    apiTarget: API_TARGET.MVC,
    purse,
    feeb: FEEB,
    apiHost,
  })
  const { txid } = await ftManager.transfer({
    codehash,
    genesis,
    receivers,
    senderWif: purse,
  })

  return { txids: [txid] }
}

export async function estimate({
  codehash,
  genesis,
  receivers,
}: {
  codehash: string
  genesis: string
  receivers: {
    address: string
    amount: string
  }[]
}) {
  const network: API_NET = (await getNetwork()) as API_NET
  const purse = await getCurrentAccount().then((account) => privateKey.value)
  const apiHost = network === API_NET.MAIN ? METASV_HOST : METASV_TESTNET_HOST

  const ftManager = new FtManager({
    network,
    apiTarget: API_TARGET.MVC,
    purse,
    feeb: FEEB,
    apiHost,
  })

  return ftManager.getTransferEstimateFee({
    codehash,
    genesis,
    receivers,
    senderWif: purse,
  })
}
