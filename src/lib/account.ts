import { Ref, ref } from 'vue'
import { fetchSpaceBalance } from '../queries/balance'
import { getStorage, setStorage } from './storage'
import { generateRandomString } from './helpers'
import { getNetwork } from './network'

export type Account = {
  id: string
  mnemonic: string
  path: string
  mainnetPrivateKey: string
  mainnetAddress: string
  testnetPrivateKey: string
  testnetAddress: string
  name?: string
  assetsDisplay?: string[]
}

export const address = ref('')
export const privateKey = ref('')
export const account = ref<Account | null>(null)

export async function getAll(): Promise<Account[]> {
  const accounts = await getStorage('accounts')
  return accounts || []
}

// accounts以uuid为key
export async function getCurrentAccount(): Promise<Account | null> {
  // 先获取当前账户
  const currentAccountId = await getStorage('currentAccountId')
  if (!currentAccountId) {
    return null
  }

  // 再获取当前账户的信息
  const accounts = await getStorage('accounts')
  if (!accounts) {
    return null
  }
  const current = accounts[currentAccountId]
  if (!current) {
    return null
  }

  // 保存当前账户的地址和私钥
  const network = await getNetwork()
  address.value = network === 'mainnet' ? current.mainnetAddress : current.testnetAddress
  privateKey.value = network === 'mainnet' ? current.mainnetPrivateKey : current.testnetPrivateKey

  account.value = current

  return current
}

export async function removeCurrentAccount(): Promise<boolean> {
  // 从accounts中删除
  const accounts = (await getStorage('accounts')) || {}
  const currentAccountId = await getStorage('currentAccountId')
  if (currentAccountId) {
    delete accounts[currentAccountId]
  }
  await setStorage('accounts', accounts)

  // 删除当前账户id
  await setStorage('currentAccountId', '')

  // 删除当前账户的地址和私钥
  address.value = ''
  privateKey.value = ''
  account.value = null

  return true
}

export async function connectAccount(accountId: string) {
  const accounts = (await getStorage('accounts')) || {}
  const current = accounts[accountId]
  if (!current) {
    return false
  }

  // 保存当前账户id
  await setStorage('currentAccountId', accountId)

  // 保存当前账户的地址和私钥
  const network = await getNetwork()
  address.value = network === 'mainnet' ? current.mainnetAddress : current.testnetAddress
  privateKey.value = network === 'mainnet' ? current.mainnetPrivateKey : current.testnetPrivateKey
  account.value = current

  return true
}

export async function setAccount(account: Account) {
  const accounts = (await getStorage('accounts')) || {}

  const exist = accounts[account.id]
  if (!exist) {
    account.name = account.name || `Account ${accounts.length + 1}`
    accounts.push(account)
  } else {
    // 更新
    accounts[account.id] = account
  }
  await setStorage('accounts', accounts)
}

export async function addAccount(account: Omit<Account, 'id' | 'name'>) {
  const accounts = (await getStorage('accounts')) || {}
  // 如果已经存在，不再保存
  const exist = (Object.keys(accounts).length &&
    Object.values(accounts).find((item: any) => item.mnemonic === account.mnemonic)) as Account | null
  if (!exist) {
    const newAccount: Account = {
      ...account,
      id: generateRandomString(32),
      name: `Account ${Object.keys(accounts).length + 1}`,
    }
    accounts[newAccount.id] = newAccount
    await setStorage('accounts', accounts)

    await connectAccount(newAccount.id)
  } else {
    // 保存最新登录账号id
    await connectAccount(exist.id)
  }
}

export async function getAddress() {
  const account = await getCurrentAccount()
  if (!account) {
    return null
  }

  const network = await getNetwork()

  address.value = network === 'mainnet' ? account.mainnetAddress : account.testnetAddress
  privateKey.value = network === 'mainnet' ? account.mainnetPrivateKey : account.testnetPrivateKey
  // address.value = 'mtvbChgf3b3sxZkBhwtbJxB1zFmoi79Ytx'

  return address.value
}

export async function getPublicKey() {
  const account = await getCurrentAccount()
  if (!account) {
    return null
  }

  return 'not implemented yet'

  // const privateKey = PrivateKey.fromString(account.privateKey)

  // return privateKey.toPublicKey().toString()
}

export async function getBalance() {
  const account = await getCurrentAccount()
  if (!account) {
    return null
  }
  const balance = await fetchSpaceBalance(address.value)

  return balance
}

type AccountManager = {
  all: () => Promise<any>
  current: Ref<Account | null>
  getCurrent: () => Promise<Account | null>
  removeCurrent: () => Promise<boolean>
  set: (account: Account) => Promise<void>
  add: (account: Omit<Account, 'id'>) => Promise<void>
  connect: (accountId: string) => Promise<boolean>
  getAddress: () => Promise<string | null>
  getPublicKey: () => Promise<string | null>
  getBalance: () => Promise<Awaited<ReturnType<typeof fetchSpaceBalance>> | null>
}

const accountManager = {} as AccountManager
accountManager.all = getAll
accountManager.current = account
accountManager.getCurrent = getCurrentAccount
accountManager.set = setAccount
accountManager.add = addAccount
accountManager.connect = connectAccount
accountManager.getAddress = getAddress
accountManager.getPublicKey = getPublicKey
accountManager.getBalance = getBalance
accountManager.removeCurrent = removeCurrentAccount

export default accountManager
