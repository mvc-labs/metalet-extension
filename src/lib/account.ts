import { Ref, ref } from 'vue'
import { mvc } from 'meta-contract'
import bitcoin from 'bitcoinjs-lib'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import ECPairFactory, { ECPairInterface } from 'ecpair'
import bitcore from 'bitcore-lib'
import { decode } from 'bs58check'

const ECPair = ECPairFactory(ecc)

import { AddressType, deriveAddress, derivePrivateKey, derivePublicKey, inferAddressType } from './bip32-deriver'
import { fetchSpaceBalance } from '@/queries/balance'
import { getStorage, setStorage } from './storage'
import { generateRandomString, raise } from './helpers'
import { getNetwork } from './network'
import { signMessage } from './crypto'

bitcoin.initEccLib(ecc)

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

export const address = ref('')
export const privateKey = ref('')
export const account = ref<Account | null>(null)

export async function getAccounts(refresh = false): Promise<Map<string, Account>> {
  if (!isAccountsLoaded.value) {
    // TODO
    // ACCOUNT_STORAGE_HISTORY_KEYS.forEach((key) => {
    //   deleteStorage(key)
    // })
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
  console.log("currentAccount.value", currentAccount.value);


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
  const currentAccount = await getAccount(accountId)
  if (!currentAccount) {
    return false
  }

  await setStorage(CURRENT_ACCOUNT_ID, accountId)

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
  if (!account) {
    return ''
  }

  return account[chain][key]
}

export async function getAddress(chain: Chain = 'mvc'): Promise<string> {
  const network = await getNetwork()
  return getAccountProperty(chain, network === 'mainnet' ? 'mainnetAddress' : 'testnetAddress')
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
  const { signature } = signMessage(wif, message)
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

export async function getPublicKey(chain: Chain = 'mvc'): Promise<string> {
  const network = await getNetwork()
  const mnemonic = await getCurrentAccount().then((account) => account!.mnemonic)
  const path = await getAccountProperty(chain, 'path')

  return derivePublicKey({ mnemonic, chain, network, path })
}

export async function getXPublicKey(chain: Chain = 'mvc'): Promise<string> {
  if (chain === 'btc') raise('Not supported yet')

  const account = await getCurrentAccount()
  if (!account) {
    return ''
  }

  const network = await getNetwork()
  const mneObj = mvc.Mnemonic.fromString(account.mnemonic)
  const xPublicKey = mneObj.toHDPrivateKey('', network).xpubkey.toString()
  console.log('xPublicKey', xPublicKey)

  return xPublicKey
}

export async function getBalance(address: string) {
  const account = await getCurrentAccount()
  if (!account) {
    return null
  }
  const balance = await fetchSpaceBalance(address)

  return balance
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

type AccountManager = {
  all: () => Promise<any>
  current: Ref<Account | null>
  getCurrent: () => Promise<Account | null>
  removeCurrent: () => Promise<boolean>
  set: (account: Account) => Promise<void>
  add: (account: Omit<Account, 'id' | 'name'>) => Promise<void>
  connect: (accountId: string) => Promise<boolean>
  getAddress: (chain: Chain) => Promise<string>
  getPublicKey: (chain: Chain) => Promise<string>
  getXPublicKey: (chain: Chain) => Promise<string>
  getBalance: (address: string) => Promise<Awaited<ReturnType<typeof fetchSpaceBalance>> | null>
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
