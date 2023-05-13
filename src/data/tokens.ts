import UsdtLogoImg from '../assets/images/usdt-logo.jpg?url'

export type Token = {
  codehash: string
  genesis: string
  name: string
  symbol: string
  decimal: number
  sensibleId: string
  utxoCount: number
  confirmed: number
  confirmedString: string
  unconfirmed: number
  unconfirmedString: string
}

export default [
  {
    genesis: '94c2ae3fdbf95a4fb0d788c818cf5fcc7a9aa66a',
    logo: UsdtLogoImg,
  },
]
