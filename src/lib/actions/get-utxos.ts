import accountManager from '../account'

export async function process(params: any, host: string) {
  return await accountManager.getUtxos(params)
}
