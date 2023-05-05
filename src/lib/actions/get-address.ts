import accountManager from '../account'
import connector from '../connector'

export async function process(params: any, host: string) {
  const address = await accountManager.getAddress()

  // 检查连接状态
  if (!address) {
    return {
      status: 'error',
      message: 'no address',
    }
  }

  if (!connector.isConnected(address, host)) {
    return {
      status: 'error',
      message: 'not connected',
    }
  }

  return address
}
