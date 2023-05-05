import browser from 'webextension-polyfill'

export async function setStorage(key: string, value: any) {
  // 先序列化
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }

  return browser.storage.local.set({ [key]: value })
}

export async function getStorage(key: string, defaultValue?: any) {
  // 先反序列化
  const res = await browser.storage.local.get(key)
  const value = res[key]
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  } else if (value === undefined) {
    return defaultValue
  }

  return value
}

type Storage = {
  get: (key: string, defaultValue?: any) => Promise<any>
  set: (key: string, value: any) => Promise<void>
}

let storage = {} as Storage
storage.get = getStorage
storage.set = setStorage

export default storage
