import { API_NET, API_TARGET, FtManager, TxDecoder, Wallet, mvc } from 'meta-contract'
import { getNetwork } from '../network'
import { getAddress, privateKey } from '../account'
import { FEEB } from '../../data/config'
import { getApiHost } from '../host'

export type TransferTask = {
  genesis?: string
  codehash?: string
  receivers: {
    address: string
    amount: string
  }[]
}
export async function process({ tasks, broadcast = true }: { tasks: TransferTask[]; broadcast?: boolean }) {
  console.log('here')
  const network: API_NET = (await getNetwork()) as API_NET
  const purse = await getAddress().then(() => privateKey.value)
  const address = (await getAddress())!
  const apiHost = await getApiHost()

  const wallet = new Wallet(purse, network, FEEB, API_TARGET.MVC, apiHost)
  const ftManager = new FtManager({
    network,
    apiTarget: API_TARGET.MVC,
    purse,
    feeb: FEEB,
    apiHost,
  })

  // 串行执行
  type TransferResult = {
    id: number
    txid: string
    txHex: string
    routeCheckTxid?: string
    routeCheckTxHex?: string
  }
  const results: TransferResult[] = []
  const txids: string[] = []
  let theUtxo:
    | {
        txId: string
        outputIndex: number
        satoshis: number
        address: string
        height: number
        wif: string
      }
    | undefined = undefined
  let fts: {
    genesis: string
    txId: string
    outputIndex: number
    tokenAddress: string
    tokenAmount: string
    wif: string
  }[] = []

  for (let i = 0; i < tasks.length; i++) {
    //If it contains multiple tasks, it is a batch transfer; We pass down the utxo from the previous task.

    const task = tasks[i]
    const id = i + 1
    // 如果有genesis，则说明是ft；

    if (task.genesis) {
      const { txHex, routeCheckTxHex, txid, tx, routeCheckTx } = await ftManager.transfer({
        codehash: task.codehash!,
        genesis: task.genesis,
        receivers: task.receivers,
        senderWif: purse,
        noBroadcast: !broadcast,
        // ftUtxos: foundFt ? [foundFt] : undefined,
        utxos: theUtxo ? [theUtxo] : undefined,
      })
      const routeCheckTxid = routeCheckTx.id
      results.push({
        id,
        txid,
        txHex,
        routeCheckTxHex,
        routeCheckTxid,
      })
      txids.push(routeCheckTxid)
      txids.push(txid)
      theUtxo = {
        txId: txid,
        outputIndex: tx.outputs.length - 1,
        satoshis: tx.outputs[tx.outputs.length - 1].satoshis,
        address,
        height: -1,
        wif: purse,
      }

      // fts.push({
      //   genesis: task.genesis,
      //   txId: txid,
      //   outputIndex: tx.outputs.length - 2,
      //   tokenAddress: address,
      //   tokenAmount: leftFtAmount,
      //   wif: purse,
      // })
    } else {
      const receiversWithNumericAmount = task.receivers.map((receiver) => ({
        ...receiver,
        amount: Number(receiver.amount),
      }))

      const utxos: any = theUtxo ? [theUtxo] : undefined
      const transferRes = await wallet.sendArray(receiversWithNumericAmount, utxos, {
        noBroadcast: !broadcast,
      })
      results.push({
        id,
        txid: transferRes.txId,
        txHex: transferRes.txHex,
      })
      txids.push(transferRes.txId)
      const resTx = new mvc.Transaction(transferRes.txHex)
      theUtxo = {
        txId: transferRes.txId,
        outputIndex: resTx.outputs.length - 1,
        satoshis: resTx.outputs[resTx.outputs.length - 1].satoshis,
        address,
        height: -1,
        wif: purse,
      }
    }
  }

  return { res: results, txids, broadcasted: broadcast }
}

// export async function estimate({
//   receivers,
// }: {
//   codehash: string
//   genesis: string
//   receivers: {
//     address: string
//     amount: string
//   }[]
// }) {
//   const network: API_NET = await getNetwork()
//   const purse = await getCurrentAccount().then((account) => account.privateKey.toString())
//   const apiHost = network === API_NET.MAIN ? METASV_HOST : METASV_TESTNET_HOST

//   const ftManager = new FtManager({
//     network,
//     apiTarget: API_TARGET.MVC,
//     purse,
//     feeb: FEEB,
//     apiHost,
//   })

//   return ftManager.getTransferEstimateFee({
//     codehash,
//     genesis,
//     receivers,
//     senderWif: purse,
//   })
// }
