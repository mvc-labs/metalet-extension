import dayjs from 'dayjs'
import { API2_ORDERS_EXCHANGE } from '@/data/hosts'

/**
 * get request
 * @param {string} url
 * @param {object} params
 */
function get(url: string, params = {}) {
  const p = new URLSearchParams(params).toString()
  return fetch(`${API2_ORDERS_EXCHANGE}${url}` + '?' + p).then((res) => res.json())
}

/**
 * post request
 * @param {string} url
 * @param {object} data
 */
function post(url: string, data = {}) {
  return fetch(`${API2_ORDERS_EXCHANGE}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((res) => res.json())
}

export const getBTCBalance = (address: string) => {
  return get('/balance', { address })
}

export const getBTActivities = async (address: string) => {
  const transactions = await get('/activities', { address })

  const txs = []

  for (let tx of transactions) {
    for (let input of tx.vin) {
      if (input.prevout.scriptpubkey_address === address) {
        txs.push({
          txid: tx.txid,
          type: 'output',
          value: '-' + input.prevout.value,
          timeStamp: tx.status.block_time,
          time: dayjs(tx.status.block_time * 1000).format('YYYY/MM/DD HH:mm'),
        })
      }
    }

    for (let output of tx.vout) {
      if (output.scriptpubkey_address === address) {
        txs.push({
          txid: tx.txid,
          type: 'input',
          value: '+' + output.value,
          timeStamp: tx.status.block_time,
          time: dayjs(tx.status.block_time * 1000).format('YYYY/MM/DD HH:mm'),
        })
      }
    }
  }
  txs.sort((a, b) => b.timeStamp - a.timeStamp)
  return txs
}

export const getBTCPrice = () => {
  return get('/btc-price')
}
