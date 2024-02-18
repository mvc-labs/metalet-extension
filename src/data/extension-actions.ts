import { deriveAllAddresses } from '@/lib/bip32-deriver'
import { addAssetsDisplay, getAssetsDisplay, removeAssetsDisplay } from '@/lib/assets'
import {
  getCurrentAccount,
  updateName,
  addAccount,
  getAddress,
  getPrivateKey,
  updateBtcPath,
  getAddressType,
} from '@/lib/account'

import { migrateV2, needMigrationV2 } from '@/lib/migrate'

export default {
  getCurrentAccount,
  updateName,
  addAccount,
  getAddress,
  getPrivateKey,
  getAddressType,
  updateBtcPath,
  migrateV2,
  needMigrationV2,
  deriveAllAddresses,
  getAssetsDisplay,
  addAssetsDisplay,
  removeAssetsDisplay,
} as { [key: string]: Function }
