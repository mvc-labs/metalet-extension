import * as TransferToken from '../lib/actions/transfer-token'
import * as Transfer from '../lib/actions/transfer'
import * as SignTx from '../lib/actions/sign-tx'
import * as Connect from '../lib/actions/connect'
import * as Disconnect from '../lib/actions/disconnect'
import * as SwitchNetwork from '../lib/actions/switch-network'
import * as EciesEncrypt from '../lib/actions/ecies-encrypt'
import * as EciesDecrypt from '../lib/actions/ecies-decrypt'
import * as Merge from '../lib/actions/merge'

function doNothing() {}

type AuthorizeAction = {
  name: string
  title: string
  description: string
  process: Function
  estimate: Function
  closeAfterProcess: boolean
}

export default {
  Connect: {
    name: 'Connect',
    title: 'Connect',
    description: 'Connect',
    process: Connect.process,
    estimate: doNothing,
    closeAfterProcess: true,
  },

  Disconnect: {
    name: 'Disconnect',
    title: 'Disconnect',
    description: 'Disconnect',
    process: Disconnect.process,
    estimate: doNothing,
    closeAfterProcess: true,
  },

  SwitchNetwork: {
    name: 'SwitchNetwork',
    title: 'SwitchNetwork',
    description: 'SwitchNetwork',
    process: SwitchNetwork.process,
    estimate: doNothing,
    closeAfterProcess: true,
  },

  TokenTransfer: {
    name: 'TokenTransfer',
    title: 'Token Transfer',
    description: 'Transfer tokens from my wallet to another',
    process: TransferToken.process,
    estimate: TransferToken.estimate,
    closeAfterProcess: false,
  },
  Transfer: {
    name: 'Transfer',
    title: 'Transfer',
    description: 'Transfer tokens from my wallet to another',
    process: Transfer.process,
    estimate: doNothing,
    closeAfterProcess: false,
  },
  Merge: {
    name: 'Merge',
    title: 'Merge',
    description: 'Merge all the UTXOs into one in my wallet',
    process: Merge.process,
    estimate: doNothing,
    closeAfterProcess: false,
  },
  SignTx: {
    name: 'Sign Tx',
    title: 'Sign Tx',
    description: 'Transfer tokens from my wallet to another',
    process: SignTx.process,
    estimate: doNothing,
    closeAfterProcess: true,
  },

  EciesEncrypt: {
    name: 'ECIES Encrypt',
    title: 'ECIES Encrypt',
    description: 'Encrypt a message with ECIES algorithm',
    process: EciesEncrypt.process,
    estimate: doNothing,
    closeAfterProcess: true,
  },
  EciesDecrypt: {
    name: 'ECIES Decrypt',
    title: 'ECIES Decrypt',
    description: 'Decrypt an encrypted message with ECIES algorithm',
    process: EciesDecrypt.process,
    estimate: doNothing,
    closeAfterProcess: true,
  },
} as { [key: string]: AuthorizeAction }
