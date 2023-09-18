import { Psbt } from 'bitcoinjs-lib'
import { getBtcNetwork, getNetwork } from '../network'
import { fetchBtcUtxos } from '@/queries/utxos'
import { deriveAddress } from '../bip32-deriver'
import { Account, getAccount, getCurrentAccount } from '@/lib/account'
import { raise } from '../helpers'

export class BtcWallet {
  private account?: Account = undefined

  constructor() {}

  static async create() {
    const wallet = new BtcWallet()

    wallet.account = (await getCurrentAccount()) ?? raise('No account found')

    return wallet
  }

  // send method
  public async send(recipient: string, amount: number) {
    if (!this.account) throw new Error('hi')

    const network = await getNetwork()
    const btcNetwork = await getBtcNetwork()

    // get my cardinal utxos
    const btcAddress = network === 'testnet' ? this.account.btc.testnetAddress : this.account.btc.mainnetAddress

    const utxos = await fetchBtcUtxos(btcAddress)

    const sendPsbt = new Psbt({ network: btcNetwork })
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
      .finalizeAllInputs()
  }
}
