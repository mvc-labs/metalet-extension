import { IS_DEV } from '@/data/config'

interface Storage {
  get<T = string>(key: string): Promise<T | undefined>
  get<T = string>(key: string, option: { defaultValue: T }): Promise<T>
  set(key: string, value: any): Promise<void>
  delete(key: string): Promise<void>
}

type StorageType = 'local' | 'session' | 'sync'

function getDevStorage(storageType: StorageType) {
  switch (storageType) {
    case 'local':
      return window.localStorage
    case 'session':
      return window.sessionStorage
    default:
      return window.localStorage
  }
}

function useStorage(storageType: StorageType = 'local'): Storage {
  let storage: {
    get: (key: string) => Promise<string | undefined>
    set: (key: string, value: string) => Promise<void>
    remove: (key: string) => Promise<void>
  }
  if (IS_DEV) {
    const _storage = getDevStorage(storageType)
    storage = {
      get: async function (key: string): Promise<string | undefined> {
        return (await _storage.getItem(key)) ?? undefined
      },
      set: async function (key: string, value: string) {
        await _storage.setItem(key, value)
      },
      remove: async function (key: string) {
        await _storage.removeItem(key)
      },
    }
  } else {
    let extension
    try {
      if (window.browser) {
        extension = window.browser
      } else {
        throw new Error('Object browser is not found.')
      }
    } catch (e) {
      // TODO：Compatible with various browsers
      extension = chrome
    }
    const _storage = extension.storage[storageType]
    storage = {
      get: async function (key: string): Promise<string | undefined> {
        const result = await _storage.get(key)
        return result?.[key]
      },
      set: async function (key: string, value: string) {
        await _storage.set({ [key]: value })
      },
      remove: async function (key: string) {
        await _storage.remove(key)
      },
    }
  }

  return {
    async get<T>(key: string, option?: { defaultValue: T }): Promise<T | string | undefined> {
      const value = await storage.get(key)
      if (!value) {
        return option?.defaultValue
      }
      try {
        return JSON.parse(value)
      } catch (error) {
        return value
      }
    },
    async set(key: string, value: object | string): Promise<void> {
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }
      return await storage.set(key, value)
    },
    async delete(key: string): Promise<void> {
      return await storage.remove(key)
    },
  }
}

export default useStorage
