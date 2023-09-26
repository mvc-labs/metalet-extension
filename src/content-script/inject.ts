import browser from 'webextension-polyfill'

export type MetaletParams = {
  nonce: string
  channel: 'to-metaidwallet' | 'from-metaidwallet'
  action: string
  host: string
  icon?: string
  params?: any
  res: any
}

const listenToMetalet = () => {
  browser.runtime.onMessage.addListener((msg, sender) => {
    if (msg.channel === 'from-metaidwallet') {
      window.postMessage(msg, '*')
    }

    return true
  })
}

listenToMetalet()

const callMetalet = async (params: MetaletParams) => {
  // try call metalet;
  // if failed, that's probably because metalet's service worker does not wake up on time;
  // so we catch that and try again after 500ms
  const tryCall = async (params: MetaletParams) => {
    const response = await browser.runtime.sendMessage(params)

    if (response?.channel === 'from-metaidwallet') {
      window.postMessage(response, '*')
    }
  }

  try {
    await tryCall(params)
  } catch (e: any) {
    // If the error comes from timeout, we try again
    if (e.message.includes('Could not establish connection.')) {
      setTimeout(async () => {
        await tryCall(params)
      }, 500)
    }
  }
}

window.addEventListener(
  'message',
  async (event) => {
    // We only accept messages from ourselves
    if (event.source !== window || event.data?.channel !== 'to-metaidwallet') {
      return
    }

    await callMetalet(event.data)

    return true
  },
  false
)

const node = document.getElementsByTagName('body')[0]
const script = document.createElement('script')
script.setAttribute('type', 'text/javascript')
script.setAttribute('src', browser.runtime.getURL('content.js'))
node.appendChild(script)

console.log('Metalet is ready. Happy coding! 🎉')
