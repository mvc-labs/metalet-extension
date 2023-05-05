import { mvc } from 'meta-contract'
import { metasvApi } from '../queries/request'

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
}> {
  const nftMetaData = await parseMetaData(txid, outputIndex)

  return {
    name: nftMetaData.name || '',
    address: nftMetaData.receiverAddress || '',
    icon: nftMetaData.icon || '',
  }
}

export async function parseMetaData(txid: string, outputIndex: number): Promise<any> {
  const messages = await parse(txid, outputIndex)
  const infoIndex = 5
  const metaData = JSON.parse(messages[infoIndex])
  chrome.runtime.sendMessage(metaData)

  return metaData
}

export async function parse(txid: string, outputIndex: number): Promise<string[]> {
  const { hex: metaTxHex } = (await metasvApi('/tx/' + txid + '/raw').get()) as {
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

export default parseMetaData
