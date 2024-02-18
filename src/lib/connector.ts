import useStorage from './storage'

const Connections_Key = 'connections'

const storage = useStorage()

type Connections = Record<
  string,
  Record<
    string,
    {
      connectedAt: number
      autoApprove: boolean
    }
  >
>

type Connector = {
  connect: (accountId: string, host: string) => Promise<void>
  isConnected: (accountId: string, host: string) => Promise<boolean>
  registerListen: (accountId: string, host: string) => Promise<void>
  disconnect: (accountId: string, host: string) => Promise<void>
}

const connector = {} as Connector

async function getConnections() {
  return await storage.get<Connections>(Connections_Key, { defaultValue: {} })
}

connector.connect = async function (accountId, host) {
<<<<<<< HEAD
  const connections = await getConnections()
=======
  const connections = await storage.get('connections', {
    defaultValue: {}, isParse: true
  })
>>>>>>> 060ee0db2d0628873973e7ccfbb8f843e47a6c81
  const accountConnections = connections[accountId] || {}
  accountConnections[host] = {
    connectedAt: Date.now(),
    autoApprove: true,
  }
  connections[accountId] = accountConnections
  await storage.set(Connections_Key, connections)
}

connector.isConnected = async function (accountId, host) {
  const connections = await getConnections()
  const accountConnections = connections[accountId] || {}
  return !!accountConnections[host]
}

connector.disconnect = async function (accountId, host) {
  const connections = await getConnections()
  const accountConnections = connections[accountId] || {}
  delete accountConnections[host]
  connections[accountId] = accountConnections
  await storage.set(Connections_Key, connections)
}

connector.registerListen = async function (accountId, host) {
  const storage = await useStorage('session')
  const listens = await storage.get<Record<string, Record<string, boolean>>>('listens', { defaultValue: {} })
  const accountListens = listens[accountId] || {}
  accountListens[host] = true
  listens[accountId] = accountListens
  await storage.set('listens', listens)
}

export default connector
