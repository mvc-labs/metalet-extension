import { IS_DEV } from '@/data/config'
// import browser from 'webextension-polyfill'
console.log({ IS_DEV })
let browser = IS_DEV ? ({} as any) : import('webextension-polyfill').then((m) => m.default)

export async function useStorage(location: 'local' | 'session' | 'sync' = 'local') {
  if (IS_DEV) {
    const storage = location === 'local' ? window.localStorage : window.sessionStorage

    return {
      async get(key: string) {
        const value = storage.getItem(key)
        if (value === null) {
          return undefined
        }
        try {
          return JSON.parse(value)
        } catch (e) {
          return value
        }
      },
      async set(key: string, value: any) {
        if (typeof value === 'object') {
          value = JSON.stringify(value)
        }
        storage.setItem(key, value)
      },
      async delete(key: string) {
        storage.removeItem(key)
      },
    }
  }

  // otherwise, dynamically import browser.storage module
  // const ext = await import('webextension-poylyfill').then((m) => m.default)
  // console.log(ext)
  // const storage = ext.storage[location]
  console.log('here')
  console.log(browser)
  console.log(2)
  const storage = (await browser).storage[location]
  console.log({ storage })

  return {
    async get(key: string) {
      return ((await storage.get(key)) as any)[key]
    },
    async set(key: string, value: any) {
      console.log('whwat')
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }
      return await storage.set({ [key]: value })
    },
    async delete(key: string) {
      return await storage.remove(key)
    },
  }
}

export async function setStorage(key: string, value: any, useSession: boolean = false) {
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }

  const storage = await useStorage(useSession ? 'session' : 'local')

  return storage.set(key, value)
}

export async function getStorage(
  key: string,
  option?: { defaultValue?: unknown; isParse?: boolean; useSession?: boolean }
) {
  const storage = await useStorage(option?.useSession ? 'session' : 'local')

  const value = await storage.get(key)
  console.log(value)

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
// export async function deleteStorage(key: string): Promise<void> {
//   const res = await browser.storage.local.get(key)
//   if (res[key] === undefined) {
//     return
//   }
//   try {
//     await browser.storage.local.remove(key)
//   } catch (e) {
//     raise(`browser local storage delete ${key} failed`)
//   }
// }

type Storage = {
  get: (key: string, option?: { defaultValue?: unknown; isParse?: boolean; useSession?: boolean }) => Promise<any>
  set: (key: string, value: any, useSession?: boolean) => Promise<void>
  // delete: (key: string) => Promise<void>
}

let storage = {} as Storage
storage.get = getStorage
storage.set = setStorage
// storage.delete = deleteStorage

export default storage
