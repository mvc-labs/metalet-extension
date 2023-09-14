import { getCredential } from '@/lib/account'
import { METASV_TESTNET_HOST, METASV_HOST, METALET_HOST, ORDERS_HOST } from '../data/hosts'
import { network } from '../lib/network'

async function request(url: string, options: any = {}): Promise<any> {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const allOptions = { ...defaultOptions, ...options }

  // extract params from options and append to url
  if (allOptions.params) {
    const params = new URLSearchParams(allOptions.params)
    url = `${url}?${params.toString()}`
    delete allOptions.params
  }

  return new Promise(async (resolve, reject) => {
    if (allOptions.requiresCredential) {
      const { publicKey, signature } = await getCredential()
      allOptions.headers['X-Signature'] = signature
      allOptions.headers['X-Public-Key'] = publicKey
      delete allOptions.requiresCredential
    }

    fetch(url, allOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText)
        }
        return response.json()
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error))
  })
}

export const mvcApi = (path: string) => {
  const metasvHost = network.value === 'mainnet' ? METASV_HOST : METASV_TESTNET_HOST
  return {
    get: (params?: any) => request(`${metasvHost}${path}`, { method: 'GET', params }),
    post: (data?: any) => request(`${metasvHost}${path}`, { method: 'POST', data }),
  }
}

export const metaletApi = (path: string) => {
  const metaletHost = METALET_HOST + '/wallet-api/v1'
  const requiresCredential = true

  return {
    get: (params?: any) => request(`${metaletHost}${path}`, { method: 'GET', requiresCredential, params }),
    post: (data?: any) => request(`${metaletHost}${path}`, { method: 'POST', requiresCredential, data }),
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
