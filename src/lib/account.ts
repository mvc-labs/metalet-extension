import { Ref, ref } from 'vue'
import { fetchSpaceBalance } from '../queries/balance'
import { getStorage, setStorage } from './storage'
import { generateRandomString, raise } from './helpers'
import { getNetwork } from './network'
import { mvc } from 'meta-contract'
import { networks, payments } from 'bitcoinjs-lib'
import bip39 from 'bip39'
import BIP32Factory from 'bip32'
import * as ecc from 'tiny-secp256k1'

const bip32 = BIP32Factory(ecc)

export type Account = {
  id: string
  mnemonic: string
  path: string
  btcPath: string
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

  await fixCompatibility(current)

  // 保存当前账户的地址和私钥
  const network = await getNetwork()
  address.value = network === 'mainnet' ? current.mainnetAddress : current.testnetAddress
  privateKey.value = network === 'mainnet' ? current.mainnetPrivateKey : current.testnetPrivateKey

  account.value = current

  return current
}

export async function getAccountInstance(accountId: string): Promise<AccountCls | null> {
  const accounts = await getStorage('accounts')
  if (!accounts) {
    return null
  }
  const current = accounts[accountId]
  if (!current) {
    return null
  }

  await fixCompatibility(current)

  const network = await getNetwork()
  const mneObj = mvc.Mnemonic.fromString(current.mnemonic)

  return new AccountCls(current.mnemonic)
}

async function fixCompatibility(account: Account) {
  // if old account has no btcPath, set it to default value the same as path
  if (!account.btcPath) {
    account.btcPath = `m/44'/${account.path}'/0'/0/0`

    // save to storage
    await setAccount(account)
  }
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

export async function deriveAddress({ chain }: { chain: 'btc' | 'mvc' }) {
  const account = (await getCurrentAccount()) ?? raise('No account')
  console.log('account', account)

  const network = await getNetwork()

  const mneObj = mvc.Mnemonic.fromString(account.mnemonic)
  const hdpk = mneObj.toHDPrivateKey('', network)
  if (chain === 'btc') {
    console.log('validateMnemonic', bip39.validateMnemonic(account.mnemonic))
    if (!bip39.validateMnemonic(account.mnemonic)) {
      return ''
    }
    console.log('account.mnemonic', account.mnemonic)

    const seed = bip39.mnemonicToSeedSync(account.mnemonic)
    // const seed = Mnemonic.toSeed(account.mnemonic)
    console.log('seed', seed)
    // console.log('bitcoin', bitcoin)
    // console.log('bip32', bip32)
    const btcNetwork = network === 'mainnet' ? networks.bitcoin : networks.testnet
    const root = bip32.fromSeed(seed, btcNetwork)
    // console.log('account.btcPath', account.btcPath)
    // const child = root.derivePath(account.btcPath)
    // const paymentAddress = bitcoin.payments.p2pkh({
    //   pubkey: child.publicKey,
    //   network: btcNetwork,
    // })
    // console.log('paymentAddress', paymentAddress.address)

    const privateKey = hdpk.deriveChild(account.btcPath).privateKey
    return privateKey.toAddress(network).toString()
  } else {
    try {
      const pathDepth = account.path
      const privateKey = hdpk.deriveChild(`m/44'/${pathDepth}'/0'/0/0`).privateKey

      return privateKey.toAddress(network).toString()
    } catch (e: any) {
      throw new Error(e.message)
    }
  }
}

export async function getAddress(params?: { path?: string }): Promise<any> {
  const account = await getCurrentAccount()
  if (!account) {
    return null
  }

  const network = await getNetwork()

  address.value = network === 'mainnet' ? account.mainnetAddress : account.testnetAddress
  privateKey.value = network === 'mainnet' ? account.mainnetPrivateKey : account.testnetPrivateKey

  if (!(params && params.path)) {
    return address.value
  }

  // 根据路径导出
  try {
    const path = account.path
    const mneObj = mvc.Mnemonic.fromString(account.mnemonic)
    const hdpk = mneObj.toHDPrivateKey('', network)
    const privateKey = hdpk.deriveChild(`m/44'/${path}'/0'/${params.path}`).privateKey

    return privateKey.toAddress(network).toString()
  } catch (e: any) {
    return {
      message: e.message,
      status: 'failed',
    }
  }
}

export async function getPublicKey(params?: { path?: string }) {
  const account = await getCurrentAccount()
  if (!account) {
    return null
  }

  const network = await getNetwork()

  if (!(params && params.path)) {
    const privateKey = mvc.PrivateKey.fromString(
      network === 'mainnet' ? account.mainnetPrivateKey : account.testnetPrivateKey
    )

    return privateKey.toPublicKey().toString()
  }

  // 根据路径导出
  try {
    const path = account.path
    const mneObj = mvc.Mnemonic.fromString(account.mnemonic)
    const hdpk = mneObj.toHDPrivateKey('', network)
    const privateKey = hdpk.deriveChild(`m/44'/${path}'/0'/${params.path}`).privateKey
    return privateKey.toPublicKey().toString()
  } catch (e: any) {
    return {
      message: e.message,
      status: 'failed',
    }
  }
}

export async function getXPublicKey() {
  console.log('hi')
  const account = await getCurrentAccount()
  if (!account) {
    return null
  }

  const network = await getNetwork()
  const mneObj = mvc.Mnemonic.fromString(account.mnemonic)
  const xPublicKey = mneObj.toHDPrivateKey('', network).xpubkey.toString()
  console.log('xPublicKey', xPublicKey)

  return xPublicKey
}

export async function getBalance() {
  const account = await getCurrentAccount()
  if (!account) {
    return null
  }
  const balance = await fetchSpaceBalance(address.value)

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

type AccountManager = {
  all: () => Promise<any>
  current: Ref<Account | null>
  getCurrent: () => Promise<Account | null>
  getAccountInstance: (accountId: string) => Promise<AccountCls | null>
  removeCurrent: () => Promise<boolean>
  set: (account: Account) => Promise<void>
  add: (account: Omit<Account, 'id'>) => Promise<void>
  connect: (accountId: string) => Promise<boolean>
  getAddress: ({ path }: { path?: string }) => Promise<any>
  getPublicKey: ({ path }: { path?: string }) => Promise<
    | string
    | null
    | {
        message: string
        status: string
      }
  >
  getXPublicKey: () => Promise<string | null>
  getBalance: () => Promise<Awaited<ReturnType<typeof fetchSpaceBalance>> | null>
  updateName: (name: string) => Promise<void>
}

const accountManager = {} as AccountManager
accountManager.all = getAll
accountManager.current = account
accountManager.getCurrent = getCurrentAccount
accountManager.getAccountInstance = getAccountInstance
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
