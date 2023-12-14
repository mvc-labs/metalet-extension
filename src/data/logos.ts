import MetaletLogo from '../assets/images/metalet-logo.png?url'
import MvcSwapLogo from '../assets/images/mvcswap-logo.png?url'
import MVCUSDTLogo from '../assets/images/usdt-logo.jpg?url'
import ShowCoinLogo from '../assets/images/sc-logo.svg?url'

const logos = {
  'localhost:3000': MetaletLogo,
  'mvcswap.com/': MvcSwapLogo,
}

export const getFTLogo = (name: string) => {
  console.log({ name })

  switch (name) {
    case 'MVC USDT':
      return MVCUSDTLogo
    case 'MVCSWAP Token':
      return MvcSwapLogo
    case 'ShowCoin':
      return ShowCoinLogo
    default:
      return
  }
}

export default logos
