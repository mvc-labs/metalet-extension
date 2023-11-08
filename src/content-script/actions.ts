import { generateRandomString } from '../lib/helpers'

type Echo = {
  nonce: string
  channel: string
  action: string
  host: string
  res: any
}

export type ActionType = 'authorize' | 'query' | 'event'

export async function createAction(
  actionName: string,
  actionType: ActionType = 'authorize',
  params?: any,
  handler?: any
): Promise<any> {
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

export async function getAddress(params?: { path: string }) {
  return await createAction('GetAddress', 'query', params)
}

export async function getPublicKey(params?: { path: string }) {
  return await createAction('GetPublicKey', 'query', params)
}

export async function getXPublicKey() {
  return await createAction('GetXPublicKey', 'query')
}

export async function getBalance(params?: { path: string }) {
  return await createAction('GetBalance', 'query', params)
}

export async function getUtxos(params?: { path: string }) {
  return await createAction('GetUtxos', 'query', params)
}

export async function eciesEncrypt(params: { message: string }) {
  return await createAction('EciesEncrypt', 'authorize', params)
}

export async function eciesDecrypt(params: { encrypted: string }) {
  return await createAction('EciesDecrypt', 'authorize', params)
}

export async function signMessage(params: { message: string }) {
  return await createAction('SignMessage', 'authorize', params)
}

export async function verifySignature(params: { message: string; signature: string }) {
  return await createAction('VerifySignature', 'query', params)
}

type SigningTransaction = {
  txHex: string
  address: string
  inputIndex: number
  scryptHex: string
  satoshis: number
  sigtype: number
}

export async function previewTransaction(params: { transaction: SigningTransaction }) {
  return await createAction('PreviewTransaction', 'query', params)
}
export async function signTransaction(params: { transaction: SigningTransaction }) {
  return await createAction('SignTransaction', 'authorize', params)
}
export async function signTransactions(params: { transactions: SigningTransaction[] }) {
  return await createAction('SignTransactions', 'authorize', params)
}
export async function pay(params: { transactions: SigningTransaction[] }) {
  return await createAction('Pay', 'authorize', params)
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

// event on
export async function on(eventName: string, handler: Function) {
  const handleFn = (event: MessageEvent) => {
    if (event.data?.channel === 'removeListener' && event.data?.eventName === eventName) {
      window.removeEventListener('message', handleFn)
      return
    }
    if (event.source !== window || event.data?.channel !== 'from-metaidwallet' || event.data?.eventName !== eventName) {
      return
    }

    handler(...event.data.args)
  }
  window.addEventListener('message', handleFn)
}

// event removeListener
export async function removeListener(eventName: string) {
  window.postMessage({ eventName, channel: 'removeListener' }, '*')
}

export interface ActionItem {
  name: string
  action: string
}

export type Keys = {
  [K in ActionType]: ActionItem[]
}

export const btcKeys: Omit<Keys, 'event'> = {
  query: [
    { name: 'getBalance', action: 'GetBTCBalance' },
    { name: 'getAddress', action: 'GetBTCAddress' },
    { name: 'getPublicKey', action: 'GetBTCPublicKey' },
    { name: 'getUtxos', action: 'GetBTCUtxos' },
  ],
  authorize: [
    { name: 'signPsbt', action: 'SignBTCPsbt' },
    { name: 'signMessage', action: 'SignBTCMessage' },
  ],
}
