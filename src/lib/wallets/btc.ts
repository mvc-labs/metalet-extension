import { Psbt, Transaction } from 'bitcoinjs-lib'
import { getBtcNetwork, getNetwork } from '../network'
import { fetchBtcUtxos } from '@/queries/utxos'
import { deriveAddress, deriveBtcPrivateKey, derivePublicKey } from '../bip32-deriver'
import { Account, getAccount, getCurrentAccount, getPublicKey } from '@/lib/account'
import { raise } from '../helpers'
import { fetchBtcTxHex } from '@/queries/transaction'
import { tapTweakHash, getTweakedPrivateKey, getXOnlyPublicKey, calcFee, sumOrNaN, DUST_UTXO_VALUE } from '../btc-util'

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
    if (!this.account) throw new Error('no account')

    const btcNetwork = await getBtcNetwork()
    const tweakedSigner = await getTweakedPrivateKey()
    console.log({ btcNetwork })

    let sendPsbt = new Psbt({ network: btcNetwork }).addOutput({
      value: amount,
      address: recipient,
    })

    sendPsbt = await this.pay(sendPsbt)

    sendPsbt.signInput(0, tweakedSigner).finalizeAllInputs()

    console.log('send psbt', sendPsbt)
  }

  async pay(psbt: Psbt) {
    if (!this.account) throw new Error('no account')

    const network = await getNetwork()
    const address = network === 'testnet' ? this.account.btc.testnetAddress : this.account.btc.mainnetAddress
    const utxos = await fetchBtcUtxos(address)
    const biggestUtxo = utxos.reduce((acc, utxo) => (utxo.satoshis > acc.satoshis ? utxo : acc))
    const rawTx = await fetchBtcTxHex(biggestUtxo.txid)
    const tx = Transaction.fromHex(rawTx)

    const xOnlyPublicKey = await getXOnlyPublicKey()

    const payInput = {
      hash: biggestUtxo.txid,
      index: biggestUtxo.outputIndex,
      witnessUtxo: tx.outs[biggestUtxo.outputIndex],
      tapInternalKey: xOnlyPublicKey,
    }

    psbt.addInput(payInput)

    // add change output
    const feeb = 10 // TODO: get feeb dynamically
    let fee = calcFee(psbt, feeb)
    const totalOutput = sumOrNaN(psbt.txOutputs)
    const totalInput = sumOrNaN(psbt.data.inputs.map((input) => input.witnessUtxo!))
    const changeValue = totalInput - totalOutput - fee

    if (changeValue < 0) {
      throw new Error('Insufficient balance')
    }

    if (changeValue >= DUST_UTXO_VALUE) {
      psbt.addOutput({
        address,
        value: changeValue,
      })
    } else {
      fee += changeValue
    }

    return psbt
  }
}
