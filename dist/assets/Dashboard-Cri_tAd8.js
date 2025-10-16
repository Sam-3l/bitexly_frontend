import{r as l,j as e,A as g,N as p}from"./index-BLzcrPts.js";import{u as f}from"./usePageTitle-BXE2Z9c8.js";/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),y=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(s,a,n)=>n?n.toUpperCase():a.toLowerCase()),u=t=>{const s=y(t);return s.charAt(0).toUpperCase()+s.slice(1)},m=(...t)=>t.filter((s,a,n)=>!!s&&s.trim()!==""&&n.indexOf(s)===a).join(" ").trim(),v=t=>{for(const s in t)if(s.startsWith("aria-")||s==="role"||s==="title")return!0};/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var N={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=l.forwardRef(({color:t="currentColor",size:s=24,strokeWidth:a=2,absoluteStrokeWidth:n,className:i="",children:o,iconNode:c,...x},h)=>l.createElement("svg",{ref:h,...N,width:s,height:s,stroke:t,strokeWidth:n?Number(a)*24/Number(s):a,className:m("lucide",i),...!o&&!v(x)&&{"aria-hidden":"true"},...x},[...c.map(([r,b])=>l.createElement(r,b)),...Array.isArray(o)?o:[o]]));/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=(t,s)=>{const a=l.forwardRef(({className:n,...i},o)=>l.createElement(w,{ref:o,iconNode:s,className:m(`lucide-${j(u(t))}`,`lucide-${t}`,n),...i}));return a.displayName=u(t),a};/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]],k=d("bell",C);/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],B=d("house",T);/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]],$=d("log-out",A);/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]],M=d("menu",E);/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["path",{d:"m17 2 4 4-4 4",key:"nntrym"}],["path",{d:"M3 11v-1a4 4 0 0 1 4-4h14",key:"84bu3i"}],["path",{d:"m7 22-4-4 4-4",key:"1wqhfi"}],["path",{d:"M21 13v1a4 4 0 0 1-4 4H3",key:"1rx37r"}]],_=d("repeat",S);function H({onMenuClick:t}){return e.jsxs("nav",{className:"w-full flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-sm sticky top-0 z-40",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{className:"lg:hidden p-2 hover:bg-gray-100 rounded-full transition",onClick:t,children:e.jsx(M,{className:"w-6 h-6 text-gray-600"})}),e.jsx("h1",{className:"text-2xl font-bold text-blue-600",children:"Bitexly"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("button",{className:"relative p-2 hover:bg-gray-100 rounded-full transition",children:[e.jsx(k,{className:"w-5 h-5 text-gray-600"}),e.jsx("span",{className:"absolute top-1 right-1 bg-red-500 text-white text-[10px] px-[4px] py-[1px] rounded-full",children:"3"})]}),e.jsx("img",{src:"https://i.pravatar.cc/40",alt:"User avatar",className:"w-10 h-10 rounded-full border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition"})]})]})}const D="/logo.png",L=[{to:"/dashboard",label:"Dashboard",icon:B}];function U({isOpen:t,onClose:s}){const{logout:a}=l.useContext(g);return e.jsx("aside",{className:`fixed lg:static z-30 inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200 transform ${t?"translate-x-0":"-translate-x-full"} transition-transform duration-300 lg:translate-x-0`,children:e.jsxs("div",{className:"h-full flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-3 p-4 border-b border-gray-200",children:[e.jsx("img",{src:D,alt:"Bitexly Logo",className:"w-8 h-8 object-contain"}),e.jsx("h2",{className:"text-xl font-semibold text-blue-600",children:"Bitexly"})]}),e.jsx("nav",{className:"mt-4 flex flex-col",children:L.map(({to:n,label:i,icon:o})=>e.jsxs(p,{to:n,className:({isActive:c})=>`flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition rounded-md mx-2 ${c?"bg-blue-50 text-blue-600 font-medium":""}`,children:[e.jsx(o,{className:"w-5 h-5"}),i]},n))})]}),e.jsxs("button",{onClick:a,className:"flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition mx-2 mb-4 rounded-md",children:[e.jsx($,{className:"w-5 h-5"}),"Logout"]})]})})}function O(){return e.jsxs("footer",{className:"w-full text-center py-4 border-t border-gray-200 text-gray-500 text-sm bg-white mt-auto",children:["© ",new Date().getFullYear()," ",e.jsx("span",{className:"font-semibold text-blue-600",children:"Bitexly"}),". All rights reserved."]})}function F(){const[t,s]=l.useState("buy"),[a,n]=l.useState("BTC"),[i,o]=l.useState("ETH"),[c,x]=l.useState(""),h=()=>{const r=a;n(i),o(r)};return e.jsxs("div",{className:"max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-6",children:[e.jsx("div",{className:"flex justify-center mb-4 border-b border-gray-200",children:["buy","sell","exchange"].map(r=>e.jsx("button",{onClick:()=>s(r),className:`px-6 py-2 -mb-px font-semibold rounded-t-2xl ${t===r?"text-white bg-indigo-600 shadow-lg":"text-gray-500 hover:text-gray-700"}`,children:r.charAt(0).toUpperCase()+r.slice(1)},r))}),e.jsxs("div",{className:"flex flex-col mb-4",children:[e.jsx("label",{className:"text-gray-500 mb-1",children:"From"}),e.jsxs("div",{className:"flex items-center justify-between border rounded-xl p-3",children:[e.jsxs("select",{value:a,onChange:r=>n(r.target.value),className:"border-none focus:ring-0 outline-none",children:[e.jsx("option",{value:"BTC",children:"Bitcoin (BTC)"}),e.jsx("option",{value:"ETH",children:"Ethereum (ETH)"}),e.jsx("option",{value:"USDT",children:"Tether (USDT)"})]}),e.jsx("input",{type:"number",placeholder:"0.0",value:c,onChange:r=>x(r.target.value),className:"w-24 text-right focus:outline-none"})]})]}),t==="exchange"&&e.jsx("div",{className:"flex justify-center mb-4",children:e.jsx("button",{onClick:h,className:"p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition",children:e.jsx(_,{className:"w-5 h-5 text-gray-600"})})}),e.jsxs("div",{className:"flex flex-col mb-6",children:[e.jsx("label",{className:"text-gray-500 mb-1",children:"To"}),e.jsxs("div",{className:"flex items-center justify-between border rounded-xl p-3 bg-gray-50",children:[e.jsxs("select",{value:i,onChange:r=>o(r.target.value),className:"border-none focus:ring-0 outline-none",children:[e.jsx("option",{value:"BTC",children:"Bitcoin (BTC)"}),e.jsx("option",{value:"ETH",children:"Ethereum (ETH)"}),e.jsx("option",{value:"USDT",children:"Tether (USDT)"})]}),e.jsx("span",{className:"text-gray-400",children:"≈ 0.0"})]})]}),e.jsxs("button",{className:"w-full py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/50",children:[t==="buy"&&`Buy ${a}`,t==="sell"&&`Sell ${a}`,t==="exchange"&&`Exchange ${a} → ${i}`]})]})}function W(){f("Dashboard");const[t,s]=l.useState(!1);return e.jsxs("div",{className:"flex min-h-screen bg-gray-50",children:[e.jsx(U,{isOpen:t,onClose:()=>s(!1)}),e.jsxs("div",{className:"flex flex-col flex-1",children:[e.jsx(H,{onMenuClick:()=>s(!t)}),e.jsxs("main",{className:"flex-1 p-6",children:[e.jsx("h2",{className:"text-3xl font-semibold text-gray-800 mb-4",children:"Welcome to Bitexly Dashboard"}),e.jsx("p",{className:"text-gray-600 mb-8",children:"Manage your crypto transactions seamlessly."}),e.jsx(F,{})]}),e.jsx(O,{})]})]})}export{W as default};
