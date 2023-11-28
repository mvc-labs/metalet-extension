import storage from './storage'

type Connector = {
  connect: (accountId: string, host: string) => Promise<void>
  isConnected: (accountId: string, host: string) => Promise<boolean>
  registerListen: (accountId: string, host: string) => Promise<void>
  disconnect: (accountId: string, host: string) => Promise<void>
}

const connector = {} as Connector

connector.connect = async function (accountId, host) {
  const connections = await storage.get('connections', {
    defaultValue: {},
  })
  const accountConnections = connections[accountId] || {}
  accountConnections[host] = {
    connectedAt: Date.now(),
    autoApprove: true,
  }
  // 写回
  connections[accountId] = accountConnections
  await storage.set('connections', connections)

  return
}

connector.isConnected = async function (accountId, host) {
  const connections = await storage.get('connections', { defaultValue: {} })
  const accountConnections = connections[accountId] || {}

  return accountConnections[host] !== undefined
}

connector.disconnect = async function (accountId, host) {
  const connections = await storage.get('connections', { defaultValue: {} })
  const accountConnections = connections[accountId] || {}

  delete accountConnections[host]

  connections[accountId] = accountConnections
  await storage.set('connections', connections)

  return
}

connector.registerListen = async function (accountId, host) {
  const listens = await storage.get('listens', { defaultValue: {}, useSession: true })
  const accountListens = listens[accountId] || {}
  accountListens[host] = true

  listens[accountId] = accountListens
  await storage.set('listens', listens, true)

  return
}

// connector.list = function (address) {
//   return new Promise((resolve) => {
//     chrome.storage.local.get(getKey(), (result) => {
//       let connectedWallets = result[getKey()] || {}
//       console.log(result, connectedWallets, address)
//       if (address) resolve(connectedWallets[address] || {})
//       else resolve(connectedWallets)
//     })
//   })
// }

export default connector
