import { IS_DEV } from '@/data/config'

interface EmitParams {
  args: unknown[]
  eventName: string
}

async function emit(params: EmitParams) {
  if (IS_DEV) {
    return
  }

  window.browser.runtime.sendMessage({ ...params, channel: 'to-bg' })
}

export function notifyBg(eventName: string) {
  return (...args: unknown[]) => emit({ eventName, args })
}
