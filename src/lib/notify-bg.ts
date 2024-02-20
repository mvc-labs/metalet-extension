import { IS_DEV } from '@/data/config'

interface EmitParams {
  args: unknown[]
  eventName: string
}

async function emit(params: EmitParams) {
  if (IS_DEV) {
    return
  }
  const ext = await import('webextension-polyfill').then((m) => m.default)
  return await ext.runtime
    .sendMessage({
      channel: 'inter-metaidwallet',
      ...params,
    })
    .catch((e) => {
      console.error('notifyBg emit error: ', e)
    })
}

export function notifyBg(eventName: string) {
  return (...args: unknown[]) => emit({ eventName, args })
}
