import useStorage from './storage'

const storage = useStorage()

const LAST_LOCK_TIME_KEY = 'LAST_LOCK_TIME'

export async function getLastLockTime() {
  const time = await storage.get(LAST_LOCK_TIME_KEY, { defaultValue: -1 })
  try {
    return Number(time)
  } catch (error) {
    console.error('getLastLockTimeError', error)
    return -1
  }
}

export async function setLastLockTime() {
  return await storage.set(LAST_LOCK_TIME_KEY, Date.now())
}
