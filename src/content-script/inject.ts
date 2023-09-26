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
  console.log('calling...')
  const response = await browser.runtime.sendMessage(params)
  console.log({ response })

  if (response?.channel === 'from-metaidwallet') {
    window.postMessage(response, '*')
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
