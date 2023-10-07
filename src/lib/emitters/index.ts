import browser from 'webextension-polyfill'
import { type Account } from '@/lib/account'
import { generateRandomString } from '@/lib/helpers'

interface EmitParams {
  fn: string
  args: unknown[]
}

async function emit<T>(params: EmitParams): Promise<T> {
  const channel = 'from-extension'
  const nonce = generateRandomString(16)
  browser.runtime.sendMessage({ ...params, nonce, channel })
  const subscribe = (callback: Function) => {
    browser.runtime.onMessage.addListener((msg) => {
      if (msg.nonce === nonce) {
        callback(msg.data)
      }
    })
  }
  return await new Promise((resolve) => {
    subscribe((data: T) => {
      resolve(data)
    })
  })
}

export async function getCurrentAccount(...args: unknown[]) {
  return await emit<Account>({ fn: 'getCurrentAccount', args })
}
