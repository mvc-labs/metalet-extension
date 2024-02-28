import useStorage from './storage'
import { mvc } from 'meta-contract'
import { encrypt, decrypt } from './crypto'
import { generateRandomString } from './helpers'
import { AddressType, deriveAllAddresses } from './bip32-deriver'
import {
  getV0Account,
  getLegacyAccounts,
  getV2Accounts,
  getV2AccountsObj,
  setV2Accounts,
  type Account,
  type DerivedAccountDetail,
} from './account'

export const ACCOUNT_Sync_Migrated_KEY = 'accounts_sync_migrated'
export const ACCOUNT_V2_Migrated_KEY = 'accounts_v2_migrated'
export const ACCOUNT_V2_Encrypted_KEY = 'accounts_v2_encrypted'
export const Error_Accounts_Migrate_Log_Key = 'error_accounts_migrate_log'

const storage = useStorage()

type MigrateErrorVersion = 'Sync' | 'V1' | 'V2'

interface MigrateErrorAccount {
  timeStamp: number
  version: MigrateErrorVersion
  mnemonic: string
  address: string
  storage: string
}

const getMigrateErrorAccounts = async (): Promise<MigrateErrorAccount[]> => {
  return await storage.get<MigrateErrorAccount[]>(Error_Accounts_Migrate_Log_Key, { defaultValue: [] })
}

const addMigrateErrorAccount = async (address: string, mnemonic: string, storage: string): Promise<void> => {
  const errorAccounts = await getMigrateErrorAccounts()
  errorAccounts.push({
    timeStamp: Date.now(),
    version: 'Sync',
    mnemonic,
    address,
    storage,
  })
}

enum MigrateResultCode {
  SUCCESS = 0,
  FAILED = -1,
  NO_fOUND = 1,
}

interface MigrateResult {
  code: MigrateResultCode
  message: string
}

interface SyncCurrentAccount {
  address: string
  mnemonicStr: string
}

export async function migrationSync(): Promise<MigrateResult> {
  const v0Record = await getV0Account()
  if (v0Record) {
    // First, determine whether it is possible to retrieve.
    const address = v0Record.address
    const mnemonicStr = v0Record.mnemonicStr
    if (!mnemonicStr) {
      await addMigrateErrorAccount(address, mnemonicStr, v0Record.toString())
      await storage.set(ACCOUNT_Sync_Migrated_KEY, true)
      return {
        code: MigrateResultCode.FAILED,
        message: 'Mnemonic is empty.',
      }
    }
    if (!address) {
      await addMigrateErrorAccount(address, mnemonicStr, v0Record.toString())
      await storage.set(ACCOUNT_Sync_Migrated_KEY, true)
      return {
        code: MigrateResultCode.FAILED,
        message: 'Address is empty.',
      }
    }
    let usingPath = ''
    const mneObj = mvc.Mnemonic.fromString(mnemonicStr)
    const commonPaths = ['236', '10001']
    const network = address.startsWith('1') ? 'mainnet' : 'testnet'
    for (const path of commonPaths) {
      const hdpk = mneObj.toHDPrivateKey('', network)
      const privateKey = hdpk.deriveChild(`m/44'/${path}'/0'/0/0`).privateKey
      const derivedAddress = privateKey.toAddress(network).toString()
      if (address === derivedAddress) {
        usingPath = path
        const v2Records = await getV2Accounts()
        const v2Account = Array.from(v2Records.values()).find(
          (account) =>
            account.mnemonic === mnemonicStr &&
            [account.mvc.mainnetAddress, account.mvc.testnetAddress].includes(address)
        )
        if (v2Account) {
          await storage.set(ACCOUNT_Sync_Migrated_KEY, true)
          return {
            code: MigrateResultCode.SUCCESS,
            message: `Account already exists.`,
          }
        }
        const fullPath = `m/44'/${usingPath}'/0'/0/0`
        const allAddresses = deriveAllAddresses({
          mnemonic: mnemonicStr,
          btcPath: fullPath,
          mvcPath: fullPath,
        })
        const id = generateRandomString(32)
        const account = {
          id,
          name: `Account ${v2Records.size + 1}`,
          mnemonic: mnemonicStr,
          assetsDisplay: ['SPACE', 'BTC'],
          mvc: {
            // V2 storage path,V3 store fullPath
            path,
            addressType: 'P2PKH' as AddressType,
            mainnetAddress: allAddresses.mvcMainnetAddress,
            testnetAddress: allAddresses.mvcTestnetAddress,
          },
          btc: {
            path: fullPath,
            addressType: 'P2PKH' as AddressType,
            mainnetAddress: allAddresses.btcMainnetAddress,
            testnetAddress: allAddresses.btcTestnetAddress,
          },
        } as Account
        v2Records.set(generateRandomString(32), account)
        await setV2Accounts(v2Records)
        await storage.set(ACCOUNT_Sync_Migrated_KEY, true)
        return {
          code: MigrateResultCode.SUCCESS,
          message: `Migration success.`,
        }
      }
    }
    if (!usingPath) {
      await addMigrateErrorAccount(address, mnemonicStr, v0Record.toString())
      await storage.set(ACCOUNT_Sync_Migrated_KEY, true)
      return {
        code: MigrateResultCode.FAILED,
        message: 'Path is not found.',
      }
    }
  }
  await storage.set(ACCOUNT_Sync_Migrated_KEY, true)
  return {
    code: MigrateResultCode.NO_fOUND,
    message: 'Sync account data is not found.',
  }
}

export async function needMigrationV2(): Promise<boolean> {
  const v1Records = await getLegacyAccounts()
  const v2Records = await getV2Accounts()
  const v1Mnemonics = v1Records.map((record) => record.mnemonic)
  const v2Mnemonics = Array.from(v2Records.values()).map((record) => record.mnemonic)
  return v1Mnemonics.some((mne) => !v2Mnemonics.includes(mne))
}

export async function migrateV2(): Promise<void> {
  const v1Accounts = await getLegacyAccounts()
  const v2Accounts = await getV2Accounts()
  const v2AccountsArr = Array.from(v2Accounts.values())
  if (!v1Accounts.length) {
    return
  }

  for (const v1Account of v1Accounts) {
    const accountHasMigrated = v2AccountsArr.some((account) => account.mnemonic === v1Account.mnemonic)

    if (accountHasMigrated) {
      continue
    }

    const deriveChainPath = v1Account.path
    const path = `m/44'/${deriveChainPath}'/0'/0/0`
    const rndNameId = generateRandomString(4)

    const allAddresses = deriveAllAddresses({
      mnemonic: v1Account.mnemonic,
      btcPath: path,
      mvcPath: path,
    })

    const newAccount = {
      id: v1Account.id,
      name: v1Account.name || `Account ${rndNameId}`,
      mnemonic: v1Account.mnemonic,
      assetsDisplay: ['SPACE', 'BTC'],
      mvc: {
        path,
        addressType: 'P2PKH',
        mainnetAddress: allAddresses.mvcMainnetAddress,
        testnetAddress: allAddresses.mvcTestnetAddress,
      } as DerivedAccountDetail,
      btc: {
        path,
        addressType: 'P2PKH',
        mainnetAddress: allAddresses.btcMainnetAddress,
        testnetAddress: allAddresses.btcTestnetAddress,
      } as DerivedAccountDetail,
    }
    v2Accounts.set(v1Account.id, newAccount)
  }

  // set new accounts map
  await setV2Accounts(v2Accounts)
}

export async function encryptV2Accounts(password: string): Promise<void> {
  const v2Accounts = await getV2AccountsObj()
  console.log('v2Accounts', v2Accounts)

  const encryptedText = encrypt(JSON.stringify(v2Accounts), password)
  console.log('encryptedText', encryptedText)

  const decryptedText = decrypt(encryptedText, password)
  console.log('decryptedText', decryptedText)
  console.log('JSON decryptedText', JSON.parse(decryptedText))
}
