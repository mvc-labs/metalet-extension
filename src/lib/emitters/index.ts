import browser from 'webextension-polyfill'

interface EmitParams {
  fn: string
  args: unknown[]
}

async function emit<T>(params: EmitParams): Promise<T> {
  const channel = 'inter-extension'
  return await browser.runtime.sendMessage({ ...params, channel })
}

export function createEmit<T>(fn: string) {
  return (...args: unknown[]) => emit<T>({ fn, args })
}
