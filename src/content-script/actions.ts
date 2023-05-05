import { generateRandomString } from '../lib/helpers'

type Echo = {
  nonce: string
  channel: string
  action: string
  host: string
  res: any
}

type ActionType = 'authorize' | 'query'

async function createAction(actionName: string, actionType: ActionType = 'authorize', params?: any): Promise<any> {
  const action = `${actionType}-${actionName}`
  // nonce为32位随机字符串
  const nonce = generateRandomString(16)
  // 读取当前页面的host
  const host = window.location.host
  window.postMessage(
    {
      nonce,
      channel: 'to-metaidwallet',
      action,
      host,
      icon: '',
      params: params || {},
    },
    '*'
  )
  // 异步返回授权结果
  const subscribe = (callback: Function) => {
    const actionListener = (event: MessageEvent) => {
      if (event.source !== window || event.data?.channel !== 'from-metaidwallet') {
        return
      }
      if (event.data?.nonce === nonce) {
        window.removeEventListener('message', actionListener)
        if (event.data?.res?.error) {
          throw new Error(event.data.res.error)
        }
        if (callback && typeof callback === 'function') {
          callback(event.data)
        }
      }
      return true
    }
    window.addEventListener('message', actionListener)
  }
  return await new Promise((resolve) => {
    subscribe((echo: Echo) => {
      resolve(echo.res)
    })
  })
}

export async function connect() {
  return await createAction('Connect')
}

export async function disconnect() {
  return await createAction('Disconnect')
}

export async function isConnected() {
  return await createAction('IsConnected', 'query')
}

export async function getNetwork() {
  return await createAction('GetNetwork', 'query')
}

export async function switchNetwork() {
  return await createAction('SwitchNetwork')
}

export async function getAddress() {
  return await createAction('GetAddress', 'query')
}

export async function getPublicKey() {
  return await createAction('GetPublicKey', 'query')
}

export async function getBalance() {
  return await createAction('GetBalance', 'query')
}

export async function eciesEncrypt(params: { message: string }) {
  return await createAction('EciesEncrypt', 'authorize', params)
}

export async function eciesDecrypt(params: { encrypted: string }) {
  return await createAction('EciesDecrypt', 'authorize', params)
}

type SigningTransaction = {
  txHex: string
  address: string
  inputIndex: number
  scryptHex: string
  satoshis: number
  sigtype: number
}
export async function signTransaction(params: { transaction: SigningTransaction }) {
  return await createAction('SignTransaction', 'authorize', params)
}

type TransferTask = {
  genesis?: string
  codehash?: string
  receivers: {
    address: string
    amount: string
  }[]
}
export async function transfer(params: { tasks: TransferTask[] }) {
  return await createAction('Transfer', 'authorize', params)
}

export async function merge(params: any) {
  return await createAction('Merge', 'authorize', params)
}

// export async function transferAll(params: {
//   receivers: {
//     address: string
//     amount: string
//   }[]
// }) {
//   return await createAction('Transfer', 'authorize', params)
// }

// tokens-related
export async function getTokenBalance(params?: { genesis: string; codehash: string }) {
  return await createAction('GetTokenBalance', 'query', params)
}
