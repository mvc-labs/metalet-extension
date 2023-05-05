import accountManager from '../account'

export async function process(params: any, host: string) {
  const balance = await accountManager.getBalance()

  return balance
}
