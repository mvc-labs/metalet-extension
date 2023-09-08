import accountManager from '../account'

export async function process(params: any, host: string) {
  const publicKey = await accountManager.getXPublicKey("mvc")

  return publicKey
}
