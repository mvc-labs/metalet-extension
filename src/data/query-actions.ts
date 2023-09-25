import * as IsConnected from '../lib/actions/is-connected'
import * as GetAddress from '../lib/actions/get-address'
import * as GetUtxos from '../lib/actions/get-utxos'
import * as GetPublicKey from '../lib/actions/get-public-key'
import * as GetXPublicKey from '../lib/actions/get-extended-public-key'
import * as GetBalance from '../lib/actions/get-balance'
import * as GetNetwork from '../lib/actions/get-network'
import * as VerifySignature from '../lib/actions/verify-signature'
import * as GetTokenBalance from '../lib/actions/token/get-balance'
import * as PreviewTransaction from '../lib/actions/preview-transaction'

// BTC
import * as GetBTCBalance from '../lib/actions/btc/get-balance'
import * as GetBTCAddress from '../lib/actions/btc/get-address'
import * as GetBTCPublicKey from '../lib/actions/btc/get-public-key'
import * as GetBTCUtxos from '../lib/actions/btc/get-utxos'

type QueryAction = {
  process: Function
}

export default {
  IsConnected,
  GetNetwork,
  GetAddress,
  GetPublicKey,
  GetBalance,
  GetUtxos,
  GetTokenBalance,
  VerifySignature,
  GetXPublicKey,
  PreviewTransaction,

  // BTC
  GetBTCBalance,
  GetBTCAddress,
  GetBTCPublicKey,
  GetBTCUtxos,
} as { [key: string]: QueryAction }
