;(function () {
  'use strict'
  const l = (n = 32) => {
    let r = ''
    const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let t = 0; t < n; t++) r += a.charAt(Math.floor(Math.random() * a.length))
    return r
  }
  async function e(n, r = 'authorize', a, t) {
    const x = `${r}-${n}`,
      f = l(16),
      N = window.location.host
    window.postMessage({ nonce: f, channel: 'to-metaidwallet', action: x, host: N, icon: '', params: a || {} }, '*')
    const v = (c) => {
      const o = (i) => {
        if (!(i.source !== window || i.data?.channel !== 'from-metaidwallet')) {
          if (i.data?.nonce === f) {
            if ((window.removeEventListener('message', o), i.data?.res?.error)) throw new Error(i.data.res.error)
            c && typeof c == 'function' && c(i.data)
          }
          return !0
        }
      }
      window.addEventListener('message', o)
    }
    return await new Promise((c) => {
      v((o) => {
        c(o.res)
      })
    })
  }
  async function s() {
    return await e('Connect')
  }
  async function u() {
    return await e('Disconnect')
  }
  async function m() {
    return await e('IsConnected', 'query')
  }
  async function h() {
    return await e('GetNetwork', 'query')
  }
  async function T() {
    return await e('SwitchNetwork')
  }
  async function B(n) {
    return await e('GetAddress', 'query', n)
  }
  async function b(n) {
    return await e('GetPublicKey', 'query', n)
  }
  async function q() {
    return await e('GetXPublicKey', 'query')
  }
  async function w(n) {
    return await e('GetBalance', 'query', n)
  }
  async function E(n) {
    return await e('GetUtxos', 'query', n)
  }
  async function G(n) {
    return await e('EciesEncrypt', 'authorize', n)
  }
  async function S(n) {
    return await e('EciesDecrypt', 'authorize', n)
  }
  async function p(n) {
    return await e('SignMessage', 'authorize', n)
  }
  async function M(n) {
    return await e('VerifySignature', 'query', n)
  }
  async function P(n) {
    return await e('PreviewTransaction', 'query', n)
  }
  async function z(n) {
    return await e('SignTransaction', 'authorize', n)
  }
  async function A(n) {
    return await e('SignTransactions', 'authorize', n)
  }
  async function C(n) {
    return await e('Transfer', 'authorize', n)
  }
  async function L(n) {
    return await e('Merge', 'authorize', n)
  }
  async function y(n) {
    return await e('GetTokenBalance', 'query', n)
  }
  async function K(n, r) {
    const a = (t) => {
      if (t.data?.channel === 'removeListener' && t.data?.eventName === n) {
        window.removeEventListener('message', a)
        return
      }
      t.source !== window || t.data?.channel !== 'from-metaidwallet' || t.data?.eventName !== n || r(...t.data.args)
    }
    window.addEventListener('message', a)
  }
  async function k(n) {
    window.postMessage({ eventName: n, channel: 'removeListener' }, '*')
  }
  const d = {
      query: [
        { name: 'getBalance', action: 'GetBTCBalance' },
        { name: 'getAddress', action: 'GetBTCAddress' },
        { name: 'getPublicKey', action: 'GetBTCPublicKey' },
        { name: 'getUtxos', action: 'GetBTCUtxos' },
      ],
      authorize: [
        { name: 'signPsbt', action: 'SignBTCPsbt' },
        { name: 'signMessage', action: 'SignBTCMessage' },
      ],
    },
    g = {
      connect: s,
      isConnected: m,
      disconnect: u,
      getNetwork: h,
      switchNetwork: T,
      getAddress: B,
      getPublicKey: b,
      getXPublicKey: q,
      getBalance: w,
      getUtxos: E,
      transfer: C,
      merge: L,
      previewTransaction: P,
      signTransaction: z,
      signTransactions: A,
      signMessage: p,
      verifySignature: M,
      eciesEncrypt: G,
      eciesDecrypt: S,
      token: { getBalance: y },
      nft: {},
      btc: {},
      on: K,
      removeListener: k,
      requestAccount: s,
      getAccount: s,
      exitAccount: u,
      getMvcBalance: w,
      getSensibleFtBalance: y,
    }
  Object.keys(d).forEach((n) => {
    const r = n
    d[r].forEach((a) => {
      g.btc[a.name] = async (t) => await e(a.action, r, t)
    })
  }),
    (window.metaidwallet = g)
})()
