import { getAddressType } from '@/lib/account'
import { type AddressType, scripts } from '@/lib/bip32-deriver'

export async function process(): Promise<
  | {
      name: string
      path: string
      addressType: AddressType
    }
  | undefined
> {
  const addressType = await getAddressType('btc')
  return scripts.find((script) => script.addressType === addressType)
}
