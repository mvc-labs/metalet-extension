import browser from 'webextension-polyfill'
import { type Account } from '@/lib/account'
import { generateRandomString } from '@/lib/helpers'

type EmitChannel = 'from-extension'

interface EmitParams {
  fn: string
  args: unknown[]
  channel: EmitChannel
}

async function emit(params: EmitParams) {
  const nonce = generateRandomString(16)
  browser.runtime.sendMessage({ ...params, nonce })
  const subscribe = (callback: Function) => {
    browser.runtime.onMessage.addListener((msg) => {
      if (msg.nonce === nonce) {
        callback(msg.data)
      }
    })
  }
  return await new Promise((resolve) => {
    subscribe((data: any) => {
      resolve(data)
    })
  })
}

export async function getCurrentAccount(...args: unknown[]) {
  return (await emit({ fn: 'getCurrentAccount', args, channel: 'from-extension' })) as Account
}
