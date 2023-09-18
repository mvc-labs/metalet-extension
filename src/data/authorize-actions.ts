import * as TransferToken from '../lib/actions/transfer-token'
import * as Transfer from '../lib/actions/transfer'
import * as Connect from '../lib/actions/connect'
import * as Disconnect from '../lib/actions/disconnect'
import * as SwitchNetwork from '../lib/actions/switch-network'
import * as EciesEncrypt from '../lib/actions/ecies-encrypt'
import * as EciesDecrypt from '../lib/actions/ecies-decrypt'
import * as SignTransaction from '../lib/actions/sign-transaction'
import * as SignTransactions from '../lib/actions/sign-transactions'
import * as SignMessage from '../lib/actions/sign-message'
import * as Merge from '../lib/actions/merge'

function doNothing() {}

type AuthorizeAction = {
  name: string
  title: string
  description: string | string[]
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
  SignTransaction: {
    name: 'Sign a Transaction',
    title: 'Sign a Transaction',
    description: ['Sign a transaction with my wallet'],
    process: SignTransaction.process,
    estimate: doNothing,
    closeAfterProcess: true,
  },

  SignTransactions: {
    name: 'Sign Transactions',
    title: 'Sign Multiple Transactions',
    description: ['Sign multiple transactions with my wallet as once'],
    process: SignTransactions.process,
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
    description: ['Decrypt an encrypted message with ECIES algorithm'],
    process: EciesDecrypt.process,
    estimate: doNothing,
    closeAfterProcess: true,
  },

  SignMessage: {
    name: 'Sign Message',
    title: 'Sign Message',
    description: ['Sign a message with ECDSA algorithm'],
    process: SignMessage.process,
    estimate: doNothing,
    closeAfterProcess: true,
  },
} as { [key: string]: AuthorizeAction }
