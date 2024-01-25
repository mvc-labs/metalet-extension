import { Psbt } from 'bitcoinjs-lib'
import * as SignPsbt from './sign-psbt'

export interface ToSignInput {
  index: number
  publicKey: string
  sighashTypes?: number[]
}

export async function process(psbtHexs: string[], options: { toSignInputs?: ToSignInput[], autoFinalized: boolean }[]): Promise<string[]> {
  const psbts:string[] = []
  psbtHexs.forEach(async (psbtHex, index) => {
    const psbt = await SignPsbt.process({ psbtHex, options: options[index] })
    psbts.push(psbt)
  })
  return psbts
}
