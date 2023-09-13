import { METASV_TESTNET_HOST, METASV_HOST, METALET_HOST, API2_ORDERS_EXCHANGE } from '../data/hosts'
import { network } from '../lib/network'

const SIGNATURE_MESSAGE = 'metalet.space'

type OptionParams = Record<string, string>

interface OptionData {
  [key: string]: unknown
}

interface requestOption {
  method: 'GET' | 'POST'
  data?: OptionData
  params?: OptionParams
  headers?: Headers
  body?: string | URLSearchParams
}

async function request(url: string, options: requestOption) {
  // const headers = new Headers({
  //   'X-Signature': '',
  //   'X-Public-Key': '',
  // })
  if (!options?.headers) {
    options.headers = new Headers()
  }
  if (options?.params) {
    if (options.method === 'GET') {
      const params = new URLSearchParams(options.params)
      url = `${url}?${params.toString()}`
    } else {
      // UNUSED: Params will not be processed in POST request
      options.body = new URLSearchParams(options.params)
    }
    delete options.params
    options.headers.set('Content-Type', 'application/x-www-form-urlencoded')
  }

  if (options?.data) {
    options.body = JSON.stringify(options.data)
    options.headers.set('Content-Type', 'application/json')
    delete options.data
  }

  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.json()
}

export const metasvApi = (path: string) => {
  const metasvHost = network.value === 'mainnet' ? METASV_HOST : METASV_TESTNET_HOST
  return {
    get: (params?: any) => request(`${metasvHost}${path}`, { method: 'GET', params }),
    post: (data?: any) => request(`${metasvHost}${path}`, { method: 'POST', data }),
  }
}

export const metaletApi = (path: string) => {
  const metaletHost = METALET_HOST + '/wallet-api/v1'
  return {
    get: (params?: any) => request(`${metaletHost}${path}`, { method: 'GET', params }),
    post: (data?: any) => request(`${metaletHost}${path}`, { method: 'POST', data }),
  }
}

export const btcApi = (path: string) => {
  return {
    get: (params?: OptionParams) => request(`${API2_ORDERS_EXCHANGE}${path}`, { method: 'GET', params }),
    post: (data?: OptionData) => request(`${API2_ORDERS_EXCHANGE}${path}`, { method: 'POST', data }),
  }
}

export default request
