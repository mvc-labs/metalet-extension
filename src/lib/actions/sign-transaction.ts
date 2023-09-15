import { getAddress, getCurrentAccount, privateKey } from '../account'
import connector from '../connector'
import { signTransaction } from '../crypto'

export async function process(params: any, host: string) {
  const wif = await getCurrentAccount().then((account) => privateKey.value)

  // let sigList = []
  // for (let i = 0; i < params.list.length; i++) {
  //   sigList[i] = sign(wif, params.list[i])
  // }
  if (params.returnsTransaction) {
    const { txHex } = signTransaction(wif, params.transaction, params.returnsTransaction)

    return { txHex }
  }

  const signature = signTransaction(wif, params.transaction, params.returnsTransaction)

  return { signature }
}
