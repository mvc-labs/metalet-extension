import {
  connect,
  isConnected,
  disconnect,
  getAddress,
  getPublicKey,
  getBalance,
  getTokenBalance,
  transfer,
  merge,
  getNetwork,
  switchNetwork,
  eciesEncrypt,
  eciesDecrypt,
  // transferAll,
  // signTransaction,
  // signTx,
} from './actions'

type Metalet = {
  // signTransaction: any
  //   signMessage: any
  // signTx: any
  connect: any
  disconnect: any
  isConnected: any
  getNetwork: any
  switchNetwork: any
  getAddress: any
  getPublicKey: any
  getBalance: any
  merge: any
  //   getUtxos: any
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
  getBalance,
  transfer,
  merge,

  eciesEncrypt,
  eciesDecrypt,
  // signTx,
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
