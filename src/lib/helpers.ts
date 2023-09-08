export const raise = (msg: string) => {
  throw new Error(msg)
}

export const toTx = async (txid: string, browserHost: string) => {
  window.open(`${browserHost}/tx/${txid}`, '_blank')
}

export const generateRandomString = (length: number = 32) => {
  let randomString = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return randomString
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
