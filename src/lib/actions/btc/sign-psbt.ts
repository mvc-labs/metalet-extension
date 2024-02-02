import ECPairFactory from 'ecpair'
import { getBtcNetwork, getNetwork } from '@/lib/network'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import btcjs, { Psbt, payments, networks, Transaction } from 'bitcoinjs-lib'
import { getAddressType, getPublicKey, getAddress, getSigner } from '@/lib/account'

const ECPair = ECPairFactory(ecc)
btcjs.initEccLib(ecc)

const toXOnly = (pubKey: Buffer) => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33))

export interface ToSignInput {
  index: number
  publicKey: string
  sighashTypes?: number[]
  treehash?: string
}

interface BaseUserToSignInput {
  index: number;
  sighashTypes: number[] | undefined;
  disableTweakSigner?: boolean;
}

export interface AddressUserToSignInput extends BaseUserToSignInput {
  address: string
}

export interface PublicKeyUserToSignInput extends BaseUserToSignInput {
  publicKey: string
}

export type UserToSignInput = AddressUserToSignInput | PublicKeyUserToSignInput

export interface SignPsbtOptions {
  autoFinalized: boolean
  toSignInputs?: UserToSignInput[]
}

export async function process({ psbtHex, options }: {
  psbtHex: string,
  options?: { toSignInputs?: ToSignInput[]; autoFinalized: boolean }
}): Promise<string> {
  const psbtNetwork = await getBtcNetwork()
  const addressType = await getAddressType('btc')

  if (!options) [
    options = { toSignInputs: undefined, autoFinalized: true }
  ]
  if (!options?.toSignInputs) {
    // Compatibility with legacy code.
    options.toSignInputs = await formatOptionsToSignInputs(psbtHex)
    if (options.autoFinalized !== false) options.autoFinalized = true
  }

  const psbt = Psbt.fromHex(psbtHex, { network: psbtNetwork })

  psbt.data.inputs.forEach((v, index) => {
    const isNotSigned = !(v.finalScriptSig || v.finalScriptWitness);
    const isP2TR = addressType === 'P2TR'
    const lostInternalPubkey = !v.tapInternalKey;
    // Special measures taken for compatibility with certain applications.
    if (isNotSigned && isP2TR && lostInternalPubkey) {
      const tapInternalKey = toXOnly(Buffer.from(options!.toSignInputs![index].publicKey, 'hex'));
      const { output } = payments.p2tr({
        internalPubkey: tapInternalKey,
        network: psbtNetwork
      });
      if (v.witnessUtxo?.script.toString('hex') == output?.toString('hex')) {
        v.tapInternalKey = tapInternalKey;
      }
    }
  })

  options.toSignInputs.forEach(async (v, index) => {
    const keyPair = await getSigner('btc', options!.toSignInputs![index].treehash)
    psbt.signInput(v.index, keyPair, v.sighashTypes)
  })

  if (options.autoFinalized) {
    options.toSignInputs.forEach((v) => {
      psbt.finalizeInput(v.index)
    })
  }

  return psbt.toHex()
}

const formatOptionsToSignInputs = async (_psbt: string | Psbt, options?: SignPsbtOptions) => {
  const pubkey = await getPublicKey('btc')
  const btcAddress = await getAddress('btc')
  const account = { pubkey, address: btcAddress }

  let toSignInputs: ToSignInput[] = [];
  if (options && options.toSignInputs) {
    // We expect userToSignInputs objects to be similar to ToSignInput interface,
    // but we allow address to be specified in addition to publicKey for convenience.
    toSignInputs = options.toSignInputs.map((input) => {
      const index = Number(input.index);
      if (isNaN(index)) throw new Error('invalid index in toSignInput');

      if (!(input as AddressUserToSignInput).address && !(input as PublicKeyUserToSignInput).publicKey) {
        throw new Error('no address or public key in toSignInput');
      }

      if ((input as AddressUserToSignInput).address && (input as AddressUserToSignInput).address != account.address) {
        throw new Error('invalid address in toSignInput');
      }

      if (
        (input as PublicKeyUserToSignInput).publicKey &&
        (input as PublicKeyUserToSignInput).publicKey != account.pubkey
      ) {
        throw new Error('invalid public key in toSignInput');
      }

      const sighashTypes = input.sighashTypes?.map(Number);

      if (sighashTypes?.some(isNaN)) throw new Error('invalid sighash type in toSignInput');

      return {
        index,
        publicKey: account.pubkey,
        sighashTypes,
        disableTweakSigner: input.disableTweakSigner
      };
    });
  } else {
    const networkType = await getNetwork()
    const psbtNetwork = networkType === 'mainnet' ? networks.bitcoin : networks.testnet

    const psbt =
      typeof _psbt === 'string'
        ? Psbt.fromHex(_psbt as string, { network: psbtNetwork })
        : (_psbt as Psbt);
    psbt.data.inputs.forEach((v, index) => {
      let script: any = null;
      let value = 0;
      if (v.witnessUtxo) {
        script = v.witnessUtxo.script;
        value = v.witnessUtxo.value;
      } else if (v.nonWitnessUtxo) {
        const tx = Transaction.fromBuffer(v.nonWitnessUtxo);
        const output = tx.outs[psbt.txInputs[index].index];
        script = output.script;
        value = output.value;
      }
      const isSigned = v.finalScriptSig || v.finalScriptWitness;
      if (script && !isSigned) {
        const address = btcjs.address.fromOutputScript(script, psbtNetwork);
        if (account.address === address) {
          toSignInputs.push({
            index,
            publicKey: account.pubkey,
            sighashTypes: v.sighashType ? [v.sighashType] : undefined
          });
        }
      }
    });
  }
  return toSignInputs;
};
