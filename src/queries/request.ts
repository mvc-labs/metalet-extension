import { network } from '@/lib/network'
import { getCredential } from '@/lib/account'
import { METASV_TESTNET_HOST, METASV_HOST, METALET_HOST, ORDERS_HOST } from '@/data/hosts'

type OptionParams = Record<string, string>

interface OptionData {
  [key: string]: unknown
}

interface RequestOption {
  method: 'GET' | 'POST'
  data?: OptionData
  params?: OptionParams
  headers?: Headers
  withCredential?: boolean
  body?: string | URLSearchParams
}

async function request(url: string, options: RequestOption) {
  if (!options?.headers) {
    options.headers = new Headers()
  }
  if (options?.withCredential) {
    const { publicKey, signature } = await getCredential()
    options.headers.set('X-Signature', signature)
    options.headers.set('X-Public-Key', publicKey)
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

export const mvcApi = (path: string) => {
  const metasvHost = network.value === 'mainnet' ? METASV_HOST : METASV_TESTNET_HOST
  return {
    get: (params?: any) => request(`${metasvHost}${path}`, { method: 'GET', params }),
    post: (data?: any) => request(`${metasvHost}${path}`, { method: 'POST', data }),
  }
}

export const metaletApi = (path: string) => {
  // metalet api requires credential to pass authentication check
  const metaletHost = METALET_HOST + '/wallet-api/v1'
  return {
    get: (params?: OptionParams) => request(`${metaletHost}${path}`, { method: 'GET', params, withCredential: true }),
    post: (data?: OptionData) => request(`${metaletHost}${path}`, { method: 'POST', data, withCredential: true }),
  }
}

export const metaletApiV2 = (path: string) => {
  // metalet api requires credential to pass authentication check
  const metaletHost = METALET_HOST + '/wallet-api/v2'
  return {
    get: (params?: OptionParams) => request(`${metaletHost}${path}`, { method: 'GET', params, withCredential: true }),
    post: (data?: OptionData) => request(`${metaletHost}${path}`, { method: 'POST', data, withCredential: true }),
  }
}

export const ordersApi = (path: string) => {
  const ordersHost = ORDERS_HOST + '/api'
  return {
    get: (params?: any) => request(`${ordersHost}${path}`, { method: 'GET', params }),
    post: (data?: any) => request(`${ordersHost}${path}`, { method: 'POST', data }),
  }
}

export default request
