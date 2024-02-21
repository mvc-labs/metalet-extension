import { mvc } from 'meta-contract'
import { Buffer } from 'buffer'

import { mvcApi } from '../queries/request'
import { METAFILE_API_HOST } from '../data/hosts'

export function parseMetaFile(metaFileUri: string): string {
  // remove prefix: metafile://, then replace .jpeg with .jpg
  const metaFile = metaFileUri.split('metafile://')[1].replace('.jpeg', '.jpg')

  // if there is no extension name in metaFile, add .png
  if (!metaFile.includes('.')) {
    return `${METAFILE_API_HOST}/metaFile/original/${metaFile}.png`
  }

  return `${METAFILE_API_HOST}/metaFile/original/${metaFile}`
}

export function getResizeQuery(long: number): string {
  return `?x-oss-process=image/resize,l_${long}`
}

export function metaFileToThumbnail(metaFileUri: string, long = 100): string {
  const metaFile = parseMetaFile(metaFileUri)

  return `${metaFile}${getResizeQuery(long)}`
}

export async function parseCollectionInfo(
  txid: string,
  outputIndex: number
): Promise<{
  name: string
  totalSupply: string
  description: string
} | null> {
  const nftMetaData = await parseMetaData(txid, outputIndex)

  const genesisTxid = nftMetaData.genesisTxid
  if (!genesisTxid) return null

  const genesisOutputIndex = 1
  const genesisMetaData = await parseMetaData(genesisTxid, genesisOutputIndex)

  return {
    name: genesisMetaData.seriesName || '',
    totalSupply: genesisMetaData.totalSupply || '',
    description: nftMetaData.desc || '',
  }
}

export async function parseNftInfo(
  txid: string,
  outputIndex: number
): Promise<{
  name: string
  address: string
  icon: string
  description: string
  creator: string
  website: string
  genesisTxid: string
} | null> {
  const nftMetaData = await parseMetaData(txid, outputIndex)
  if (!nftMetaData) return null

  return {
    name: nftMetaData.name || '',
    address: nftMetaData.receiverAddress || '',
    icon: nftMetaData.icon || '',
    description: nftMetaData.desc || '',
    creator: nftMetaData.issuerName || '',
    website: nftMetaData.website || '',
    genesisTxid: nftMetaData.genesisTxid || '',
  }
}

export async function parseMetaData(txid: string, outputIndex: number): Promise<any> {
  // if txid is only consisted of 0, return empty string
  if (txid.replace(/0/g, '') === '') {
    return null
  }

  const messages = await parse(txid, outputIndex)
  const infoIndex = 5
  const metaData = JSON.parse(messages[infoIndex])

  return metaData
}

export async function parse(txid: string, outputIndex: number): Promise<string[]> {
  const { hex: metaTxHex } = (await (await mvcApi('/tx/' + txid + '/raw')).get()) as {
    hex: string
  }
  const tx = new mvc.Transaction(metaTxHex)

  const outputAsm = tx.outputs[outputIndex].script.toASM()
  const isOpreturn = outputAsm.includes('OP_RETURN')
  if (!isOpreturn) return []

  const asmFractions = outputAsm.split('OP_RETURN')[1].trim().split(' ')
  let messages = asmFractions.map((fraction: string) => {
    return Buffer.from(fraction, 'hex').toString()
  })

  return messages
}

export async function parseLocalTransaction(transaction: mvc.Transaction): Promise<{
  messages: (string | Buffer)[]
  outputIndex: number | null
}> {
  // loop through all outputs and find the one with OP_RETURN
  const outputs = transaction.outputs
  const outputIndex = outputs.findIndex((output) => output.script.toASM().includes('OP_RETURN'))

  if (outputIndex === -1)
    return {
      messages: [],
      outputIndex: null,
    }

  const outputAsm = outputs[outputIndex].script.toASM()
  const asmFractions = outputAsm.split('OP_RETURN')[1].trim().split(' ')
  let messages: any = asmFractions.map((fraction: string) => {
    return Buffer.from(fraction, 'hex').toString()
  })

  // if data type is binary, revert data to buffer
  const isBinary = messages[messages.length - 1] === 'binary'
  if (isBinary) {
    messages[5] = Buffer.from(asmFractions[5], 'hex')
  }

  return {
    messages,
    outputIndex,
  }
}

export default parseMetaData
