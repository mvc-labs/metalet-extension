import storageManager from './storage'
import hash from 'object-hash'

export async function getPassword() {
  const password = await storageManager.get('password')
  return password
}

export async function hasPassword() {
  const password = await getPassword()
  return !!password
}

export async function checkPassword(credential: string) {
  const password = await getPassword()

  return hash(credential) === password
}

// export async function encrypt(anything: any) {
//   const password = await getPassword()
// }

export async function setPassword(password: string) {
  const hashed = hash(password)
  await storageManager.set('password', hashed)
}

export async function lock() {
  await storageManager.set('locked', true)
}

export async function isLocked() {
  return await storageManager.get('locked', { defaultValue: false })
}

export async function unlock(password: string) {
  const isCorrect = await checkPassword(password)
  if (!isCorrect) {
    throw new Error('Password incorrect')
  }
  await storageManager.set('locked', false)

  return true
}

type PasswordManager = {
  has: () => Promise<boolean>
  get: () => Promise<string>
  set: (password: string) => Promise<void>
  lock: () => Promise<void>
  unlock: (password: string) => Promise<boolean>
  isLocked: () => Promise<boolean>
  check: (credential: string) => Promise<boolean>
}
const passwordManager = {} as PasswordManager
passwordManager.has = hasPassword
passwordManager.get = getPassword
passwordManager.set = setPassword
passwordManager.lock = lock
passwordManager.unlock = unlock
passwordManager.isLocked = isLocked
passwordManager.check = checkPassword

export default passwordManager
