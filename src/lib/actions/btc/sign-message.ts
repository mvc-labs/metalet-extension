import { getPrivateKey } from '@/lib/account'
import { Message, PrivateKey } from 'bitcore-lib'

export async function process(message: string): Promise<string> {
  const privateKey = await getPrivateKey('btc')
  const signMessage = new Message(message);
  return signMessage.sign(new PrivateKey(privateKey));
}
