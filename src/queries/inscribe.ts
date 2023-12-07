import { metaletApiV3 } from './request'
import { getNetwork } from '@/lib/network'

export interface PreInscribe {
  count: number
  fee: number
  inscriptionState: number
  minerFee: number
  needAmount: number
  networkFeeRate: number
  orderId: string
  payAddress: string
  payAmount: number
  receiveAddress: string
  serviceFee: number
}

export const preInscribe = async (address: string, feeRate: number, filename: string): Promise<PreInscribe> => {
  const network = await getNetwork()
  const net = network === 'mainnet' ? 'livenet' : network
  return await metaletApiV3<PreInscribe>(`/inscribe/pre`).post({
    feeRate,
    files: [
      {
        filename,
        dataURL: Buffer.from(filename).toString('base64'),
      },
    ],
    net,
    receiveAddress: address,
  })
}

export interface CommitInscribe {
  commitTxHash: string
  inscriptionIdList: string[]
  inscriptionState: number
  orderId: string
  revealTxHashList: string[]
}

export const commitInscribe = async (
  address: string,
  orderId: string,
  rawTx: string
): Promise<CommitInscribe | void> => {
  const network = await getNetwork()
  const net = network === 'mainnet' ? 'livenet' : network
  return await metaletApiV3<CommitInscribe>(`/inscribe/commit`)
    .post({
      feeAddress: address,
      net,
      orderId,
      rawTx,
      version: 0,
    })
}

export const getInscribeInfo = async (orderId: string): Promise<CommitInscribe> => {
  return await metaletApiV3<CommitInscribe>(`/inscribe/info`).post({
    orderId,
  })
}
