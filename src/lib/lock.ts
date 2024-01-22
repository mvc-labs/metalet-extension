import { getStorage, setStorage } from './storage'

const LAST_LOCK_TIME = 'LAST_LOCK_TIME'

export async function getLastLockTime() {
    const time = await getStorage(LAST_LOCK_TIME, { defaultValue: -1 })
    try {
        return Number(time)
    } catch (error) {
        console.error("getLastLockTimeError", error);
        return -1
    }
}

export async function setLastLockTime() {
    return await setStorage(LAST_LOCK_TIME, Date.now())
}