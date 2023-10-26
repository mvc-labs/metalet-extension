import { deriveAllAddresses } from '@/lib/bip32-deriver'
import { addAssetsDisplay, getAssetsDisplay, removeAssetsDisplay } from '@/lib/assets'
import {
  getCurrentAccount,
  updateName,
  addAccount,
  getAddress,
  getPrivateKey,
  updateBtcPath,
  migrateV2,
  needsMigrationV2,
  getAddressType,
} from '@/lib/account'

export default {
  getCurrentAccount,
  updateName,
  addAccount,
  getAddress,
  getPrivateKey,
  getAddressType,
  updateBtcPath,
  migrateV2,
  needsMigrationV2,
  deriveAllAddresses,
  getAssetsDisplay,
  addAssetsDisplay,
  removeAssetsDisplay,
} as { [key: string]: Function }
