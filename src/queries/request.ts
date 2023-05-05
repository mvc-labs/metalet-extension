import { METASV_TESTNET_HOST, METASV_HOST, SHOW_API_HOST, SHOW_API_TESTNET_HOST } from '../data/hosts'
import { network } from '../lib/network'

async function request(url: string, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const allOptions = { ...defaultOptions, ...options }
  return new Promise((resolve, reject) => {
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

export const metasvApi = (path: string) => {
  const metasvHost = network.value === 'mainnet' ? METASV_HOST : METASV_TESTNET_HOST
  return {
    get: (params?: any) => request(`${metasvHost}${path}`, { method: 'GET', params }),
    post: (data?: any) => request(`${metasvHost}${path}`, { method: 'POST', data }),
  }
}

export const showApi = (path: string) => {
  const showHost = network.value === 'mainnet' ? SHOW_API_HOST : SHOW_API_TESTNET_HOST
  return {
    get: (params?: any) => request(`${showHost}${path}`, { method: 'GET', params }),
    post: (data?: any) => request(`${showHost}${path}`, { method: 'POST', data }),
  }
}

export default request
