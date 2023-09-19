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
} as { [key: string]: QueryAction }
