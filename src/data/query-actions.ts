import * as IsConnected from '../lib/actions/is-connected'
import * as GetAddress from '../lib/actions/get-address'
import * as GetPublicKey from '../lib/actions/get-public-key'
import * as GetBalance from '../lib/actions/get-balance'
import * as GetNetwork from '../lib/actions/get-network'
import * as GetTokenBalance from '../lib/actions/token/get-balance'

type QueryAction = {
  process: Function
}

export default {
  IsConnected,
  GetNetwork,
  GetAddress,
  GetPublicKey,
  GetBalance,
  GetTokenBalance,
} as { [key: string]: QueryAction }
