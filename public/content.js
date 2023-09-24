const m = (t = 32) => {
  let e = "";
  const a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let c = 0; c < t; c++)
    e += a.charAt(Math.floor(Math.random() * a.length));
  return e;
};
async function n(t, e = "authorize", a) {
  const c = `${e}-${t}`, u = m(16), l = window.location.host;
  window.postMessage(
    {
      nonce: u,
      channel: "to-metaidwallet",
      action: c,
      host: l,
      icon: "",
      params: a || {}
    },
    "*"
  );
  const h = (i) => {
    const o = (r) => {
      if (!(r.source !== window || r.data?.channel !== "from-metaidwallet")) {
        if (r.data?.nonce === u) {
          if (window.removeEventListener("message", o), r.data?.res?.error)
            throw new Error(r.data.res.error);
          i && typeof i == "function" && i(r.data);
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
  return await n("Connect");
}
async function w() {
  return await n("Disconnect");
}
async function B() {
  return await n("IsConnected", "query");
}
async function b() {
  return await n("GetNetwork", "query");
}
async function T() {
  return await n("SwitchNetwork");
}
async function G(t) {
  return await n("GetAddress", "query", t);
}
async function q(t) {
  return await n("GetPublicKey", "query", t);
}
async function A() {
  return await n("GetXPublicKey", "query");
}
async function y() {
  return await n("GetBalance", "query");
}
async function C(t) {
  return await n("EciesEncrypt", "authorize", t);
}
async function E(t) {
  return await n("EciesDecrypt", "authorize", t);
}
async function P(t) {
  return await n("SignTransaction", "authorize", t);
}
async function p(t) {
  return await n("Transfer", "authorize", t);
}
async function z(t) {
  return await n("Merge", "authorize", t);
}
async function g(t) {
  return await n("GetTokenBalance", "query", t);
}
const d = {
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
}, f = {
  connect: s,
  isConnected: B,
  disconnect: w,
  getNetwork: b,
  switchNetwork: T,
  getAddress: G,
  getPublicKey: q,
  getXPublicKey: A,
  getBalance: y,
  transfer: p,
  merge: z,
  signTransaction: P,
  eciesEncrypt: C,
  eciesDecrypt: E,
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
  exitAccount: w,
  getMvcBalance: y,
  getSensibleFtBalance: g
};
Object.keys(d).forEach((t) => {
  const e = t;
  d[e].forEach((a) => {
    f.btc[a.name] = async (c) => await n(a.action, e, c);
  });
});
window.metaidwallet = f;
