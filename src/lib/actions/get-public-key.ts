import accountManager from '../account'
import connector from '../connector'

export async function process(params: any, host: string) {
  const publicKey = await accountManager.getPublicKey(params)

  return publicKey
}
