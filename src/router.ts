import useStorage from './lib/storage'
import { IS_DEV } from '@/data/config'
import * as VueRouter from 'vue-router'
import Wallet from './pages/wallet/Index.vue'
import { getCurrentAccount } from './lib/account'

const storage = useStorage()

const routes = [
  { path: '/', redirect: '/wallet' },
  {
    path: '/welcome',
    component: () => import('./pages/welcome/Index.vue'),
    meta: {
      noFooter: true,
      noMenu: true,
    },
  },
  {
    path: '/wallet/init-service',
    component: () => import('./pages/wallet/InitService.vue'),
    meta: {
      noFooter: true,
      noMenu: true,
    },
  },
  {
    // path: '/migrate',
    // component: () => import('./pages/migrate/Index.vue'),
    path: '/migrateV2',
    component: () => import('./pages/migrateV2/Index.vue'),
    name: 'migrateV2',
    meta: {
      noFooter: true,
      noMenu: true,
    },
  },
  {
    path: '/lock',
    component: () => import('./pages/lock/Index.vue'),
    meta: {
      noFooter: true,
      noMenu: true,
    },
  },
  {
    path: '/connected-dapps',
    component: () => import('./pages/connected-dapps/Index.vue'),
    meta: {
      noFooter: true,
      secondaryHeader: true,
      headerTitle: 'Connected Dapps',
    },
  },
  {
    path: '/authorize',
    component: () => import('./pages/authorize/Index.vue'),
    meta: {
      noFooter: true,
      noMenu: true,
    },
  },
  {
    path: '/wallet/create',
    component: () => import('./pages/wallet/Create.vue'),
    meta: {
      noFooter: true,
    },
  },
  {
    path: '/wallet/backup',
    component: () => import('./pages/wallet/Backup.vue'),
    meta: {
      noFooter: true,
      secondaryHeader: true,
      headerTitle: 'Backup',
    },
  },
  {
    path: '/wallet/check-backup',
    component: () => import('./pages/wallet/CheckBackup.vue'),
    meta: {
      noFooter: true,
    },
  },
  {
    path: '/wallet/set-password',
    component: () => import('./pages/wallet/SetPassword.vue'),
    meta: {
      noFooter: true,
      noMenu: true,
    },
  },
  {
    path: '/wallet/create-success',
    component: () => import('./pages/wallet/CreateSuccess.vue'),
    meta: {
      noFooter: true,
      noMenu: true,
    },
  },
  {
    path: '/wallet/receive',
    component: () => import('./pages/wallet/Receive.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'Receive',
      noFooter: true,
    },
  },
  {
    path: '/wallet/send/:symbol/:address',
    component: () => import('./pages/wallet/Send.vue'),
    name: 'send',
    meta: {
      secondaryHeader: true,
      headerTitle: 'Send',
      noFooter: true,
    },
  },
  {
    path: '/wallet/sendBRC20',
    component: () => import('./pages/wallet/SendBRC.vue'),
    name: 'sendBRC20',
    meta: {
      secondaryHeader: true,
      headerTitle: 'Send',
      noFooter: true,
    },
  },
  {
    path: '/wallet/inscribe/:symbol/:address',
    component: () => import('./pages/wallet/Inscribe.vue'),
    name: 'inscribe',
    meta: {
      secondaryHeader: true,
      headerTitle: 'Inscribe Transfer',
      noFooter: true,
    },
  },
  {
    path: '/wallet/transfer/:symbol/:address',
    component: () => import('./pages/wallet/Transfer.vue'),
    name: 'transfer',
    meta: {
      secondaryHeader: true,
      headerTitle: 'Transfer',
      noFooter: true,
    },
  },
  {
    path: '/wallet/inscribe-success/:symbol/:orderId',
    component: () => import('./pages/wallet/InscribeSuccess.vue'),
    name: 'inscribe-success',
    meta: {
      secondaryHeader: true,
      headerTitle: '',
      noFooter: true,
    },
  },
  {
    path: '/wallet/inscribe-query/:symbol/:orderId',
    component: () => import('./pages/wallet/InscribeQuery.vue'),
    name: 'inscribe-query',
    meta: {
      secondaryHeader: true,
      headerTitle: '',
      noFooter: true,
    },
  },
  {
    path: '/wallet/send-token/:symbol/:genesis',
    component: () => import('./pages/wallet/SendToken.vue'),
    name: 'send-token',
    meta: {
      secondaryHeader: true,
      headerTitle: 'Send Token',
      noFooter: true,
    },
  },
  {
    path: '/wallet/select-asset',
    component: () => import('./pages/wallet/SelectAsset.vue'),
    props: (route: any) => ({ purpose: route.query.purpose }),
    name: 'select-asset',
    meta: {
      secondaryHeader: true,
      headerTitle: 'Select Asset',
    },
  },
  {
    path: '/wallet/select-network',
    component: () => import('./pages/wallet/SelectNetwork.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'Select Network',
      noFooter: true,
    },
  },
  {
    path: '/wallet/manage-assets',
    component: () => import('./pages/wallet/ManageAssets.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'Manage Assets',
      noFooter: true,
    },
  },
  {
    path: '/wallet/import',
    component: () => import('./pages/wallet/Import.vue'),
    meta: {
      noFooter: true,
      secondaryHeader: true,
      headerTitle: 'Import',
      noMenu: true,
    },
  },
  {
    path: '/wallet/assets/:address/:symbol',
    component: () => import('./pages/wallet/Asset.vue'),
    name: 'asset',
    props: true,
    meta: {
      secondaryHeader: true,
      headerTitle: 'Asset',
    },
  },
  {
    path: '/wallet/tokens/:address/:symbol/:genesis',
    component: () => import('./pages/wallet/Token.vue'),
    name: 'token',
    meta: {
      secondaryHeader: true,
      headerTitle: 'ASSET',
    },
  },
  { path: '/wallet', component: Wallet },

  {
    path: '/collections/:codehash/:genesis',
    component: () => import('./pages/nfts/Collection.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'NFT Collection',
    },
  },
  { path: '/collections/:tabIndex', component: () => import('./pages/nfts/Index.vue'), name: 'collections' },
  {
    name: 'brc20Detail',
    path: '/nft/brc20/detail',
    component: () => import('./pages/nfts/BRCTokenDetail.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: '',
      noFooter: true,
    },
  },
  {
    name: 'metaPinDetail',
    path: '/nft/metaPin/detail',
    component: () => import('./pages/nfts/MetaPinDetail.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: '',
      noFooter: true,
    },
  },
  {
    path: '/nfts/transfer-nft/:codehash/:genesis/:tokenIndex',
    component: () => import('./pages/nfts/Transfer.vue'),
    name: 'transfer-nft',
    props: (route: any) => ({
      codehash: route.params.codehash,
      genesis: route.params.genesis,
      tokenIndex: Number(route.params.tokenIndex),
    }),
    meta: {
      secondaryHeader: true,
      headerTitle: 'Transfer NFT',
    },
  },
  {
    path: '/nfts/:codehash/:genesis/:tokenIndex',
    component: () => import('./pages/nfts/Detail.vue'),
    name: 'nft-detail',
    props: (route: any) => ({
      codehash: route.params.codehash,
      genesis: route.params.genesis,
      tokenIndex: Number(route.params.tokenIndex),
    }),
    meta: {
      secondaryHeader: true,
      headerTitle: 'NFT',
    },
  },

  { path: '/tokens', component: () => import('./pages/tokens/Index.vue') },

  { path: '/settings', component: () => import('./pages/settings/Index.vue') },
  {
    path: '/accounts',
    component: () => import('./pages/accounts/Index.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'Accounts',
      noFooter: true,
    },
  },

  {
    path: '/settings/current-account',
    component: () => import('./pages/settings/CurrentAccount.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'Current Account',
      noFooter: true,
    },
  },
  {
    path: '/settings/address-type',
    component: () => import('./pages/settings/AddressType.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'BTC Address Type',
      noFooter: true,
    },
  },
  {
    path: '/settings/security-lab',
    component: () => import('./pages/settings/SecurityLab.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'Security Lab',
      noFooter: true,
    },
  },
  {
    path: '/tools/path-finder',
    component: () => import('./pages/tools/PathFinder.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'Path Finder',
      noFooter: true,
    },
  },
]

const historyMode = IS_DEV ? VueRouter.createWebHistory() : VueRouter.createWebHashHistory()
const router = VueRouter.createRouter({
  history: historyMode,
  routes,
})

const authPages = ['/welcome', '/lock', '/accounts', '/wallet/create', '/wallet/import', '/migrateV2']

router.beforeEach(async (to, _, next) => {
  if (to.fullPath !== '/lock' && (await storage.get('locked'))) {
    next('/lock')
  } else if (!authPages.includes(to.path) && !(await getCurrentAccount())) {
    next('/welcome')
  } else {
    if (['asset', 'token'].includes(to.name as string)) {
      to.meta.headerTitle = to.params.symbol
    }

    if (to.name === 'send-token') {
      to.meta.headerTitle = `Send ${to.params.symbol}`
    }

    next()
  }
})

export default router
