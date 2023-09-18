import { Psbt } from 'bitcoinjs-lib'
import { getBtcNetwork } from '../network';

export class BtcWallet {
  constructor() {
    console.log('BtcWallet constructor')
  }

  // getUtxos method
  public async getUtxos() {
    const network = await getBtcNetwork()

    const utxos = await regtestUtils.faucetComplex(
      address,
      sendAmount,
      output,
      network,
    );
  }

  // send method
  public async send(recipient: string, amount: number) {
    const network = await getBtcNetwork()

    // get my cardinal utxos
    const utxos = await this.getUtxos()
    
    const sendPsbt = new Psbt({ network })
      .addInput({
        hash,
        index,
        witnessUtxo: { value: amount, script: output },
        tapInternalKey: childNodeXOnlyPubkey,
      })
      .addOutput({
        value: sendAmount,
        address: regtestUtils.RANDOM_ADDRESS,
      })
      .signInput(0, tweakedChildNode)
      .finalizeAllInputs();
  }
}
