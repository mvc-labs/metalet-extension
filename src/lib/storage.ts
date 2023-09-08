import browser from 'webextension-polyfill'
import { raise } from './helpers'

export async function setStorage(key: string, value: any) {
  console.log('setStorage typeof', typeof value, typeof value === 'object', value)
  // 先序列化
  if (typeof value === 'object') {
    value = JSON.stringify(value)
    console.log('value', value)
  }

  await browser.storage.local.set({ [key]: value })
}

export async function getStorage(key: string, option?: { defaultValue?: any; isParse?: boolean }) {
  // 先反序列化
  const res = await browser.storage.local.get(key)
  const value = res[key]
  if (typeof value === 'string') {
    try {
      console.log('isParse', option?.isParse, option?.isParse === false)

      if (option?.isParse === false) {
        return value
      }
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  } else if (value === undefined) {
    return option?.defaultValue
  }

  return value
}

export async function deleteStorage(key: string): Promise<void> {
  const res = await browser.storage.local.get(key)
  if (res[key] === undefined) {
    return
  }
  try {
    await browser.storage.local.remove(key)
  } catch (e) {
    raise(`browser local storage delele ${key} failed`)
  }
}

type Storage = {
  get: (key: string, defaultValue?: any) => Promise<any>
  set: (key: string, value: any) => Promise<void>
  delete: (key: string) => Promise<void>
}

let storage = {} as Storage
storage.get = getStorage
storage.set = setStorage
storage.delete = deleteStorage

export default storage
