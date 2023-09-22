function getProcessor(actionName: string) {
  return () => import(`../lib/actions/${actionName.toLowerCase()}`).then((m) => m.process)
}
function getEstimator(actionName: string) {
  return () => import(`../lib/actions/${actionName.toLowerCase()}`).then((m) => m.estimate)
}

function doNothing() {}

type AuthorizeAction = {
  name: string
  title: string
  description: string | string[]
  process: Function
  estimate: Function
  closeAfterProcess: boolean
}

const actions = {
  Connect: {
    name: 'Connect',
    title: 'Connect',
    description: 'Connect',
    process: () => getProcessor('connect'),
    estimate: doNothing,
    closeAfterProcess: true,
  },
  Disconnect: {
    name: 'Disconnect',
    title: 'Disconnect',
    description: 'Disconnect',
    process: getProcessor('disconnect'),
    estimate: doNothing,
    closeAfterProcess: true,
  },
  SwitchNetwork: {
    name: 'SwitchNetwork',
    title: 'SwitchNetwork',
    description: 'SwitchNetwork',
    process: getProcessor('switch-network'),
    estimate: doNothing,
    closeAfterProcess: true,
  },
  TokenTransfer: {
    name: 'TokenTransfer',
    title: 'Token Transfer',
    description: 'Transfer tokens from my wallet to another',
    process: getProcessor('transfer-token'),
    estimate: getEstimator('transfer-token'),
    closeAfterProcess: false,
  },
  Transfer: {
    name: 'Transfer',
    title: 'Transfer',
    description: 'Transfer tokens from my wallet to another',
    process: getProcessor('transfer'),
    estimate: doNothing,
    closeAfterProcess: false,
  },
  Merge: {
    name: 'Merge',
    title: 'Merge',
    description: 'Merge all the UTXOs into one in my wallet',
    process: getProcessor('merge'),
    estimate: doNothing,
    closeAfterProcess: false,
  },
  SignTransaction: {
    name: 'Sign a Transaction',
    title: 'Sign a Transaction',
    description: ['Sign a transaction with my wallet'],
    process: getProcessor('sign-transaction'),
    estimate: doNothing,
    closeAfterProcess: true,
  },
  EciesEncrypt: {
    name: 'ECIES Encrypt',
    title: 'ECIES Encrypt',
    description: 'Encrypt a message with ECIES algorithm',
    process: getProcessor('ecies-encrypt'),
    estimate: doNothing,
    closeAfterProcess: true,
  },
  EciesDecrypt: {
    name: 'ECIES Decrypt',
    title: 'ECIES Decrypt',
    description: ['Decrypt an encrypted message with ECIES algorithm'],
    process: getProcessor('ecies-decrypt'),
    estimate: doNothing,
    closeAfterProcess: true,
  },
} as { [key: string]: AuthorizeAction }

export default actions

const authorizeActionNames = Object.keys(actions)
export { authorizeActionNames }
