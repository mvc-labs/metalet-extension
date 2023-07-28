import assetsManager from '@/lib/assets'

export async function process(params: any, host: string) {
  const balance = await assetsManager.getTokenBalance()

  return balance
}
