import {
  connect,
  isConnected,
  disconnect,
  getAddress,
  getPublicKey,
  getXPublicKey,
  getBalance,
  getUtxos,
  getTokenBalance,
  transfer,
  merge,
  getNetwork,
  switchNetwork,
  eciesEncrypt,
  eciesDecrypt,
  signMessage,
  verifySignature,
  signTransaction,
} from './actions'

type Metalet = {
  connect: any
  disconnect: any
  isConnected: any
  getNetwork: any
  switchNetwork: any
  getAddress: any
  getPublicKey: any
  getXPublicKey: any
  getBalance: any
  merge: any
  signTransaction: any
  signMessage: any
  verifySignature: any
  getUtxos: any
  //   getActivities: any
  transfer: any
  // transferAll: any
  //   merge: any

  eciesEncrypt: any
  eciesDecrypt: any

  token: {
    //   list: any
    getBalance: any
    //   transfer: any
    //   merge: any
    //   getActivities: any
  }
  nft: {
    //   list: any
    //   transfer: any
    //   getActivities: any
  }

  // Deprecating
  requestAccount: any
  getAccount: any
  exitAccount: any
  getMvcBalance: any
  getSensibleFtBalance: any
}

const metalet: Metalet = {
  connect,
  isConnected,
  disconnect,
  getNetwork,
  switchNetwork,
  getAddress,
  getPublicKey,
  getXPublicKey,
  getBalance,
  getUtxos,
  transfer,
  merge,
  signTransaction,
  signMessage,
  verifySignature,

  eciesEncrypt,
  eciesDecrypt,
  // signTransaction,
  // transferAll,
  token: {
    getBalance: getTokenBalance,
  },
  nft: {},

  // Deprecating
  requestAccount: connect,
  getAccount: connect,
  exitAccount: disconnect,
  getMvcBalance: getBalance,
  getSensibleFtBalance: getTokenBalance,
}

window.metaidwallet = metalet

export {}
