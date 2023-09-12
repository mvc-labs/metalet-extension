(function(){"use strict";var V=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},X={exports:{}};(function(c,H){(function(S,v){c.exports=v()})(V,function(){var S=1e3,v=6e4,L=36e5,k="millisecond",O="second",m="minute",M="hour",y="day",_="week",w="month",C="quarter",p="year",x="date",K="Invalid Date",dt=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,lt=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,$t={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(r){var e=["th","st","nd","rd"],t=r%100;return"["+r+(e[(t-20)%10]||e[t]||e[0])+"]"}},I=function(r,e,t){var i=String(r);return!i||i.length>=e?r:""+Array(e+1-i.length).join(t)+r},yt={s:I,z:function(r){var e=-r.utcOffset(),t=Math.abs(e),i=Math.floor(t/60),n=t%60;return(e<=0?"+":"-")+I(i,2,"0")+":"+I(n,2,"0")},m:function r(e,t){if(e.date()<t.date())return-r(t,e);var i=12*(t.year()-e.year())+(t.month()-e.month()),n=e.clone().add(i,w),a=t-n<0,s=e.clone().add(i+(a?-1:1),w);return+(-(i+(t-n)/(a?n-s:s-n))||0)},a:function(r){return r<0?Math.ceil(r)||0:Math.floor(r)},p:function(r){return{M:w,y:p,w:_,d:y,D:x,h:M,m,s:O,ms:k,Q:C}[r]||String(r||"").toLowerCase().replace(/s$/,"")},u:function(r){return r===void 0}},q="en",A={};A[q]=$t;var U=function(r){return r instanceof B},W=function r(e,t,i){var n;if(!e)return q;if(typeof e=="string"){var a=e.toLowerCase();A[a]&&(n=a),t&&(A[a]=t,n=a);var s=e.split("-");if(!n&&s.length>1)return r(s[0])}else{var u=e.name;A[u]=e,n=u}return!i&&n&&(q=n),n||!i&&q},d=function(r,e){if(U(r))return r.clone();var t=typeof e=="object"?e:{};return t.date=r,t.args=arguments,new B(t)},o=yt;o.l=W,o.i=U,o.w=function(r,e){return d(r,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var B=function(){function r(t){this.$L=W(t.locale,null,!0),this.parse(t)}var e=r.prototype;return e.parse=function(t){this.$d=function(i){var n=i.date,a=i.utc;if(n===null)return new Date(NaN);if(o.u(n))return new Date;if(n instanceof Date)return new Date(n);if(typeof n=="string"&&!/Z$/i.test(n)){var s=n.match(dt);if(s){var u=s[2]-1||0,h=(s[7]||"0").substring(0,3);return a?new Date(Date.UTC(s[1],u,s[3]||1,s[4]||0,s[5]||0,s[6]||0,h)):new Date(s[1],u,s[3]||1,s[4]||0,s[5]||0,s[6]||0,h)}}return new Date(n)}(t),this.$x=t.x||{},this.init()},e.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},e.$utils=function(){return o},e.isValid=function(){return this.$d.toString()!==K},e.isSame=function(t,i){var n=d(t);return this.startOf(i)<=n&&n<=this.endOf(i)},e.isAfter=function(t,i){return d(t)<this.startOf(i)},e.isBefore=function(t,i){return this.endOf(i)<d(t)},e.$g=function(t,i,n){return o.u(t)?this[i]:this.set(n,t)},e.unix=function(){return Math.floor(this.valueOf()/1e3)},e.valueOf=function(){return this.$d.getTime()},e.startOf=function(t,i){var n=this,a=!!o.u(i)||i,s=o.p(t),u=function(Y,g){var T=o.w(n.$u?Date.UTC(n.$y,g,Y):new Date(n.$y,g,Y),n);return a?T:T.endOf(y)},h=function(Y,g){return o.w(n.toDate()[Y].apply(n.toDate("s"),(a?[0,0,0,0]:[23,59,59,999]).slice(g)),n)},f=this.$W,$=this.$M,b=this.$D,D="set"+(this.$u?"UTC":"");switch(s){case p:return a?u(1,0):u(31,11);case w:return a?u(1,$):u(0,$+1);case _:var z=this.$locale().weekStart||0,N=(f<z?f+7:f)-z;return u(a?b-N:b+(6-N),$);case y:case x:return h(D+"Hours",0);case M:return h(D+"Minutes",1);case m:return h(D+"Seconds",2);case O:return h(D+"Milliseconds",3);default:return this.clone()}},e.endOf=function(t){return this.startOf(t,!1)},e.$set=function(t,i){var n,a=o.p(t),s="set"+(this.$u?"UTC":""),u=(n={},n[y]=s+"Date",n[x]=s+"Date",n[w]=s+"Month",n[p]=s+"FullYear",n[M]=s+"Hours",n[m]=s+"Minutes",n[O]=s+"Seconds",n[k]=s+"Milliseconds",n)[a],h=a===y?this.$D+(i-this.$W):i;if(a===w||a===p){var f=this.clone().set(x,1);f.$d[u](h),f.init(),this.$d=f.set(x,Math.min(this.$D,f.daysInMonth())).$d}else u&&this.$d[u](h);return this.init(),this},e.set=function(t,i){return this.clone().$set(t,i)},e.get=function(t){return this[o.p(t)]()},e.add=function(t,i){var n,a=this;t=Number(t);var s=o.p(i),u=function($){var b=d(a);return o.w(b.date(b.date()+Math.round($*t)),a)};if(s===w)return this.set(w,this.$M+t);if(s===p)return this.set(p,this.$y+t);if(s===y)return u(1);if(s===_)return u(7);var h=(n={},n[m]=v,n[M]=L,n[O]=S,n)[s]||1,f=this.$d.getTime()+t*h;return o.w(f,this)},e.subtract=function(t,i){return this.add(-1*t,i)},e.format=function(t){var i=this,n=this.$locale();if(!this.isValid())return n.invalidDate||K;var a=t||"YYYY-MM-DDTHH:mm:ssZ",s=o.z(this),u=this.$H,h=this.$m,f=this.$M,$=n.weekdays,b=n.months,D=function(g,T,P,E){return g&&(g[T]||g(i,a))||P[T].slice(0,E)},z=function(g){return o.s(u%12||12,g,"0")},N=n.meridiem||function(g,T,P){var E=g<12?"AM":"PM";return P?E.toLowerCase():E},Y={YY:String(this.$y).slice(-2),YYYY:this.$y,M:f+1,MM:o.s(f+1,2,"0"),MMM:D(n.monthsShort,f,b,3),MMMM:D(b,f),D:this.$D,DD:o.s(this.$D,2,"0"),d:String(this.$W),dd:D(n.weekdaysMin,this.$W,$,2),ddd:D(n.weekdaysShort,this.$W,$,3),dddd:$[this.$W],H:String(u),HH:o.s(u,2,"0"),h:z(1),hh:z(2),a:N(u,h,!0),A:N(u,h,!1),m:String(h),mm:o.s(h,2,"0"),s:String(this.$s),ss:o.s(this.$s,2,"0"),SSS:o.s(this.$ms,3,"0"),Z:s};return a.replace(lt,function(g,T){return T||Y[g]||s.replace(":","")})},e.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},e.diff=function(t,i,n){var a,s=o.p(i),u=d(t),h=(u.utcOffset()-this.utcOffset())*v,f=this-u,$=o.m(this,u);return $=(a={},a[p]=$/12,a[w]=$,a[C]=$/3,a[_]=(f-h)/6048e5,a[y]=(f-h)/864e5,a[M]=f/L,a[m]=f/v,a[O]=f/S,a)[s]||f,n?$:o.a($)},e.daysInMonth=function(){return this.endOf(w).$D},e.$locale=function(){return A[this.$L]},e.locale=function(t,i){if(!t)return this.$L;var n=this.clone(),a=W(t,i,!0);return a&&(n.$L=a),n},e.clone=function(){return o.w(this.$d,this)},e.toDate=function(){return new Date(this.valueOf())},e.toJSON=function(){return this.isValid()?this.toISOString():null},e.toISOString=function(){return this.$d.toISOString()},e.toString=function(){return this.$d.toUTCString()},r}(),Z=B.prototype;return d.prototype=Z,[["$ms",k],["$s",O],["$m",m],["$H",M],["$W",y],["$M",w],["$y",p],["$D",x]].forEach(function(r){Z[r[1]]=function(e){return this.$g(e,r[0],r[1])}}),d.extend=function(r,e){return r.$i||(r(e,B,d),r.$i=!0),d},d.locale=W,d.isDayjs=U,d.unix=function(r){return d(1e3*r)},d.en=A[q],d.Ls=A,d.p={},d})})(X);const Q=(c=32)=>{let H="";const S="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let v=0;v<c;v++)H+=S.charAt(Math.floor(Math.random()*S.length));return H};async function l(c,H="authorize",S){const v=`${H}-${c}`,L=Q(16),k=window.location.host;window.postMessage({nonce:L,channel:"to-metaidwallet",action:v,host:k,icon:"",params:S||{}},"*");const O=m=>{const M=y=>{var _,w,C,p;if(!(y.source!==window||((_=y.data)==null?void 0:_.channel)!=="from-metaidwallet")){if(((w=y.data)==null?void 0:w.nonce)===L){if(window.removeEventListener("message",M),(p=(C=y.data)==null?void 0:C.res)!=null&&p.error)throw new Error(y.data.res.error);m&&typeof m=="function"&&m(y.data)}return!0}};window.addEventListener("message",M)};return await new Promise(m=>{O(M=>{m(M.res)})})}async function G(){return await l("Connect")}async function j(){return await l("Disconnect")}async function R(){return await l("IsConnected","query")}async function tt(){return await l("GetNetwork","query")}async function nt(){return await l("SwitchNetwork")}async function et(c){return await l("GetAddress","query",c)}async function rt(c){return await l("GetPublicKey","query",c)}async function it(){return await l("GetXPublicKey","query")}async function F(c){return await l("GetBalance","query",c)}async function st(c){return await l("GetUtxos","query",c)}async function at(c){return await l("EciesEncrypt","authorize",c)}async function ut(c){return await l("EciesDecrypt","authorize",c)}async function ot(c){return await l("SignTransaction","authorize",c)}async function ct(c){return await l("Transfer","authorize",c)}async function ft(c){return await l("Merge","authorize",c)}async function J(c){return await l("GetTokenBalance","query",c)}const ht={connect:G,isConnected:R,disconnect:j,getNetwork:tt,switchNetwork:nt,getAddress:et,getPublicKey:rt,getXPublicKey:it,getBalance:F,getUtxos:st,transfer:ct,merge:ft,signTransaction:ot,eciesEncrypt:at,eciesDecrypt:ut,token:{getBalance:J},nft:{},requestAccount:G,getAccount:G,exitAccount:j,getMvcBalance:F,getSensibleFtBalance:J};window.metaidwallet=ht})();
