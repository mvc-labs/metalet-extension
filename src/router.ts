import * as VueRouter from 'vue-router'
import Wallet from './pages/wallet/Index.vue'
import { getStorage } from './lib/storage'
import accountManager, {
  Account,
  getAccounts,
  getCurrentAccount,
  getLegacyAccounts,
  needsMigrationV2,
} from './lib/account'

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
    path: '/migrate',
    component: () => import('./pages/migrate/Index.vue'),
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
    path: '/wallet/send',
    component: () => import('./pages/wallet/Send.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'Send',
      noFooter: true,
    },
  },
  {
    path: '/wallet/sendBRC',
    component: () => import('./pages/wallet/SendBRC.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'Send',
      noFooter: true,
    },
  },
  {
    path: '/wallet/inscribe',
    component: () => import('./pages/wallet/Inscribe.vue'),
    meta: {
      secondaryHeader: true,
      headerTitle: 'Inscribe Transfer',
      noFooter: true,
    },
  },
  {
    path: '/wallet/inscribe-success',
    component: () => import('./pages/wallet/InscribeSuccess.vue'),
    name:'inscribe-success',
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
  { path: '/collections', component: () => import('./pages/nfts/Index.vue'), name: 'collections' },
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
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
})

// 检查锁定状态；如果锁定，跳转到锁定页面
router.beforeEach(async (to, from) => {
  if (to.path !== '/lock') {
    const locked = await getStorage('locked')
    if (locked) {
      return '/lock'
    }
  }
})

// 检查账号状态；如果没有当前账号，跳转到账号页面
router.beforeEach(async (to, from) => {
  // 如果是老用户（sync存储中有助记词），且该账号在localStorage中不存在，则说明需要迁移，跳转至新版本迁移页面
  const v0Record = await chrome.storage.sync.get('currentAccount')
  const v1Records = await getLegacyAccounts()
  if (v0Record && v0Record.currentAccount && v1Records.length === 0) {
    const mneStr = v0Record.currentAccount.mnemonicStr

    // 比照查看有无该助记词的账号
    const accounts = await getAccounts()
    const accountsArr = Array.from(accounts.values())
    const hasAccount = accountsArr.some((account) => account.mnemonic === mneStr)

    if (!hasAccount && to.path !== '/migrate') {
      return '/migrate'
    }
  }

  if (await needsMigrationV2()) {
    if (to.path !== '/welcome') {
      return '/welcome'
    }
  }

  const authPages = ['/welcome', '/lock', '/accounts', '/wallet/create', '/wallet/import', '/migrate']
  if (!authPages.includes(to.path)) {
    const redirect = getCurrentAccount().then(async (account) => {
      if (!account) {
        return '/welcome'
      }
    })

    if (redirect) {
      return redirect
    }
  }
})

router.beforeEach((to, from) => {
  if (['asset', 'token'].includes(to.name as string)) {
    to.meta.headerTitle = to.params.symbol
  }

  if (to.name === 'send-token') {
    to.meta.headerTitle = `Send ${to.params.symbol}`
  }
})

export default router
