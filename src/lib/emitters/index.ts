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
  return await new Promise((resolve) => {
    browser.runtime.onMessage.addListener((msg) => {
      if (msg.nonce === nonce) {
        resolve(msg.data)
      }
    })
  })
}

export async function getCurrentAccount(...args: unknown[]) {
  return await emit<Account>({ fn: 'getCurrentAccount', args })
}
