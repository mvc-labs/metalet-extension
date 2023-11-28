import browser from 'webextension-polyfill'

interface EmitParams {
  args: unknown[]
  eventName: string
}

// const eventSet = ref<Set<string>>(new Set())

// export function register(eventName: string) {
//   eventSet.value.add(eventName)
//   console.log('eventSet', eventSet.value)
// }

// export function unregister(eventName: string) {
//   eventSet.value.delete(eventName)
// }

// export function isSend(eventName: string) {
//   console.log('eventSet', eventSet.value)
//   return eventSet.value.has(eventName)
// }

async function emit(params: EmitParams) {
  const channel = 'from-metaidwallet'

  const tab = await browser.tabs.query({
    active: true,
    windowType: 'normal',
    currentWindow: true,
  })

  if (tab[0].id) {
    browser.tabs.sendMessage(tab[0].id, { ...params, channel }).catch((e) => {
      if (!e.message.includes('Could not establish connection.')) {
        throw e
      }
    })
  }
}

export function notifyContent(eventName: string) {
  return (...args: unknown[]) => emit({ eventName, args })
}
