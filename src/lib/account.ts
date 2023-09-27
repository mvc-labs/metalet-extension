import { Ref, ref } from 'vue'
import { fetchUtxos } from '../queries/utxos'
import { mvc } from 'meta-contract'

import {
  AddressType,
  deriveAddress,
  deriveAllAddresses,
  derivePrivateKey,
  derivePublicKey,
  inferAddressType,
} from './bip32-deriver'
import { fetchSpaceBalance, fetchBtcBalance, doNothing } from '@/queries/balance'
import { getStorage, setStorage } from './storage'
import { generateRandomString, raise } from './helpers'
import { getNetwork } from './network'
import { signMessage } from './crypto'

const CURRENT_ACCOUNT_ID = 'currentAccountId'
const ACCOUNT_STORAGE_CURRENT_KEY = 'accounts_v2'
const ACCOUNT_STORAGE_HISTORY_KEYS = ['accounts']

export type Chain = 'btc' | 'mvc'

type DerivedAccountDetail = {
  path: string
  addressType: AddressType
  mainnetAddress: string
  testnetAddress: string
  credential?: {
    address: string
    publicKey: string
    signature: string
  }
}

type ChainDetail = {
  [chain in Chain]: Omit<DerivedAccountDetail, 'credential'>
}

export type Account = {
  id: string
  name: string
  mnemonic: string
  assetsDisplay: string[]
  mvc: DerivedAccountDetail
  btc: DerivedAccountDetail
}

const isAccountsLoaded = ref(false)

export const currentAccount = ref<Account | null>(null)
export const accounts = ref<Map<string, Account>>(new Map())

// Account Map Serialization
function serializeAccountMap(map: Map<string, Account>): string {
  const obj: { [key: string]: Account } = {}
  for (const [key, value] of map.entries()) {
    obj[key] = value
  }
  return JSON.stringify(obj)
}

// Account Map Deserialization
function deserializeAccountMap(json: string): Map<string, Account> {
  const obj = JSON.parse(json)
  const map = new Map()
  for (const key in obj) {
    map.set(key, obj[key])
  }
  return map
}

export const account = ref<Account | null>(null)

export async function getAccounts(refresh = false): Promise<Map<string, Account>> {
  if (!isAccountsLoaded.value) {
    accounts.value = deserializeAccountMap(
      await getStorage(ACCOUNT_STORAGE_CURRENT_KEY, { defaultValue: '{}', isParse: false })
    )
    isAccountsLoaded.value = true
  }

  return accounts.value
}

export async function getAccount(accountId: string): Promise<Account | null> {
  const accounts = await getAccounts()
  if (accounts.size === 0) {
    return null
  }

  const account = accounts.get(accountId)
  if (!account) {
    return null
  }

  return account
}

export async function getCurrentAccount(): Promise<Account | null> {
  if (currentAccount.value) {
    return currentAccount.value
  }

  const currentAccountId = await getStorage(CURRENT_ACCOUNT_ID)
  if (!currentAccountId) {
    return null
  }

  currentAccount.value = await getAccount(currentAccountId)

  return currentAccount.value
}

export async function removeCurrentAccount(): Promise<boolean> {
  const accounts = await getAccounts()
  if (accounts.size === 0) {
    return false
  }

  const currentAccountId = await getStorage(CURRENT_ACCOUNT_ID)
  const currentAccount = accounts.get(currentAccountId)
  if (!currentAccount) {
    return false
  }

  accounts.delete(currentAccountId)
  await setStorage(CURRENT_ACCOUNT_ID, '')
  setAccounts(accounts)
  return true
}

export async function connectAccount(accountId: string) {
  const _currentAccount = await getAccount(accountId)
  if (!_currentAccount) {
    return false
  }

  await setStorage(CURRENT_ACCOUNT_ID, accountId)
  currentAccount.value = _currentAccount
  account.value = _currentAccount

  return true
}

export async function setAccounts(accountsMap: Map<string, Account>): Promise<void> {
  accounts.value = accountsMap
  await setStorage(ACCOUNT_STORAGE_CURRENT_KEY, serializeAccountMap(accountsMap))
}

export async function setAccount(account: Account) {
  const accounts = await getAccounts()
  accounts.set(account.id, account)
  setAccounts(accounts)
}

export async function addAccount(newAccount: Omit<Account, 'id' | 'name'>) {
  const accounts = await getAccounts()

  const { mnemonic } = newAccount
  let id: string
  let account = [...accounts.values()].find((account) => account.mnemonic === mnemonic)

  if (!account) {
    id = generateRandomString(32)
    await setAccount({
      ...newAccount,
      id,
      name: `Account ${accounts.size + 1}`,
    })
  } else {
    id = account.id
  }
  await connectAccount(id)
}

async function getAccountProperty(chain: Chain, key: keyof ChainDetail[Chain]): Promise<string> {
  const account = await getCurrentAccount()
  console.log('current account', account)

  if (!account) {
    return ''
  }

  return account[chain][key]
}

export async function getAddress(chain: Chain = 'mvc', path?: string): Promise<string> {
  const network = await getNetwork()
  const account = await getCurrentAccount()

  if (chain === 'btc' || !path) {
    return getAccountProperty(chain, network === 'mainnet' ? 'mainnetAddress' : 'testnetAddress')
  }

  // derive mvc address by path
  try {
    const rootPath = await getMvcRootPath()
    const concatPath = `${rootPath}/${path}`

    const mneObj = mvc.Mnemonic.fromString(account!.mnemonic)
    const hdpk = mneObj.toHDPrivateKey('', network)
    const privateKey = hdpk.deriveChild(concatPath).privateKey

    return privateKey.toAddress(network).toString()
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getAddressType(chain: Chain = 'mvc'): Promise<string> {
  return getAccountProperty(chain, 'addressType')
}

export async function getMvcRootPath(): Promise<string> {
  const mvcFullPath = await getAccountProperty('mvc', 'path')

  return mvcFullPath.slice(0, mvcFullPath.length - 4)
}

export async function getPrivateKey(chain: Chain = 'mvc') {
  const network = await getNetwork()
  const mnemonic = await getCurrentAccount().then((account) => account!.mnemonic)
  const path = await getAccountProperty(chain, 'path')

  return derivePrivateKey({ mnemonic, chain, network, path })
}

export async function getCredential(
  chain: Chain = 'btc'
): Promise<{ address: string; publicKey: string; signature: string }> {
  const account = currentAccount.value ?? raise('No current account')
  const cachedCredential = account[chain]['credential']

  if (cachedCredential) return cachedCredential

  const message = 'metalet.space'
  const wif = await getPrivateKey(chain)
  const privateKey = mvc.PrivateKey.fromWIF(wif)
  const { signature } = signMessage(message, privateKey)
  const address = await getAddress(chain)
  const publicKey = await getPublicKey(chain)
  const newCredential = {
    address,
    publicKey,
    signature,
  }

  // cache credential
  account[chain]['credential'] = newCredential
  await setAccount(account)

  return newCredential
}

export async function getPublicKey(chain: Chain = 'mvc', path?: string): Promise<string> {
  const network = await getNetwork()
  const mnemonic = await getCurrentAccount().then((account) => account!.mnemonic)

  if (!path) {
    const fullPath = await getAccountProperty(chain, 'path')

    return derivePublicKey({ mnemonic, chain, network, path: fullPath })
  }

  // derive mvc public key by path
  try {
    const rootPath = await getMvcRootPath()
    const concatPath = `${rootPath}/${path}`

    const mneObj = mvc.Mnemonic.fromString(mnemonic)
    const hdpk = mneObj.toHDPrivateKey('', network)
    const privateKey = hdpk.deriveChild(concatPath).privateKey

    return privateKey.toPublicKey().toString()
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getXPublicKey() {
  const account = await getCurrentAccount()
  if (!account) {
    return ''
  }

  const network = await getNetwork()
  const mneObj = mvc.Mnemonic.fromString(account.mnemonic)
  const rootPath = await getMvcRootPath()
  const xPublicKey = mneObj.toHDPrivateKey('', network).deriveChild(rootPath).xpubkey.toString()
  console.log('xPublicKey', xPublicKey)

  return xPublicKey
}

export async function getBalance(chain: Chain = 'mvc', address?: string) {
  const account = await getCurrentAccount()

  if (!account) {
    return null
  }

  if (!address) {
    address = await getAddress(chain)
  }

  switch (chain) {
    case 'mvc':
      return fetchSpaceBalance(address)
    case 'btc':
      return fetchBtcBalance(address)
    default: {
      return doNothing()
    }
  }
}

export async function getUtxos(params?: { path?: string }) {
  const account = await getCurrentAccount()
  console.log('account', account)
  if (!account) {
    return null
  }
  const address = await getAddress('mvc', params?.path)

  return await fetchUtxos(address)
}

export async function updateName(name: string) {
  const account = await getCurrentAccount()
  if (!account) {
    return
  }

  account.name = name
  await setAccount(account)
}

export async function updateBtcPath(path: string) {
  const account = await getCurrentAccount()
  if (!account) {
    return
  }

  // derive new address
  const mnemonic = account.mnemonic
  const mainnetAddress = deriveAddress({ mnemonic, chain: 'btc', network: 'mainnet', path })
  const testnetAddress = deriveAddress({ mnemonic, chain: 'btc', network: 'testnet', path })
  account.btc = {
    path,
    addressType: inferAddressType(path),
    mainnetAddress,
    testnetAddress,
  }

  await setAccount(account)
}

export async function needsMigrationV2(): Promise<boolean> {
  const oldRecords = await getStorage(ACCOUNT_STORAGE_HISTORY_KEYS[0])
  const newRecords = await getStorage(ACCOUNT_STORAGE_CURRENT_KEY)

  return !!(oldRecords && !newRecords)
}

export async function migrateV2(): Promise<void> {
  const oldRecords = await getStorage(ACCOUNT_STORAGE_HISTORY_KEYS[0])
  if (!oldRecords) {
    return
  }
  const oldRecordsIds = Object.keys(oldRecords)

  // loop through old records and construct new accounts map accordingly
  const newAccounts = new Map()
  for (let i = 0; i < oldRecordsIds.length; i++) {
    const oldRecordId = oldRecordsIds[i]
    const oldRecord = oldRecords[oldRecordId]

    const deriveChainPath = oldRecord.path
    const path = `m/44'/${deriveChainPath}'/0'/0/0`
    const rndNameId = generateRandomString(4)

    const allAddresses = deriveAllAddresses({
      mnemonic: oldRecord.mnemonic,
      btcPath: path,
      mvcPath: path,
    })

    const newAccount = {
      id: oldRecordId,
      name: oldRecord.name || `Account ${rndNameId}`,
      mnemonic: oldRecord.mnemonic,
      assetsDisplay: ['SPACE', 'BTC'],
      mvc: {
        path,
        addressType: 'P2PKH',
        mainnetAddress: allAddresses.mvcMainnetAddress,
        testnetAddress: allAddresses.mvcTestnetAddress,
      },
      btc: {
        path,
        addressType: 'P2PKH',
        mainnetAddress: allAddresses.btcMainnetAddress,
        testnetAddress: allAddresses.btcTestnetAddress,
      },
    }
    newAccounts.set(oldRecordId, newAccount)
  }

  // set new accounts map
  await setAccounts(newAccounts)
}

type AccountManager = {
  all: () => Promise<any>
  current: Ref<Account | null>
  getCurrent: () => Promise<Account | null>
  removeCurrent: () => Promise<boolean>
  set: (account: Account) => Promise<void>
  add: (account: Omit<Account, 'id' | 'name'>) => Promise<void>
  connect: (accountId: string) => Promise<boolean>
  getPublicKey: (chain: Chain, path?: string) => Promise<string>
  getBalance: (chain: Chain, address?: string) => Promise<Awaited<ReturnType<typeof fetchSpaceBalance>> | null>
  getAddress: (chain: Chain, path?: string) => Promise<any>
  getXPublicKey: () => Promise<string | null>
  getUtxos: (params?: any) => Promise<any>
  updateName: (name: string) => Promise<void>
}

const accountManager = {} as AccountManager
accountManager.all = getAccounts
accountManager.current = currentAccount
accountManager.getCurrent = getCurrentAccount
accountManager.set = setAccount
accountManager.add = addAccount
accountManager.connect = connectAccount
accountManager.getAddress = getAddress
accountManager.getPublicKey = getPublicKey
accountManager.getXPublicKey = getXPublicKey
accountManager.getBalance = getBalance
accountManager.getUtxos = getUtxos
accountManager.removeCurrent = removeCurrentAccount
accountManager.updateName = updateName

export default accountManager

// Class
class AccountCls {
  mnemonic: string
  constructor(mnemonic: string) {
    this.mnemonic = mnemonic
  }

  async getAddress({ path }: { path?: string }) {
    const network = await getNetwork()
    const mneObj = mvc.Mnemonic.fromString(this.mnemonic)
    const hdpk = mneObj.toHDPrivateKey('', network)
    if (!(path && path.length)) {
      const privateKey = hdpk.deriveChild(`m/44'/0'/0'/0/0`).privateKey
      return privateKey.toAddress(network).toString()
    }

    // 根据路径导出
    try {
      const privateKey = hdpk.deriveChild(`m/44'/0'/0'/${path}`).privateKey
      return privateKey.toAddress(network).toString()
    } catch (e: any) {
      return {
        message: e.message,
        status: 'failed',
      }
    }
  }

  async getPublicKey({ path }: { path?: string }) {
    const network = await getNetwork()
    const mneObj = mvc.Mnemonic.fromString(this.mnemonic)
    const hdpk = mneObj.toHDPrivateKey('', network)
    if (!(path && path.length)) {
      const privateKey = hdpk.deriveChild(`m/44'/0'/0'/0/0`).privateKey
      return privateKey.toPublicKey().toString()
    }

    // 根据路径导出
    try {
      const privateKey = hdpk.deriveChild(`m/44'/0'/0'/${path}`).privateKey
      return privateKey.toPublicKey().toString()
    } catch (e: any) {
      return {
        message: e.message,
        status: 'failed',
      }
    }
  }

  async getXPublicKey() {
    const network = await getNetwork()
    const mneObj = mvc.Mnemonic.fromString(this.mnemonic)
    const xPublicKey = mneObj.toHDPrivateKey('', network).xpubkey.toString()
    console.log('xPublicKey', xPublicKey)

    return xPublicKey
  }
}
