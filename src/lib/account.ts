import { Ref, ref } from 'vue'
import { fetchSpaceBalance } from '../queries/balance'
import { getStorage, setStorage, deleteStorage } from './storage'
import { generateRandomString, raise } from './helpers'
import { getNetwork, Network } from './network'
import { mvc } from 'meta-contract'
import bitcoin, { networks, payments } from 'bitcoinjs-lib'
import bip39 from 'bip39'
import BIP32Factory from 'bip32'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'

bitcoin.initEccLib(ecc)
const bip32 = BIP32Factory(ecc)

const CURRENT_ACCOUNT_ID = 'currentAccountId'
const ACCOUNT_STORAGE_HISTORY_KEYS = ['accounts']
const ACCOUNT_STORAGE_CURRENT_KEY = 'accounts_v2'

export const currentAccount = ref<Account | null>(null)

export type Chain = 'btc' | 'mvc'

export type AddressType = 'P2WPKH' | 'P2SH-P2WPKH' | 'P2TR' | 'P2PKH'

export const scripts: {
  name: string
  path: string
  addressType: AddressType
}[] = [
  {
    name: 'Native Segwit',
    addressType: 'P2WPKH',
    path: "m/84'/0'/0'",
  },
  {
    name: 'Nested Segwit',
    addressType: 'P2SH-P2WPKH',
    path: "m/49'/0'/0'",
  },
  {
    name: 'Taproot',
    addressType: 'P2TR',
    path: "m/86'/0'/0'",
  },
  {
    name: 'Legacy',
    addressType: 'P2PKH',
    path: "m/44'/0'/0'",
  },
]

interface ChainInfoDetail {
  address: string
  publicKey: string
  privateKey: string
}

type ChainInfo = {
  [chain in Chain]: ChainInfoDetail
}

export type Account = {
  id: string
  name?: string
  mvcIndex: string
  mvcPath: string
  btcPath: string
  mnemonic: string
  btcType?: AddressType
  assetsDisplay?: string[]
  mainnet: ChainInfo
  testnet: ChainInfo
}

function stringify(map: Map<string, Account>) {
  return JSON.stringify(map, (key, value) => {
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()),
      }
    }
    return value
  })
}

// JSON反序列化
function parse(json: string) {
  console.log('json', json)

  return JSON.parse(json, (key, value) => {
    if (value && value.dataType === 'Map') {
      return new Map(value.value)
    }

    if (typeof value === 'object') {
      return parse(JSON.stringify(value)) // 递归处理对象
    }

    return value
  })
}

export async function getAccounts(): Promise<Map<string, Account>> {
  ACCOUNT_STORAGE_HISTORY_KEYS.forEach((key) => {
    deleteStorage(key)
  })

  // const accounts = await getStorage(ACCOUNT_STORAGE_CURRENT_KEY)||new Map()
  // if(accounts){
  //   return new Map([...Object.entries(accounts)])
  // }
  const accounts = parse(await getStorage(ACCOUNT_STORAGE_CURRENT_KEY, { defaultValue: {}, isParse: false }))
  console.log('getAccounts accounts', accounts)

  return accounts
}

export async function getAccount(accountId: string): Promise<Account | null> {
  const accounts = await getAccounts()
  if (accounts.size === 0) {
    return null
  }

  console.log('accounts', accounts)
  console.log('accountId', accountId)

  const account = accounts.get(accountId)
  if (!account) {
    return null
  }

  return account
}

export async function getCurrentAccount(): Promise<Account | null> {
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
  await setStorage(ACCOUNT_STORAGE_CURRENT_KEY, accounts)
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

export async function setAccount(account: Account) {
  const accounts = await getAccounts()
  console.log('accounts', accounts)
  console.log('account', account)
  accounts.set(account.id, account)
  console.log('accounts', accounts)
  await setStorage(ACCOUNT_STORAGE_CURRENT_KEY, stringify(accounts))
}

export async function addAccount(newAccount: Omit<Account, 'id' | 'name'>) {
  const accounts = await getAccounts()
  console.log('addAccount accounts', accounts)

  const { mnemonic } = newAccount
  let connectId = ''
  let account = [...accounts.values()].find((account) => account.mnemonic === mnemonic)

  if (!account) {
    connectId = generateRandomString(32)
    await setAccount({
      ...newAccount,
      id: connectId,
      name: `Account ${accounts.size + 1}`,
    })
  } else {
    connectId = account.id
  }
  // await connectAccount(connectId)
}

export async function deriveAddress({ chain }: { chain: Chain }) {
  const account = (await getCurrentAccount()) ?? raise('No account')
  const network = await getNetwork()
  if (chain === 'btc') {
    bip39.validateMnemonic(account.mnemonic) ?? raise('Invalid mnemonic')
    const seed = bip39.mnemonicToSeedSync(account.mnemonic)
    const btcNetwork = network === 'mainnet' ? networks.bitcoin : networks.testnet
    const root = bip32.fromSeed(seed, btcNetwork)
    const child = root.derivePath(account.btcPath)
    switch (account.btcType) {
      case 'P2WPKH':
        return payments.p2wpkh({
          pubkey: child.publicKey,
          network: btcNetwork,
        }).address

      case 'P2SH-P2WPKH':
        const redeemScript = payments.p2wpkh({ pubkey: child.publicKey }).output
        return payments.p2sh({
          redeem: {
            output: redeemScript,
            network: btcNetwork,
          },
        }).address

      case 'P2TR':
        return payments.p2tr({
          pubkey: child.publicKey.subarray(1),
          network: btcNetwork,
        }).address

      case 'P2PKH':
        return payments.p2pkh({
          pubkey: child.publicKey,
          network: btcNetwork,
        }).address

      default:
        return payments.p2pkh({
          pubkey: child.publicKey,
          network: btcNetwork,
        }).address
    }
  } else {
    try {
      const mneObj = mvc.Mnemonic.fromString(account.mnemonic)
      const hdpk = mneObj.toHDPrivateKey('', network)
      const pathDepth = account?.mvcIndex || 10001
      const privateKey = hdpk.deriveChild(`m/44'/${pathDepth}'/0'/0/0`).privateKey
      return privateKey.toAddress(network).toString()
    } catch (e: any) {
      throw new Error(e.message)
    }
  }
}

function getBTCInfo(mnemonic: string, network: networks.Network, btcType?: string): ChainInfoDetail {
  bip39.validateMnemonic(mnemonic) ?? raise('Invalid mnemonic')
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed, network)
  switch (btcType) {
    case 'P2WPKH': {
      const { publicKey, privateKey } = root.derivePath("m/84'/0'/0'")
      const { address = '' } = payments.p2wpkh({
        pubkey: publicKey,
        network: network,
      })
      return {
        address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey?.toString('hex') || '',
      }
    }

    case 'P2SH-P2WPKH': {
      const { publicKey, privateKey } = root.derivePath("m/49'/0'/0'")
      const { address = '' } = payments.p2sh({
        pubkey: publicKey,
        network: network,
      })
      return {
        address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey?.toString('hex') || '',
      }
    }

    case 'P2TR': {
      const { publicKey, privateKey } = root.derivePath("m/86'/0'/0'")
      const { address = '' } = payments.p2tr({
        pubkey: publicKey,
        network: network,
      })
      return {
        address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey?.toString('hex') || '',
      }
    }

    case 'P2PKH': {
      const { publicKey, privateKey } = root.derivePath("m/44'/0'/0'")
      const { address = '' } = payments.p2pkh({
        pubkey: publicKey,
        network: network,
      })
      return {
        address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey?.toString('hex') || '',
      }
    }

    default: {
      const { publicKey, privateKey } = root.derivePath("m/44'/0'/0'")
      const { address = '' } = payments.p2pkh({
        pubkey: publicKey,
        network: network,
      })
      return {
        address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey?.toString('hex') || '',
      }
    }
  }
}

export function deriveBTCInfo(
  mnemonic: string,
  btcType?: string
): {
  [network in Network]: ChainInfoDetail
} {
  return {
    mainnet: getBTCInfo(mnemonic, networks.bitcoin, btcType),
    testnet: getBTCInfo(mnemonic, networks.testnet, btcType),
  }
}

export async function getInfo(key: keyof Account): Promise<any> {
  const account = await getCurrentAccount()
  if (!account) {
    return ''
  }

  return account[key]
}

export async function getChainInfo(chain: Chain, key: keyof ChainInfo[Chain]): Promise<string> {
  const account = await getCurrentAccount()
  if (!account) {
    return ''
  }

  const network = await getNetwork()
  return account[network][chain][key]
}

export async function getAddress(chain: Chain = 'mvc'): Promise<string> {
  return getChainInfo(chain, 'address')
}

export async function getPrivateKey(chain: Chain = 'mvc'): Promise<string> {
  return getChainInfo(chain, 'privateKey')
}

export async function getPublicKey(chain: Chain = 'mvc'): Promise<string> {
  return getChainInfo(chain, 'publicKey')
}

export async function getXPublicKey(chain: Chain = 'mvc'): Promise<string> {
  console.log('hi')
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

export async function updateBTCType(btcType: AddressType) {
  const account = await getCurrentAccount()
  if (!account) {
    return
  }

  account.btcType = btcType
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
  getAddress: (chain: Chain) => Promise<string>
  getPublicKey: (chain: Chain) => Promise<string>
  getXPublicKey: (chain: Chain) => Promise<string>
  getBalance: (address: string) => Promise<Awaited<ReturnType<typeof fetchSpaceBalance>> | null>
  updateName: (name: string) => Promise<void>
}

const accountManager = {} as AccountManager
accountManager.all = getAccounts
// accountManager.current = account
accountManager.getCurrent = getCurrentAccount
// accountManager.getAccountInstance = getAccountInstance
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
