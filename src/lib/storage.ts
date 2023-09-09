import browser from 'webextension-polyfill'
import { raise } from './helpers'

export async function setStorage(key: string, value: any) {
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }

  await browser.storage.local.set({ [key]: value })
}

export async function getStorage(key: string, option?: { defaultValue?: unknown; isParse?: boolean }) {
  const res = await browser.storage.local.get(key)
  const value = res[key]

  if (typeof value === 'string') {
    try {
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
