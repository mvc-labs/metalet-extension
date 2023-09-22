type QueryAction = {
  process: Function
}

function getProcessor(actionName: string) {
  return () => import(`../lib/actions/${actionName.toLowerCase()}`).then((m) => m.process)
}

const actions = {
  IsConnected: { process: () => getProcessor('is-connected') },
  GetNetwork: { process: getProcessor('get-network') },
  GetAddress: { process: getProcessor('get-address') },
  GetPublicKey: { process: getProcessor('get-public-key') },
  GetBalance: { process: getProcessor('get-balance') },
  GetTokenBalance: { process: getProcessor('token/get-balance') },
  GetXPublicKey: { process: getProcessor('get-extended-public-key') },
} as { [key: string]: QueryAction }

export default actions

const queryActionNames = Object.keys(actions)
export { queryActionNames }
