const m = (n = 32) => {
  let e = "";
  const a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let r = 0; r < n; r++)
    e += a.charAt(Math.floor(Math.random() * a.length));
  return e;
};
async function t(n, e = "authorize", a) {
  const r = `${e}-${n}`, u = m(16), l = window.location.host;
  window.postMessage(
    {
      nonce: u,
      channel: "to-metaidwallet",
      action: r,
      host: l,
      icon: "",
      params: a || {}
    },
    "*"
  );
  const h = (i) => {
    const o = (c) => {
      if (!(c.source !== window || c.data?.channel !== "from-metaidwallet")) {
        if (c.data?.nonce === u) {
          if (window.removeEventListener("message", o), c.data?.res?.error)
            throw new Error(c.data.res.error);
          i && typeof i == "function" && i(c.data);
        }
        return !0;
      }
    };
    window.addEventListener("message", o);
  };
  return await new Promise((i) => {
    h((o) => {
      i(o.res);
    });
  });
}
async function s() {
  return await t("Connect");
}
async function y() {
  return await t("Disconnect");
}
async function T() {
  return await t("IsConnected", "query");
}
async function B() {
  return await t("GetNetwork", "query");
}
async function b() {
  return await t("SwitchNetwork");
}
async function q(n) {
  return await t("GetAddress", "query", n);
}
async function G(n) {
  return await t("GetPublicKey", "query", n);
}
async function S() {
  return await t("GetXPublicKey", "query");
}
async function w(n) {
  return await t("GetBalance", "query", n);
}
async function P(n) {
  return await t("GetUtxos", "query", n);
}
async function p(n) {
  return await t("EciesEncrypt", "authorize", n);
}
async function z(n) {
  return await t("EciesDecrypt", "authorize", n);
}
async function A(n) {
  return await t("SignMessage", "authorize", n);
}
async function C(n) {
  return await t("VerifySignature", "query", n);
}
async function E(n) {
  return await t("PreviewTransaction", "query", n);
}
async function M(n) {
  return await t("SignTransaction", "authorize", n);
}
async function K(n) {
  return await t("SignTransactions", "authorize", n);
}
async function k(n) {
  return await t("Transfer", "authorize", n);
}
async function x(n) {
  return await t("Merge", "authorize", n);
}
async function g(n) {
  return await t("GetTokenBalance", "query", n);
}
const f = {
  query: [
    { name: "getBalance", action: "GetBTCBalance" },
    { name: "getAddress", action: "GetBTCAddress" },
    { name: "getPublicKey", action: "GetBTCPublicKey" },
    { name: "getUtxos", action: "GetBTCUtxos" }
  ],
  authorize: [
    { name: "signPsbt", action: "SignBTCPsbt" },
    { name: "signMessage", action: "SignBTCMessage" }
  ]
}, d = {
  connect: s,
  isConnected: T,
  disconnect: y,
  getNetwork: B,
  switchNetwork: b,
  getAddress: q,
  getPublicKey: G,
  getXPublicKey: S,
  getBalance: w,
  getUtxos: P,
  transfer: k,
  merge: x,
  previewTransaction: E,
  signTransaction: M,
  signTransactions: K,
  signMessage: A,
  verifySignature: C,
  eciesEncrypt: p,
  eciesDecrypt: z,
  // signTransaction,
  // transferAll,
  token: {
    getBalance: g
  },
  nft: {},
  btc: {},
  // btc: {
  //   getBalance: () => {},
  //   getAddress: () => {},
  //   getPublicKey: () => {},
  //   getUtxos: () => {},
  // },
  // Deprecating
  requestAccount: s,
  getAccount: s,
  exitAccount: y,
  getMvcBalance: w,
  getSensibleFtBalance: g
};
Object.keys(f).forEach((n) => {
  const e = n;
  f[e].forEach((a) => {
    d.btc[a.name] = async (r) => await t(a.action, e, r);
  });
});
window.metaidwallet = d;
