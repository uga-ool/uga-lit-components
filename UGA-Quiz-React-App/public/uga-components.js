const ft=globalThis,Bt=ft.ShadowRoot&&(ft.ShadyCSS===void 0||ft.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Gt=Symbol(),es=new WeakMap;let Ns=class{constructor(e,s,r){if(this._$cssResult$=!0,r!==Gt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=s}get styleSheet(){let e=this.o;const s=this.t;if(Bt&&e===void 0){const r=s!==void 0&&s.length===1;r&&(e=es.get(s)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&es.set(s,e))}return e}toString(){return this.cssText}};const dr=t=>new Ns(typeof t=="string"?t:t+"",void 0,Gt),Us=(t,...e)=>{const s=t.length===1?t[0]:e.reduce(((r,i,o)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1]),t[0]);return new Ns(s,t,Gt)},ur=(t,e)=>{if(Bt)t.adoptedStyleSheets=e.map((s=>s instanceof CSSStyleSheet?s:s.styleSheet));else for(const s of e){const r=document.createElement("style"),i=ft.litNonce;i!==void 0&&r.setAttribute("nonce",i),r.textContent=s.cssText,t.appendChild(r)}},ts=Bt?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let s="";for(const r of e.cssRules)s+=r.cssText;return dr(s)})(t):t;const{is:hr,defineProperty:pr,getOwnPropertyDescriptor:fr,getOwnPropertyNames:mr,getOwnPropertySymbols:gr,getPrototypeOf:br}=Object,ye=globalThis,ss=ye.trustedTypes,yr=ss?ss.emptyScript:"",vr=ye.reactiveElementPolyfillSupport,Qe=(t,e)=>t,yt={toAttribute(t,e){switch(e){case Boolean:t=t?yr:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=t!==null;break;case Number:s=t===null?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch{s=null}}return s}},Ht=(t,e)=>!hr(t,e),rs={attribute:!0,type:String,converter:yt,reflect:!1,useDefault:!1,hasChanged:Ht};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),ye.litPropertyMetadata??(ye.litPropertyMetadata=new WeakMap);let ze=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,s=rs){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(e,s),!s.noAccessor){const r=Symbol(),i=this.getPropertyDescriptor(e,r,s);i!==void 0&&pr(this.prototype,e,i)}}static getPropertyDescriptor(e,s,r){const{get:i,set:o}=fr(this.prototype,e)??{get(){return this[s]},set(n){this[s]=n}};return{get:i,set(n){const a=i?.call(this);o?.call(this,n),this.requestUpdate(e,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??rs}static _$Ei(){if(this.hasOwnProperty(Qe("elementProperties")))return;const e=br(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Qe("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Qe("properties"))){const s=this.properties,r=[...mr(s),...gr(s)];for(const i of r)this.createProperty(i,s[i])}const e=this[Symbol.metadata];if(e!==null){const s=litPropertyMetadata.get(e);if(s!==void 0)for(const[r,i]of s)this.elementProperties.set(r,i)}this._$Eh=new Map;for(const[s,r]of this.elementProperties){const i=this._$Eu(s,r);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const s=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const i of r)s.unshift(ts(i))}else e!==void 0&&s.push(ts(e));return s}static _$Eu(e,s){const r=s.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,s=this.constructor.elementProperties;for(const r of s.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ur(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,s,r){this._$AK(e,r)}_$ET(e,s){const r=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,r);if(i!==void 0&&r.reflect===!0){const o=(r.converter?.toAttribute!==void 0?r.converter:yt).toAttribute(s,r.type);this._$Em=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(e,s){const r=this.constructor,i=r._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const o=r.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:yt;this._$Em=i;const a=n.fromAttribute(s,o.type);this[i]=a??this._$Ej?.get(i)??a,this._$Em=null}}requestUpdate(e,s,r){if(e!==void 0){const i=this.constructor,o=this[e];if(r??(r=i.getPropertyOptions(e)),!((r.hasChanged??Ht)(o,s)||r.useDefault&&r.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(i._$Eu(e,r))))return;this.C(e,s,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,s,{useDefault:r,reflect:i,wrapped:o},n){r&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,n??s??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(s=void 0),this._$AL.set(e,s)),i===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[i,o]of r){const{wrapped:n}=o,a=this[i];n!==!0||this._$AL.has(i)||a===void 0||this.C(i,void 0,o,a)}}let e=!1;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),this._$EO?.forEach((r=>r.hostUpdate?.())),this.update(s)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(s)}willUpdate(e){}_$AE(e){this._$EO?.forEach((s=>s.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach((s=>this._$ET(s,this[s])))),this._$EM()}updated(e){}firstUpdated(e){}};ze.elementStyles=[],ze.shadowRootOptions={mode:"open"},ze[Qe("elementProperties")]=new Map,ze[Qe("finalized")]=new Map,vr?.({ReactiveElement:ze}),(ye.reactiveElementVersions??(ye.reactiveElementVersions=[])).push("2.1.1");const Xe=globalThis,vt=Xe.trustedTypes,is=vt?vt.createPolicy("lit-html",{createHTML:t=>t}):void 0,Ts="$lit$",be=`lit$${Math.random().toFixed(9).slice(2)}$`,Os="?"+be,wr=`<${Os}>`,Ne=document,et=()=>Ne.createComment(""),tt=t=>t===null||typeof t!="object"&&typeof t!="function",Vt=Array.isArray,$r=t=>Vt(t)||typeof t?.[Symbol.iterator]=="function",Ut=`[ 	
\f\r]`,We=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,os=/-->/g,ns=/>/g,_e=RegExp(`>|${Ut}(?:([^\\s"'>=/]+)(${Ut}*=${Ut}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),as=/'/g,ls=/"/g,Ds=/^(?:script|style|textarea|title)$/i,Ir=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),m=Ir(1),Ue=Symbol.for("lit-noChange"),M=Symbol.for("lit-nothing"),cs=new WeakMap,Ee=Ne.createTreeWalker(Ne,129);function Ps(t,e){if(!Vt(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return is!==void 0?is.createHTML(e):e}const Sr=(t,e)=>{const s=t.length-1,r=[];let i,o=e===2?"<svg>":e===3?"<math>":"",n=We;for(let a=0;a<s;a++){const l=t[a];let c,d,p=-1,h=0;for(;h<l.length&&(n.lastIndex=h,d=n.exec(l),d!==null);)h=n.lastIndex,n===We?d[1]==="!--"?n=os:d[1]!==void 0?n=ns:d[2]!==void 0?(Ds.test(d[2])&&(i=RegExp("</"+d[2],"g")),n=_e):d[3]!==void 0&&(n=_e):n===_e?d[0]===">"?(n=i??We,p=-1):d[1]===void 0?p=-2:(p=n.lastIndex-d[2].length,c=d[1],n=d[3]===void 0?_e:d[3]==='"'?ls:as):n===ls||n===as?n=_e:n===os||n===ns?n=We:(n=_e,i=void 0);const v=n===_e&&t[a+1].startsWith("/>")?" ":"";o+=n===We?l+wr:p>=0?(r.push(c),l.slice(0,p)+Ts+l.slice(p)+be+v):l+be+(p===-2?a:v)}return[Ps(t,o+(t[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]};class st{constructor({strings:e,_$litType$:s},r){let i;this.parts=[];let o=0,n=0;const a=e.length-1,l=this.parts,[c,d]=Sr(e,s);if(this.el=st.createElement(c,r),Ee.currentNode=this.el.content,s===2||s===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=Ee.nextNode())!==null&&l.length<a;){if(i.nodeType===1){if(i.hasAttributes())for(const p of i.getAttributeNames())if(p.endsWith(Ts)){const h=d[n++],v=i.getAttribute(p).split(be),g=/([.?@])?(.*)/.exec(h);l.push({type:1,index:o,name:g[2],strings:v,ctor:g[1]==="."?xr:g[1]==="?"?Er:g[1]==="@"?kr:It}),i.removeAttribute(p)}else p.startsWith(be)&&(l.push({type:6,index:o}),i.removeAttribute(p));if(Ds.test(i.tagName)){const p=i.textContent.split(be),h=p.length-1;if(h>0){i.textContent=vt?vt.emptyScript:"";for(let v=0;v<h;v++)i.append(p[v],et()),Ee.nextNode(),l.push({type:2,index:++o});i.append(p[h],et())}}}else if(i.nodeType===8)if(i.data===Os)l.push({type:2,index:o});else{let p=-1;for(;(p=i.data.indexOf(be,p+1))!==-1;)l.push({type:7,index:o}),p+=be.length-1}o++}}static createElement(e,s){const r=Ne.createElement("template");return r.innerHTML=e,r}}function qe(t,e,s=t,r){if(e===Ue)return e;let i=r!==void 0?s._$Co?.[r]:s._$Cl;const o=tt(e)?void 0:e._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(t),i._$AT(t,s,r)),r!==void 0?(s._$Co??(s._$Co=[]))[r]=i:s._$Cl=i),i!==void 0&&(e=qe(t,i._$AS(t,e.values),i,r)),e}class _r{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:r}=this._$AD,i=(e?.creationScope??Ne).importNode(s,!0);Ee.currentNode=i;let o=Ee.nextNode(),n=0,a=0,l=r[0];for(;l!==void 0;){if(n===l.index){let c;l.type===2?c=new ot(o,o.nextSibling,this,e):l.type===1?c=new l.ctor(o,l.name,l.strings,this,e):l.type===6&&(c=new Ar(o,this,e)),this._$AV.push(c),l=r[++a]}n!==l?.index&&(o=Ee.nextNode(),n++)}return Ee.currentNode=Ne,i}p(e){let s=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,s),s+=r.strings.length-2):r._$AI(e[s])),s++}}class ot{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,s,r,i){this.type=2,this._$AH=M,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=r,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&e?.nodeType===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=qe(this,e,s),tt(e)?e===M||e==null||e===""?(this._$AH!==M&&this._$AR(),this._$AH=M):e!==this._$AH&&e!==Ue&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):$r(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==M&&tt(this._$AH)?this._$AA.nextSibling.data=e:this.T(Ne.createTextNode(e)),this._$AH=e}$(e){const{values:s,_$litType$:r}=e,i=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=st.createElement(Ps(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===i)this._$AH.p(s);else{const o=new _r(i,this),n=o.u(this.options);o.p(s),this.T(n),this._$AH=o}}_$AC(e){let s=cs.get(e.strings);return s===void 0&&cs.set(e.strings,s=new st(e)),s}k(e){Vt(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let r,i=0;for(const o of e)i===s.length?s.push(r=new ot(this.O(et()),this.O(et()),this,this.options)):r=s[i],r._$AI(o),i++;i<s.length&&(this._$AR(r&&r._$AB.nextSibling,i),s.length=i)}_$AR(e=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);e!==this._$AB;){const r=e.nextSibling;e.remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class It{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,r,i,o){this.type=1,this._$AH=M,this._$AN=void 0,this.element=e,this.name=s,this._$AM=i,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=M}_$AI(e,s=this,r,i){const o=this.strings;let n=!1;if(o===void 0)e=qe(this,e,s,0),n=!tt(e)||e!==this._$AH&&e!==Ue,n&&(this._$AH=e);else{const a=e;let l,c;for(e=o[0],l=0;l<o.length-1;l++)c=qe(this,a[r+l],s,l),c===Ue&&(c=this._$AH[l]),n||(n=!tt(c)||c!==this._$AH[l]),c===M?e=M:e!==M&&(e+=(c??"")+o[l+1]),this._$AH[l]=c}n&&!i&&this.j(e)}j(e){e===M?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class xr extends It{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===M?void 0:e}}class Er extends It{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==M)}}class kr extends It{constructor(e,s,r,i,o){super(e,s,r,i,o),this.type=5}_$AI(e,s=this){if((e=qe(this,e,s,0)??M)===Ue)return;const r=this._$AH,i=e===M&&r!==M||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==M&&(r===M||i);i&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ar{constructor(e,s,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){qe(this,e)}}const Cr=Xe.litHtmlPolyfillSupport;Cr?.(st,ot),(Xe.litHtmlVersions??(Xe.litHtmlVersions=[])).push("3.3.1");const Nr=(t,e,s)=>{const r=s?.renderBefore??e;let i=r._$litPart$;if(i===void 0){const o=s?.renderBefore??null;r._$litPart$=i=new ot(e.insertBefore(et(),o),o,void 0,s??{})}return i._$AI(t),i};const Ye=globalThis;let H=class extends ze{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var s;const e=super.createRenderRoot();return(s=this.renderOptions).renderBefore??(s.renderBefore=e.firstChild),e}update(e){const s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Nr(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Ue}};H._$litElement$=!0,H.finalized=!0,Ye.litElementHydrateSupport?.({LitElement:H});const Ur=Ye.litElementPolyfillSupport;Ur?.({LitElement:H});(Ye.litElementVersions??(Ye.litElementVersions=[])).push("4.2.1");const ee=t=>(e,s)=>{s!==void 0?s.addInitializer((()=>{customElements.define(t,e)})):customElements.define(t,e)};const Tr={attribute:!0,type:String,converter:yt,reflect:!1,hasChanged:Ht},Or=(t=Tr,e,s)=>{const{kind:r,metadata:i}=s;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),r==="setter"&&((t=Object.create(t)).wrapped=!0),o.set(s.name,t),r==="accessor"){const{name:n}=s;return{set(a){const l=e.get.call(this);e.set.call(this,a),this.requestUpdate(n,l,t)},init(a){return a!==void 0&&this.C(n,void 0,t,a),a}}}if(r==="setter"){const{name:n}=s;return function(a){const l=this[n];e.call(this,a),this.requestUpdate(n,l,t)}}throw Error("Unsupported decorator location: "+r)};function b(t){return(e,s)=>typeof s=="object"?Or(t,e,s):((r,i,o)=>{const n=i.hasOwnProperty(o);return i.constructor.createProperty(o,r),n?Object.getOwnPropertyDescriptor(i,o):void 0})(t,e,s)}function P(t){return b({...t,state:!0,attribute:!1})}const Dr={CHILD:2},Pr=t=>(...e)=>({_$litDirective$:t,values:e});class Rr{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,s,r){this._$Ct=e,this._$AM=s,this._$Ci=r}_$AS(e,s){return this.update(e,s)}update(e,s){return this.render(...s)}}class Pt extends Rr{constructor(e){if(super(e),this.it=M,e.type!==Dr.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===M||e==null)return this._t=void 0,this.it=e;if(e===Ue)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const s=[e];return s.raw=s,this._t={_$litType$:this.constructor.resultType,strings:s,values:[]}}}Pt.directiveName="unsafeHTML",Pt.resultType=1;const nt=Pr(Pt);function Rs(t,e){return function(){return t.apply(e,arguments)}}const{toString:jr}=Object.prototype,{getPrototypeOf:Jt}=Object,{iterator:St,toStringTag:js}=Symbol,_t=(t=>e=>{const s=jr.call(e);return t[s]||(t[s]=s.slice(8,-1).toLowerCase())})(Object.create(null)),ce=t=>(t=t.toLowerCase(),e=>_t(e)===t),xt=t=>e=>typeof e===t,{isArray:Ge}=Array,Le=xt("undefined");function at(t){return t!==null&&!Le(t)&&t.constructor!==null&&!Le(t.constructor)&&Y(t.constructor.isBuffer)&&t.constructor.isBuffer(t)}const zs=ce("ArrayBuffer");function zr(t){let e;return typeof ArrayBuffer<"u"&&ArrayBuffer.isView?e=ArrayBuffer.isView(t):e=t&&t.buffer&&zs(t.buffer),e}const Fr=xt("string"),Y=xt("function"),Fs=xt("number"),lt=t=>t!==null&&typeof t=="object",qr=t=>t===!0||t===!1,mt=t=>{if(_t(t)!=="object")return!1;const e=Jt(t);return(e===null||e===Object.prototype||Object.getPrototypeOf(e)===null)&&!(js in t)&&!(St in t)},Lr=t=>{if(!lt(t)||at(t))return!1;try{return Object.keys(t).length===0&&Object.getPrototypeOf(t)===Object.prototype}catch{return!1}},Mr=ce("Date"),Br=ce("File"),Gr=ce("Blob"),Hr=ce("FileList"),Vr=t=>lt(t)&&Y(t.pipe),Jr=t=>{let e;return t&&(typeof FormData=="function"&&t instanceof FormData||Y(t.append)&&((e=_t(t))==="formdata"||e==="object"&&Y(t.toString)&&t.toString()==="[object FormData]"))},Wr=ce("URLSearchParams"),[Kr,Qr,Xr,Yr]=["ReadableStream","Request","Response","Headers"].map(ce),Zr=t=>t.trim?t.trim():t.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"");function ct(t,e,{allOwnKeys:s=!1}={}){if(t===null||typeof t>"u")return;let r,i;if(typeof t!="object"&&(t=[t]),Ge(t))for(r=0,i=t.length;r<i;r++)e.call(null,t[r],r,t);else{if(at(t))return;const o=s?Object.getOwnPropertyNames(t):Object.keys(t),n=o.length;let a;for(r=0;r<n;r++)a=o[r],e.call(null,t[a],a,t)}}function qs(t,e){if(at(t))return null;e=e.toLowerCase();const s=Object.keys(t);let r=s.length,i;for(;r-- >0;)if(i=s[r],e===i.toLowerCase())return i;return null}const ke=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:global,Ls=t=>!Le(t)&&t!==ke;function Rt(){const{caseless:t,skipUndefined:e}=Ls(this)&&this||{},s={},r=(i,o)=>{const n=t&&qs(s,o)||o;mt(s[n])&&mt(i)?s[n]=Rt(s[n],i):mt(i)?s[n]=Rt({},i):Ge(i)?s[n]=i.slice():(!e||!Le(i))&&(s[n]=i)};for(let i=0,o=arguments.length;i<o;i++)arguments[i]&&ct(arguments[i],r);return s}const ei=(t,e,s,{allOwnKeys:r}={})=>(ct(e,(i,o)=>{s&&Y(i)?t[o]=Rs(i,s):t[o]=i},{allOwnKeys:r}),t),ti=t=>(t.charCodeAt(0)===65279&&(t=t.slice(1)),t),si=(t,e,s,r)=>{t.prototype=Object.create(e.prototype,r),t.prototype.constructor=t,Object.defineProperty(t,"super",{value:e.prototype}),s&&Object.assign(t.prototype,s)},ri=(t,e,s,r)=>{let i,o,n;const a={};if(e=e||{},t==null)return e;do{for(i=Object.getOwnPropertyNames(t),o=i.length;o-- >0;)n=i[o],(!r||r(n,t,e))&&!a[n]&&(e[n]=t[n],a[n]=!0);t=s!==!1&&Jt(t)}while(t&&(!s||s(t,e))&&t!==Object.prototype);return e},ii=(t,e,s)=>{t=String(t),(s===void 0||s>t.length)&&(s=t.length),s-=e.length;const r=t.indexOf(e,s);return r!==-1&&r===s},oi=t=>{if(!t)return null;if(Ge(t))return t;let e=t.length;if(!Fs(e))return null;const s=new Array(e);for(;e-- >0;)s[e]=t[e];return s},ni=(t=>e=>t&&e instanceof t)(typeof Uint8Array<"u"&&Jt(Uint8Array)),ai=(t,e)=>{const r=(t&&t[St]).call(t);let i;for(;(i=r.next())&&!i.done;){const o=i.value;e.call(t,o[0],o[1])}},li=(t,e)=>{let s;const r=[];for(;(s=t.exec(e))!==null;)r.push(s);return r},ci=ce("HTMLFormElement"),di=t=>t.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,function(s,r,i){return r.toUpperCase()+i}),ds=(({hasOwnProperty:t})=>(e,s)=>t.call(e,s))(Object.prototype),ui=ce("RegExp"),Ms=(t,e)=>{const s=Object.getOwnPropertyDescriptors(t),r={};ct(s,(i,o)=>{let n;(n=e(i,o,t))!==!1&&(r[o]=n||i)}),Object.defineProperties(t,r)},hi=t=>{Ms(t,(e,s)=>{if(Y(t)&&["arguments","caller","callee"].indexOf(s)!==-1)return!1;const r=t[s];if(Y(r)){if(e.enumerable=!1,"writable"in e){e.writable=!1;return}e.set||(e.set=()=>{throw Error("Can not rewrite read-only method '"+s+"'")})}})},pi=(t,e)=>{const s={},r=i=>{i.forEach(o=>{s[o]=!0})};return Ge(t)?r(t):r(String(t).split(e)),s},fi=()=>{},mi=(t,e)=>t!=null&&Number.isFinite(t=+t)?t:e;function gi(t){return!!(t&&Y(t.append)&&t[js]==="FormData"&&t[St])}const bi=t=>{const e=new Array(10),s=(r,i)=>{if(lt(r)){if(e.indexOf(r)>=0)return;if(at(r))return r;if(!("toJSON"in r)){e[i]=r;const o=Ge(r)?[]:{};return ct(r,(n,a)=>{const l=s(n,i+1);!Le(l)&&(o[a]=l)}),e[i]=void 0,o}}return r};return s(t,0)},yi=ce("AsyncFunction"),vi=t=>t&&(lt(t)||Y(t))&&Y(t.then)&&Y(t.catch),Bs=((t,e)=>t?setImmediate:e?((s,r)=>(ke.addEventListener("message",({source:i,data:o})=>{i===ke&&o===s&&r.length&&r.shift()()},!1),i=>{r.push(i),ke.postMessage(s,"*")}))(`axios@${Math.random()}`,[]):s=>setTimeout(s))(typeof setImmediate=="function",Y(ke.postMessage)),wi=typeof queueMicrotask<"u"?queueMicrotask.bind(ke):typeof process<"u"&&process.nextTick||Bs,$i=t=>t!=null&&Y(t[St]),u={isArray:Ge,isArrayBuffer:zs,isBuffer:at,isFormData:Jr,isArrayBufferView:zr,isString:Fr,isNumber:Fs,isBoolean:qr,isObject:lt,isPlainObject:mt,isEmptyObject:Lr,isReadableStream:Kr,isRequest:Qr,isResponse:Xr,isHeaders:Yr,isUndefined:Le,isDate:Mr,isFile:Br,isBlob:Gr,isRegExp:ui,isFunction:Y,isStream:Vr,isURLSearchParams:Wr,isTypedArray:ni,isFileList:Hr,forEach:ct,merge:Rt,extend:ei,trim:Zr,stripBOM:ti,inherits:si,toFlatObject:ri,kindOf:_t,kindOfTest:ce,endsWith:ii,toArray:oi,forEachEntry:ai,matchAll:li,isHTMLForm:ci,hasOwnProperty:ds,hasOwnProp:ds,reduceDescriptors:Ms,freezeMethods:hi,toObjectSet:pi,toCamelCase:di,noop:fi,toFiniteNumber:mi,findKey:qs,global:ke,isContextDefined:Ls,isSpecCompliantForm:gi,toJSONObject:bi,isAsyncFn:yi,isThenable:vi,setImmediate:Bs,asap:wi,isIterable:$i};function _(t,e,s,r,i){Error.call(this),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack,this.message=t,this.name="AxiosError",e&&(this.code=e),s&&(this.config=s),r&&(this.request=r),i&&(this.response=i,this.status=i.status?i.status:null)}u.inherits(_,Error,{toJSON:function(){return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:u.toJSONObject(this.config),code:this.code,status:this.status}}});const Gs=_.prototype,Hs={};["ERR_BAD_OPTION_VALUE","ERR_BAD_OPTION","ECONNABORTED","ETIMEDOUT","ERR_NETWORK","ERR_FR_TOO_MANY_REDIRECTS","ERR_DEPRECATED","ERR_BAD_RESPONSE","ERR_BAD_REQUEST","ERR_CANCELED","ERR_NOT_SUPPORT","ERR_INVALID_URL"].forEach(t=>{Hs[t]={value:t}});Object.defineProperties(_,Hs);Object.defineProperty(Gs,"isAxiosError",{value:!0});_.from=(t,e,s,r,i,o)=>{const n=Object.create(Gs);u.toFlatObject(t,n,function(d){return d!==Error.prototype},c=>c!=="isAxiosError");const a=t&&t.message?t.message:"Error",l=e==null&&t?t.code:e;return _.call(n,a,l,s,r,i),t&&n.cause==null&&Object.defineProperty(n,"cause",{value:t,configurable:!0}),n.name=t&&t.name||"Error",o&&Object.assign(n,o),n};const Ii=null;function jt(t){return u.isPlainObject(t)||u.isArray(t)}function Vs(t){return u.endsWith(t,"[]")?t.slice(0,-2):t}function us(t,e,s){return t?t.concat(e).map(function(i,o){return i=Vs(i),!s&&o?"["+i+"]":i}).join(s?".":""):e}function Si(t){return u.isArray(t)&&!t.some(jt)}const _i=u.toFlatObject(u,{},null,function(e){return/^is[A-Z]/.test(e)});function Et(t,e,s){if(!u.isObject(t))throw new TypeError("target must be an object");e=e||new FormData,s=u.toFlatObject(s,{metaTokens:!0,dots:!1,indexes:!1},!1,function(w,y){return!u.isUndefined(y[w])});const r=s.metaTokens,i=s.visitor||d,o=s.dots,n=s.indexes,l=(s.Blob||typeof Blob<"u"&&Blob)&&u.isSpecCompliantForm(e);if(!u.isFunction(i))throw new TypeError("visitor must be a function");function c(g){if(g===null)return"";if(u.isDate(g))return g.toISOString();if(u.isBoolean(g))return g.toString();if(!l&&u.isBlob(g))throw new _("Blob is not supported. Use a Buffer instead.");return u.isArrayBuffer(g)||u.isTypedArray(g)?l&&typeof Blob=="function"?new Blob([g]):Buffer.from(g):g}function d(g,w,y){let A=g;if(g&&!y&&typeof g=="object"){if(u.endsWith(w,"{}"))w=r?w:w.slice(0,-2),g=JSON.stringify(g);else if(u.isArray(g)&&Si(g)||(u.isFileList(g)||u.endsWith(w,"[]"))&&(A=u.toArray(g)))return w=Vs(w),A.forEach(function(E,R){!(u.isUndefined(E)||E===null)&&e.append(n===!0?us([w],R,o):n===null?w:w+"[]",c(E))}),!1}return jt(g)?!0:(e.append(us(y,w,o),c(g)),!1)}const p=[],h=Object.assign(_i,{defaultVisitor:d,convertValue:c,isVisitable:jt});function v(g,w){if(!u.isUndefined(g)){if(p.indexOf(g)!==-1)throw Error("Circular reference detected in "+w.join("."));p.push(g),u.forEach(g,function(A,F){(!(u.isUndefined(A)||A===null)&&i.call(e,A,u.isString(F)?F.trim():F,w,h))===!0&&v(A,w?w.concat(F):[F])}),p.pop()}}if(!u.isObject(t))throw new TypeError("data must be an object");return v(t),e}function hs(t){const e={"!":"%21","'":"%27","(":"%28",")":"%29","~":"%7E","%20":"+","%00":"\0"};return encodeURIComponent(t).replace(/[!'()~]|%20|%00/g,function(r){return e[r]})}function Wt(t,e){this._pairs=[],t&&Et(t,this,e)}const Js=Wt.prototype;Js.append=function(e,s){this._pairs.push([e,s])};Js.toString=function(e){const s=e?function(r){return e.call(this,r,hs)}:hs;return this._pairs.map(function(i){return s(i[0])+"="+s(i[1])},"").join("&")};function xi(t){return encodeURIComponent(t).replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+")}function Ws(t,e,s){if(!e)return t;const r=s&&s.encode||xi;u.isFunction(s)&&(s={serialize:s});const i=s&&s.serialize;let o;if(i?o=i(e,s):o=u.isURLSearchParams(e)?e.toString():new Wt(e,s).toString(r),o){const n=t.indexOf("#");n!==-1&&(t=t.slice(0,n)),t+=(t.indexOf("?")===-1?"?":"&")+o}return t}class ps{constructor(){this.handlers=[]}use(e,s,r){return this.handlers.push({fulfilled:e,rejected:s,synchronous:r?r.synchronous:!1,runWhen:r?r.runWhen:null}),this.handlers.length-1}eject(e){this.handlers[e]&&(this.handlers[e]=null)}clear(){this.handlers&&(this.handlers=[])}forEach(e){u.forEach(this.handlers,function(r){r!==null&&e(r)})}}const Ks={silentJSONParsing:!0,forcedJSONParsing:!0,clarifyTimeoutError:!1},Ei=typeof URLSearchParams<"u"?URLSearchParams:Wt,ki=typeof FormData<"u"?FormData:null,Ai=typeof Blob<"u"?Blob:null,Ci={isBrowser:!0,classes:{URLSearchParams:Ei,FormData:ki,Blob:Ai},protocols:["http","https","file","blob","url","data"]},Kt=typeof window<"u"&&typeof document<"u",zt=typeof navigator=="object"&&navigator||void 0,Ni=Kt&&(!zt||["ReactNative","NativeScript","NS"].indexOf(zt.product)<0),Ui=typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope&&typeof self.importScripts=="function",Ti=Kt&&window.location.href||"http://localhost",Oi=Object.freeze(Object.defineProperty({__proto__:null,hasBrowserEnv:Kt,hasStandardBrowserEnv:Ni,hasStandardBrowserWebWorkerEnv:Ui,navigator:zt,origin:Ti},Symbol.toStringTag,{value:"Module"})),Q={...Oi,...Ci};function Di(t,e){return Et(t,new Q.classes.URLSearchParams,{visitor:function(s,r,i,o){return Q.isNode&&u.isBuffer(s)?(this.append(r,s.toString("base64")),!1):o.defaultVisitor.apply(this,arguments)},...e})}function Pi(t){return u.matchAll(/\w+|\[(\w*)]/g,t).map(e=>e[0]==="[]"?"":e[1]||e[0])}function Ri(t){const e={},s=Object.keys(t);let r;const i=s.length;let o;for(r=0;r<i;r++)o=s[r],e[o]=t[o];return e}function Qs(t){function e(s,r,i,o){let n=s[o++];if(n==="__proto__")return!0;const a=Number.isFinite(+n),l=o>=s.length;return n=!n&&u.isArray(i)?i.length:n,l?(u.hasOwnProp(i,n)?i[n]=[i[n],r]:i[n]=r,!a):((!i[n]||!u.isObject(i[n]))&&(i[n]=[]),e(s,r,i[n],o)&&u.isArray(i[n])&&(i[n]=Ri(i[n])),!a)}if(u.isFormData(t)&&u.isFunction(t.entries)){const s={};return u.forEachEntry(t,(r,i)=>{e(Pi(r),i,s,0)}),s}return null}function ji(t,e,s){if(u.isString(t))try{return(e||JSON.parse)(t),u.trim(t)}catch(r){if(r.name!=="SyntaxError")throw r}return(s||JSON.stringify)(t)}const dt={transitional:Ks,adapter:["xhr","http","fetch"],transformRequest:[function(e,s){const r=s.getContentType()||"",i=r.indexOf("application/json")>-1,o=u.isObject(e);if(o&&u.isHTMLForm(e)&&(e=new FormData(e)),u.isFormData(e))return i?JSON.stringify(Qs(e)):e;if(u.isArrayBuffer(e)||u.isBuffer(e)||u.isStream(e)||u.isFile(e)||u.isBlob(e)||u.isReadableStream(e))return e;if(u.isArrayBufferView(e))return e.buffer;if(u.isURLSearchParams(e))return s.setContentType("application/x-www-form-urlencoded;charset=utf-8",!1),e.toString();let a;if(o){if(r.indexOf("application/x-www-form-urlencoded")>-1)return Di(e,this.formSerializer).toString();if((a=u.isFileList(e))||r.indexOf("multipart/form-data")>-1){const l=this.env&&this.env.FormData;return Et(a?{"files[]":e}:e,l&&new l,this.formSerializer)}}return o||i?(s.setContentType("application/json",!1),ji(e)):e}],transformResponse:[function(e){const s=this.transitional||dt.transitional,r=s&&s.forcedJSONParsing,i=this.responseType==="json";if(u.isResponse(e)||u.isReadableStream(e))return e;if(e&&u.isString(e)&&(r&&!this.responseType||i)){const n=!(s&&s.silentJSONParsing)&&i;try{return JSON.parse(e,this.parseReviver)}catch(a){if(n)throw a.name==="SyntaxError"?_.from(a,_.ERR_BAD_RESPONSE,this,null,this.response):a}}return e}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,maxBodyLength:-1,env:{FormData:Q.classes.FormData,Blob:Q.classes.Blob},validateStatus:function(e){return e>=200&&e<300},headers:{common:{Accept:"application/json, text/plain, */*","Content-Type":void 0}}};u.forEach(["delete","get","head","post","put","patch"],t=>{dt.headers[t]={}});const zi=u.toObjectSet(["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"]),Fi=t=>{const e={};let s,r,i;return t&&t.split(`
`).forEach(function(n){i=n.indexOf(":"),s=n.substring(0,i).trim().toLowerCase(),r=n.substring(i+1).trim(),!(!s||e[s]&&zi[s])&&(s==="set-cookie"?e[s]?e[s].push(r):e[s]=[r]:e[s]=e[s]?e[s]+", "+r:r)}),e},fs=Symbol("internals");function Ke(t){return t&&String(t).trim().toLowerCase()}function gt(t){return t===!1||t==null?t:u.isArray(t)?t.map(gt):String(t)}function qi(t){const e=Object.create(null),s=/([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;let r;for(;r=s.exec(t);)e[r[1]]=r[2];return e}const Li=t=>/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(t.trim());function Tt(t,e,s,r,i){if(u.isFunction(r))return r.call(this,e,s);if(i&&(e=s),!!u.isString(e)){if(u.isString(r))return e.indexOf(r)!==-1;if(u.isRegExp(r))return r.test(e)}}function Mi(t){return t.trim().toLowerCase().replace(/([a-z\d])(\w*)/g,(e,s,r)=>s.toUpperCase()+r)}function Bi(t,e){const s=u.toCamelCase(" "+e);["get","set","has"].forEach(r=>{Object.defineProperty(t,r+s,{value:function(i,o,n){return this[r].call(this,e,i,o,n)},configurable:!0})})}let Z=class{constructor(e){e&&this.set(e)}set(e,s,r){const i=this;function o(a,l,c){const d=Ke(l);if(!d)throw new Error("header name must be a non-empty string");const p=u.findKey(i,d);(!p||i[p]===void 0||c===!0||c===void 0&&i[p]!==!1)&&(i[p||l]=gt(a))}const n=(a,l)=>u.forEach(a,(c,d)=>o(c,d,l));if(u.isPlainObject(e)||e instanceof this.constructor)n(e,s);else if(u.isString(e)&&(e=e.trim())&&!Li(e))n(Fi(e),s);else if(u.isObject(e)&&u.isIterable(e)){let a={},l,c;for(const d of e){if(!u.isArray(d))throw TypeError("Object iterator must return a key-value pair");a[c=d[0]]=(l=a[c])?u.isArray(l)?[...l,d[1]]:[l,d[1]]:d[1]}n(a,s)}else e!=null&&o(s,e,r);return this}get(e,s){if(e=Ke(e),e){const r=u.findKey(this,e);if(r){const i=this[r];if(!s)return i;if(s===!0)return qi(i);if(u.isFunction(s))return s.call(this,i,r);if(u.isRegExp(s))return s.exec(i);throw new TypeError("parser must be boolean|regexp|function")}}}has(e,s){if(e=Ke(e),e){const r=u.findKey(this,e);return!!(r&&this[r]!==void 0&&(!s||Tt(this,this[r],r,s)))}return!1}delete(e,s){const r=this;let i=!1;function o(n){if(n=Ke(n),n){const a=u.findKey(r,n);a&&(!s||Tt(r,r[a],a,s))&&(delete r[a],i=!0)}}return u.isArray(e)?e.forEach(o):o(e),i}clear(e){const s=Object.keys(this);let r=s.length,i=!1;for(;r--;){const o=s[r];(!e||Tt(this,this[o],o,e,!0))&&(delete this[o],i=!0)}return i}normalize(e){const s=this,r={};return u.forEach(this,(i,o)=>{const n=u.findKey(r,o);if(n){s[n]=gt(i),delete s[o];return}const a=e?Mi(o):String(o).trim();a!==o&&delete s[o],s[a]=gt(i),r[a]=!0}),this}concat(...e){return this.constructor.concat(this,...e)}toJSON(e){const s=Object.create(null);return u.forEach(this,(r,i)=>{r!=null&&r!==!1&&(s[i]=e&&u.isArray(r)?r.join(", "):r)}),s}[Symbol.iterator](){return Object.entries(this.toJSON())[Symbol.iterator]()}toString(){return Object.entries(this.toJSON()).map(([e,s])=>e+": "+s).join(`
`)}getSetCookie(){return this.get("set-cookie")||[]}get[Symbol.toStringTag](){return"AxiosHeaders"}static from(e){return e instanceof this?e:new this(e)}static concat(e,...s){const r=new this(e);return s.forEach(i=>r.set(i)),r}static accessor(e){const r=(this[fs]=this[fs]={accessors:{}}).accessors,i=this.prototype;function o(n){const a=Ke(n);r[a]||(Bi(i,n),r[a]=!0)}return u.isArray(e)?e.forEach(o):o(e),this}};Z.accessor(["Content-Type","Content-Length","Accept","Accept-Encoding","User-Agent","Authorization"]);u.reduceDescriptors(Z.prototype,({value:t},e)=>{let s=e[0].toUpperCase()+e.slice(1);return{get:()=>t,set(r){this[s]=r}}});u.freezeMethods(Z);function Ot(t,e){const s=this||dt,r=e||s,i=Z.from(r.headers);let o=r.data;return u.forEach(t,function(a){o=a.call(s,o,i.normalize(),e?e.status:void 0)}),i.normalize(),o}function Xs(t){return!!(t&&t.__CANCEL__)}function He(t,e,s){_.call(this,t??"canceled",_.ERR_CANCELED,e,s),this.name="CanceledError"}u.inherits(He,_,{__CANCEL__:!0});function Ys(t,e,s){const r=s.config.validateStatus;!s.status||!r||r(s.status)?t(s):e(new _("Request failed with status code "+s.status,[_.ERR_BAD_REQUEST,_.ERR_BAD_RESPONSE][Math.floor(s.status/100)-4],s.config,s.request,s))}function Gi(t){const e=/^([-+\w]{1,25})(:?\/\/|:)/.exec(t);return e&&e[1]||""}function Hi(t,e){t=t||10;const s=new Array(t),r=new Array(t);let i=0,o=0,n;return e=e!==void 0?e:1e3,function(l){const c=Date.now(),d=r[o];n||(n=c),s[i]=l,r[i]=c;let p=o,h=0;for(;p!==i;)h+=s[p++],p=p%t;if(i=(i+1)%t,i===o&&(o=(o+1)%t),c-n<e)return;const v=d&&c-d;return v?Math.round(h*1e3/v):void 0}}function Vi(t,e){let s=0,r=1e3/e,i,o;const n=(c,d=Date.now())=>{s=d,i=null,o&&(clearTimeout(o),o=null),t(...c)};return[(...c)=>{const d=Date.now(),p=d-s;p>=r?n(c,d):(i=c,o||(o=setTimeout(()=>{o=null,n(i)},r-p)))},()=>i&&n(i)]}const wt=(t,e,s=3)=>{let r=0;const i=Hi(50,250);return Vi(o=>{const n=o.loaded,a=o.lengthComputable?o.total:void 0,l=n-r,c=i(l),d=n<=a;r=n;const p={loaded:n,total:a,progress:a?n/a:void 0,bytes:l,rate:c||void 0,estimated:c&&a&&d?(a-n)/c:void 0,event:o,lengthComputable:a!=null,[e?"download":"upload"]:!0};t(p)},s)},ms=(t,e)=>{const s=t!=null;return[r=>e[0]({lengthComputable:s,total:t,loaded:r}),e[1]]},gs=t=>(...e)=>u.asap(()=>t(...e)),Ji=Q.hasStandardBrowserEnv?((t,e)=>s=>(s=new URL(s,Q.origin),t.protocol===s.protocol&&t.host===s.host&&(e||t.port===s.port)))(new URL(Q.origin),Q.navigator&&/(msie|trident)/i.test(Q.navigator.userAgent)):()=>!0,Wi=Q.hasStandardBrowserEnv?{write(t,e,s,r,i,o,n){if(typeof document>"u")return;const a=[`${t}=${encodeURIComponent(e)}`];u.isNumber(s)&&a.push(`expires=${new Date(s).toUTCString()}`),u.isString(r)&&a.push(`path=${r}`),u.isString(i)&&a.push(`domain=${i}`),o===!0&&a.push("secure"),u.isString(n)&&a.push(`SameSite=${n}`),document.cookie=a.join("; ")},read(t){if(typeof document>"u")return null;const e=document.cookie.match(new RegExp("(?:^|; )"+t+"=([^;]*)"));return e?decodeURIComponent(e[1]):null},remove(t){this.write(t,"",Date.now()-864e5,"/")}}:{write(){},read(){return null},remove(){}};function Ki(t){return/^([a-z][a-z\d+\-.]*:)?\/\//i.test(t)}function Qi(t,e){return e?t.replace(/\/?\/$/,"")+"/"+e.replace(/^\/+/,""):t}function Zs(t,e,s){let r=!Ki(e);return t&&(r||s==!1)?Qi(t,e):e}const bs=t=>t instanceof Z?{...t}:t;function Te(t,e){e=e||{};const s={};function r(c,d,p,h){return u.isPlainObject(c)&&u.isPlainObject(d)?u.merge.call({caseless:h},c,d):u.isPlainObject(d)?u.merge({},d):u.isArray(d)?d.slice():d}function i(c,d,p,h){if(u.isUndefined(d)){if(!u.isUndefined(c))return r(void 0,c,p,h)}else return r(c,d,p,h)}function o(c,d){if(!u.isUndefined(d))return r(void 0,d)}function n(c,d){if(u.isUndefined(d)){if(!u.isUndefined(c))return r(void 0,c)}else return r(void 0,d)}function a(c,d,p){if(p in e)return r(c,d);if(p in t)return r(void 0,c)}const l={url:o,method:o,data:o,baseURL:n,transformRequest:n,transformResponse:n,paramsSerializer:n,timeout:n,timeoutMessage:n,withCredentials:n,withXSRFToken:n,adapter:n,responseType:n,xsrfCookieName:n,xsrfHeaderName:n,onUploadProgress:n,onDownloadProgress:n,decompress:n,maxContentLength:n,maxBodyLength:n,beforeRedirect:n,transport:n,httpAgent:n,httpsAgent:n,cancelToken:n,socketPath:n,responseEncoding:n,validateStatus:a,headers:(c,d,p)=>i(bs(c),bs(d),p,!0)};return u.forEach(Object.keys({...t,...e}),function(d){const p=l[d]||i,h=p(t[d],e[d],d);u.isUndefined(h)&&p!==a||(s[d]=h)}),s}const er=t=>{const e=Te({},t);let{data:s,withXSRFToken:r,xsrfHeaderName:i,xsrfCookieName:o,headers:n,auth:a}=e;if(e.headers=n=Z.from(n),e.url=Ws(Zs(e.baseURL,e.url,e.allowAbsoluteUrls),t.params,t.paramsSerializer),a&&n.set("Authorization","Basic "+btoa((a.username||"")+":"+(a.password?unescape(encodeURIComponent(a.password)):""))),u.isFormData(s)){if(Q.hasStandardBrowserEnv||Q.hasStandardBrowserWebWorkerEnv)n.setContentType(void 0);else if(u.isFunction(s.getHeaders)){const l=s.getHeaders(),c=["content-type","content-length"];Object.entries(l).forEach(([d,p])=>{c.includes(d.toLowerCase())&&n.set(d,p)})}}if(Q.hasStandardBrowserEnv&&(r&&u.isFunction(r)&&(r=r(e)),r||r!==!1&&Ji(e.url))){const l=i&&o&&Wi.read(o);l&&n.set(i,l)}return e},Xi=typeof XMLHttpRequest<"u",Yi=Xi&&function(t){return new Promise(function(s,r){const i=er(t);let o=i.data;const n=Z.from(i.headers).normalize();let{responseType:a,onUploadProgress:l,onDownloadProgress:c}=i,d,p,h,v,g;function w(){v&&v(),g&&g(),i.cancelToken&&i.cancelToken.unsubscribe(d),i.signal&&i.signal.removeEventListener("abort",d)}let y=new XMLHttpRequest;y.open(i.method.toUpperCase(),i.url,!0),y.timeout=i.timeout;function A(){if(!y)return;const E=Z.from("getAllResponseHeaders"in y&&y.getAllResponseHeaders()),q={data:!a||a==="text"||a==="json"?y.responseText:y.response,status:y.status,statusText:y.statusText,headers:E,config:t,request:y};Ys(function(z){s(z),w()},function(z){r(z),w()},q),y=null}"onloadend"in y?y.onloadend=A:y.onreadystatechange=function(){!y||y.readyState!==4||y.status===0&&!(y.responseURL&&y.responseURL.indexOf("file:")===0)||setTimeout(A)},y.onabort=function(){y&&(r(new _("Request aborted",_.ECONNABORTED,t,y)),y=null)},y.onerror=function(R){const q=R&&R.message?R.message:"Network Error",U=new _(q,_.ERR_NETWORK,t,y);U.event=R||null,r(U),y=null},y.ontimeout=function(){let R=i.timeout?"timeout of "+i.timeout+"ms exceeded":"timeout exceeded";const q=i.transitional||Ks;i.timeoutErrorMessage&&(R=i.timeoutErrorMessage),r(new _(R,q.clarifyTimeoutError?_.ETIMEDOUT:_.ECONNABORTED,t,y)),y=null},o===void 0&&n.setContentType(null),"setRequestHeader"in y&&u.forEach(n.toJSON(),function(R,q){y.setRequestHeader(q,R)}),u.isUndefined(i.withCredentials)||(y.withCredentials=!!i.withCredentials),a&&a!=="json"&&(y.responseType=i.responseType),c&&([h,g]=wt(c,!0),y.addEventListener("progress",h)),l&&y.upload&&([p,v]=wt(l),y.upload.addEventListener("progress",p),y.upload.addEventListener("loadend",v)),(i.cancelToken||i.signal)&&(d=E=>{y&&(r(!E||E.type?new He(null,t,y):E),y.abort(),y=null)},i.cancelToken&&i.cancelToken.subscribe(d),i.signal&&(i.signal.aborted?d():i.signal.addEventListener("abort",d)));const F=Gi(i.url);if(F&&Q.protocols.indexOf(F)===-1){r(new _("Unsupported protocol "+F+":",_.ERR_BAD_REQUEST,t));return}y.send(o||null)})},Zi=(t,e)=>{const{length:s}=t=t?t.filter(Boolean):[];if(e||s){let r=new AbortController,i;const o=function(c){if(!i){i=!0,a();const d=c instanceof Error?c:this.reason;r.abort(d instanceof _?d:new He(d instanceof Error?d.message:d))}};let n=e&&setTimeout(()=>{n=null,o(new _(`timeout ${e} of ms exceeded`,_.ETIMEDOUT))},e);const a=()=>{t&&(n&&clearTimeout(n),n=null,t.forEach(c=>{c.unsubscribe?c.unsubscribe(o):c.removeEventListener("abort",o)}),t=null)};t.forEach(c=>c.addEventListener("abort",o));const{signal:l}=r;return l.unsubscribe=()=>u.asap(a),l}},eo=function*(t,e){let s=t.byteLength;if(s<e){yield t;return}let r=0,i;for(;r<s;)i=r+e,yield t.slice(r,i),r=i},to=async function*(t,e){for await(const s of so(t))yield*eo(s,e)},so=async function*(t){if(t[Symbol.asyncIterator]){yield*t;return}const e=t.getReader();try{for(;;){const{done:s,value:r}=await e.read();if(s)break;yield r}}finally{await e.cancel()}},ys=(t,e,s,r)=>{const i=to(t,e);let o=0,n,a=l=>{n||(n=!0,r&&r(l))};return new ReadableStream({async pull(l){try{const{done:c,value:d}=await i.next();if(c){a(),l.close();return}let p=d.byteLength;if(s){let h=o+=p;s(h)}l.enqueue(new Uint8Array(d))}catch(c){throw a(c),c}},cancel(l){return a(l),i.return()}},{highWaterMark:2})},vs=64*1024,{isFunction:ht}=u,ro=(({Request:t,Response:e})=>({Request:t,Response:e}))(u.global),{ReadableStream:ws,TextEncoder:$s}=u.global,Is=(t,...e)=>{try{return!!t(...e)}catch{return!1}},io=t=>{t=u.merge.call({skipUndefined:!0},ro,t);const{fetch:e,Request:s,Response:r}=t,i=e?ht(e):typeof fetch=="function",o=ht(s),n=ht(r);if(!i)return!1;const a=i&&ht(ws),l=i&&(typeof $s=="function"?(g=>w=>g.encode(w))(new $s):async g=>new Uint8Array(await new s(g).arrayBuffer())),c=o&&a&&Is(()=>{let g=!1;const w=new s(Q.origin,{body:new ws,method:"POST",get duplex(){return g=!0,"half"}}).headers.has("Content-Type");return g&&!w}),d=n&&a&&Is(()=>u.isReadableStream(new r("").body)),p={stream:d&&(g=>g.body)};i&&["text","arrayBuffer","blob","formData","stream"].forEach(g=>{!p[g]&&(p[g]=(w,y)=>{let A=w&&w[g];if(A)return A.call(w);throw new _(`Response type '${g}' is not supported`,_.ERR_NOT_SUPPORT,y)})});const h=async g=>{if(g==null)return 0;if(u.isBlob(g))return g.size;if(u.isSpecCompliantForm(g))return(await new s(Q.origin,{method:"POST",body:g}).arrayBuffer()).byteLength;if(u.isArrayBufferView(g)||u.isArrayBuffer(g))return g.byteLength;if(u.isURLSearchParams(g)&&(g=g+""),u.isString(g))return(await l(g)).byteLength},v=async(g,w)=>{const y=u.toFiniteNumber(g.getContentLength());return y??h(w)};return async g=>{let{url:w,method:y,data:A,signal:F,cancelToken:E,timeout:R,onDownloadProgress:q,onUploadProgress:U,responseType:z,headers:L,withCredentials:le="same-origin",fetchOptions:J}=er(g),f=e||fetch;z=z?(z+"").toLowerCase():"text";let x=Zi([F,E&&E.toAbortSignal()],R),I=null;const S=x&&x.unsubscribe&&(()=>{x.unsubscribe()});let B;try{if(U&&c&&y!=="get"&&y!=="head"&&(B=await v(L,A))!==0){let D=new s(w,{method:"POST",body:A,duplex:"half"}),k;if(u.isFormData(A)&&(k=D.headers.get("content-type"))&&L.setContentType(k),D.body){const[G,ie]=ms(B,wt(gs(U)));A=ys(D.body,vs,G,ie)}}u.isString(le)||(le=le?"include":"omit");const j=o&&"credentials"in s.prototype,je={...J,signal:x,method:y.toUpperCase(),headers:L.normalize().toJSON(),body:A,duplex:"half",credentials:j?le:void 0};I=o&&new s(w,je);let re=await(o?f(I,J):f(w,je));const pe=d&&(z==="stream"||z==="response");if(d&&(q||pe&&S)){const D={};["status","statusText","headers"].forEach(Je=>{D[Je]=re[Je]});const k=u.toFiniteNumber(re.headers.get("content-length")),[G,ie]=q&&ms(k,wt(gs(q),!0))||[];re=new r(ys(re.body,vs,G,()=>{ie&&ie(),S&&S()}),D)}z=z||"text";let C=await p[u.findKey(p,z)||"text"](re,g);return!pe&&S&&S(),await new Promise((D,k)=>{Ys(D,k,{data:C,headers:Z.from(re.headers),status:re.status,statusText:re.statusText,config:g,request:I})})}catch(j){throw S&&S(),j&&j.name==="TypeError"&&/Load failed|fetch/i.test(j.message)?Object.assign(new _("Network Error",_.ERR_NETWORK,g,I),{cause:j.cause||j}):_.from(j,j&&j.code,g,I)}}},oo=new Map,tr=t=>{let e=t&&t.env||{};const{fetch:s,Request:r,Response:i}=e,o=[r,i,s];let n=o.length,a=n,l,c,d=oo;for(;a--;)l=o[a],c=d.get(l),c===void 0&&d.set(l,c=a?new Map:io(e)),d=c;return c};tr();const Qt={http:Ii,xhr:Yi,fetch:{get:tr}};u.forEach(Qt,(t,e)=>{if(t){try{Object.defineProperty(t,"name",{value:e})}catch{}Object.defineProperty(t,"adapterName",{value:e})}});const Ss=t=>`- ${t}`,no=t=>u.isFunction(t)||t===null||t===!1;function ao(t,e){t=u.isArray(t)?t:[t];const{length:s}=t;let r,i;const o={};for(let n=0;n<s;n++){r=t[n];let a;if(i=r,!no(r)&&(i=Qt[(a=String(r)).toLowerCase()],i===void 0))throw new _(`Unknown adapter '${a}'`);if(i&&(u.isFunction(i)||(i=i.get(e))))break;o[a||"#"+n]=i}if(!i){const n=Object.entries(o).map(([l,c])=>`adapter ${l} `+(c===!1?"is not supported by the environment":"is not available in the build"));let a=s?n.length>1?`since :
`+n.map(Ss).join(`
`):" "+Ss(n[0]):"as no adapter specified";throw new _("There is no suitable adapter to dispatch the request "+a,"ERR_NOT_SUPPORT")}return i}const sr={getAdapter:ao,adapters:Qt};function Dt(t){if(t.cancelToken&&t.cancelToken.throwIfRequested(),t.signal&&t.signal.aborted)throw new He(null,t)}function _s(t){return Dt(t),t.headers=Z.from(t.headers),t.data=Ot.call(t,t.transformRequest),["post","put","patch"].indexOf(t.method)!==-1&&t.headers.setContentType("application/x-www-form-urlencoded",!1),sr.getAdapter(t.adapter||dt.adapter,t)(t).then(function(r){return Dt(t),r.data=Ot.call(t,t.transformResponse,r),r.headers=Z.from(r.headers),r},function(r){return Xs(r)||(Dt(t),r&&r.response&&(r.response.data=Ot.call(t,t.transformResponse,r.response),r.response.headers=Z.from(r.response.headers))),Promise.reject(r)})}const rr="1.13.2",kt={};["object","boolean","number","function","string","symbol"].forEach((t,e)=>{kt[t]=function(r){return typeof r===t||"a"+(e<1?"n ":" ")+t}});const xs={};kt.transitional=function(e,s,r){function i(o,n){return"[Axios v"+rr+"] Transitional option '"+o+"'"+n+(r?". "+r:"")}return(o,n,a)=>{if(e===!1)throw new _(i(n," has been removed"+(s?" in "+s:"")),_.ERR_DEPRECATED);return s&&!xs[n]&&(xs[n]=!0,console.warn(i(n," has been deprecated since v"+s+" and will be removed in the near future"))),e?e(o,n,a):!0}};kt.spelling=function(e){return(s,r)=>(console.warn(`${r} is likely a misspelling of ${e}`),!0)};function lo(t,e,s){if(typeof t!="object")throw new _("options must be an object",_.ERR_BAD_OPTION_VALUE);const r=Object.keys(t);let i=r.length;for(;i-- >0;){const o=r[i],n=e[o];if(n){const a=t[o],l=a===void 0||n(a,o,t);if(l!==!0)throw new _("option "+o+" must be "+l,_.ERR_BAD_OPTION_VALUE);continue}if(s!==!0)throw new _("Unknown option "+o,_.ERR_BAD_OPTION)}}const bt={assertOptions:lo,validators:kt},ue=bt.validators;let Ce=class{constructor(e){this.defaults=e||{},this.interceptors={request:new ps,response:new ps}}async request(e,s){try{return await this._request(e,s)}catch(r){if(r instanceof Error){let i={};Error.captureStackTrace?Error.captureStackTrace(i):i=new Error;const o=i.stack?i.stack.replace(/^.+\n/,""):"";try{r.stack?o&&!String(r.stack).endsWith(o.replace(/^.+\n.+\n/,""))&&(r.stack+=`
`+o):r.stack=o}catch{}}throw r}}_request(e,s){typeof e=="string"?(s=s||{},s.url=e):s=e||{},s=Te(this.defaults,s);const{transitional:r,paramsSerializer:i,headers:o}=s;r!==void 0&&bt.assertOptions(r,{silentJSONParsing:ue.transitional(ue.boolean),forcedJSONParsing:ue.transitional(ue.boolean),clarifyTimeoutError:ue.transitional(ue.boolean)},!1),i!=null&&(u.isFunction(i)?s.paramsSerializer={serialize:i}:bt.assertOptions(i,{encode:ue.function,serialize:ue.function},!0)),s.allowAbsoluteUrls!==void 0||(this.defaults.allowAbsoluteUrls!==void 0?s.allowAbsoluteUrls=this.defaults.allowAbsoluteUrls:s.allowAbsoluteUrls=!0),bt.assertOptions(s,{baseUrl:ue.spelling("baseURL"),withXsrfToken:ue.spelling("withXSRFToken")},!0),s.method=(s.method||this.defaults.method||"get").toLowerCase();let n=o&&u.merge(o.common,o[s.method]);o&&u.forEach(["delete","get","head","post","put","patch","common"],g=>{delete o[g]}),s.headers=Z.concat(n,o);const a=[];let l=!0;this.interceptors.request.forEach(function(w){typeof w.runWhen=="function"&&w.runWhen(s)===!1||(l=l&&w.synchronous,a.unshift(w.fulfilled,w.rejected))});const c=[];this.interceptors.response.forEach(function(w){c.push(w.fulfilled,w.rejected)});let d,p=0,h;if(!l){const g=[_s.bind(this),void 0];for(g.unshift(...a),g.push(...c),h=g.length,d=Promise.resolve(s);p<h;)d=d.then(g[p++],g[p++]);return d}h=a.length;let v=s;for(;p<h;){const g=a[p++],w=a[p++];try{v=g(v)}catch(y){w.call(this,y);break}}try{d=_s.call(this,v)}catch(g){return Promise.reject(g)}for(p=0,h=c.length;p<h;)d=d.then(c[p++],c[p++]);return d}getUri(e){e=Te(this.defaults,e);const s=Zs(e.baseURL,e.url,e.allowAbsoluteUrls);return Ws(s,e.params,e.paramsSerializer)}};u.forEach(["delete","get","head","options"],function(e){Ce.prototype[e]=function(s,r){return this.request(Te(r||{},{method:e,url:s,data:(r||{}).data}))}});u.forEach(["post","put","patch"],function(e){function s(r){return function(o,n,a){return this.request(Te(a||{},{method:e,headers:r?{"Content-Type":"multipart/form-data"}:{},url:o,data:n}))}}Ce.prototype[e]=s(),Ce.prototype[e+"Form"]=s(!0)});let co=class ir{constructor(e){if(typeof e!="function")throw new TypeError("executor must be a function.");let s;this.promise=new Promise(function(o){s=o});const r=this;this.promise.then(i=>{if(!r._listeners)return;let o=r._listeners.length;for(;o-- >0;)r._listeners[o](i);r._listeners=null}),this.promise.then=i=>{let o;const n=new Promise(a=>{r.subscribe(a),o=a}).then(i);return n.cancel=function(){r.unsubscribe(o)},n},e(function(o,n,a){r.reason||(r.reason=new He(o,n,a),s(r.reason))})}throwIfRequested(){if(this.reason)throw this.reason}subscribe(e){if(this.reason){e(this.reason);return}this._listeners?this._listeners.push(e):this._listeners=[e]}unsubscribe(e){if(!this._listeners)return;const s=this._listeners.indexOf(e);s!==-1&&this._listeners.splice(s,1)}toAbortSignal(){const e=new AbortController,s=r=>{e.abort(r)};return this.subscribe(s),e.signal.unsubscribe=()=>this.unsubscribe(s),e.signal}static source(){let e;return{token:new ir(function(i){e=i}),cancel:e}}};function uo(t){return function(s){return t.apply(null,s)}}function ho(t){return u.isObject(t)&&t.isAxiosError===!0}const Ft={Continue:100,SwitchingProtocols:101,Processing:102,EarlyHints:103,Ok:200,Created:201,Accepted:202,NonAuthoritativeInformation:203,NoContent:204,ResetContent:205,PartialContent:206,MultiStatus:207,AlreadyReported:208,ImUsed:226,MultipleChoices:300,MovedPermanently:301,Found:302,SeeOther:303,NotModified:304,UseProxy:305,Unused:306,TemporaryRedirect:307,PermanentRedirect:308,BadRequest:400,Unauthorized:401,PaymentRequired:402,Forbidden:403,NotFound:404,MethodNotAllowed:405,NotAcceptable:406,ProxyAuthenticationRequired:407,RequestTimeout:408,Conflict:409,Gone:410,LengthRequired:411,PreconditionFailed:412,PayloadTooLarge:413,UriTooLong:414,UnsupportedMediaType:415,RangeNotSatisfiable:416,ExpectationFailed:417,ImATeapot:418,MisdirectedRequest:421,UnprocessableEntity:422,Locked:423,FailedDependency:424,TooEarly:425,UpgradeRequired:426,PreconditionRequired:428,TooManyRequests:429,RequestHeaderFieldsTooLarge:431,UnavailableForLegalReasons:451,InternalServerError:500,NotImplemented:501,BadGateway:502,ServiceUnavailable:503,GatewayTimeout:504,HttpVersionNotSupported:505,VariantAlsoNegotiates:506,InsufficientStorage:507,LoopDetected:508,NotExtended:510,NetworkAuthenticationRequired:511,WebServerIsDown:521,ConnectionTimedOut:522,OriginIsUnreachable:523,TimeoutOccurred:524,SslHandshakeFailed:525,InvalidSslCertificate:526};Object.entries(Ft).forEach(([t,e])=>{Ft[e]=t});function or(t){const e=new Ce(t),s=Rs(Ce.prototype.request,e);return u.extend(s,Ce.prototype,e,{allOwnKeys:!0}),u.extend(s,e,null,{allOwnKeys:!0}),s.create=function(i){return or(Te(t,i))},s}const $=or(dt);$.Axios=Ce;$.CanceledError=He;$.CancelToken=co;$.isCancel=Xs;$.VERSION=rr;$.toFormData=Et;$.AxiosError=_;$.Cancel=$.CanceledError;$.all=function(e){return Promise.all(e)};$.spread=uo;$.isAxiosError=ho;$.mergeConfig=Te;$.AxiosHeaders=Z;$.formToJSON=t=>Qs(u.isHTMLForm(t)?new FormData(t):t);$.getAdapter=sr.getAdapter;$.HttpStatusCode=Ft;$.default=$;const{Axios:pn,AxiosError:fn,CanceledError:mn,isCancel:gn,CancelToken:bn,VERSION:yn,all:vn,Cancel:wn,isAxiosError:$n,spread:In,toFormData:Sn,AxiosHeaders:_n,HttpStatusCode:xn,formToJSON:En,getAdapter:kn,mergeConfig:An}=$;var po=Object.defineProperty,fo=Object.getOwnPropertyDescriptor,$e=(t,e,s,r)=>{for(var i=r>1?void 0:r?fo(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&po(e,s,i),i};let fe=class extends H{constructor(){super(...arguments),this.accordionData={title:"",data:[]},this.ariaHiddenAll=!1,this.allState="Open",this.type="",this.filename="",this.program="",this.loaded=!1}createRenderRoot(){return this}async init(){await this.getDataFile()}async getDataFile(){if(this.type==="local"){const t=await $.get(this.filename);this.accordionData=t.data,this.loaded=!0,this.requestUpdate()}else if(this.type==="program"){const t=await $.get("/shared/ugaonline/templates/"+this.program+"/data/"+this.filename);this.accordionData=t.data,this.loaded=!0,this.requestUpdate()}}render(){if(this.loaded){for(let t in this.accordionData.data)this.accordionData.data[t].id==null&&(this.accordionData.data[t].id=t,this.accordionData.data[t].ariaExpanded=!1,this.accordionData.data[t].ariaHidden=!0);return m`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <button class="cmp-button cmp-accordion-toggle-all js-toggle-all" aria-controls="${this.accordionData.title}" aria-hidden="${this.ariaHiddenAll}" @click="${this.allToggle}">${this.allState} All</button>
      <dl id="${this.accordionData.title}" class="cmp-accordion">
        ${this.accordionData.data.map(t=>m`
          <dt>
            <button id="${t.id}" class="cmp-accordion__button js-toggler" aria-expanded="${t.ariaExpanded}" @click="${()=>this.toggleItem(t)}">
              ${t.title}
              <span class="icon"></span>
            </button>
          </dt>
          <dd class="cmp-accordion__content" aria-labelledby="${t.id}" aria-hidden="${t.ariaHidden}">
            ${nt(t.body)}
          </dd>
          `)}
      </dl>
      `}else this.init()}allToggle(){if(this.ariaHiddenAll=!this.ariaHiddenAll,this.allState==="Open"){this.allState="Close";for(let t in this.accordionData.data)this.accordionData.data[t].ariaHidden=!1,this.accordionData.data[t].ariaExpanded=!0}else{this.allState="Open";for(let t in this.accordionData.data)this.accordionData.data[t].ariaHidden=!0,this.accordionData.data[t].ariaExpanded=!1}this.requestUpdate()}toggleItem(t){const e=this.accordionData.data.findIndex(s=>s.id==t.id);e!==-1&&(this.accordionData.data[e].ariaHidden=!t.ariaHidden,this.accordionData.data[e].ariaExpanded=!t.ariaExpanded,this.requestUpdate())}};$e([b({type:Object})],fe.prototype,"accordionData",2);$e([b({type:Boolean})],fe.prototype,"ariaHiddenAll",2);$e([b({type:String})],fe.prototype,"allState",2);$e([b({type:String})],fe.prototype,"type",2);$e([b({type:String})],fe.prototype,"filename",2);$e([b({type:String})],fe.prototype,"program",2);$e([b({type:Boolean})],fe.prototype,"loaded",2);fe=$e([ee("uga-accordion")],fe);class mo{constructor(){this.cache=new Map,this.inFlightRequests=new Map,this.DEFAULT_TTL=300*1e3,this.TTL_OVERRIDES={versions:1800*1e3,course:3600*1e3,enrollment:600*1e3,classlist:300*1e3,assignments:120*1e3,gradebook:120*1e3}}get(e){const s=this.cache.get(e);return s?Date.now()-s.timestamp>s.ttl?(this.cache.delete(e),null):s.data:null}set(e,s,r){const i=this.getCacheKey(e),o=r||this.getTTL(e);this.cache.set(i,{data:s,timestamp:Date.now(),ttl:o})}getInFlight(e){const s=this.inFlightRequests.get(e);return s?Date.now()-s.timestamp>3e4?(this.inFlightRequests.delete(e),null):s.promise:null}setInFlight(e,s){this.inFlightRequests.set(e,{promise:s,timestamp:Date.now()}),s.finally(()=>{this.inFlightRequests.delete(e)})}clear(e){this.cache.delete(this.getCacheKey(e))}clearAll(){this.cache.clear(),this.inFlightRequests.clear()}getCacheKey(e){return`api:${e}`}getTTL(e){const s=e.split(":")[0];return this.TTL_OVERRIDES[s]||this.DEFAULT_TTL}getStats(){return{cacheSize:this.cache.size,inFlightSize:this.inFlightRequests.size,keys:Array.from(this.cache.keys())}}}const pt=new mo;async function De(t,e,s){const r=pt.get(t);if(r!==null)return r;const i=pt.getInFlight(t);if(i)return i;const o=e();pt.setInFlight(t,o);try{const n=await o;return pt.set(t,n,s),n}catch(n){throw n}}async function W(t,e=3,s=1e3,r){for(let i=0;i<e;i++)try{return await t()}catch(o){if(o.name==="AbortError")throw new Error("Request aborted");const n=o.response?.status===429,a=o.response?.status>=500&&o.response?.status<600,l=i===e-1;if((n||a)&&!l){const c=s*Math.pow(2,i),d=o.response?.headers?.["retry-after"],p=d?parseInt(d)*1e3:c;n?console.warn(`⚠️ Rate limited (429). Retrying in ${p}ms (attempt ${i+1}/${e})...`):a&&console.warn(`⚠️ Server error (${o.response?.status}). Retrying in ${p}ms (attempt ${i+1}/${e})...`),await new Promise((h,v)=>{setTimeout(h,p)});continue}throw o}throw new Error("Max retries exceeded")}async function Pe(){return De("versions",async()=>{const t=await W(()=>$.get("/d2l/api/versions/")),e={},s={le:["1.91","1.82"],lp:["1.82","1.75"]};for(let r in t.data){const i=t.data[r].ProductCode,o=t.data[r].LatestVersion;if(s[i]){let n=o;for(const a of s[i])try{const l=await $.post("/d2l/api/versions/check",[{ProductCode:i,Version:a}]);if(l.data?.Supported===!0||l.data?.Versions?.[0]?.Supported===!0){n=a,console.log(`✅ Using API version ${a} for ${i} (reported: ${o})`);break}}catch{continue}e[i]=n}else e[i]=o}return e},1800*1e3)}function go(t,e){const s=parseFloat(t);return isNaN(s)?{isDeprecated:!1,isObsolete:!1,status:"current",message:`⚠️ Could not parse API version "${t}" for ${e}`}:s>=1.82?{isDeprecated:!1,isObsolete:!1,status:"current"}:s>=1.75?{isDeprecated:!0,isObsolete:!1,status:"deprecated",message:`⚠️ Using deprecated API version ${t} for ${e}. Consider upgrading to 1.82+ (deprecated as of LMS v20.26.1)`}:{isDeprecated:!0,isObsolete:!0,status:"obsolete",message:`⚠️ Using obsolete API version ${t} for ${e}. Please upgrade to 1.82+ (obsolete as of LMS v20.26.1)`}}function T(t,e){const s=go(t,e);s.message&&console.warn(s.message)}async function bo(t,e){const s=new URLSearchParams;e?.pageSize&&s.append("pageSize",e.pageSize.toString()),e?.bookmark&&s.append("bookmark",e.bookmark);for(const[c,d]of Object.entries(e||{}))c!=="pageSize"&&c!=="bookmark"&&d!==void 0&&d!==null&&s.append(c,String(d));const r=s.toString(),i=`${t}${r?"?"+r:""}`,n=(await W(()=>$.get(i))).data;let a=[],l=null;return Array.isArray(n)?a=n:n&&Array.isArray(n.Items)?(a=n.Items,l=n.Next||null):n&&Array.isArray(n.Objects)&&(a=n.Objects,l=n.Next||null),{items:a,nextBookmark:l}}async function nr(t,e){const s=[];let r=null;do{const i=await bo(t,{...e,bookmark:r});s.push(...i.items),r=i.nextBookmark}while(r);return s}async function rt(t,e){return T(e,"getClasslist"),De(`classlist:${t}`,async()=>(await W(()=>$.get(`/d2l/api/le/${e}/${t}/classlist/`))).data)}async function yo(t,e,s){T(e,"getClasslistPaged");const r=`classlist:${t}:paged:${JSON.stringify(s||{})}`;return De(r,async()=>nr(`/d2l/api/le/${e}/${t}/classlist/paged/`,s))}async function At(t,e,s){return T(e,"getEnrollment"),De(`enrollment:${t}`,async()=>{const i=(await W(()=>$.get(`/d2l/api/lp/${e}/enrollments/myenrollments/?orgUnitTypeId=3`))).data.Items||[];for(let n in i)if(i[n].OrgUnit.Id.toString()===t)return i[n];if(s?.fallbackToFirst&&i.length>0)return console.warn(`Enrollment not found for course ID ${t}, using first available enrollment: ${i[0].OrgUnit.Id}`),i[0];if(s?.throwOnNotFound===!1)return console.warn(`Enrollment not found for course ID ${t}. Available enrollments: ${i.map(n=>n.OrgUnit.Id).join(", ")||"none"}`),null;const o=i.map(n=>n.OrgUnit.Id).join(", ");throw new Error(`Enrollment not found for course ID ${t}. Available enrollments: ${o||"none"}`)})}async function Xt(t){return T(t,"getUser"),(await W(()=>$.get(`/d2l/api/lp/${t}/users/whoami`))).data}async function ar(t,e){return T(e,"getAssignments"),De(`assignments:${t}`,async()=>(await W(()=>$.get(`/d2l/api/le/${e}/${t}/dropbox/folders/`))).data)}async function lr(t,e){return T(e,"getMyItemsDue"),De(`myItemsDue:${t}`,async()=>(await W(()=>$.get(`/d2l/api/le/${e}/${t}/content/myItems/due/`))).data)}async function Yt(t,e){return T(e,"getForums"),(await W(()=>$.get(`/d2l/api/le/${e}/${t}/discussions/forums/`))).data}async function vo(t,e,s,r=""){const i={Name:s,Description:{Content:r,Type:"Text"}};return(await $.post(`/d2l/api/le/${e}/${t}/discussions/forums/`,i)).data}async function Zt(t,e,s){return T(e,"getTopics"),(await W(()=>$.get(`/d2l/api/le/${e}/${t}/discussions/forums/${s}/topics/`))).data}async function wo(t,e,s,r,i){T(e,"getPostsPaged");try{return await nr(`/d2l/api/le/${e}/${t}/discussions/forums/${s}/topics/${r}/posts/paged/`,i)}catch(o){if(o.response?.status===404)return(await W(()=>$.get(`/d2l/api/le/${e}/${t}/discussions/forums/${s}/topics/${r}/posts/`))).data;throw o}}async function $o(t,e,s,r,i=""){const o={Name:r,Description:{Content:i,Type:"Text"}};return(await $.post(`/d2l/api/le/${e}/${t}/discussions/forums/${s}/topics/`,o)).data}async function Io(t,e,s,r,i,o,n){T(e,"createPost");const a={ParentPostId:null,Subject:i,Message:{Content:o,Type:"Text"}};n?.isAnonymous!==void 0&&(a.IsAnonymous=n.isAnonymous);let l=n?.xsrfToken;l||(l=await Ct());const c={};return l&&(c["X-Csrf-Token"]=l),(await W(()=>$.post(`/d2l/api/le/${e}/${t}/discussions/forums/${s}/topics/${r}/posts/`,a,{headers:c}))).data}async function Ct(){return(await $.get("/d2l/lp/auth/xsrf-tokens")).data.referrerToken}async function Fe(t,e){return T(e,"getGradebook"),De(`gradebook:${t}`,async()=>{const r=(await W(()=>$.get(`/d2l/api/le/${e}/${t}/grades/`))).data;let i=[];Array.isArray(r)?i=r:r&&Array.isArray(r.Items)?i=r.Items:r&&Array.isArray(r.Objects)&&(i=r.Objects);const o=i.filter(n=>(!n.GradeObjectId&&n.Id&&(n.GradeObjectId=n.Id),n.GradeObjectId!==void 0&&n.GradeObjectId!==null));return o.length<i.length&&console.warn(`⚠️ Filtered out ${i.length-o.length} gradebook items missing GradeObjectId`),o})}async function qt(t,e,s,r){T(e,"getGradeValues");const i=[];let o=null;do{const n=new URLSearchParams;o&&n.append("bookmark",o);const a=n.toString(),l=`/d2l/api/le/${e}/${t}/grades/${s}/values/${a?"?"+a:""}`,d=(await W(()=>$.get(l))).data;let p=[];Array.isArray(d)?(p=d,o=null):d&&Array.isArray(d.Items)?(p=d.Items,o=d.Next||null):d&&Array.isArray(d.Objects)?(p=d.Objects,o=d.Next||null):o=null;for(const h of p){const v=h.User,g=h.GradeValue;if(!g)continue;let w=null;v&&(v.Identifier!==void 0&&v.Identifier!==null?w=v.Identifier:v.UserId!==void 0&&v.UserId!==null?w=v.UserId:v.Id!==void 0&&v.Id!==null&&(w=v.Id)),w===null&&g.UserId!==void 0&&g.UserId!==null&&(w=g.UserId);const y={...g,UserId:w!==null?w:g.UserId,OrgUnitId:g.OrgUnitId||t,GradeObjectId:g.GradeObjectId||g.GradeObjectIdentifier||s};i.push(y)}}while(o);return i}async function So(t,e,s){parseFloat(e)<1.85&&console.warn(`⚠️ Bulk grade values endpoint requires API version 1.85+, but using ${e}. Feature may not work correctly.`);const r=[];let i=null;do{const o=new URLSearchParams;s?.gradeObjectTypeId&&o.append("gradeObjectTypeId",s.gradeObjectTypeId.toString()),s?.modifiedSince&&o.append("modifiedSince",s.modifiedSince),s?.pageSize&&o.append("pageSize",s.pageSize.toString()),i&&o.append("bookmark",i);const n=o.toString(),a=`/d2l/api/le/${e}/${t}/grades/values/${n?"?"+n:""}`,c=(await W(()=>$.get(a))).data;let d=[];Array.isArray(c)?(d=c,i=null):c&&Array.isArray(c.Items)?(d=c.Items,i=c.Next||null):c&&Array.isArray(c.Objects)?(d=c.Objects,i=c.Next||null):i=null;for(const p of d){const h={...p,UserId:p.UserId!==void 0&&p.UserId!==null?p.UserId:null,OrgUnitId:p.OrgUnitId||t,GradeObjectId:p.GradeObjectId||p.GradeObjectIdentifier||null};r.push(h)}}while(i);return r}async function _o(t,e,s){T(e,"createGradeObject");const r=await Ct(),i={Name:s.Name,Type:s.Type,CategoryId:s.CategoryId??0};return s.ShortName&&(i.ShortName=s.ShortName),s.MaxPoints!==void 0&&(i.MaxPoints=s.MaxPoints),s.CanExceedMaxPoints!==void 0&&(i.CanExceedMaxPoints=s.CanExceedMaxPoints),s.IsBonus!==void 0&&(i.IsBonus=s.IsBonus),s.ExcludeFromFinalGrade!==void 0&&(i.ExcludeFromFinalGrade=s.ExcludeFromFinalGrade),s.GradeSchemeId!==void 0&&(i.GradeSchemeId=s.GradeSchemeId),s.Description&&(i.Description={Content:s.Description.Content,Type:s.Description.Type}),(await W(()=>$.post(`/d2l/api/le/${e}/${t}/grades/`,i,{headers:{"X-Csrf-Token":r}}))).data}async function Es(t,e,s,r,i){if(T(e,"updateGradeValue"),!t||!e||!s||!r||!i)throw new Error(`Invalid parameters for updateGradeValue: ou=${t}, leVersion=${e}, gradeObjectId=${s}, userId=${r}`);return W(async()=>{const n=await Ct();if(!n)throw new Error("Failed to get XSRF token");const a=`/d2l/api/le/${e}/${t}/grades/${s}/values/${r}`;return(await $.put(a,i,{headers:{"X-Csrf-Token":n}})).data},3,2e3)}async function xo(t,e,s,r){T(e,"getAssignmentSubmissions");const i=[];let o=null,n=[];try{n=await rt(t,e)}catch(l){console.warn("Could not fetch classlist for username lookup:",l)}const a=new Map;for(const l of n)if(l.UserId!==void 0&&l.Username)a.set(l.UserId,l.Username);else if(l.Identifier!==void 0&&l.Username){const c=typeof l.Identifier=="string"?Number(l.Identifier):l.Identifier;Number.isFinite(c)&&a.set(c,l.Username)}do{const l=new URLSearchParams;o&&l.append("bookmark",o);const c=l.toString(),d=`/d2l/api/le/${e}/${t}/dropbox/folders/${s}/submissions/paged/${c?"?"+c:""}`;let p;try{p=await W(()=>$.get(d))}catch(g){if(g.response?.status===404&&!o)p=await W(()=>$.get(`/d2l/api/le/${e}/${t}/dropbox/folders/${s}/submissions/`)),o=null;else throw g}const h=p.data;let v=[];Array.isArray(h)?(v=h,o=null):h&&Array.isArray(h.Items)?(v=h.Items,o=h.Next||null):h&&Array.isArray(h.Objects)?(v=h.Objects,o=h.Next||null):o=null;for(const g of v){const w=g.Entity,y=w?.EntityId,A=w?.EntityType,F=w?.DisplayName||w?.Name||"";if(!w||!y||A!=="User"&&A!=="Group")continue;if(A==="Group"){const J=g.Submissions||[],f=g.Feedback,x=f?.Score!==void 0&&f?.Score!==null?f.Score:void 0,I=f?.IsGraded||!1,S=f?.Feedback?.Text||f?.Feedback?.Html||void 0;for(const B of J){B.SubmittedBy;const j=B.Id,je=B.SubmissionDate||"",re=B.Files||[];i.push({SubmissionId:j,SubmissionNumber:B.SubmissionNumber||0,UserId:y,UserName:`GROUP:${y}`,DisplayName:F||`Group ${y}`,SubmittedDate:je,IsRetracted:B.IsRetracted||!1,Files:re.map(pe=>({FileId:pe.FileId,FileName:pe.FileName,FileSize:pe.Size||pe.FileSize||0})),TextSubmission:B.Comment?.Text||B.TextSubmission,FeedbackScore:x,IsGraded:I,FeedbackText:S,IsGroupSubmission:!0,GroupId:y})}continue}let E=null;if(typeof y=="string"){const J=Number(y);Number.isFinite(J)&&(E=J)}else typeof y=="number"&&Number.isFinite(y)&&(E=y);if(E===null)continue;const R=a.get(E)||"",q=g.Submissions||[],U=g.Feedback,z=U?.Score!==void 0&&U?.Score!==null?U.Score:void 0,L=U?.IsGraded||!1,le=U?.Feedback?.Text||U?.Feedback?.Html||void 0;for(const J of q){const f=J.SubmittedBy||{},x=J.Id,I=J.SubmissionDate||"",S=J.Files||[],B=R||(typeof f.Id=="string"?f.Id:"");i.push({SubmissionId:x,SubmissionNumber:J.SubmissionNumber||0,UserId:E,UserName:B,DisplayName:f.DisplayName||F,SubmittedDate:I,IsRetracted:J.IsRetracted||!1,Files:S.map(j=>({FileId:j.FileId,FileName:j.FileName,FileSize:j.Size||j.FileSize||0})),TextSubmission:J.Comment?.Text||J.TextSubmission,FeedbackScore:z,IsGraded:L,FeedbackText:le})}}}while(o);return i}function ve(){const t=window.location,e=t.href,s=new URLSearchParams(t.search);let r=null;if(s.has("ou")&&(r=s.get("ou"),r))return r;const i=t.hash;if(i){const a=new URLSearchParams(i.substring(1));if(a.has("ou")&&(r=a.get("ou"),r))return r}const o=e.split("/"),n=o[o.length-1];if(n.includes("?")){const[a,l]=n.split("?"),c=new URLSearchParams(l);if(c.has("ou")&&(r=c.get("ou"),r))return r}if(n.includes("&")){const a=n.split("&");for(const l of a)if(l.startsWith("ou=")&&(r=l.slice(3),r=r.split("?")[0].split("#")[0],r))return r}if(r===null&&o.length>5){const a=o.findIndex(l=>l==="content"||l==="home"||l==="course");if(a>=0&&o.length>a+1){const l=o[a+1];if(l){const c=l.split("-");if(c.length>0&&(r=c[0].split("?")[0].split("#")[0],r&&/^\d+$/.test(r)))return r}}}if(typeof window<"u"&&window.D2L?.LearnerExperience?.Context?.orgUnitId){const a=String(window.D2L.LearnerExperience.Context.orgUnitId);if(a)return a}return r}function Ze(t){const e=new Date(t),r=["January","February","March","April","May","June","July","August","September","October","November","December"][e.getMonth()],i=e.getDate(),o=e.getFullYear();let n=e.getHours();const a=e.getMinutes(),l=n>=12?"PM":"AM";n=n%12,n=n||12;const c=a<10?"0"+a:a;return`${r} ${i}, ${o} at ${n}:${c} ${l}`}const Eo=["assignment","discussion","quiz","content"],cr="assignment,discussion,quiz,content";function Ae(t){return t.TopicId||t.ForumId||t.ItemType==="Discussion"||t.ItemType==="DiscussionTopic"||typeof t.ItemType=="string"&&t.ItemType.toLowerCase().includes("discussion")?"discussion":t.ItemType==="Quiz"||t.ItemType==="Quizzing"||typeof t.ItemType=="string"&&t.ItemType.toLowerCase().includes("quiz")?"quiz":t.ItemType==="Content"||t.ItemType==="ContentObject"||typeof t.ItemType=="string"&&t.ItemType.toLowerCase().includes("content")?"content":"assignment"}function $t(t){return t?t.split(",").map(e=>e.trim().toLowerCase()):Eo}function Lt(t,e){const s=Ae(t);return e.includes(s)}function ko(t){const e=Ae(t);return e.charAt(0).toUpperCase()+e.slice(1)}function Ao(t,e){const s=new Map,r=((...i)=>{const o=e?e(...i):JSON.stringify(i);if(s.has(o))return s.get(o);const n=t(...i);return s.set(o,n),n});return r.clear=()=>s.clear(),r.cache=s,r}function Co(t,e,s={}){const{root:r=null,rootMargin:i="50px",threshold:o=.1,once:n=!0}=s,a=new IntersectionObserver(l=>{l.forEach(c=>{c.isIntersecting&&(e(),n&&a.disconnect())})},{root:r,rootMargin:i,threshold:o});return a.observe(t),()=>a.disconnect()}var No=Object.defineProperty,Uo=Object.getOwnPropertyDescriptor,de=(t,e,s,r)=>{for(var i=r>1?void 0:r?Uo(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&No(e,s,i),i};let oe=class extends H{constructor(){super(...arguments),this.versions={},this.domain=null,this.ou=null,this.assignments=[],this.studentRoles=["Student","Demo Student"],this.errorMessage=null,this.types=cr,this.enableExport=!1,this.exportInProgress=!1,this.exportResults=null,this.student=null,this.loaded=!1,this.abortController=null,this.lazyLoadCleanup=null,this.memoizedFilter=Ao((t,e)=>t.filter(s=>Lt(s,e)),(t,e)=>`${t.length}:${e.join(",")}`)}createRenderRoot(){return this}connectedCallback(){if(super.connectedCallback(),this.abortController=new AbortController,this.hasAttribute("enable-export")&&(this.enableExport=!0),this.ou=ve(),!this.ou){this.errorMessage="Unable to determine course ID from URL. Make sure you are viewing this in an eLC course page.",this.loaded=!0,this.requestUpdate();return}this.domain=window.location.hostname,Pe().then(t=>{this.addVersions(t),At(this.ou,this.versions.lp,{fallbackToFirst:!0,throwOnNotFound:!1}).then(e=>{e?this.checkStudent(e):(console.warn("Unable to determine enrollment, defaulting to instructor view"),this.student=!1)}).catch(e=>{console.warn("Unable to determine enrollment, defaulting to instructor view:",e.message),this.student=!1}).finally(()=>{lr(this.ou,this.versions.le).then(e=>{const s=e.map(i=>({Name:i.Name||i.Title||i.ItemName||"Untitled",Id:i.Id||i.ItemId||i.AssignmentId,TopicId:i.TopicId,ForumId:i.ForumId,ItemType:i.ItemType||i.ContentType,Instructions:i.Instructions||i.Description,CustomInstructions:i.Instructions||i.Description,DueDate:i.DueDate||i.EndDate||null,Availability:i.Availability||{StartDate:i.StartDate,EndDate:i.EndDate},DropboxType:i.DropboxType||i.Type||2,Assessment:i.Assessment})),r=$t(this.types);this.assignments=this.memoizedFilter(s,r),this.loaded=!0,this.requestUpdate()}).catch(e=>{console.warn("myItems/due endpoint unavailable, falling back to assignments and discussions:",e.message),Promise.all([ar(this.ou,this.versions.le).catch(()=>[]),Yt(this.ou,this.versions.le).then(s=>Promise.all(s.map(r=>Zt(this.ou,this.versions.le,r.ForumId).then(i=>i.map(o=>({...o,ForumId:r.ForumId}))).catch(()=>[]))).then(r=>r.flat())).catch(()=>[])]).then(([s,r])=>{const i=s.map(l=>({Name:l.Name,Id:l.Id,Instructions:l.Instructions,CustomInstructions:l.Instructions,DueDate:l.DueDate||null,Availability:{StartDate:l.StartDate,EndDate:l.EndDate},DropboxType:2,Assessment:void 0})),o=r.filter(l=>l.DueDate||l.EndDate||l.Availability?.EndDate).map(l=>({Name:l.Name,Id:l.TopicId,TopicId:l.TopicId,ForumId:l.ForumId,ItemType:"discussion",Instructions:l.Description,CustomInstructions:l.Description,DueDate:l.DueDate||l.EndDate||l.Availability?.EndDate||null,Availability:l.Availability||{StartDate:l.StartDate,EndDate:l.EndDate},DropboxType:void 0,Assessment:void 0})),n=[...i,...o],a=$t(this.types);this.assignments=this.memoizedFilter(n,a),this.loaded=!0,this.requestUpdate()}).catch(s=>{this.errorMessage=`Unable to load assignments and discussions: ${s.message}`,this.loaded=!0,this.requestUpdate()})})})}).catch(t=>{t.message==="Request aborted"||this.abortController?.signal.aborted||(this.errorMessage=`Unable to load API versions: ${t.message}`,this.loaded=!0,this.requestUpdate())})}disconnectedCallback(){super.disconnectedCallback(),this.abortController?.abort(),this.abortController=null,this.lazyLoadCleanup?.(),this.lazyLoadCleanup=null}enableLazyLoad(){this.lazyLoadCleanup||(this.lazyLoadCleanup=Co(this,()=>{!this.loaded&&this.ou&&this.connectedCallback()},{rootMargin:"100px",once:!0}))}addVersions(t){for(let e in t)this.versions[e]=t[e]}checkStudent(t){const e=t.Role?.Name;this.studentRoles.includes(e)?(this.student=!0,console.log("🔵 User identified as student, role:",e)):(this.student=!1,console.log("🟢 User identified as instructor, role:",e)),this.requestUpdate()}formatAssignmentType(t){const e=Ae(t);return e==="discussion"?"Discussion":e==="quiz"?"Quiz":e==="content"?"Content":t.DropboxType===1?"Group":t.DropboxType===2?"Individual":"Assignment"}getAssignmentLink(t){if(Ae(t)==="discussion"){const s=t.TopicId||t.Id;return!s||!this.domain||!this.ou?"#":`https://${this.domain}/d2l/lms/discussions/topic/${s}/view?ou=${this.ou}`}const e=t.Id;return!e||!this.domain||!this.ou?"#":this.student?`https://${this.domain}/d2l/lms/dropbox/user/folder_submit_files.d2l?db=${e}&ou=${this.ou}`:`https://${this.domain}/d2l/lms/dropbox/admin/mark/folder_submissions_users.d2l?db=${e}&ou=${this.ou}`}normalizeQuotes(t){return t.replace(/[''']/g,"'").replace(/[""]/g,'"').replace(/[''‚‛]/g,"'").replace(/["„‟]/g,'"')}csvEscape(t){if(t==null)return"";let e=String(t);return e=this.normalizeQuotes(e),/[",\n]/.test(e)?`"${e.replace(/"/g,'""')}"`:e}normalizeRole(t){return(t||"").toLowerCase().trim()}isLikelyStudent(t){const e=this.normalizeRole(t.ClasslistRoleDisplayName);return e.includes("instructor")||e.includes("teacher")||e.includes("admin")||e.includes("designer")||e.includes("ta")?!1:(e.includes("student")||e.includes("learner"),!0)}async exportGrades(t){if(!t.Id||!this.ou||!this.versions.le){console.error("❌ Missing required data:",{assignmentId:t.Id,ou:this.ou,leVersion:this.versions.le});return}this.exportInProgress=!0,this.exportResults=null,this.errorMessage=null,this.requestUpdate();try{const e=await Fe(this.ou,this.versions.le);console.log(`📚 Gradebook has ${e.length} grade objects`),console.log(`🔍 Looking for grade object matching: "${t.Name}"`);const s=e.find(f=>f.Name===t.Name)||e.find(f=>(f.Name||"").trim().toLowerCase()===(t.Name||"").trim().toLowerCase());if(!s){console.warn("❌ Grade object not found. Available grade objects:",e.map(f=>f.Name)),this.exportResults={success:0,failed:0,errors:[`Grade object "${t.Name}" not found in gradebook. Available: ${e.map(f=>f.Name).join(", ")}`]};return}const r=s.GradeObjectId||s.gradeObjectId||s.Id||s.id;if(!r){console.error("❌ Grade object found but has no GradeObjectId:",s),console.error("Available properties:",Object.keys(s)),this.exportResults={success:0,failed:0,errors:[`Grade object "${t.Name}" found but has no GradeObjectId. Available properties: ${Object.keys(s).join(", ")}`]};return}console.log(`✅ Found grade object: "${s.Name}" (ID: ${r})`);const o=(await rt(this.ou,this.versions.le)).filter(f=>this.isLikelyStudent(f));let n=[];try{n=await qt(this.ou,this.versions.le,r),console.log(`📊 Found ${n.length} grade values for "${t.Name}"`),n.length>0&&(console.log("Sample grade value structure:",n[0]),console.log("All grade value UserIds:",n.map(f=>({userId:f.UserId,userIdType:typeof f.UserId,pointsNumerator:f.PointsNumerator,pointsDenominator:f.PointsDenominator}))))}catch(f){console.warn("Unable to fetch grade values:",f?.message||f)}const a=new Map,l=new Map;for(const f of n){let x=null;if(f.UserId!==void 0&&f.UserId!==null)if(typeof f.UserId=="string"){const I=Number(f.UserId);Number.isFinite(I)&&(x=I)}else typeof f.UserId=="number"&&Number.isFinite(f.UserId)&&(x=f.UserId);x!==null?a.set(x,f):console.warn("⚠️ Grade value has invalid UserId:",f)}let c=[];try{c=await xo(this.ou,this.versions.le,t.Id),console.log(`📤 Found ${c.length} submissions for assignment "${t.Name}" (ID: ${t.Id})`),c.length>0&&console.log("All submissions:",c.map(f=>({userId:f.UserId,username:f.UserName,displayName:f.DisplayName,submittedDate:f.SubmittedDate,submissionNumber:f.SubmissionNumber})))}catch(f){console.warn("Unable to fetch assignment submissions:",f?.message||f)}const d=new Map,p=new Map;for(const f of c){let x=null;if(f.UserId!==void 0&&f.UserId!==null)if(typeof f.UserId=="string"){const I=Number(f.UserId);Number.isFinite(I)&&(x=I)}else typeof f.UserId=="number"&&Number.isFinite(f.UserId)&&(x=f.UserId);if(x!==null){const I=d.get(x);(!I||f.SubmissionNumber>I.SubmissionNumber)&&d.set(x,f)}else console.warn("⚠️ Submission has invalid UserId:",f);f.UserName&&p.set(f.UserName.toLowerCase(),f)}console.log(`👥 Processing ${o.length} students from classlist`),console.log("📋 Classlist UserIds:",o.map(f=>({name:f.DisplayName,username:f.Username,userId:f.UserId,identifier:f.Identifier}))),console.log("📤 Submission UserIds:",c.map(f=>({username:f.UserName,userId:f.UserId,displayName:f.DisplayName}))),console.log("📊 Grade UserIds:",n.map(f=>({userId:f.UserId,points:`${f.PointsNumerator}/${f.PointsDenominator}`})));const h=new Set(o.map(f=>f.UserId).filter(f=>f!=null)),v=new Set(c.map(f=>f.UserId)),g=new Set(n.map(f=>f.UserId)),w=Array.from(v).filter(f=>!h.has(f)),y=Array.from(g).filter(f=>!h.has(f));w.length>0&&(console.warn(`⚠️ Found ${w.length} submission(s) from users not in classlist:`,w),console.warn("   These submissions:",c.filter(f=>w.includes(f.UserId)))),y.length>0&&(console.warn(`⚠️ Found ${y.length} grade(s) for users not in classlist:`,y),console.warn("   These grades:",n.filter(f=>y.includes(f.UserId))));const A=o.filter(f=>!f.UserId&&!f.Identifier);A.length>0&&console.warn(`⚠️ Found ${A.length} students without UserId or Identifier:`,A.map(f=>f.DisplayName||f.Username));const F=s.MaxPoints??s.maxPoints??"",E=["Display Name","Username","User ID","Role","Submitted","Submitted Date","Points Earned","Points Possible","Comments"],R=o.map(f=>{let x=null;if(f.UserId!==void 0&&f.UserId!==null)x=Number(f.UserId),Number.isFinite(x)||(x=null);else if(f.Identifier!==void 0&&f.Identifier!==null){const C=Number(f.Identifier);Number.isFinite(C)&&(x=C)}let I=x!==null?a.get(x):void 0,S=x!==null?d.get(x):void 0;if(f.Username){const C=f.Username.toLowerCase();if(!S&&p.has(C)&&(S=p.get(C),S)){let D=null;if(typeof S.UserId=="string"){const k=Number(S.UserId);Number.isFinite(k)&&(D=k)}else typeof S.UserId=="number"&&Number.isFinite(S.UserId)&&(D=S.UserId);D&&(!x||D!==x)?(x=D,I=a.get(x)):D&&!I&&(I=a.get(D))}if(!S){const D=c.filter(k=>{if(!k.UserName)return!1;const G=k.UserName.toLowerCase();return G===C||G.includes(C)||C.includes(G)});if(D.length>0&&(S=D.reduce((k,G)=>(G.SubmissionNumber||0)>(k.SubmissionNumber||0)?G:k),S&&!I)){let k=null;if(typeof S.UserId=="string"){const G=Number(S.UserId);Number.isFinite(G)&&(k=G)}else typeof S.UserId=="number"&&Number.isFinite(S.UserId)&&(k=S.UserId);k!==null&&(I=a.get(k),(!x||k!==x)&&(x=k))}}if(I&&!S){const D=c.filter(k=>k.UserName?k.UserName.toLowerCase()===C:!1);if(D.length>0&&(S=D.reduce((k,G)=>(G.SubmissionNumber||0)>(k.SubmissionNumber||0)?G:k)),!S&&f.DisplayName){const k=f.DisplayName.toLowerCase(),G=c.filter(ie=>ie.DisplayName?ie.DisplayName.toLowerCase()===k||ie.DisplayName.toLowerCase().includes(k)||k.includes(ie.DisplayName.toLowerCase()):!1);G.length>0&&(S=G.reduce((ie,Je)=>(Je.SubmissionNumber||0)>(ie.SubmissionNumber||0)?Je:ie))}}if(!I&&S){let D=null;if(typeof S.UserId=="string"){const k=Number(S.UserId);Number.isFinite(k)&&(D=k)}else typeof S.UserId=="number"&&Number.isFinite(S.UserId)&&(D=S.UserId);D!==null&&(I=a.get(D))}}(f.Username==="cs78865"||f.DisplayName&&f.DisplayName.includes("Sparks"))&&console.log(`🔍 Debug for ${f.DisplayName||f.Username}:`,{classlistUserId:f.UserId,classlistIdentifier:f.Identifier,classlistUsername:f.Username,resolvedUserId:x,hasGrade:!!I,hasSubmission:!!S,gradeValue:I?`${I.PointsNumerator}/${I.PointsDenominator}`:"none",submissionDate:S?.SubmittedDate||"none",submissionUserId:S?.UserId,submissionUsername:S?.UserName,allSubmissionsForUser:c.filter(C=>C.UserId===x||f.Username&&C.UserName&&C.UserName.toLowerCase()===f.Username.toLowerCase()).map(C=>({userId:C.UserId,username:C.UserName,submittedDate:C.SubmittedDate,submissionNumber:C.SubmissionNumber})),allGradesForUser:n.filter(C=>C.UserId===x).map(C=>({userId:C.UserId,points:`${C.PointsNumerator}/${C.PointsDenominator}`}))});let B="",j="";if(I){if(I.PointsNumerator!==null&&I.PointsNumerator!==void 0){const C=typeof I.PointsNumerator=="string"?Number(I.PointsNumerator):I.PointsNumerator;B=Number.isFinite(C)?C:""}if(I.PointsDenominator!==null&&I.PointsDenominator!==void 0){const C=typeof I.PointsDenominator=="string"?Number(I.PointsDenominator):I.PointsDenominator;j=Number.isFinite(C)?C:""}}let je="";typeof B=="number"&&typeof j=="number"&&j>0&&(je=Math.round(B/j*1e4)/100);const re=S!==void 0||I!==void 0&&(B!==""||j!==""),pe=S?.SubmittedDate||"";return[this.csvEscape(f.DisplayName||""),this.csvEscape(f.Username||""),this.csvEscape(x!==null?x:""),this.csvEscape(f.ClasslistRoleDisplayName||""),this.csvEscape(re?"Yes":"No"),this.csvEscape(pe),this.csvEscape(B),this.csvEscape(j),this.csvEscape(I?.Comments?.Content||"")].join(",")}),q=[E.join(","),...R].join(`
`),U="\uFEFF",z=new Blob([U+q],{type:"text/csv;charset=utf-8;"}),L=document.createElement("a"),le=URL.createObjectURL(z),J=t.Name.replace(/[^\w\- ]+/g,"").trim().replace(/\s+/g,"-").slice(0,80)||"assignment";L.setAttribute("href",le),L.setAttribute("download",`${J}-grades-${new Date().toISOString().split("T")[0]}.csv`),L.style.visibility="hidden",document.body.appendChild(L),L.click(),document.body.removeChild(L),URL.revokeObjectURL(le),this.exportResults={success:o.length,failed:0,errors:[]}}catch(e){console.error("❌ Error exporting grades:",e);const s=e.message||"Unknown error occurred during export";this.errorMessage=`Export failed: ${s}`,this.exportResults={success:0,failed:1,errors:[s]}}finally{this.exportInProgress=!1,this.requestUpdate()}}async exportAllAssignments(){if(!this.ou||!this.versions.le){console.error("❌ Missing required data for export");return}try{let t=0;try{t=(await rt(this.ou,this.versions.le)).filter(v=>(v.ClasslistRoleDisplayName||"").toLowerCase().includes("student")||v.RoleId===195).length}catch(h){console.warn("Could not fetch classlist for total student count:",h)}const e=[],s=await Fe(this.ou,this.versions.le);let r=[];try{r=await So(this.ou,this.versions.le,{pageSize:200}),console.log(`📊 Fetched ${r.length} grade values in bulk for all assignments`)}catch(h){console.warn("Could not fetch bulk grade values, falling back to per-assignment fetching:",h)}const i=new Map;for(const h of r){const v=h.GradeObjectId;if(v!=null){const g=typeof v=="string"?Number(v):v;Number.isFinite(g)&&(i.has(g)||i.set(g,[]),i.get(g).push(h))}}for(const h of this.assignments){if(!(Ae(h)==="assignment"))continue;const g=h.DueDate?Ze(h.DueDate):"No Due Date",w=this.formatAssignmentType(h),y=s.find(E=>E.Name===h.Name)||s.find(E=>(E.Name||"").trim().toLowerCase()===(h.Name||"").trim().toLowerCase());let A=0,F=null;if(y)try{const E=y.GradeObjectId||y.gradeObjectId||y.Id||y.id;let R=[];if(E&&i.has(E)?R=i.get(E):E&&r.length===0&&(R=await qt(this.ou,this.versions.le,E)),A=R.length,R.length>0){const q=[];for(const U of R)if(U.PointsNumerator!==null&&U.PointsNumerator!==void 0&&U.PointsDenominator!==null&&U.PointsDenominator!==void 0){const z=typeof U.PointsNumerator=="string"?Number(U.PointsNumerator):U.PointsNumerator,L=typeof U.PointsDenominator=="string"?Number(U.PointsDenominator):U.PointsDenominator;if(Number.isFinite(z)&&Number.isFinite(L)&&L>0){const le=z/L*100;q.push(le)}}if(q.length>0){const U=q.reduce((z,L)=>z+L,0);F=Math.round(U/q.length*100)/100}}}catch{}e.push({assignmentName:h.Name,dueDate:g,type:w,gradeObjectId:y?.GradeObjectId||y?.gradeObjectId||y?.Id||y?.id,gradeObjectName:y?.Name,maxPoints:y?.MaxPoints,studentCount:A,classAverage:F!==null?F:void 0})}const o=["Assignment Name","Due Date","Type","Grade Object ID","Max Points","Students Graded","Total Students","Class Average (%)"],n=e.map(h=>[`"${h.assignmentName}"`,`"${h.dueDate}"`,`"${h.type}"`,h.gradeObjectId?.toString()||"",h.maxPoints?.toString()||"",h.studentCount?.toString()||"0",t.toString(),h.classAverage!==void 0?h.classAverage.toFixed(2):""]),a=[o.join(","),...n.map(h=>h.join(","))].join(`
`),l="\uFEFF",c=new Blob([l+a],{type:"text/csv;charset=utf-8;"}),d=document.createElement("a"),p=URL.createObjectURL(c);d.setAttribute("href",p),d.setAttribute("download",`assignments-export-${new Date().toISOString().split("T")[0]}.csv`),d.style.visibility="hidden",document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(p),console.log("✅ Exported assignments to CSV")}catch(t){console.error("❌ Error exporting assignments:",t),this.errorMessage=`Export failed: ${t.message}`,this.requestUpdate()}}render(){return this.loaded?this.assignments.length===0?m`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__12-12">
            <p>No assignments found in this course.</p>
          </div>
        </div>
      `:m`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="util-margin-top-md">
        ${this.errorMessage?m`
          <div class="util-pad-all-md util-margin-bottom-md util-background-light-gray" style="border-left: 4px solid #ba0c2f;">
            <p><strong>${this.errorMessage}</strong></p>
          </div>
        `:""}
        ${this.exportResults?m`
          <div class="util-pad-all-md util-margin-bottom-md" style="background-color: ${this.exportResults.failed===0?"#d4edda":"#f8d7da"}; border-left: 4px solid ${this.exportResults.failed===0?"#28a745":"#dc3545"};">
            <p><strong>Export Results:</strong> ${this.exportResults.success} successful, ${this.exportResults.failed} failed</p>
            ${this.exportResults.errors.length>0?m`
              <ul style="margin-top: 0.5rem;">
                ${this.exportResults.errors.map(t=>m`<li>${t}</li>`)}
              </ul>
            `:""}
          </div>
        `:""}
        
        ${(this.student===!1||this.student===null)&&this.enableExport?m`
          <div style="margin-bottom: 1rem; text-align: right;">
            <button 
              class="cmp-button cmp-button--primary"
              @click=${()=>this.exportAllAssignments()}
              style="margin-left: 0.5rem;"
            >
              Export All Assignments (CSV)
            </button>
          </div>
        `:""}
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ba0c2f;">
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Assignment</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Type</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Due Date</th>
              ${(this.student===!1||this.student===null)&&this.enableExport?m`
                <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Actions</th>
              `:""}
            </tr>
          </thead>
          <tbody>
            ${this.assignments.map(t=>{const e=t.DueDate?Ze(t.DueDate):"No Due Date",s=this.formatAssignmentType(t),r=this.getAssignmentLink(t),i=Ae(t)==="assignment";return m`
                <tr style="border-bottom: 1px solid #e0e0e0;">
                  <td style="padding: 0.75rem;">
                    <a href="${r}" target="_blank" style="color: #ba0c2f; text-decoration: none;">
                      ${t.Name}
                    </a>
                  </td>
                  <td style="padding: 0.75rem;">${s}</td>
                  <td style="padding: 0.75rem;">${e}</td>
                  ${(this.student===!1||this.student===null)&&this.enableExport&&i?m`
                    <td style="padding: 0.75rem;">
                      <button 
                        class="cmp-button cmp-button--primary"
                        @click=${()=>this.exportGrades(t)}
                        ?disabled=${this.exportInProgress}
                      >
                        ${this.exportInProgress?"Exporting...":"Export Grades"}
                      </button>
                    </td>
                  `:(this.student===!1||this.student===null)&&this.enableExport?m`
                    <td style="padding: 0.75rem;">—</td>
                  `:""}
                </tr>
              `})}
          </tbody>
        </table>
      </div>
    `:m`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__12-12">
            <p>Loading assignments...</p>
          </div>
        </div>
      `}};de([b({type:Object})],oe.prototype,"versions",2);de([b({type:String})],oe.prototype,"domain",2);de([b({type:String})],oe.prototype,"ou",2);de([b({type:Array})],oe.prototype,"assignments",2);de([b({type:Array})],oe.prototype,"studentRoles",2);de([b({type:String})],oe.prototype,"errorMessage",2);de([b({type:String})],oe.prototype,"types",2);de([b({type:Boolean})],oe.prototype,"enableExport",2);de([P()],oe.prototype,"exportInProgress",2);de([P()],oe.prototype,"exportResults",2);oe=de([ee("uga-assignment")],oe);async function Me(t,e,s){let r;if(t==="local")r=e;else if(t==="program"){if(!s)throw new Error('Program identifier is required when type is "program"');r=`/shared/ugaonline/templates/${s}/data/${e}`}else throw new Error(`Invalid type: ${t}. Must be 'local' or 'program'`);return(await $.get(r)).data}var To=Object.defineProperty,Oo=Object.getOwnPropertyDescriptor,ut=(t,e,s,r)=>{for(var i=r>1?void 0:r?Oo(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&To(e,s,i),i};let Be=class extends H{constructor(){super(),this.type="",this.filename="",this.program="",this.loaded=!1,this.circles=[]}createRenderRoot(){return this}async init(){await this.getDataFile()}async getDataFile(){if(this.type==="local"||this.type==="program"){const t=await Me(this.type,this.filename,this.program);this.circles=t.data,this.loaded=!0,this.requestUpdate()}}getWideGridClass(t){switch(t){case 1:return"obj-grid__12-12";case 2:return"obj-grid__6-12";case 3:return"obj-grid__4-12";case 4:return"obj-grid__3-12";default:return"obj-grid__12-12"}}getNarrowGridClass(t){switch(t){case 1:return"obj-grid__12-12";case 2:return"obj-grid__6-12";case 3:return"obj-grid__6-12";case 4:return"obj-grid__6-12";default:return"obj-grid__12-12"}}render(){if(this.loaded){const t=this.getWideGridClass(this.circles.length),e=this.getNarrowGridClass(this.circles.length);return m`
			  <div class="obj-grid obj-grid--gap-lg">
				${this.circles.map(s=>m`
				  <div class="${e} ${t}@md util-align-center">
					<div class="circle-info">
					  <span class="circle-info__number">${s.figure}</span>
					  <span class="circle-info__label">${s.caption}</span>
					</div>
				  </div>
				`)}
			  </div>
			`}else this.init()}};ut([b({type:String})],Be.prototype,"type",2);ut([b({type:String})],Be.prototype,"filename",2);ut([b({type:String})],Be.prototype,"program",2);ut([b({type:Boolean})],Be.prototype,"loaded",2);Be=ut([ee("uga-circles")],Be);var Do=Object.defineProperty,Po=Object.getOwnPropertyDescriptor,Nt=(t,e,s,r)=>{for(var i=r>1?void 0:r?Po(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&Do(e,s,i),i};let it=class extends H{constructor(){super(...arguments),this.filename="",this.language="",this.code=""}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),!this.code&&this.textContent&&(this.code=this.textContent.trim(),this.textContent="")}updated(t){t.has("filename")&&this.fetchCode(),(t.has("code")||t.has("language"))&&this.updateComplete.then(()=>{this.runExternalScripts()})}fetchCode(){this.filename&&fetch(this.filename).then(t=>t.text()).then(t=>{this.code=t.trim()}).catch(t=>console.error("Error fetching code:",t))}copyCode(){const e=this.querySelector("code")?.textContent||"";navigator.clipboard.writeText(e).then(()=>{const s=this.querySelector("button");s&&(s.innerHTML=Ro,setTimeout(()=>{s.innerHTML=ks},2e3))}).catch(s=>{console.error("Failed to copy text: ",s)})}runExternalScripts(){Prism.highlightAllUnder(this)}render(){return m`
      <div class="cmp-code">
		<div class="cmp-code__container util-color-light-gray">
			<div class="obj-grid">
				<div class="obj-grid__12-12 util-background-sanford util-color-white util-pad-horiz-lg util-pad-vert-xs">
					<span class="util-margin-bottom-none util-margin-top-xs cmp-code__language-name">${this.language.charAt(0).toUpperCase()+this.language.slice(1)}</span>
					<button class="util-background-sanford util-color-light-gray util-pad-vert-xs util-pad-horiz-sm" @click="${this.copyCode}">
					${ks}
					</button>
            	</div>
            	<div class="obj-grid__12-12 util-pad-left-lg util-pad-vert-md">
              		<pre><code class="language-${this.language}">${this.code}</code></pre>
            	</div>
          	</div>
        </div>
      </div>
    `}};Nt([b({type:String})],it.prototype,"filename",2);Nt([b({type:String})],it.prototype,"language",2);Nt([b({type:String})],it.prototype,"code",2);it=Nt([ee("uga-code")],it);const ks=m`
  <svg class="util-margin-right-xs" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-sm">
    <path fill="currentColor" fill-rule="evenodd" d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" clip-rule="evenodd"></path>
  </svg>
  Copy Code
`,Ro=m`
  <svg class="util-margin-right-xs" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="icon-sm">
    <path fill="currentColor" fill-rule="evenodd" d="M20.285 6.288a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L11 14.586l8.293-8.292a1 1 0 0 1 1.414 0z" clip-rule="evenodd"></path>
  </svg>
  Copied
`;var jo=Object.defineProperty,zo=Object.getOwnPropertyDescriptor,Ie=(t,e,s,r)=>{for(var i=r>1?void 0:r?zo(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&jo(e,s,i),i};let me=class extends H{constructor(){super(...arguments),this.versions={},this.domain=null,this.ou=null,this.assignments=[],this.studentRoles=["Student","Demo Student"],this.errorMessage=null,this.types=cr,this.student=null,this.loaded=!1,this.abortController=null}createRenderRoot(){return this}connectedCallback(){if(super.connectedCallback(),this.abortController=new AbortController,this.ou=ve(),!this.ou){this.errorMessage="Unable to determine course ID from URL. Make sure you are viewing this in an eLC course page.",this.loaded=!0,this.requestUpdate();return}this.domain=window.location.hostname,Pe().then(t=>{this.addVersions(t),this.versions.le&&(T(this.versions.le,"getMyItemsDue"),T(this.versions.le,"getAssignments"),T(this.versions.le,"getForums")),this.versions.lp&&T(this.versions.lp,"getEnrollment"),At(this.ou,this.versions.lp,{fallbackToFirst:!0,throwOnNotFound:!1}).then(e=>{e?this.checkStudent(e):(console.warn("Unable to determine enrollment, defaulting to instructor view"),this.student=!1)}).catch(e=>{console.warn("Unable to determine enrollment, defaulting to instructor view:",e.message),this.student=!1}).finally(()=>{lr(this.ou,this.versions.le).then(e=>{const s=e.filter(i=>i.DueDate||i.EndDate).map(i=>({Name:i.Name||i.Title||i.ItemName||"Untitled",Id:i.Id||i.AssignmentId||i.ItemId,DueDate:Ze(i.DueDate||i.EndDate),TopicId:i.TopicId,ForumId:i.ForumId,ItemType:i.ItemType||i.ContentType})),r=$t(this.types);this.assignments=s.filter(i=>Lt(i,r)),this.loaded=!0,this.requestUpdate()}).catch(e=>{console.warn("myItems/due endpoint unavailable, falling back to assignments and discussions:",e.message),Promise.all([ar(this.ou,this.versions.le).catch(()=>[]),Yt(this.ou,this.versions.le).then(s=>Promise.all(s.map(r=>Zt(this.ou,this.versions.le,r.ForumId).then(i=>i.map(o=>({...o,ForumId:r.ForumId}))).catch(()=>[]))).then(r=>r.flat())).catch(()=>[])]).then(([s,r])=>{const i=s.filter(l=>l.DueDate).map(l=>({Name:l.Name,Id:l.Id,DueDate:Ze(l.DueDate),ItemType:"assignment"})),o=r.filter(l=>l.DueDate||l.EndDate||l.Availability?.EndDate).map(l=>({Name:l.Name,DueDate:Ze(l.DueDate||l.EndDate||l.Availability?.EndDate),TopicId:l.TopicId,ForumId:l.ForumId,ItemType:"discussion"})),n=[...i,...o],a=$t(this.types);this.assignments=n.filter(l=>Lt(l,a)),this.loaded=!0,this.requestUpdate()}).catch(s=>{this.errorMessage=`Unable to load assignments and discussions: ${s.message}`,this.loaded=!0,this.requestUpdate()})})})}).catch(t=>{t.message==="Request aborted"||this.abortController?.signal.aborted||(this.errorMessage=`Unable to load API versions: ${t.message}`,this.loaded=!0,this.requestUpdate())})}disconnectedCallback(){super.disconnectedCallback(),this.abortController?.abort(),this.abortController=null}addVersions(t){for(let e in t)this.versions[e]=t[e]}checkStudent(t){this.student=this.studentRoles.includes(t.Role.Name)}getAssignmentLink(t){if(Ae(t)==="discussion"){const s=t.TopicId||t.Id;return!s||!this.domain||!this.ou?"#":`https://${this.domain}/d2l/lms/discussions/topic/${s}/view?ou=${this.ou}`}const e=t.Id;return!e||!this.domain||!this.ou?"#":this.student?`https://${this.domain}/d2l/lms/dropbox/user/folder_submit_files.d2l?db=${e}&ou=${this.ou}`:`https://${this.domain}/d2l/lms/dropbox/admin/mark/folder_submissions_users.d2l?db=${e}&ou=${this.ou}`}render(){return this.errorMessage?m`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="util-pad-all-md util-background-light-gray" style="border-left: 4px solid #ba0c2f;">
          <p><strong>${this.errorMessage}</strong></p>
        </div>
      `:this.loaded?this.assignments.length===0?m`<span>No assignments with due dates found in this course.</span>`:m`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="util-margin-top-md">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ba0c2f;">
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Assignment</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Type</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: bold; color: #000000;">Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${this.assignments.map(t=>{const e=this.getAssignmentLink(t);return m`
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 0.75rem;">
                  <a href="${e}" target="_blank" style="color: #ba0c2f; text-decoration: none;">
                    ${t.Name}
                  </a>
                </td>
                <td style="padding: 0.75rem;">${ko(t)}</td>
                <td style="padding: 0.75rem;">${t.DueDate||"No Due Date"}</td>
              </tr>
            `})}
          </tbody>
        </table>
      </div>
    `:m`<span>Loading due dates...</span>`}};Ie([b({type:Object})],me.prototype,"versions",2);Ie([b({type:String})],me.prototype,"domain",2);Ie([b({type:String})],me.prototype,"ou",2);Ie([b({type:Array})],me.prototype,"assignments",2);Ie([b({type:Array})],me.prototype,"studentRoles",2);Ie([b({type:String})],me.prototype,"errorMessage",2);Ie([b({type:String})],me.prototype,"types",2);me=Ie([ee("uga-duedate")],me);var Fo=Object.defineProperty,Se=(t,e,s,r)=>{for(var i=void 0,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=n(e,s,i)||i);return i&&Fo(e,s,i),i};class ge extends H{constructor(){super(...arguments),this.filename="",this.imagefile="",this.program="",this.loaded=!1,this.cacheBust=!1,this.footerData=null,this.loadError=null,this.loading=!1}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.loaded||this.init()}updated(e){super.updated?.(e);const s=e.get("filename"),r=e.get("program"),i=e.has("filename")&&s!==void 0,o=e.has("program")&&r!==void 0;(i||o)&&(this.loaded=!1,this.footerData=null,this.loadError=null,this.init())}async init(){await this.getDataFile()}async getDataFile(){this.loading=!0,this.loadError=null;try{let e;if(this.program){const r="footer.json";console.log("[uga-footer] Loading JSON from program:",this.program),e=await Me("program",r,this.program),console.log("[uga-footer] JSON loaded successfully:",e)}else{if(!this.filename){this.loadError='Missing filename. Use filename="footer-demo.json" (or your JSON file).',this.loaded=!0,this.loading=!1,this.requestUpdate();return}const r=this.cacheBust?`${this.filename}?t=${Date.now()}`:this.filename;console.log("[uga-footer] Loading JSON from:",r),e=await Me("local",r),console.log("[uga-footer] JSON loaded successfully:",e)}const s=e.data||e;s.link&&s.alt&&!s.logo?this.footerData={logo:{link:s.link,alt:s.alt,...s.imageSrc&&{imageSrc:s.imageSrc},...s.imageSrcSet&&{imageSrcSet:s.imageSrcSet},...s.verticalImageSrc&&{verticalImageSrc:s.verticalImageSrc}}}:this.footerData=s,this.loaded=!0}catch(e){const s=e?.response?.status===404?`File not found: ${this.filename}. Upload it to the same folder as this page, or use the full path (e.g. /content/enforced/COURSE_ID/.../footer-demo-copy.json).`:e?.message||"Failed to load footer data";this.loadError=s,console.error("Failed to load footer data:",e),console.error("Filename:",this.filename),this.loaded=!0}finally{this.loading=!1,this.requestUpdate()}}getSocialIconSVG(e){return{facebook:`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-facebook" viewBox="0 0 32 32">
        <title>Facebook</title>
        <path fill="currentColor" d="M19 6h5v-6h-5c-3.86 0-7 3.14-7 7v3h-4v6h4v16h6v-16h5l1-6h-6v-3c0-0.542 0.458-1 1-1z"></path>
      </svg>`,twitter:`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-twitter" viewBox="0 0 32 32">
        <title>Twitter</title>
        <path fill="currentColor" d="M32 7.075c-1.175 0.525-2.444 0.875-3.769 1.031 1.356-0.813 2.394-2.1 2.887-3.631-1.269 0.75-2.675 1.3-4.169 1.594-1.2-1.275-2.906-2.069-4.794-2.069-3.625 0-6.563 2.938-6.563 6.563 0 0.512 0.056 1.012 0.169 1.494-5.456-0.275-10.294-2.888-13.531-6.862-0.563 0.969-0.887 2.1-0.887 3.3 0 2.275 1.156 4.287 2.919 5.463-1.075-0.031-2.087-0.331-2.975-0.819 0 0.025 0 0.056 0 0.081 0 3.181 2.263 5.838 5.269 6.437-0.55 0.15-1.131 0.231-1.731 0.231-0.425 0-0.831-0.044-1.237-0.119 0.838 2.606 3.263 4.506 6.131 4.563-2.25 1.762-5.075 2.813-8.156 2.813-0.531 0-1.050-0.031-1.569-0.094 2.913 1.869 6.362 2.95 10.069 2.95 12.075 0 18.681-10.006 18.681-18.681 0-0.287-0.006-0.569-0.019-0.85 1.281-0.919 2.394-2.075 3.275-3.394z" />
      </svg>`,instagram:`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-instagram" viewBox="0 0 32 32">
        <title>Instagram</title>
        <path fill="currentColor" d="M16 2.881c4.275 0 4.781 0.019 6.462 0.094 1.563 0.069 2.406 0.331 2.969 0.55 0.744 0.288 1.281 0.638 1.837 1.194 0.563 0.563 0.906 1.094 1.2 1.838 0.219 0.563 0.481 1.412 0.55 2.969 0.075 1.688 0.094 2.194 0.094 6.463s-0.019 4.781-0.094 6.463c-0.069 1.563-0.331 2.406-0.55 2.969-0.288 0.744-0.637 1.281-1.194 1.837-0.563 0.563-1.094 0.906-1.837 1.2-0.563 0.219-1.413 0.481-2.969 0.55-1.688 0.075-2.194 0.094-6.463 0.094s-4.781-0.019-6.463-0.094c-1.563-0.069-2.406-0.331-2.969-0.55-0.744-0.288-1.281-0.637-1.838-1.194-0.563-0.563-0.906-1.094-1.2-1.837-0.219-0.563-0.481-1.413-0.55-2.969-0.075-1.688-0.094-2.194-0.094-6.463s0.019-4.781 0.094-6.463c0.069-1.563 0.331-2.406 0.55-2.969 0.288-0.744 0.638-1.281 1.194-1.838 0.563-0.563 1.094-0.906 1.838-1.2 0.563-0.219 1.412-0.481 2.969-0.55 1.681-0.075 2.188-0.094 6.463-0.094zM16 0c-4.344 0-4.887 0.019-6.594 0.094-1.7 0.075-2.869 0.35-3.881 0.744-1.056 0.412-1.95 0.956-2.837 1.85-0.894 0.888-1.438 1.781-1.85 2.831-0.394 1.019-0.669 2.181-0.744 3.881-0.075 1.713-0.094 2.256-0.094 6.6s0.019 4.887 0.094 6.594c0.075 1.7 0.35 2.869 0.744 3.881 0.413 1.056 0.956 1.95 1.85 2.837 0.887 0.887 1.781 1.438 2.831 1.844 1.019 0.394 2.181 0.669 3.881 0.744 1.706 0.075 2.25 0.094 6.594 0.094s4.888-0.019 6.594-0.094c1.7-0.075 2.869-0.35 3.881-0.744 1.050-0.406 1.944-0.956 2.831-1.844s1.438-1.781 1.844-2.831c0.394-1.019 0.669-2.181 0.744-3.881 0.075-1.706 0.094-2.25 0.094-6.594s-0.019-4.887-0.094-6.594c-0.075-1.7-0.35-2.869-0.744-3.881-0.394-1.063-0.938-1.956-1.831-2.844-0.887-0.887-1.781-1.438-2.831-1.844-1.019-0.394-2.181-0.669-3.881-0.744-1.712-0.081-2.256-0.1-6.6-0.1v0z M16 7.781c-4.537 0-8.219 3.681-8.219 8.219s3.681 8.219 8.219 8.219 8.219-3.681 8.219-8.219c0-4.537-3.681-8.219-8.219-8.219zM16 21.331c-2.944 0-5.331-2.387-5.331-5.331s2.387-5.331 5.331-5.331c2.944 0 5.331 2.387 5.331 5.331s-2.387 5.331-5.331 5.331z M26.462 7.456c0 1.060-0.859 1.919-1.919 1.919s-1.919-0.859-1.919-1.919c0-1.060 0.859-1.919 1.919-1.919s1.919 0.859 1.919 1.919z" />
      </svg>`,snapchat:`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-snapchat" viewBox="0 0 512 512">
        <title>Snapchat</title>
        <path fill="currentColor" d="M496.9 366.6c-3.373-9.176-9.8-14.09-17.11-18.15a42.714 42.714 0 0 0-3.72-1.947c-2.182-1.128-4.414-2.22-6.634-3.373-22.8-12.09-40.61-27.34-52.96-45.42a102.9 102.9 0 0 1-9.089-16.12c-1.054-3.013-1-4.724-.248-6.287a10.22 10.22 0 0 1 2.914-3.038c3.918-2.591 7.96-5.22 10.7-6.993 4.885-3.162 8.754-5.667 11.25-7.44 9.362-6.547 15.91-13.5 20-21.28a42.37 42.37 0 0 0 2.1-35.19c-6.2-16.32-21.61-26.45-40.29-26.45a55.54 55.54 0 0 0-11.72 1.24 79.072 79.072 0 0 0-3.063.72c.174-11.16-.074-22.94-1.066-34.53-3.522-40.76-17.79-62.12-32.67-79.16A130.2 130.2 0 0 0 332.1 36.44C309.5 23.55 283.9 17 256 17s-53.4 6.55-76 19.44a129.7 129.7 0 0 0-33.28 26.78c-14.88 17.04-29.15 38.44-32.67 79.16-.992 11.59-1.24 23.43-1.079 34.53-1-.26-2.021-.5-3.051-.719a55.46 55.46 0 0 0-11.72-1.24c-18.69 0-34.13 10.13-40.3 26.45a42.42 42.42 0 0 0 2.046 35.23c4.105 7.774 10.65 14.73 20.01 21.28 2.48 1.736 6.361 4.24 11.25 7.44 2.641 1.711 6.5 4.216 10.28 6.72a11.05 11.05 0 0 1 3.3 3.311c.794 1.624.818 3.373-.36 6.6a102 102 0 0 1-8.94 15.78c-12.08 17.67-29.36 32.65-51.43 44.64C32.35 348.6 20.2 352.8 15.07 366.7c-3.868 10.53-1.339 22.51 8.494 32.6a49.14 49.14 0 0 0 12.4 9.387 134.3 134.3 0 0 0 30.34 12.14 20.02 20.02 0 0 1 6.126 2.741c3.583 3.137 3.075 7.861 7.849 14.78a34.47 34.47 0 0 0 8.977 9.127c10.02 6.919 21.28 7.353 33.21 7.811 10.78.41 22.99.881 36.94 5.481 5.778 1.91 11.78 5.605 18.74 9.92C194.8 480.1 217.7 495 255.1 495s61.29-14.12 78.12-24.43c6.907-4.24 12.87-7.9 18.49-9.758 13.95-4.613 26.16-5.072 36.94-5.481 11.93-.459 23.19-.893 33.21-7.812a34.58 34.58 0 0 0 10.22-11.16c3.434-5.84 3.348-9.919 6.572-12.77a18.97 18.97 0 0 1 5.753-2.629A134.9 134.9 0 0 0 476 408.7a48.34 48.34 0 0 0 13.02-10.19l.124-.149C498.4 388.5 500.7 376.9 496.9 366.6zm-34.01 18.28c-20.75 11.46-34.53 10.23-45.26 17.14-9.114 5.865-3.72 18.51-10.34 23.08-8.134 5.617-32.18-.4-63.24 9.858-25.62 8.469-41.96 32.82-88.04 32.82s-62.04-24.3-88.08-32.88c-31-10.26-55.09-4.241-63.24-9.858-6.609-4.563-1.24-17.21-10.34-23.08-10.74-6.907-24.53-5.679-45.26-17.08-13.21-7.291-5.716-11.8-1.314-13.94 75.14-36.38 87.13-92.55 87.67-96.72.645-5.046 1.364-9.014-4.191-14.15-5.369-4.96-29.19-19.7-35.8-24.32-10.94-7.638-15.75-15.26-12.2-24.64 2.48-6.485 8.531-8.928 14.88-8.928a27.64 27.64 0 0 1 5.965.67c12 2.6 23.66 8.617 30.39 10.24a10.75 10.75 0 0 0 2.48.335c3.6 0 4.86-1.811 4.612-5.927-.768-13.13-2.628-38.72-.558-62.64 2.84-32.91 13.44-49.22 26.04-63.64 6.051-6.932 34.48-36.98 88.86-36.98s82.88 29.92 88.93 36.83c12.61 14.42 23.23 30.73 26.04 63.64 2.071 23.92.285 49.53-.558 62.64-.285 4.327 1.017 5.927 4.613 5.927a10.65 10.65 0 0 0 2.48-.335c6.745-1.624 18.4-7.638 30.4-10.24a27.64 27.64 0 0 1 5.964-.67c6.386 0 12.4 2.48 14.88 8.928 3.546 9.374-1.24 17-12.19 24.64-6.609 4.612-30.43 19.34-35.8 24.32-5.568 5.134-4.836 9.1-4.191 14.15.533 4.228 12.51 60.4 87.67 96.72C468.6 373 476.1 377.5 462.9 384.9z"/>
      </svg>`,youtube:`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-youtube" viewBox="0 0 32 32">
        <title>YouTube</title>
        <path fill="currentColor" d="M31.681 9.6c0 0-0.313-2.206-1.275-3.175-1.219-1.275-2.581-1.281-3.206-1.356-4.475-0.325-11.194-0.325-11.194-0.325h-0.012c0 0-6.719 0-11.194 0.325-0.625 0.075-1.987 0.081-3.206 1.356-0.963 0.969-1.269 3.175-1.269 3.175s-0.319 2.588-0.319 5.181v2.425c0 2.587 0.319 5.181 0.319 5.181s0.313 2.206 1.269 3.175c1.219 1.275 2.819 1.231 3.531 1.369 2.563 0.244 10.881 0.319 10.881 0.319s6.725-0.012 11.2-0.331c0.625-0.075 1.988-0.081 3.206-1.356 0.962-0.969 1.275-3.175 1.275-3.175s0.319-2.587 0.319-5.181v-2.425c-0.006-2.588-0.325-5.181-0.325-5.181zM12.694 20.15v-8.994l8.644 4.513-8.644 4.481z" />
      </svg>`,linkedin:`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon-linkedin" viewBox="0 0 32 32">
        <title>LinkedIn</title>
        <path fill="currentColor" d="M12 12h5.535v2.837h0.079c0.77-1.381 2.655-2.837 5.464-2.837 5.842 0 6.922 3.637 6.922 8.367v9.633h-5.769v-8.54c0-2.037-0.042-4.657-3.001-4.657-3.005 0-3.463 2.218-3.463 4.509v8.688h-5.767v-18z M2 12h6v18h-6v-18z M8 7c0 1.657-1.343 3-3 3s-3-1.343-3-3c0-1.657 1.343-3 3-3s3 1.343 3 3z" />
      </svg>`}[e.toLowerCase()]||""}render(){if(this.loading)return m`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css">
        <div class="cmp-site-footer" style="padding: 1rem; text-align: center;">
          <p>Loading footer...</p>
        </div>
      `;if(!this.loaded)return m``;if(this.loaded&&!this.footerData&&this.loadError)return m`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css">
        <div class="cmp-site-footer" style="padding: 1rem; background: #fff3cd; border: 2px solid #ffc107; border-radius: 4px; margin: 1rem 0;">
          <p style="margin: 0; color: #856404; font-weight: bold;"><strong>uga-footer Error:</strong> ${this.loadError}</p>
          <p style="margin: 0.5rem 0 0 0; color: #856404; font-size: 0.9em;">This component does NOT use design-system footer data. It only loads from your JSON file.</p>
        </div>
      `;if(!this.footerData)return m`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css">
        <div class="cmp-site-footer" style="padding: 1rem; background: #fff3cd; border: 2px solid #ffc107; border-radius: 4px; margin: 1rem 0;">
          <p style="margin: 0; color: #856404; font-weight: bold;"><strong>uga-footer Error:</strong> No footer data loaded.</p>
          <p style="margin: 0.5rem 0 0 0; color: #856404; font-size: 0.9em;">Check the browser console for details. This component does NOT use design-system footer data.</p>
        </div>
      `;const{logo:e,navigation:s,copyright:r,social:i}=this.footerData;let o="",n="",a="";return e&&(this.program&&this.imagefile?o=`/shared/ugaonline/templates/${this.program}/img/${this.imagefile}`:e.imageSrc?o=e.imageSrc:this.imagefile&&(o=this.imagefile),n=e.imageSrcSet||"",a=e.verticalImageSrc||""),m`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css">
      <footer class="cmp-site-footer">
        <div class="cmp-site-footer__container">
          ${e?m`
            <div class="cmp-site-footer__logo">
              <a href="${e.link}" ${e.link.startsWith("http")?'target="_blank" rel="noopener noreferrer"':""}>
                ${n||a?m`
                  <picture>
                    ${n?m`
                      <source srcset="${n}" media="(min-width: 50rem)">
                    `:""}
                    <img class="cmp-site-footer__logo-img" 
                         src="${a||o}" 
                         alt="${e.alt||"University of Georgia"}">
                  </picture>
                `:o?m`
                  <img class="cmp-site-footer__logo-img" 
                       src="${o}" 
                       alt="${e.alt||"University of Georgia"}">
                `:""}
              </a>
            </div>
          `:""}

          ${s&&s.length>0?m`
            <div class="cmp-site-footer__navigation">
              <nav>
                <ul class="cmp-site-footer__navigation-list">
                  ${s.map(l=>m`
                    <li class="cmp-site-footer__navigation-list-item">
                      <a href="${l.url}" class="cmp-site-footer__navigation-link" ${l.url.startsWith("http")?'target="_blank" rel="noopener noreferrer"':""}>${l.text}</a>
                    </li>
                  `)}
                </ul>
              </nav>
            </div>
          `:""}

          ${r?m`
            <div class="cmp-site-footer__copyright">
              <p class="cmp-site-footer__copyright-info">
                ${r.text}
                ${r.phone?m`
                  <br>
                  ${r.phone}
                `:""}
              </p>
            </div>
          `:""}

          ${i&&i.links&&i.links.length>0?m`
            <div class="cmp-site-footer__social">
              <nav class="cmp-site-footer__social-nav">
                ${i.label?m`
                  <span class="cmp-site-footer__social-label">${i.label}</span>
                `:""}
                ${i.links.map(l=>m`
                  <a class="cmp-site-footer__social-link" 
                     href="${l.url}" 
                     ${l.url.startsWith("http")?'target="_blank" rel="noopener noreferrer"':""}
                     aria-label="${l.name}">
                    ${l.icon?nt(this.getSocialIconSVG(l.icon)):l.name}
                  </a>
                `)}
              </nav>
            </div>
          `:""}
        </div>
      </footer>
    `}}Se([b({type:String})],ge.prototype,"filename");Se([b({type:String})],ge.prototype,"imagefile");Se([b({type:String})],ge.prototype,"program");Se([b({type:Boolean})],ge.prototype,"loaded");Se([b({type:Boolean,attribute:"cache-bust"})],ge.prototype,"cacheBust");Se([P()],ge.prototype,"footerData");Se([P()],ge.prototype,"loadError");Se([P()],ge.prototype,"loading");customElements.get("uga-footer")||customElements.define("uga-footer",ge);var qo=Object.defineProperty,Lo=Object.getOwnPropertyDescriptor,Re=(t,e,s,r)=>{for(var i=r>1?void 0:r?Lo(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&qo(e,s,i),i};let we=class extends H{constructor(){super(...arguments),this.versions={},this.ou=null,this._instructor=null,this._loading=!1,this._error="",this._instructors=[],this.abortController=null}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.abortController=new AbortController,this._bootstrap()}disconnectedCallback(){super.disconnectedCallback(),this.abortController?.abort(),this.abortController=null}render(){if(this._error)return m`<div class="error">${this._error}</div>`;if(this._loading)return m`<div class="loading">Loading instructor…</div>`;if(!this._instructor)return m`<div class="loading">No instructor found.</div>`;const t=this._instructor,e=encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>
        <rect width='100%' height='100%' fill='#e5e7eb'/>
        <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
              font-family='system-ui,sans-serif' font-size='44' fill='#374151'>
          ${(t.name||"?").split(/\s+/).map(s=>s[0]).filter(Boolean).slice(0,2).join("").toUpperCase()}
        </text>
      </svg>
    `);return m`
      <div class="obj-flex">
        <figure
          class="obj-flex-item__sm util-align-center util-text-center util-pad-all-md util-margin-all-none util-background-white"
          style="border-radius:4px; box-shadow:0 10px 25px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.08);"
        >
          <img
            class="util-margin-bottom-md"
            loading="lazy"
            decoding="async"
            src=${t.imageSrc||`data:image/svg+xml,${e}`}
            alt=${`Instructor profile image for ${t.name}`}
            @error=${s=>this._fallbackMonogram(s,t.name)}
          />
          <span>${t.name}</span>
        </figure>
      </div>
    `}async _bootstrap(){this._loading=!0,this._error="",this._instructor=null;try{if(await this._getVersions(),this.ou=ve(),!this.ou)throw new Error("Unable to determine OrgUnitId.");const t=await this._fetchClasslist(this.ou),e=this._pickInstructorsFromClasslist(t);if(e.length===0)throw new Error("No instructor found.");const s=e[0];this._instructors=e;const r=await this._resolveImageSrc(s.userId);this._instructor={name:s.name,imageSrc:r},console.log("✅ Instructor loaded:",this._instructor)}catch(t){if(t.message==="Request aborted"||this.abortController?.signal.aborted)return;console.error("InstructorCard error:",t),this._error=t.message||"Failed to load instructor."}finally{this.abortController?.signal.aborted||(this._loading=!1)}}async _getVersions(){const t=await Pe();this.versions=t,t.le&&T(t.le,"uga-instructor-card"),t.lp&&T(t.lp,"uga-instructor-card")}async _fetchClasslist(t){if(!this.versions.le)throw new Error("API versions not loaded");T(this.versions.le,"getClasslist");try{return await yo(t,this.versions.le,{pageSize:200})}catch(e){if(e.response?.status===404)return console.warn("Paged classlist endpoint not available, falling back to non-paged"),await rt(t,this.versions.le);throw e}}_pickInstructorsFromClasslist(t=[]){const e=r=>String(r??"").toLowerCase();let s=t.filter(r=>e(r.ClasslistRoleDisplayName).includes("banner instructor"));return s.length===0&&(s=t.filter(r=>e(r.ClasslistRoleDisplayName).includes("instructor"))),s.map(r=>({userId:Number(r.Identifier||r.UserId||0),name:r.DisplayName||`${r.FirstName||""} ${r.LastName||""}`.trim()||"Unknown"}))}async _resolveImageSrc(t){if(!t||!this.versions.lp)return"";try{const e=`/d2l/api/lp/${this.versions.lp}/profile/user/${t}/image`,s=await $.get(e,{responseType:"blob"});if(s?.data&&s.headers["content-type"]?.startsWith("image/"))return URL.createObjectURL(s.data)}catch(e){console.warn("No profile image available",e)}return""}_fallbackMonogram(t,e){const s=t.currentTarget;if(!s)return;const r=(e||"?").split(/\s+/).map(i=>i[0]).slice(0,2).join("").toUpperCase();s.src=`data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='112' height='112'>
        <rect width='100%' height='100%' fill='#e5e7eb'/>
        <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
              font-family='system-ui' font-size='44' fill='#374151'>${r}</text>
      </svg>
    `)}`}};Re([b({type:Object})],we.prototype,"versions",2);Re([b({type:String})],we.prototype,"ou",2);Re([P()],we.prototype,"_instructor",2);Re([P()],we.prototype,"_loading",2);Re([P()],we.prototype,"_error",2);Re([P()],we.prototype,"_instructors",2);we=Re([ee("uga-instructor-card")],we);var Mo=Object.defineProperty,Bo=Object.getOwnPropertyDescriptor,ae=(t,e,s,r)=>{for(var i=r>1?void 0:r?Bo(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&Mo(e,s,i),i};let se=class extends H{constructor(){super(),this.versions={},this.currentUser={},this.ou="",this.enrollment="Student",this.excludedRoles=["Student","Demo Student"],this.type="",this.filename="",this.program="",this.text="",this.loading=!0,this.errorMessage=null,this.abortController=null}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.abortController=new AbortController,this.init()}disconnectedCallback(){super.disconnectedCallback(),this.abortController?.abort(),this.abortController=null}async init(){this.loading=!0,this.errorMessage=null;try{const t=await Pe();for(let e in t)this.versions[e]=t[e];if(this.versions.lp&&(T(this.versions.lp,"getUser"),T(this.versions.lp,"getEnrollment")),this.currentUser=await Xt(this.versions.lp),this.ou=ve()||"",this.ou)try{const e=await At(this.ou,this.versions.lp,{fallbackToFirst:!0,throwOnNotFound:!1});e?this.enrollment=e.Role?.Name||"Student":(console.warn(`Could not find enrollment for course ${this.ou}, defaulting to show instructor note`),this.enrollment="Instructor")}catch(e){console.warn("Enrollment lookup failed, defaulting to show instructor note:",e.message),this.enrollment="Instructor"}else console.warn("No course ID found, defaulting to show instructor note"),this.enrollment="Instructor";this.filename!==""&&this.type&&(this.text=await Me(this.type,this.filename,this.program))}catch(t){if(t.message==="Request aborted"||this.abortController?.signal.aborted)return;console.error("Failed to initialize instructor note:",t),this.errorMessage=t.message||"Failed to load instructor note"}finally{this.abortController?.signal.aborted||(this.loading=!1,this.requestUpdate())}}isInstructorRole(t){const e=t.Role?.Name||"",s=t.Role?.Id,r=[170,171,172,173];return!this.excludedRoles.includes(e)||s!==void 0&&r.includes(s)}render(){return this.loading?m`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__full util-pad-all-md">
            <p>Loading instructor note...</p>
          </div>
        </div>
      `:this.errorMessage?m`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="obj-grid">
          <div class="obj-grid__full util-background-light-gray util-pad-all-md" style="border-left: 4px solid #ba0c2f;">
            <p><strong>Error:</strong> ${this.errorMessage}</p>
          </div>
        </div>
      `:this.excludedRoles.includes(this.enrollment)?m``:m`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="obj-grid">
        <div class="obj-grid__full util-background-odyssey util-text-center util-pad-all-md">
          <h1 class="cmp-heading-5">Instructor Note</h1>
          <p>${nt(this.text)}</p>
        </div>
      </div>
      `}};ae([b({type:Object})],se.prototype,"versions",2);ae([b({type:Object})],se.prototype,"currentUser",2);ae([b({type:String})],se.prototype,"ou",2);ae([b({type:String})],se.prototype,"enrollment",2);ae([b({type:Array})],se.prototype,"excludedRoles",2);ae([b({type:String})],se.prototype,"type",2);ae([b({type:String})],se.prototype,"filename",2);ae([b({type:String})],se.prototype,"program",2);ae([b({type:String})],se.prototype,"text",2);ae([P()],se.prototype,"loading",2);ae([P()],se.prototype,"errorMessage",2);se=ae([ee("uga-instructor-note")],se);function Go(t){const e=[],s=t.split(`
`);for(const r of s){if(!r.trim()||r.trim().startsWith("//"))continue;const i=[];let o="",n=!1;for(let a=0;a<r.length;a++){const l=r[a];l==='"'?n&&r[a+1]==='"'?(o+='"',a++):n=!n:l===","&&!n?(i.push(o.trim()),o=""):o+=l}for(i.push(o.trim());i.length<5;)i.push("");e.push({col0:i[0]||"",col1:i[1]||"",col2:i[2]||"",col3:i[3]||"",col4:i[4]||""})}return e}function Ho(t){switch(t){case"MC":return xe.MULTIPLE_CHOICE;case"TF":return xe.TRUE_FALSE;case"M":return xe.MATCHING;case"SA":case"WR":return xe.SHORT_ANSWER;default:return xe.MULTIPLE_CHOICE}}function As(t){if(!t.type||!t.questionText)return null;const e=Ho(t.type),s=t.id||`q${Date.now()}`,r=t.points||1;let i,o,n=t.feedback||"";switch(t.type){case"MC":if(!t.options||t.options.length===0)return null;o=t.options.map(p=>p.text);let l=0,c=-1;for(let p=0;p<t.options.length;p++){if(t.options[p].weight>=100){l=p;break}t.options[p].weight>c&&(c=t.options[p].weight,l=p)}i=l,t.options[l]?.feedback&&(n=t.options[l].feedback+(n?" "+n:""));break;case"TF":t.trueFeedback!==void 0&&t.trueFeedback!==null?(i=!0,typeof t.trueFeedback=="string"&&t.trueFeedback&&(n=t.trueFeedback+(n?" "+n:""))):t.falseFeedback!==void 0&&t.falseFeedback!==null?(i=!1,typeof t.falseFeedback=="string"&&t.falseFeedback&&(n=t.falseFeedback+(n?" "+n:""))):i=!0;break;case"M":if(!t.choices||!t.matches)return null;o=t.matches.map(p=>p.text);const d={};for(const p of t.choices){const h=t.matches.find(v=>v.id===p.id);h&&(d[p.text]=h.text)}i=d;break;case"SA":case"WR":if(t.answerKey)i=t.answerKey;else if(t.answers&&t.answers.length>0)i=(t.answers.find(h=>h.weight>=100)||t.answers[0]).text;else return null;break;default:return null}const a={id:s,type:e,question:t.questionText,points:r,correctAnswer:i,explanation:n||void 0};return o&&(a.options=o),e===xe.SHORT_ANSWER&&(a.caseSensitive=!1),a}function Vo(t){const e=Go(t),s=[];let r=null;for(const i of e){const o=i.col0.trim(),n=i.col1.trim(),a=i.col2.trim(),l=i.col3.trim(),c=i.col4.trim();if(o==="NewQuestion"&&n){if(r){const d=As(r);d&&s.push(d)}r={type:n};continue}if(r)switch(o){case"ID":r.id=n;break;case"Title":r.title=n;break;case"QuestionText":r.questionText=n;break;case"Points":r.points=parseInt(n)||1;break;case"Difficulty":r.difficulty=parseInt(n)||1;break;case"Image":r.image=n;break;case"Hint":r.hint=n;break;case"Feedback":r.feedback=n;break;case"InitialText":r.initialText=n;break;case"AnswerKey":r.answerKey=n;break;case"InputBox":r.inputBox={count:parseInt(n)||1,width:parseInt(a)||40};break;case"Scoring":r.scoring=n;break;case"Option":r.options||(r.options=[]);const d=parseInt(n)||0,p=a,h=c;r.options.push({text:p,weight:d,feedback:h||void 0});break;case"Answer":r.answers||(r.answers=[]);const v=parseInt(n)||0,g=a,w=l==="regexp";r.answers.push({text:g,weight:v,regexp:w});break;case"Choice":r.choices||(r.choices=[]);const y=parseInt(n)||r.choices.length+1,A=a;r.choices.push({id:y,text:A});break;case"Match":r.matches||(r.matches=[]);const F=parseInt(n)||r.matches.length+1,E=a;r.matches.push({id:F,text:E});break;case"TRUE":(parseInt(n)||0)===100&&(r.trueFeedback=a||"");break;case"FALSE":(parseInt(n)||0)===100&&(r.falseFeedback=a||"");break;case"Item":r.items||(r.items=[]);const U=n,z=a==="HTML",L=l;r.items.push({text:U,isHtml:z,feedback:L||void 0});break}}if(r){const i=As(r);i&&s.push(i)}return{questions:s}}var Jo=Object.defineProperty,Wo=Object.getOwnPropertyDescriptor,O=(t,e,s,r)=>{for(var i=r>1?void 0:r?Wo(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&Jo(e,s,i),i},xe=(t=>(t.MULTIPLE_CHOICE="multiple-choice",t.TRUE_FALSE="true-false",t.MATCHING="matching",t.SHORT_ANSWER="short-answer",t.FILL_IN_BLANK="fill-in-blank",t))(xe||{});let N=class extends H{constructor(){super(...arguments),this.quizId="",this.quizTitle="",this.questions="",this.gradeObjectName="",this.autoCreateGradeObject=!0,this.apiEndpoint="",this.passingScore=70,this.allowRetry=!0,this.maxAttempts=3,this.showFeedback=!0,this.allowReset=!1,this.randomizeQuestions=!1,this.timeLimit=0,this.autoSubmit=!1,this.type="inline",this.filename="",this.parsedQuestions=[],this.currentQuestionIndex=0,this.responses={},this.results=null,this.isSubmitted=!1,this.isStarted=!1,this.loading=!1,this.errorMessage=null,this.timeRemaining=0,this.timerInterval=null,this.attemptCount=0,this.completionStatus="not-started",this.gradebookSaveStatus="idle",this.gradebookErrorMessage=null,this.versions={},this.ou=null,this.currentUser=null,this.currentEnrollment=null,this.gradeObject=null,this.abortController=null}createRenderRoot(){return this}async connectedCallback(){if(super.connectedCallback(),this.abortController=new AbortController,(!this.quizId||this.quizId.trim()==="")&&(this.gradeObjectName?this.quizId=`quiz-${this.gradeObjectName.toLowerCase().replace(/\s+/g,"-")}`:this.quizId=`quiz-${Date.now()}`,console.log(`ℹ️ quizId was empty, generated default: "${this.quizId}"`)),console.log("🔍 uga-quiz component initialized:",{quizId:this.quizId,gradeObjectName:this.gradeObjectName||"(not set)",hasGradeObjectNameAttribute:this.hasAttribute("grade-object-name"),gradeObjectNameAttribute:this.getAttribute("grade-object-name")||"(not found)"}),this.ou=ve(),!this.ou){if(!this.questions&&this.type!=="local"&&this.type!=="csv"){this.errorMessage="Unable to determine course ID from URL. Make sure you are viewing this in an eLC course page, or provide questions inline.",this.loading=!1,this.requestUpdate();return}console.warn("⚠️ No course ID found. Quiz will work but gradebook integration will be disabled.")}this.loading=!0,this.requestUpdate();try{if(this.ou)try{this.versions=await Pe(),this.versions.le&&(T(this.versions.le,"getGradebook"),T(this.versions.le,"updateGradeValue")),this.versions.lp&&T(this.versions.lp,"getUser"),this.currentUser=await Xt(this.versions.lp);try{this.currentEnrollment=await At(this.ou,this.versions.lp,{fallbackToFirst:!1,throwOnNotFound:!1}),this.currentEnrollment&&this.currentEnrollment.User?console.log("📋 Enrollment info:",{userId:this.currentEnrollment.User.Identifier,displayName:this.currentEnrollment.User.DisplayName,role:this.currentEnrollment.Role?.Name||"Unknown"}):console.log("ℹ️ No enrollment found for this course. Will use currentUser.Identifier for gradebook operations.")}catch(t){console.warn("⚠️ Could not get enrollment info:",t),this.currentEnrollment=null}if(this.gradeObjectName&&(await this.checkCompletionStatus(),setTimeout(()=>{this.retryPendingGradebookSaves().catch(t=>{console.warn("⚠️ Background retry of pending gradebook save failed:",t)})},2e3),!this.gradeObject&&this.autoCreateGradeObject&&this.parsedQuestions.length>0))try{const t=this.parsedQuestions.reduce((e,s)=>e+s.points,0);this.gradeObject=await _o(this.ou,this.versions.le,{Name:this.gradeObjectName,ShortName:this.gradeObjectName.substring(0,20),Type:1,MaxPoints:t,CanExceedMaxPoints:!1,IsBonus:!1,ExcludeFromFinalGrade:!1,CategoryId:0,GradeSchemeId:null,Description:{Content:`Auto-created by uga-quiz component for "${this.quizTitle||this.quizId}"`,Type:"Text"}}),console.log(`✅ Pre-created gradebook item "${this.gradeObjectName}" with ${t} max points`)}catch(t){t.response?.status===403?console.log(`ℹ️ Gradebook item "${this.gradeObjectName}" will need to be created by an instructor (student viewing page)`):console.warn("⚠️ Could not pre-create gradebook item:",t)}await this.loadPreviousAttempts()}catch(t){console.warn("⚠️ D2L API calls failed. Quiz will work but gradebook integration disabled:",t)}await this.loadQuestions()}catch(t){if(t.message==="Request aborted"||this.abortController?.signal.aborted)return;console.error("Error initializing quiz:",t),this.errorMessage=`Failed to initialize quiz: ${t.message||"Unknown error"}`}finally{this.loading=!1,this.requestUpdate()}}disconnectedCallback(){super.disconnectedCallback(),this.abortController?.abort(),this.abortController=null,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null)}async loadQuestions(){let t=[];if(this.type==="csv"&&this.filename)try{const e=await $.get(this.filename),s=typeof e.data=="string"?e.data:JSON.stringify(e.data);if(t=Vo(s).questions,t.length===0)throw new Error("No questions found in CSV file. Please check the file format.")}catch(e){throw e.response?.status===404?new Error(`CSV file not found: ${this.filename}. Please check the file path and ensure the file exists in your course files.`):e.response?.status?new Error(`Failed to load CSV file (HTTP ${e.response.status}): ${e.message}`):new Error(`Failed to load CSV file: ${e.message}`)}else if(this.type==="local"&&this.filename)try{const s=(await $.get(this.filename)).data;if(t=Array.isArray(s.questions)?s.questions:Array.isArray(s)?s:[],t.length===0)throw new Error("No questions found in JSON file. Please check the file format.")}catch(e){throw e.response?.status===404?new Error(`JSON file not found: ${this.filename}. Please check the file path and ensure the file exists in your course files.`):e.response?.status?new Error(`Failed to load JSON file (HTTP ${e.response.status}): ${e.message}`):new Error(`Failed to load JSON file: ${e.message}`)}else if(this.questions)try{const e=JSON.parse(this.questions);if(t=Array.isArray(e.questions)?e.questions:Array.isArray(e)?e:[],t.length===0)throw new Error("No questions found in JSON. Please check the format.")}catch(e){throw e instanceof SyntaxError?new Error(`Invalid quiz JSON format: ${e.message}. Please check your JSON syntax.`):new Error(`Invalid quiz JSON: ${e.message}`)}else throw new Error('No quiz questions provided. Use questions attribute, type="local" with filename, or type="csv" with filename.');for(const e of t)if(!e.id||!e.type||!e.question||e.points===void 0||e.correctAnswer===void 0)throw new Error(`Invalid question format: ${JSON.stringify(e)}`);this.randomizeQuestions&&(t=this.shuffleArray([...t])),this.parsedQuestions=t,this.responses={};for(const e of this.parsedQuestions)e.type==="matching"?this.responses[e.id]={}:e.type==="multiple-choice"||e.type==="true-false"?this.responses[e.id]="":this.responses[e.id]=""}async checkCompletionStatus(){if(!this.gradeObjectName||!this.ou||!this.versions.le)return;const t=this.currentEnrollment?.User?.Identifier||this.currentUser?.Identifier;if(!t){console.log("ℹ️ Cannot check completion status: no user ID available yet");return}try{const e=await Fe(this.ou,this.versions.le);if(this.gradeObject=e.find(s=>s.Name===this.gradeObjectName),this.gradeObject&&this.gradeObject.GradeObjectId){const s=typeof t=="string"?parseInt(t):t;try{const i=(await qt(this.ou,this.versions.le,this.gradeObject.GradeObjectId)).find(o=>(typeof o.UserId=="string"?parseInt(o.UserId):o.UserId)===s);if(i&&i.PointsNumerator!==null&&i.PointsNumerator!==void 0){const o=i.PointsDenominator&&i.PointsDenominator>0?i.PointsNumerator/i.PointsDenominator*100:0;this.completionStatus=o>=this.passingScore?"passed":"failed",this.isSubmitted=!0,console.log(`ℹ️ Quiz already completed: ${o.toFixed(1)}% (${this.completionStatus})`)}}catch(r){r.response?.status===403?console.log("ℹ️ Cannot check completion status: permission denied (403). This is normal for students. Quiz can proceed."):console.warn("⚠️ Could not check completion status (grade values):",r.message||r)}}}catch(e){e.response?.status===403?console.log("ℹ️ Cannot check completion status: permission denied (403). This is normal for students. Quiz can proceed."):console.warn("⚠️ Could not check completion status:",e.message||e)}}async loadPreviousAttempts(){const t=this.currentUser?.Identifier||"anonymous",e=`uga-quiz-attempts-${this.quizId}-${t}`,s=localStorage.getItem(e);if(s)try{const r=JSON.parse(s);this.attemptCount=r.attemptCount||0}catch(r){console.warn("Could not parse stored attempt data:",r)}}startQuiz(){this.isStarted=!0,this.currentQuestionIndex=0,this.isSubmitted=!1,this.results=null,this.attemptCount++,this.timeLimit>0&&(this.timeRemaining=this.timeLimit*60,this.startTimer()),this.requestUpdate()}startTimer(){this.timerInterval&&clearInterval(this.timerInterval),this.timerInterval=window.setInterval(()=>{this.timeRemaining--,this.timeRemaining<=0&&(this.timeRemaining=0,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.autoSubmit?this.submitQuiz():this.errorMessage="Time limit reached. Please submit your quiz."),this.requestUpdate()},1e3)}formatTime(t){const e=Math.floor(t/60),s=t%60;return`${e.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`}handleAnswer(t,e){this.isSubmitted||(this.responses[t]=e,this.requestUpdate())}gradeQuestion(t,e){let s=!1,r=0;switch(t.type){case"multiple-choice":case"true-false":s=String(e)===String(t.correctAnswer);break;case"short-answer":case"fill-in-blank":const i=String(e).trim(),o=String(t.correctAnswer).trim();t.caseSensitive?s=i===o:s=i.toLowerCase()===o.toLowerCase();break;case"matching":if(typeof t.correctAnswer=="object"&&typeof e=="object"){const n=t.correctAnswer;let a=0,l=0;for(const c in n)l++,e[c]===n[c]&&a++;s=a===l,r=a/l*t.points}else s=!1;break}return s&&r===0&&(r=t.points),{questionId:t.id,answer:e,isCorrect:s,pointsEarned:r,timestamp:new Date().toISOString()}}async submitQuiz(){if(!this.isSubmitted){this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.loading=!0,this.requestUpdate();try{const t=[];let e=0,s=0;for(const a of this.parsedQuestions){e+=a.points;const l=this.gradeQuestion(a,this.responses[a.id]);t.push(l),s+=l.pointsEarned}const r=e>0?s/e*100:0,i=r>=this.passingScore;this.results={totalPoints:e,pointsEarned:s,percentage:r,passed:i,attempts:t,completedAt:new Date().toISOString()},this.isSubmitted=!0,this.completionStatus=i?"passed":"failed";const o=this.currentEnrollment?.User?.Identifier||this.currentUser?.Identifier;if(console.log("🔍 Gradebook save check:",{gradeObjectName:this.gradeObjectName||"(not set)",hasOU:!!this.ou,ou:this.ou,hasUserId:!!o,userId:o,userIdSource:this.currentEnrollment?.User?.Identifier?"enrollment":"currentUser",hasApiVersion:!!this.versions.le,apiVersion:this.versions.le,currentUser:this.currentUser?.DisplayName||"unknown",enrollment:this.currentEnrollment?.User?.DisplayName||"not found"}),this.gradeObjectName||console.warn('⚠️ gradeObjectName is not set. Please add grade-object-name="Formative Quiz 1" to the uga-quiz component.'),this.gradeObjectName&&this.ou&&o&&this.versions.le){this.gradebookSaveStatus="saving",this.requestUpdate();try{console.log("💾 Attempting to save quiz results to gradebook...",{user:this.currentUser?.DisplayName||"Unknown",userId:a,enrollmentUserId:this.currentEnrollment?.User?.Identifier,currentUserId:this.currentUser?.Identifier,gradeObjectName:this.gradeObjectName,points:`${s}/${e}`,percentage:`${(s/e*100).toFixed(1)}%`}),await this.saveToGradebook(s,e,i),this.gradebookSaveStatus="success",this.gradebookErrorMessage=null,console.log("✅ Gradebook save completed successfully");const a=this.currentEnrollment?.User?.Identifier||this.currentUser?.Identifier;if(a){const l=`uga-quiz-pending-grade-${this.quizId}-${a}`;localStorage.removeItem(l)}}catch(a){this.gradebookSaveStatus="error",a.response?.status>=500&&a.response?.status<600?this.gradebookErrorMessage=`D2L server error (${a.response.status}). The gradebook service is temporarily unavailable. Your quiz results have been saved locally. Please try again later or contact your instructor.`:this.gradebookErrorMessage=a.message||"Failed to save to gradebook",console.error("❌ Gradebook save failed:",{error:a.message,response:a.response?.data,status:a.response?.status,statusText:a.response?.statusText,user:this.currentUser?.DisplayName||this.currentEnrollment?.User?.DisplayName,userId:o,gradeObjectName:this.gradeObjectName,courseId:this.ou}),a.response?.status>=500&&a.response?.status<600&&console.warn("⚠️ Server error occurred. The component automatically retried, but all attempts failed. This may be a temporary D2L service issue.")}this.requestUpdate()}else{const a=[];this.gradeObjectName||a.push("grade-object-name attribute"),this.ou||a.push("course ID"),o||a.push("user ID"),this.versions.le||a.push("API version"),console.warn("⚠️ Gradebook save skipped. Missing:",a.join(", ")),console.warn('💡 To enable gradebook saving, add grade-object-name="Your Grade Item Name" to the uga-quiz component.')}const n=`uga-quiz-attempts-${this.quizId}-${this.currentUser?.Identifier||"anonymous"}`;if(localStorage.setItem(n,JSON.stringify({attemptCount:this.attemptCount,lastCompleted:new Date().toISOString()})),this.gradebookSaveStatus==="error"&&this.gradeObjectName&&this.ou){const a=this.currentEnrollment?.User?.Identifier||this.currentUser?.Identifier;if(a){const l=`uga-quiz-pending-grade-${this.quizId}-${a}`,c={quizId:this.quizId,courseId:this.ou,userId:a,gradeObjectName:this.gradeObjectName,pointsEarned:s,totalPoints:e,percentage:r,passed:i,timestamp:new Date().toISOString(),attemptCount:this.attemptCount};localStorage.setItem(l,JSON.stringify(c)),console.log("💾 Saved pending grade to localStorage for retry:",c)}}}catch(t){console.error("Error submitting quiz:",t),this.errorMessage=`Failed to submit quiz: ${t.message||"Unknown error"}`}finally{this.loading=!1,this.requestUpdate()}}}async saveToGradebook(t,e,s){const r=this.currentEnrollment?.User?.Identifier||this.currentUser?.Identifier;if(!this.ou||!r||!this.gradeObjectName||!this.versions.le){const h=[];throw this.ou||h.push("course ID"),r||h.push("user ID (neither enrollment nor currentUser available)"),this.gradeObjectName||h.push("grade object name"),this.versions.le||h.push("API version"),new Error(`Missing required information for gradebook save: ${h.join(", ")}`)}console.log("📊 Saving to gradebook:",{courseId:this.ou,userId:r,userIdSource:this.currentEnrollment?.User?.Identifier?"enrollment":"currentUser",userName:this.currentUser?.DisplayName||this.currentEnrollment?.User?.DisplayName||"Unknown",gradeObjectName:this.gradeObjectName,points:`${t}/${e}`});let i=this.gradeObject;if(!i){console.log("🔍 Looking up gradebook...");const h=await Fe(this.ou,this.versions.le);console.log(`📋 Found ${h.length} gradebook items:`,h.map(v=>v.Name)),i=h.find(v=>v.Name===this.gradeObjectName),i||(i=h.find(v=>v.Name.toLowerCase()===this.gradeObjectName.toLowerCase()),i&&console.warn(`⚠️ Found grade object with case-insensitive match: "${i.Name}" (looking for "${this.gradeObjectName}")`)),i||(i=h.find(v=>v.Name.trim()===this.gradeObjectName.trim()),i&&console.warn(`⚠️ Found grade object after trimming whitespace: "${i.Name}"`)),i&&(this.gradeObject=i)}if(!i){const v=(await Fe(this.ou,this.versions.le)).map(g=>`"${g.Name}"`).join(", ");throw new Error(`Gradebook item "${this.gradeObjectName}" not found. Please ask your instructor to create a gradebook item with the exact name "${this.gradeObjectName}" before taking this quiz. Available gradebook items: ${v||"none"}. Note: Instructors can enable auto-creation by viewing this page (the gradebook item will be created automatically).`)}if(!i.GradeObjectId){console.error("❌ Grade object found but missing GradeObjectId:",i);const h=await Fe(this.ou,this.versions.le);throw console.error("❌ Full gradebook response:",h),new Error(`Gradebook item "${this.gradeObjectName}" exists but is missing required ID (GradeObjectId). This may indicate a D2L API issue or the gradebook item is not fully initialized. Please try refreshing the page or contact support.`)}console.log("✅ Found grade object:",{id:i.GradeObjectId,name:i.Name,type:i.Type,maxPoints:i.MaxPoints}),i.Type!==void 0&&i.Type!==1?console.warn(`⚠️ Grade object "${this.gradeObjectName}" is not a numeric type (Type: ${i.Type}). Results may not display correctly.`):i.Type===void 0&&console.log(`ℹ️ Grade object "${this.gradeObjectName}" Type is undefined. Assuming numeric type based on gradebook configuration.`),i.MaxPoints&&i.MaxPoints!==e&&console.warn(`⚠️ Grade object max points (${i.MaxPoints}) doesn't match quiz total points (${e}). Using quiz total points.`);let o,n="currentUser.Identifier";if(this.currentEnrollment?.User?.Identifier){const h=this.currentEnrollment.User.Identifier;o=typeof h=="string"?parseInt(h):h,n="enrollment.User.Identifier"}else if(this.currentUser?.Identifier){const h=String(this.currentUser.Identifier).trim(),v=parseInt(h);if(!isNaN(v)&&String(v)===h)o=v;else throw new Error(`Invalid user ID format: ${h}. Expected numeric ID.`)}else throw new Error("No user ID available for gradebook save");if(isNaN(o)||o<=0)throw new Error(`Invalid user ID: ${o}. User ID must be a positive number.`);console.log("👤 User info for gradebook:",{userId:o,userIdSource:n,displayName:this.currentUser?.DisplayName||this.currentEnrollment?.User?.DisplayName||"Unknown",enrollmentUserId:this.currentEnrollment?.User?.Identifier,currentUserIdentifier:this.currentUser?.Identifier});const a=this.results?.percentage||(e>0?t/e*100:0),l=this.attemptCount>1?` (Attempt ${this.attemptCount})`:"",c=Math.round(t),p={GradeObjectType:i.Type!==void 0?i.Type:1,PointsNumerator:c,Comments:{Content:`<p><strong>Quiz "${this.quizTitle||this.quizId}"</strong> completed${l}</p><p>Score: ${c}/${e} points (${a.toFixed(1)}%)</p><p>Status: ${s?'<strong style="color: green;">Passed</strong>':'<strong style="color: red;">Failed</strong>'}</p><p>Completed: ${new Date().toLocaleString()}</p>`,Type:"Html"},PrivateComments:{Content:"",Type:"Text"}};if(this.apiEndpoint&&this.apiEndpoint.trim()!==""){console.log("🌐 Using external API endpoint for grade submission:",this.apiEndpoint);try{const h={courseId:this.ou,userId:o,gradeObjectName:this.gradeObjectName,pointsEarned:t,totalPoints:e,quizId:this.quizId,quizTitle:this.quizTitle,attemptCount:this.attemptCount,passed:s,comments:p.Comments?.Content||""};console.log("📤 Submitting to external API:",{endpoint:this.apiEndpoint,payload:h});const v=await $.post(this.apiEndpoint,h,{headers:{"Content-Type":"application/json"},timeout:3e4});console.log("✅ External API Response:",v.data),console.log(`✅ Successfully submitted quiz results via external API for user ${this.currentUser?.DisplayName||this.currentEnrollment?.User?.DisplayName||"Unknown"} (ID: ${o}): ${t}/${e} (${a.toFixed(1)}%)`);return}catch(h){console.error("❌ External API call failed:",{error:h,message:h?.message,response:h?.response?.data,status:h?.response?.status}),console.log("⚠️ External API failed, falling back to direct D2L API...")}}console.log("💾 Grade value payload to save:",{GradeObjectType:p.GradeObjectType,PointsNumerator:p.PointsNumerator,Comments:p.Comments,urlPath:`/d2l/api/le/${this.versions.le}/${this.ou}/grades/${i.GradeObjectId}/values/${o}`});try{console.log("🔄 Calling updateGradeValue API (direct D2L)...",{courseId:this.ou,gradeObjectId:i.GradeObjectId,userId:o,pointsNumerator:c,pointsDenominator:e,originalPointsEarned:t,roundedPointsEarned:c});let h;try{h=await Es(this.ou,this.versions.le,i.GradeObjectId,o,p)}catch(v){throw console.error("❌ updateGradeValue API call failed:",{error:v,message:v?.message,response:v?.response?.data,status:v?.response?.status}),v}console.log("✅ API Response:",h),console.log(`✅ Successfully saved quiz results to gradebook for user ${this.currentUser?.DisplayName||this.currentEnrollment?.User?.DisplayName||"Unknown"} (ID: ${o}): ${t}/${e} (${a.toFixed(1)}%)`)}catch(h){if(console.error("❌ Gradebook save error details:",{status:h.response?.status,statusText:h.response?.statusText,data:h.response?.data,message:h.message,userId:o,gradeObjectId:i.GradeObjectId,courseId:this.ou}),h.response?.status===403){const v="Permission denied (403). Students cannot directly save grades to the D2L gradebook. Your quiz results have been saved locally and will be automatically submitted when an instructor views this page. If you are an instructor, please check your course permissions.";throw console.warn("⚠️",v),new Error(v)}else{if(h.response?.status===404)throw new Error(`Grade object (ID: ${i.GradeObjectId}) or user (ID: ${o}) not found. Please verify the gradebook item "${this.gradeObjectName}" exists and the user is enrolled in the course.`);if(h.response?.status===400){const v=h.response?.data;throw new Error(`Invalid grade data (400). ${v?JSON.stringify(v):"Please check that the grade object accepts numeric values and the points are valid."}`)}else throw new Error(`Failed to save to gradebook (${h.response?.status||"unknown"}): ${h.message||JSON.stringify(h.response?.data||"Unknown error")}`)}}}async retryPendingGradebookSaves(){if(!this.ou||!this.versions.le||!this.gradeObjectName)return;if(!this.currentUser&&!this.currentEnrollment&&(await new Promise(o=>setTimeout(o,1e3)),!this.currentUser&&!this.currentEnrollment)){console.log("ℹ️ Cannot retry pending gradebook saves: user info not available yet");return}const t=this.currentEnrollment?.User?.Identifier,e=this.currentUser?.Identifier,s=t||e;if(!s){console.log("ℹ️ Cannot retry pending gradebook saves: no user ID available");return}if(!this.quizId||this.quizId.trim()===""){console.log("ℹ️ Cannot retry pending gradebook saves: quizId is not set");return}const r=`uga-quiz-pending-grade-${this.quizId}-${s}`,i=localStorage.getItem(r);if(i)try{const o=JSON.parse(i);if(o.courseId!==this.ou||o.gradeObjectName!==this.gradeObjectName){console.log("ℹ️ Pending grade is for a different course/grade object, skipping retry");return}if(!o.pointsEarned||!o.totalPoints){console.log("ℹ️ Pending grade is incomplete, removing from localStorage"),localStorage.removeItem(r);return}if(console.log("🔄 Found pending gradebook save, attempting to retry...",o),this.gradebookSaveStatus="saving",this.requestUpdate(),!this.currentUser&&!this.currentEnrollment)throw new Error("User information not available for gradebook save");console.log("🔄 Retrying gradebook save for pending grade:",{quizId:o.quizId,userId:o.userId,pointsEarned:o.pointsEarned,totalPoints:o.totalPoints}),await this.saveToGradebook(o.pointsEarned,o.totalPoints,o.passed),localStorage.removeItem(r),this.gradebookSaveStatus="success",this.gradebookErrorMessage=null,console.log("✅ Successfully retried pending gradebook save")}catch(o){if(o.message?.includes("User information not available")){console.log("ℹ️ Cannot retry pending gradebook save yet: user info not loaded. Will retry on next page load.");return}console.warn("⚠️ Failed to retry pending gradebook save:",o),this.gradebookSaveStatus="error",this.gradebookErrorMessage=`Retry failed: ${o.message||"Unknown error"}. Will try again next time.`,o.response?.status&&o.response.status<500&&o.response.status!==403?(console.warn("⚠️ Non-retryable error (not 403), removing pending grade from localStorage"),localStorage.removeItem(r)):o.response?.status===403&&console.log("ℹ️ Permission denied (403). Grade saved to localStorage. An instructor viewing this page will automatically submit it to the gradebook.")}finally{this.requestUpdate()}}resetQuiz(){if(this.allowRetry){if(this.attemptCount>=this.maxAttempts){this.errorMessage=`Maximum attempts (${this.maxAttempts}) reached.`;return}this.isStarted=!1,this.isSubmitted=!1,this.results=null,this.currentQuestionIndex=0,this.responses={},this.gradebookSaveStatus="idle",this.gradebookErrorMessage=null;for(const t of this.parsedQuestions)t.type==="matching"?this.responses[t.id]={}:this.responses[t.id]="";this.errorMessage=null,this.requestUpdate()}}async clearAllAttempts(){if(!this.allowReset){console.warn('Reset not allowed. Set allow-reset="true" to enable.');return}const t=this.currentUser?.Identifier||"anonymous",e=`uga-quiz-attempts-${this.quizId}-${t}`;if(localStorage.removeItem(e),this.attemptCount=0,this.gradeObjectName&&this.ou&&this.currentUser&&this.versions.le&&this.gradeObject)try{const s=this.currentEnrollment?.User?.Identifier||this.currentUser?.Identifier,r=typeof s=="string"?parseInt(s):s;if(!isNaN(r)&&r>0){const i={OrgUnitId:parseInt(this.ou),UserId:r,GradeObjectId:this.gradeObject.GradeObjectId,PointsNumerator:null,PointsDenominator:null,Comments:{Text:"Quiz reset by instructor",Html:"<p>Quiz reset by instructor</p>"}};await Es(this.ou,this.versions.le,this.gradeObject.GradeObjectId,r,i),console.log("✅ Cleared gradebook entry for quiz reset")}}catch(s){console.error("⚠️ Could not clear gradebook entry:",s)}this.completionStatus="not-started",this.isSubmitted=!1,this.isStarted=!1,this.results=null,this.currentQuestionIndex=0,this.responses={},this.gradebookSaveStatus="idle",this.gradebookErrorMessage=null,this.errorMessage=null;for(const s of this.parsedQuestions)s.type==="matching"?this.responses[s.id]={}:this.responses[s.id]="";console.log("✅ Quiz reset complete. All attempts cleared."),this.requestUpdate()}nextQuestion(){this.currentQuestionIndex<this.parsedQuestions.length-1&&(this.currentQuestionIndex++,this.requestUpdate())}previousQuestion(){this.currentQuestionIndex>0&&(this.currentQuestionIndex--,this.requestUpdate())}shuffleArray(t){const e=[...t];for(let s=e.length-1;s>0;s--){const r=Math.floor(Math.random()*(s+1));[e[s],e[r]]=[e[r],e[s]]}return e}renderQuestion(t){const e=this.responses[t.id],s=this.results?.attempts.find(i=>i.questionId===t.id),r=this.isSubmitted&&this.showFeedback&&s;switch(t.type){case"multiple-choice":return m`
          <div class="quiz-question">
            <p class="quiz-question-text">${t.question}</p>
            <div class="quiz-options">
              ${t.options?.map((n,a)=>m`
                <label class="quiz-option ${r&&String(a)===String(t.correctAnswer)?"correct":""} ${r&&String(a)===String(e)&&!s?.isCorrect?"incorrect":""}">
                  <input
                    type="radio"
                    name="question-${t.id}"
                    value="${a}"
                    .checked=${String(e)===String(a)}
                    @change=${()=>this.handleAnswer(t.id,a)}
                    ?disabled=${this.isSubmitted}
                  />
                  <span>${n}</span>
                </label>
              `)}
            </div>
            ${r?m`
              <div class="quiz-feedback ${s?.isCorrect?"correct":"incorrect"}">
                ${s?.isCorrect?m`<span class="feedback-icon">✓</span> Correct! ${t.explanation?`- ${t.explanation}`:""}`:m`<span class="feedback-icon">✗</span> Incorrect. ${t.explanation?`- ${t.explanation}`:""}`}
                <div class="feedback-points">Points: ${s.pointsEarned}/${t.points}</div>
              </div>
            `:""}
          </div>
        `;case"true-false":return m`
          <div class="quiz-question">
            <p class="quiz-question-text">${t.question}</p>
            <div class="quiz-options">
              <label class="quiz-option ${r&&t.correctAnswer===!0?"correct":""} ${r&&e==="true"&&!s?.isCorrect?"incorrect":""}">
                <input
                  type="radio"
                  name="question-${t.id}"
                  value="true"
                  .checked=${e==="true"}
                  @change=${()=>this.handleAnswer(t.id,"true")}
                  ?disabled=${this.isSubmitted}
                />
                <span>True</span>
              </label>
              <label class="quiz-option ${r&&t.correctAnswer===!1?"correct":""} ${r&&e==="false"&&!s?.isCorrect?"incorrect":""}">
                <input
                  type="radio"
                  name="question-${t.id}"
                  value="false"
                  .checked=${e==="false"}
                  @change=${()=>this.handleAnswer(t.id,"false")}
                  ?disabled=${this.isSubmitted}
                />
                <span>False</span>
              </label>
            </div>
            ${r?m`
              <div class="quiz-feedback ${s?.isCorrect?"correct":"incorrect"}">
                ${s?.isCorrect?m`<span class="feedback-icon">✓</span> Correct! ${t.explanation?`- ${t.explanation}`:""}`:m`<span class="feedback-icon">✗</span> Incorrect. ${t.explanation?`- ${t.explanation}`:""}`}
                <div class="feedback-points">Points: ${s.pointsEarned}/${t.points}</div>
              </div>
            `:""}
          </div>
        `;case"short-answer":case"fill-in-blank":return m`
          <div class="quiz-question">
            <p class="quiz-question-text">${t.question}</p>
            <input
              type="text"
              class="quiz-text-input"
              .value=${e||""}
              @input=${n=>this.handleAnswer(t.id,n.target.value)}
              ?disabled=${this.isSubmitted}
              placeholder="Enter your answer"
            />
            ${r?m`
              <div class="quiz-feedback ${s?.isCorrect?"correct":"incorrect"}">
                ${s?.isCorrect?m`<span class="feedback-icon">✓</span> Correct! ${t.explanation?`- ${t.explanation}`:""}`:m`<span class="feedback-icon">✗</span> Incorrect. ${t.explanation?`- ${t.explanation}`:""}`}
                <div class="feedback-points">Points: ${s.pointsEarned}/${t.points}</div>
              </div>
            `:""}
          </div>
        `;case"matching":const i=t.correctAnswer,o=t.options||[];return m`
          <div class="quiz-question">
            <p class="quiz-question-text">${t.question}</p>
            <div class="quiz-matching">
              ${Object.keys(i).map(n=>{const a=e?.[n]||"";return m`
                  <div class="matching-row">
                    <span class="matching-key">${n}</span>
                    <select
                      class="matching-select"
                      .value=${a}
                      @change=${l=>{const c={...e};c[n]=l.target.value,this.handleAnswer(t.id,c)}}
                      ?disabled=${this.isSubmitted}
                    >
                      <option value="">Select...</option>
                      ${o.map(l=>m`
                        <option value="${l}" ?selected=${a===l}>${l}</option>
                      `)}
                    </select>
                    ${r?m`
                      <span class="matching-feedback ${a===i[n]?"correct":"incorrect"}">
                        ${a===i[n]?"✓":"✗"}
                      </span>
                    `:""}
                  </div>
                `})}
            </div>
            ${r?m`
              <div class="quiz-feedback ${s?.isCorrect?"correct":"incorrect"}">
                ${s?.isCorrect?m`<span class="feedback-icon">✓</span> All matches correct! ${t.explanation?`- ${t.explanation}`:""}`:m`<span class="feedback-icon">✗</span> Some matches incorrect. ${t.explanation?`- ${t.explanation}`:""}`}
                <div class="feedback-points">Points: ${s.pointsEarned}/${t.points}</div>
              </div>
            `:""}
          </div>
        `;default:return m`<p>Unsupported question type: ${t.type}</p>`}}render(){if(this.loading&&!this.isStarted)return m`
        <div class="quiz-container">
          <div class="quiz-loading">Loading quiz...</div>
        </div>
      `;if(this.errorMessage&&!this.isStarted)return m`
        <div class="quiz-container">
          <div class="quiz-error">${this.errorMessage}</div>
        </div>
      `;if(this.completionStatus==="passed"||this.completionStatus==="failed")return m`
        <div class="quiz-container">
          <div class="quiz-completed">
            <h3>Quiz Already Completed</h3>
            <p>You have already completed this quiz.</p>
            ${this.completionStatus==="passed"?m`<p class="quiz-status passed">Status: Passed ✓</p>`:m`<p class="quiz-status failed">Status: Failed ✗</p>`}
            ${this.allowRetry&&this.attemptCount<this.maxAttempts?m`<button class="quiz-button" @click=${this.resetQuiz}>Retake Quiz</button>`:m`<p class="quiz-info">Maximum attempts reached.</p>`}
            ${this.allowReset?m`<button class="quiz-button" style="margin-top: 1rem; background: #ff9800;" @click=${this.clearAllAttempts}>Reset All Attempts (Instructor Only)</button>`:""}
          </div>
        </div>
      `;if(!this.isStarted)return m`
        <div class="quiz-container">
          <div class="quiz-start">
            <h3>${this.quizTitle||"Quiz"}</h3>
            <div class="quiz-info">
              <p><strong>Questions:</strong> ${this.parsedQuestions.length}</p>
              <p><strong>Total Points:</strong> ${this.parsedQuestions.reduce((s,r)=>s+r.points,0)}</p>
              <p><strong>Passing Score:</strong> ${this.passingScore}%</p>
              ${this.timeLimit>0?m`<p><strong>Time Limit:</strong> ${this.timeLimit} minutes</p>`:""}
              ${this.allowRetry?m`<p><strong>Max Attempts:</strong> ${this.maxAttempts}</p>`:m`<p><strong>Attempts:</strong> 1 (no retries)</p>`}
              ${this.attemptCount>0?m`<p><strong>Previous Attempts:</strong> ${this.attemptCount}</p>`:""}
            </div>
            <button class="quiz-button quiz-button-primary" @click=${this.startQuiz}>Start Quiz</button>
          </div>
        </div>
      `;const t=this.parsedQuestions[this.currentQuestionIndex],e=this.parsedQuestions.every(s=>{if(s.type==="matching"){const r=this.responses[s.id];return r&&Object.keys(r).length>0}return this.responses[s.id]!==""&&this.responses[s.id]!==null&&this.responses[s.id]!==void 0});return m`
      <style>
        .quiz-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
        }
        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #ba0c2f;
        }
        .quiz-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #ba0c2f;
        }
        .quiz-timer {
          font-size: 1.2rem;
          font-weight: bold;
          color: ${this.timeRemaining<60?"#d32f2f":"#333"};
        }
        .quiz-progress {
          margin-bottom: 1rem;
        }
        .quiz-progress-bar {
          width: 100%;
          height: 20px;
          background: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
        }
        .quiz-progress-fill {
          height: 100%;
          background: #ba0c2f;
          transition: width 0.3s;
        }
        .quiz-question {
          margin-bottom: 2rem;
        }
        .quiz-question-text {
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .quiz-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .quiz-option {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quiz-option:hover:not(:has(input:disabled)) {
          background: #f5f5f5;
          border-color: #ba0c2f;
        }
        .quiz-option input[type="radio"] {
          margin-right: 0.5rem;
        }
        .quiz-option.correct {
          background: #e8f5e9;
          border-color: #4caf50;
        }
        .quiz-option.incorrect {
          background: #ffebee;
          border-color: #f44336;
        }
        .quiz-text-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        .quiz-matching {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .matching-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .matching-key {
          min-width: 100px;
          font-weight: bold;
        }
        .matching-select {
          flex: 1;
          padding: 0.5rem;
          border: 2px solid #ddd;
          border-radius: 4px;
        }
        .quiz-feedback {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 4px;
        }
        .quiz-feedback.correct {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
        }
        .quiz-feedback.incorrect {
          background: #ffebee;
          border-left: 4px solid #f44336;
        }
        .feedback-icon {
          font-weight: bold;
          margin-right: 0.5rem;
        }
        .feedback-points {
          margin-top: 0.5rem;
          font-weight: bold;
        }
        .quiz-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
        }
        .quiz-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quiz-button-primary {
          background: #ba0c2f;
          color: white;
        }
        .quiz-button-primary:hover:not(:disabled) {
          background: #8a0a23;
        }
        .quiz-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .quiz-results {
          margin-top: 2rem;
          padding: 2rem;
          background: #f5f5f5;
          border-radius: 8px;
        }
        .quiz-score {
          font-size: 2rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 1rem;
        }
        .quiz-score.passed {
          color: #4caf50;
        }
        .quiz-score.failed {
          color: #f44336;
        }
        .quiz-loading, .quiz-error {
          padding: 2rem;
          text-align: center;
        }
        .quiz-error {
          color: #f44336;
        }
        .quiz-start {
          text-align: center;
        }
        .quiz-info {
          margin: 2rem 0;
          text-align: left;
          display: inline-block;
        }
        .quiz-info p {
          margin: 0.5rem 0;
        }
        .quiz-completed {
          text-align: center;
          padding: 2rem;
        }
        .quiz-status {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        .quiz-status.passed {
          color: #4caf50;
        }
        .quiz-status.failed {
          color: #f44336;
        }
        .gradebook-status {
          background: #f9f9f9;
          border: 1px solid #ddd;
        }
        .gradebook-status p {
          margin: 0.25rem 0;
        }
      </style>

      <div class="quiz-container">
        <div class="quiz-header">
          <div class="quiz-title">${this.quizTitle||"Quiz"}</div>
          ${this.timeLimit>0?m`<div class="quiz-timer">Time: ${this.formatTime(this.timeRemaining)}</div>`:""}
        </div>

        <div class="quiz-progress">
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width: ${(this.currentQuestionIndex+1)/this.parsedQuestions.length*100}%"></div>
          </div>
          <p>Question ${this.currentQuestionIndex+1} of ${this.parsedQuestions.length}</p>
        </div>

        ${this.isSubmitted?m`
          <div class="quiz-results">
            <div class="quiz-score ${this.results?.passed?"passed":"failed"}">
              Score: ${this.results?.pointsEarned}/${this.results?.totalPoints} (${this.results?.percentage.toFixed(1)}%)
            </div>
            <p style="text-align: center; font-size: 1.2rem;">
              ${this.results?.passed?"✓ Passed!":"✗ Failed"}
            </p>
            <p style="text-align: center;">
              Passing score: ${this.passingScore}%
            </p>
            
            ${this.gradeObjectName?m`
              <div class="gradebook-status" style="margin-top: 1.5rem; padding: 1rem; border-radius: 4px; text-align: center;">
                ${this.gradebookSaveStatus==="saving"?m`
                  <p style="color: #666;">⏳ Saving results to gradebook...</p>
                `:this.gradebookSaveStatus==="success"?m`
                  <p style="color: #4caf50; font-weight: bold;">✓ Results saved to gradebook successfully!</p>
                  <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">Gradebook item: "${this.gradeObjectName}"</p>
                `:this.gradebookSaveStatus==="error"?m`
                  <p style="color: #f44336; font-weight: bold;">✗ Failed to save to gradebook</p>
                  <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">${this.gradebookErrorMessage||"Unknown error"}</p>
                  <p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem;">
                    ${this.gradebookErrorMessage?.includes("server error")||this.gradebookErrorMessage?.includes("temporarily unavailable")?"Your results have been saved locally and will be automatically synced to the gradebook when the server is available. You can refresh this page later to retry.":`Please ensure the gradebook item "${this.gradeObjectName}" exists.`}
                  </p>
                `:""}
              </div>
            `:""}

            <h4>Question Review:</h4>
            ${this.parsedQuestions.map((s,r)=>{const i=this.results?.attempts.find(o=>o.questionId===s.id);return m`
                <div class="quiz-question">
                  <p><strong>Question ${r+1}:</strong> ${s.question}</p>
                  <p><strong>Your Answer:</strong> ${JSON.stringify(this.responses[s.id])}</p>
                  <p><strong>Points:</strong> ${i?.pointsEarned||0}/${s.points}</p>
                  ${this.renderQuestion(s)}
                </div>
              `})}

            ${this.allowRetry&&this.attemptCount<this.maxAttempts?m`<button class="quiz-button quiz-button-primary" @click=${this.resetQuiz} style="margin-top: 1rem; width: 100%;">
                  Retake Quiz (Attempt ${this.attemptCount+1}/${this.maxAttempts})
                </button>`:m`<p class="quiz-info">Maximum attempts reached.</p>`}
            
            ${this.allowReset?m`<button class="quiz-button" style="margin-top: 1rem; width: 100%; background: #ff9800; color: white;" @click=${this.clearAllAttempts}>
                  Reset All Attempts (Instructor Only)
                </button>`:""}
          </div>
        `:m`
          ${this.renderQuestion(t)}

          <div class="quiz-navigation">
            <button 
              class="quiz-button" 
              @click=${this.previousQuestion}
              ?disabled=${this.currentQuestionIndex===0}
            >
              Previous
            </button>
            ${this.currentQuestionIndex<this.parsedQuestions.length-1?m`<button class="quiz-button quiz-button-primary" @click=${this.nextQuestion}>Next</button>`:m`<button 
                  class="quiz-button quiz-button-primary" 
                  @click=${this.submitQuiz}
                  ?disabled=${!e||this.loading}
                >
                  ${this.loading?"Submitting...":"Submit Quiz"}
                </button>`}
          </div>
        `}
      </div>
    `}};O([b({type:String})],N.prototype,"quizId",2);O([b({type:String})],N.prototype,"quizTitle",2);O([b({type:String})],N.prototype,"questions",2);O([b({type:String,attribute:"grade-object-name"})],N.prototype,"gradeObjectName",2);O([b({type:Boolean})],N.prototype,"autoCreateGradeObject",2);O([b({type:String,attribute:"api-endpoint"})],N.prototype,"apiEndpoint",2);O([b({type:Number})],N.prototype,"passingScore",2);O([b({type:Boolean})],N.prototype,"allowRetry",2);O([b({type:Number})],N.prototype,"maxAttempts",2);O([b({type:Boolean})],N.prototype,"showFeedback",2);O([b({type:Boolean})],N.prototype,"allowReset",2);O([b({type:Boolean})],N.prototype,"randomizeQuestions",2);O([b({type:Number})],N.prototype,"timeLimit",2);O([b({type:Boolean})],N.prototype,"autoSubmit",2);O([b({type:String})],N.prototype,"type",2);O([b({type:String})],N.prototype,"filename",2);O([P()],N.prototype,"parsedQuestions",2);O([P()],N.prototype,"currentQuestionIndex",2);O([P()],N.prototype,"responses",2);O([P()],N.prototype,"results",2);O([P()],N.prototype,"isSubmitted",2);O([P()],N.prototype,"isStarted",2);O([P()],N.prototype,"loading",2);O([P()],N.prototype,"errorMessage",2);O([P()],N.prototype,"timeRemaining",2);O([P()],N.prototype,"timerInterval",2);O([P()],N.prototype,"attemptCount",2);O([P()],N.prototype,"completionStatus",2);O([P()],N.prototype,"gradebookSaveStatus",2);O([P()],N.prototype,"gradebookErrorMessage",2);N=O([ee("uga-quiz")],N);var Ko=Object.defineProperty,Qo=Object.getOwnPropertyDescriptor,K=(t,e,s,r)=>{for(var i=r>1?void 0:r?Qo(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&Ko(e,s,i),i};let V=class extends H{constructor(){super(),this.loaded=!0,this.token=null,this.xsrfRoute="/d2l/lp/auth/xsrf-tokens",this.versions={},this.forumName=null,this.forumId=null,this.topicName=null,this.topicId=null,this.options=[{value:"0",text:"Please Select an Option"},{value:"1",text:"Very Poor"},{value:"2",text:"Poor"},{value:"3",text:"Neutral"},{value:"4",text:"Good"},{value:"5",text:"Very Good"}],this.contentId="",this.contentType="",this.contentName="",this.contentPlatform="",this.ou=null,this.reviewExists=!1,this.name="",this.postId=null,this.error=!1,this.errorMessage=null,this.currentUser={},this.selected=null,this.contentTitle="",this.domain=null,this.loading=!1,this.abortController=null,this.addEventListener("keypress",t=>{t.key==="Enter"&&this.querySelector("#feedback-field")?.id==="feedback-field"&&(t.preventDefault(),this.selected!==null&&this.selected!=="0"?this.submitRating():(this.error=!0,this.errorMessage="Please select a rating",this.requestUpdate()))})}createRenderRoot(){return this}async connectedCallback(){if(super.connectedCallback(),this.abortController=new AbortController,this.forumId===null&&this.forumName===null&&(this.forumName="Content Ratings"),this.topicId===null&&this.topicName===null&&(this.topicName="Content Ratings"),this.ou===null&&(this.ou=ve()),!this.ou)return;const t=await Pe();this.addVersions(t),this.versions.le&&(T(this.versions.le,"getForums"),T(this.versions.le,"getTopics"),T(this.versions.le,"getPostsPaged")),this.versions.lp&&T(this.versions.lp,"getUser");const e=await Xt(this.versions.lp);if(this.addWhoAmI(e),this.forumId===null){try{const s=await Yt(this.ou,this.versions.le);this.findForum(s)}catch(s){console.error("Error fetching forums:",s),this.error=!0,this.errorMessage=`Failed to fetch forums: ${s.message||"Unknown error"}`;return}if(this.forumId===null&&this.forumName)try{if(this.token===null&&await this.getToken(),this.token!==null){const s=await vo(this.ou,this.versions.le,this.forumName,"");this.forumId=s.ForumId.toString()}}catch(s){console.error("Error creating forum:",s),this.error=!0,this.errorMessage=`Failed to create rating forum: ${s.message||"Unknown error"}`;return}}if(this.topicId===null&&this.forumId){try{const s=await Zt(this.ou,this.versions.le,parseInt(this.forumId,10));this.findTopic(s)}catch(s){console.error("Error fetching topics:",s),this.error=!0,this.errorMessage=`Failed to fetch topics: ${s.message||"Unknown error"}`;return}if(this.topicId===null&&this.topicName)try{if(this.token===null&&await this.getToken(),this.token!==null){const s=await $o(this.ou,this.versions.le,parseInt(this.forumId,10),this.topicName,"");this.topicId=s.TopicId.toString()}}catch(s){console.error("Error creating topic:",s),this.error=!0,this.errorMessage=`Failed to create rating topic: ${s.message||"Unknown error"}`;return}}if(this.topicId===null||this.forumId===null)this.error=!0,this.errorMessage||(this.errorMessage="Failed to initialize rating system");else try{const s=await wo(this.ou,this.versions.le,parseInt(this.forumId,10),parseInt(this.topicId,10),{pageSize:200});this.findPost(s)}catch(s){if(s.message==="Request aborted"||this.abortController?.signal.aborted)return;console.error("Error fetching posts:",s)}}disconnectedCallback(){super.disconnectedCallback(),this.abortController?.abort(),this.abortController=null}async getToken(){this.token=await Ct()}async makePostRequest(t,e){return $.post(t,e,{headers:{"X-Csrf-Token":this.token}}).then(i=>i.data)}makeGetRequest(t){return $.get(t).then(r=>r.data)}addVersions(t){for(let e in t)this.versions[e]=t[e]}findForum(t){for(let e in t)t[e].Name===this.forumName&&(this.forumId=t[e].ForumId)}findTopic(t){for(let e in t)t[e].Name===this.topicName&&(this.topicId=t[e].TopicId)}findPost(t){for(const e of t){const s=e;if(!s.IsDeleted&&s.PostingUserId===this.currentUser.userId){const i=(s.Subject||"").split("|").map(n=>n.trim()),o=i.length>0?i[i.length-1]:"";if(this.contentId===o){this.reviewExists=!0,this.postId=s.PostId?.toString()||null;return}}}}addWhoAmI(t){this.currentUser.firstName=t.FirstName,this.currentUser.lastName=t.LastName,this.currentUser.username=t.UniqueName,this.currentUser.userId=t.Identifier}async submitRating(){if(this.selected===null||this.selected==="0"){this.error=!0,this.errorMessage="Please select a rating",this.requestUpdate();return}this.loading=!0,this.error=!1,this.errorMessage=null;const t=this.reviewExists;this.reviewExists=!0,this.requestUpdate();try{const e=this.selected,r=(this.querySelector("#feedback-field")?.value||"").trim(),i=this.options.find(d=>d.value===e)?.text||"",o=i?`${e} ${i} - ${r}`:`${e} - ${r}`;if(this.ou===null&&(this.ou=ve()),!this.ou||!this.forumId||!this.topicId)throw new Error("Missing required information to submit rating");const n={ParentPostId:null,Subject:`${this.contentName} | ${this.contentId}`,Message:{Content:o,Type:"Text"},IsAnonymous:!1};this.token===null&&await this.getToken(),this.token===null&&await this.getToken();const a=await Io(this.ou,this.versions.le,parseInt(this.forumId,10),parseInt(this.topicId,10),n.Subject,o,{xsrfToken:this.token||void 0,isAnonymous:!1}),l=a&&typeof a=="object"&&"PostId"in a,c=a&&typeof a=="object"&&"ThreadId"in a;if(l||c)this.error=!1,this.postId=a.PostId?.toString()||null,console.log("✅ Rating submitted successfully:",{postId:a.PostId,threadId:a.ThreadId});else throw this.reviewExists=t,console.error("❌ Unexpected post response structure:",{postData:a,hasPostId:l,hasThreadId:c,type:typeof a,keys:a?Object.keys(a):"null/undefined"}),new Error("Post was created but response was unexpected. Please refresh and try again.")}catch(e){this.reviewExists=t,console.error("Error submitting rating:",e),this.error=!0,this.errorMessage=e.response?.data?.Message||e.message||"An error occurred saving your response. Please try again in a few minutes."}finally{this.loading=!1,this.requestUpdate()}}changeRating(t){const e=t.target;this.selected=e.value,this.error===!0&&(this.error=!1,this.errorMessage=""),this.requestUpdate()}render(){return this.reviewExists?m`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <div class="util-background-light-gray util-pad-all-sm util-display-none@print">
        <p class="cmp-paragraph util-margin-all-none">Thank you for giving feedback on this content.</p>
      </div>
      `:m`
      <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
      <form class="util-background-light-gray util-pad-all-sm util-pad-all-md@sm util-pad-all-lg@md util-display-none@print">
        <fieldset>
            <legend class="cmp-heading-5 util-margin-bottom-sm util-text-center util-full-width">Leave feedback for ${this.contentName}</legend>
            ${this.error?m`<p class="util-text-center util-color-red" role="alert">${this.errorMessage}</p>`:m``}
            <div class="obj-grid obj-grid--gap-md@md">
              <div class="obj-grid__full obj-grid__half@md">
                <div class="cmp-form-select">  
                  <label
                      for="rating-select"
                      class="cmp-form-label">
                      How beneficial was this video for your learning?
                  </label>                  
                  <div class="">
                      <select id="rating-select" class="cmp-form-select__dropdown" @change=${this.changeRating} ?disabled=${this.loading}>
                        ${this.options.map(t=>m`
                          <option value="${t.value}">${t.text}</option>
                        `)}
                      </select>
                  </div>
                </div>
              </div>
              <div class="obj-grid__full obj-grid__half@md">
                <div class="cmp-form-field">
                    <label
                      for="feedback-field"
                      class="cmp-form-label">
                      Comment
                    </label>
                  <div class="">
                    <div class="util-position-relative">
                      <input id="feedback-field" class="cmp-form-field__input" type="search"
                        placeholder="Leave a Comment (Optional)" ?disabled=${this.loading} />
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </fieldset>
          <div class="obj-grid obj-grid--gap-md@sm util-margin-top-md">
            <div class="obj-grid__full obj-grid__quarter@md">
                <button class="cmp-button
                  cmp-button--full-width" id="submitButton" type="button" @click="${this.submitRating}" ?disabled=${this.loading}>
                  ${this.loading?"Submitting...":"Submit Feedback"}
                </button>
            </div>
          </div>
      </form>
      `}};K([b({type:Boolean})],V.prototype,"loaded",2);K([b({type:String})],V.prototype,"token",2);K([b({type:String})],V.prototype,"xsrfRoute",2);K([b({type:Object})],V.prototype,"versions",2);K([b({type:String})],V.prototype,"forumName",2);K([b({type:String})],V.prototype,"forumId",2);K([b({type:String})],V.prototype,"topicName",2);K([b({type:String})],V.prototype,"topicId",2);K([b({type:Array})],V.prototype,"options",2);K([b({type:String})],V.prototype,"contentId",2);K([b({type:String})],V.prototype,"contentType",2);K([b({type:String})],V.prototype,"contentName",2);K([b({type:String})],V.prototype,"contentPlatform",2);K([b({type:String})],V.prototype,"ou",2);K([b({type:Boolean})],V.prototype,"reviewExists",2);K([b({type:String})],V.prototype,"name",2);K([P()],V.prototype,"loading",2);V=K([ee("uga-rating")],V);var Xo=Object.getOwnPropertyDescriptor,Yo=(t,e,s,r)=>{for(var i=r>1?void 0:r?Xo(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=n(i)||i);return i};let Mt=class extends H{createRenderRoot(){return this}styleTag(){return m`<style>
      uga-return-to-top {
        position: fixed;
        right: 20px;
        bottom: 20px;
        width: 50px;
        height: 50px;
        background-color: rgba(186, 12, 47, 0.7);
        color: #fff;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 24px;
        text-align: center;
        line-height: 50px;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      uga-return-to-top button {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        width: 100%;
        height: 100%;
      }
    </style>`}constructor(){super(),this._scrollToTop=this._scrollToTop.bind(this)}connectedCallback(){super.connectedCallback(),this.addEventListener("click",this._scrollToTop)}disconnectedCallback(){this.removeEventListener("click",this._scrollToTop),super.disconnectedCallback()}_scrollToTop(){const t={top:0,behavior:"smooth"};try{if(window.self!==window.top){const e=window.parent.document;(e.documentElement.scrollTop||e.body.scrollTop)>0?window.parent.scrollTo(t):window.scrollTo(t)}else window.scrollTo(t)}catch{window.scrollTo(t)}}render(){return m`
      ${this.styleTag()}
      <button aria-label="Return to top">⇧</button>
    `}};Mt.styles=Us``;Mt=Yo([ee("uga-return-to-top")],Mt);var Zo=Object.defineProperty,en=Object.getOwnPropertyDescriptor,he=(t,e,s,r)=>{for(var i=r>1?void 0:r?en(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&Zo(e,s,i),i};let ne=class extends H{constructor(){super(...arguments),this.slideshowTitle="Loading",this.slideshowId=null,this.slideshowDescription=null,this.slideshowData=[],this.filename=null,this.activeImage=0,this.imageHeight="500",this.initialLoadHeight="700",this.loaded=!1}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.getDataFile().then(t=>{this.addData(t),this.loaded=!0,this.requestUpdate()}).catch(t=>{console.error("Failed to load slideshow data:",t),console.error("Filename:",this.filename),this.slideshowTitle="Error Loading Slideshow",this.slideshowDescription=`Failed to load: ${this.filename}`,this.loaded=!0,this.requestUpdate()})}async getDataFile(){if(!this.filename)throw new Error("Missing required filename for uga-slideshow");return(await $.get(this.filename)).data}addData(t){this.slideshowTitle=t.title,this.slideshowDescription=t.description,this.slideshowId=t.id,this.slideshowData=t.data}decrementActive(){this.activeImage===0?this.activeImage=this.slideshowData.length-1:this.activeImage=this.activeImage-1}incrementActive(){this.activeImage===this.slideshowData.length-1?this.activeImage=0:this.activeImage=this.activeImage+1}jumpToItem(t){this.activeImage=parseInt(t,10)}render(){if(this.loaded){let t=0;for(let s in this.slideshowData)this.slideshowData[s].id=s,t===this.activeImage?(this.slideshowData[s].displayClass="",this.slideshowData[s].fadeClass="fade"):(this.slideshowData[s].displayClass="util-visually-hidden",this.slideshowData[s].fadeClass=""),t+=1;let e=this.slideshowData.map(s=>m`
          <div class="cmp-slide ${s.displayClass}" aria-hidden="${this.activeImage!==parseInt(s.id||"0")}">
            <div class="cmp-slide__container" style="max-height:${this.imageHeight}px;">
              <div class="cmp-slide__controls">
                <button type="button" alt="Previous Image" class="cmp-slide__button cmp-slide__button-prev" @click="${this.decrementActive}">&#10094;</button>
                <button type="button" alt="Next Image" class="cmp-slide__button cmp-slide__button-next" @click="${this.incrementActive}">&#10095;</button>
              </div>
              <img class="cmp-slide__image ${s.fadeClass}" src="${s.src}" alt="${s.alt}" id="${s.id??""}"/>
            </div>
            <div class="cmp-slide__dots util-margin-bottom-md">
              ${this.slideshowData.map(r=>m`
                ${this.activeImage===parseInt(r.id??"0",10)?m`<button type="button" aria-label="image_${r.id??""}" class="cmp-slide__dot cmp-slide__dot-active util-margin-top-lg util-margin-horiz-sm"></button>`:m`<button type="button" aria-label="image_${r.id??""}" class="cmp-slide__dot util-margin-top-lg util-margin-horiz-sm" @click="${()=>this.jumpToItem(r.id??"0")}"></button>`}
              `)}
            </div>
            <div class="cmp-slide__content">
              <h2 class="cmp-heading-4 util-text-center">${s.title}</h2>
              <p>${nt(s.description)}</p>
            </div>
          </div>
        `);return m`
        <style>
          .cmp-slide { position: relative; order: -1; }
          .cmp-slide__controls { width: 100%; display: flex; justify-content: space-between; position: absolute; top: 45%; z-index: 100; }
          .cmp-slide__image { width: 100%; object-fit: cover; z-index: 99; }
          .cmp-slide__container { overflow: hidden; position: relative; }
          .cmp-slide__button { width: 50px; height: 70px; padding: 10px; border: none; cursor: pointer; background-color: #fff; font-size: 36px; opacity: 50%; }
          .cmp-slide__button:hover { background-color: #dedede; }
          .cmp-slide__button-next { border-radius: 3px 0 0 3px; }
          .cmp-slide__button-prev { border-radius: 0 3px 3px 0; }
          .cmp-slide__dots { width: 100%; display: flex; justify-content: center; }
          .cmp-slide__dot { cursor: pointer; height: 20px; width: 20px; background-color: #DEDEDE; border-radius: 50%; border: none; display: inline-block; transition: background-color 0.6s ease; }
          .cmp-slide__dot-active { background-color: #9EA2A2; }
          .cmp-slide__dot:hover { background-color: #e4002b; }
          .fade { -webkit-animation-name: fade; -webkit-animation-duration: 1.5s; animation-name: fade; animation-duration: 1.5s; }
          @-webkit-keyframes fade { from { opacity: .4 } to { opacity: 1 } }
          @keyframes fade { from { opacity: .4 } to { opacity: 1 } }
        </style>
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div class="cmp-slideshow">
          <h1 class="cmp-heading-1 util-text-center">${this.slideshowTitle}</h1>
          ${e}
        </div>
      `}else return m`
        <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
        <div style="min-height: ${this.initialLoadHeight}px; display: flex; align-items: center; justify-content: center;">
          <p>${this.slideshowTitle}</p>
        </div>
      `}};ne.styles=Us`
    .cmp-slide {
      position: relative;
      order: -1;
    }

    .cmp-slide__controls {
      width: 100%;
      display: flex;
      justify-content: space-between;
      position: absolute;
      top: 45%;
      z-index: 100;
    }

    .cmp-slide__image {
      width: 100%;
      object-fit: cover;
      z-index: 99;
    }

    .cmp-slide__container {
      overflow: hidden;
      position: relative;
    }

    .cmp-slide__button {
      width: 50px;
      height: 70px;
      padding: 10px;
      border: none;
      cursor: pointer;
      background-color: #fff;
      font-size: 36px;
      opacity: 50%;
    }

    .cmp-slide__button:hover {
      background-color: #dedede;
    }
    
    .cmp-slide__button-next {
      border-radius: 3px 0 0 3px;
    }

    .cmp-slide__button-prev {
      border-radius: 0 3px 3px 0;      
    }

    .cmp-slide__dots {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .cmp-slide__dot {
      cursor: pointer;
      height: 20px;
      width: 20px;
      background-color: #DEDEDE;
      border-radius: 50%;
      border: none;
      display: inline-block;
      transition: background-color 0.6s ease;
    }

    .cmp-slide__dot-active {
      background-color: #9EA2A2;
    }

    .cmp-slide__dot:hover {
      background-color: #e4002b;
    }

    /* Fading animation */
    .fade {
      -webkit-animation-name: fade;
      -webkit-animation-duration: 1.5s;
      animation-name: fade;
      animation-duration: 1.5s;
    }
    @-webkit-keyframes fade {
      from {
        opacity: .4
      }
      to {
        opacity: 1
      }
    }
    @keyframes fade {
      from {
        opacity: .4
      }
      to {
        opacity: 1
      }
    }
  `;he([b({type:String})],ne.prototype,"slideshowTitle",2);he([b({type:String})],ne.prototype,"slideshowId",2);he([b({type:String})],ne.prototype,"slideshowDescription",2);he([b({type:Array})],ne.prototype,"slideshowData",2);he([b({type:String})],ne.prototype,"filename",2);he([b({type:Number})],ne.prototype,"activeImage",2);he([b({type:String})],ne.prototype,"imageHeight",2);he([b({type:String})],ne.prototype,"initialLoadHeight",2);he([b({type:Boolean})],ne.prototype,"loaded",2);ne=he([ee("uga-slideshow")],ne);var tn=Object.defineProperty,sn=Object.getOwnPropertyDescriptor,Ve=(t,e,s,r)=>{for(var i=r>1?void 0:r?sn(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&tn(e,s,i),i};let Oe=class extends H{constructor(){super(...arguments),this.tabs=[],this.type="",this.filename="",this.program="",this.loaded=!1,this.activeTab=0}createRenderRoot(){return this}setActiveTab(t){this.activeTab=t,this.requestUpdate()}async init(){await this.getDataFile()}async getDataFile(){if(this.type==="local"||this.type==="program"){const t=await Me(this.type,this.filename,this.program);this.tabs=t.data,this.loaded=!0,this.requestUpdate()}}render(){if(this.loaded)return m`
			<div class="cmp-tabs">
			  <div class="cmp-tabs__nav" role="tablist">
				${Array.isArray(this.tabs)&&this.tabs.length>0?this.tabs.map((t,e)=>m`
				<button class="cmp-tabs__nav-item ${this.activeTab===e?"cmp-tabs__nav-item--active":""}"
						data-tab="tab-${e}"
						role="tab"
						tabindex="${this.activeTab===e?"0":"-1"}"
						aria-selected="${this.activeTab===e?"true":"false"}"
						aria-controls="tab-${e}"
						@click="${()=>this.setActiveTab(e)}">
				  ${t.title}
				</button>
				`):""}
			  </div>
			  <div class="cmp-tabs__content">
				${Array.isArray(this.tabs)&&this.tabs.length>0?this.tabs.map((t,e)=>m`
				<div class="cmp-tabs__content-item ${this.activeTab===e?"cmp-tabs__content-item--active":""}"
					 id="tab-${e}"
					 role="tabpanel"
					 aria-labelledby="tab-${e}">
				  <p>${nt(t.body)}</p>
				</div>
				`):""}
			  </div>
			</div>
		  `;this.init()}};Ve([b({type:Array})],Oe.prototype,"tabs",2);Ve([b({type:String})],Oe.prototype,"type",2);Ve([b({type:String})],Oe.prototype,"filename",2);Ve([b({type:String})],Oe.prototype,"program",2);Ve([b({type:Boolean})],Oe.prototype,"loaded",2);Oe=Ve([ee("uga-tabs")],Oe);var rn=Object.getOwnPropertyDescriptor,on=(t,e,s,r)=>{for(var i=r>1?void 0:r?rn(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=n(i)||i);return i};let Cs=class extends H{createRenderRoot(){return this}firstUpdated(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>this.buildTOC()):this.buildTOC()}buildTOC(){const t=this.querySelector("#toc-list");if(!t)return;const e=Array.from(document.querySelectorAll("h2, h3")),s=new Set;e.forEach(o=>{o.id&&s.add(o.id)});let r=null;const i={1:t};e.forEach(o=>{if(o.closest("#table-of-contents"))return;const n=parseInt(o.tagName[1]);if(!o.id){const c=(o.textContent||"section").toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-");let d=c||"section",p=2;for(;s.has(d)||document.getElementById(d);)d=`${c}-${p++}`;o.id=d,s.add(d)}r===null&&(r=n,i[n]=t);const a=document.createElement("li");a.className="util-margin-vert-sm";const l=document.createElement("a");l.href=`#${o.id}`,l.textContent=o.textContent,a.appendChild(l),l.addEventListener("click",c=>{c.preventDefault();const d=document.getElementById(o.id);d&&d.scrollIntoView({behavior:"smooth"})});for(let c=n+1;c<=6;c++)i[c]&&delete i[c];if(n===r)i[r].appendChild(a);else if(n>r){let c=n-1;for(;c>=r&&!i[c];)c--;if(!i[n]){const d=document.createElement("ul"),p=i[c];p&&p.lastElementChild&&(p.lastElementChild.appendChild(d),i[n]=d)}i[n]&&i[n].appendChild(a)}})}render(){return m`
      <!-- Local styles for this element, now in the light DOM -->
      <style>
        #table-of-contents {
          border: 1px solid #ccc;
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
                      0 6px 20px 0 rgba(0, 0, 0, 0.19);
        }
      </style>

      <div class="util-pad-all-md util-margin-bottom-lg util-background-odyssey" id="table-of-contents">
        <h2>Contents</h2>
        <ul class="util-pad-left-lg util-delist" id="toc-list"></ul>
      </div>
    `}};Cs=on([ee("uga-toc")],Cs);var nn=Object.defineProperty,an=Object.getOwnPropertyDescriptor,te=(t,e,s,r)=>{for(var i=r>1?void 0:r?an(e,s):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(i=(r?n(e,s,i):n(i))||i);return r&&i&&nn(e,s,i),i};let X=class extends H{constructor(){super(...arguments),this.ou=null,this.videodata={data:{}},this.type="",this.filename="",this.program="",this.loaded=!1,this.host="",this.videoid="",this.playerid="",this.versions={},this.videos=[],this.includeRating=!1,this.name="",this.uiconfid="",this.domain=null,this.kalturaScriptLoaded=!1,this.playerInstances=new Map,this.videoNames=new Map,this.componentId=`video_${Math.random().toString(36).substr(2,9)}`}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.ou=ve(),this.playerid===""?(this.playerid="1574196844",this.uiconfid="57494843"):this.uiconfid=this.playerid,this.videoid!==""?(this.videos.push(this.videoid),this.loaded=!0,this.requestUpdate()):this.getDataFile().then(()=>{const t=this.videodata?.data;if(Array.isArray(t)){for(let e=0;e<t.length;e++)this.videos.push(t[e]);this.loaded=!0,this.requestUpdate()}else t&&typeof t=="object"?Pe().then(e=>{if(this.addVersions(e),!this.ou){this.loaded=!0,this.requestUpdate();return}rt(this.ou,this.versions.le).then(s=>{for(let r in s)if(s[r].Username in t&&s[r].RoleId===195)for(let i in t[s[r].Username])this.videos.push(t[s[r].Username][i]);this.loaded=!0,this.requestUpdate()}).catch(s=>{console.error("Failed to get classlist:",s),this.loaded=!0,this.requestUpdate()})}).catch(e=>{console.error("Failed to get API versions:",e),this.loaded=!0,this.requestUpdate()}):(console.error("Invalid video data structure:",t),this.loaded=!0,this.requestUpdate())}).catch(t=>{console.error("Failed to load video data file:",t),this.loaded=!0,this.requestUpdate()})}async getDataFile(){(this.type==="local"||this.type==="program")&&(this.videodata=await Me(this.type,this.filename,this.program),this.requestUpdate())}addVersions(t){for(let e in t)this.versions[e]=t[e]}loadKalturaScript(){return new Promise((t,e)=>{if(this.kalturaScriptLoaded||window.KalturaPlayer){this.kalturaScriptLoaded=!0,t();return}const s=document.createElement("script");s.src=`https://cdnapisec.kaltura.com/p/1727411/embedPlaykitJs/uiconf_id/${this.uiconfid}`,s.type="text/javascript",s.onload=()=>{this.kalturaScriptLoaded=!0,t()},s.onerror=()=>{console.error("Failed to load KalturaPlayer script"),e(new Error("KalturaPlayer script failed to load"))},document.head.appendChild(s)})}async initKalturaPlayer(t,e){try{if(this.playerInstances.has(t))return;const s=document.getElementById(e);if(!s){console.warn(`Container element not found for video ${t}, retrying...`),setTimeout(()=>this.initKalturaPlayer(t,e),100);return}if(s.hasChildNodes()&&s.children.length>0)return;await this.loadKalturaScript();const r=window.KalturaPlayer.setup({targetId:e,provider:{partnerId:1727411,uiConfId:this.uiconfid},ui:{components:{logo:{disabled:!0}}}});r.loadMedia({entryId:t}),this.playerInstances.set(t,r)}catch(s){console.error(`Failed to initialize Kaltura player for video ${t}:`,s)}}async getKalturaSession(){try{const t=new URLSearchParams;t.append("widgetId","_1727411"),t.append("format","1");const{data:e}=await $.post("https://www.kaltura.com/api_v3/service/session/action/startWidgetSession",t);return e?.ks??null}catch{return null}}async fetchKalturaName(t){try{const e=await this.getKalturaSession();if(!e)return null;const s=new URLSearchParams;s.append("entryId",t),s.append("ks",e),s.append("format","1");const{data:r}=await $.post("https://www.kaltura.com/api_v3/service/media/action/get",s);return r?.name??null}catch{return null}}async ensureVideoName(t){if(this.videoNames.has(t))return;const e=await this.fetchKalturaName(t);e&&(this.videoNames.set(t,e),this.requestUpdate())}kalturaCode(t){const e=`kaltura_player_${this.componentId}_${t}`;return this.ensureVideoName(t),m`
      <style>
        .cmp-video::after {
          content: none !important;
          display: none !important;
          padding-top: 0 !important;
        }
        .cmp-video__container {
          width: 100%;
          background: #000;
        }
        .cmp-video__container > div {
          width: 100%;
          height: auto;
        }
      </style>
      <div class="cmp-video util-margin-top-lg">
        <div class="cmp-video__container">
          <div id="${e}" style="width: 100%; aspect-ratio: 16 / 9;"></div>
        </div>
      </div>
      ${this.includeRating?m`<uga-rating .contentId="${t}" contentType="video" .ou=${this.ou} .contentName=${this.videoNames.get(t)??this.name} contentPlatform="kaltura"></uga-rating>`:m``}
    `}youtubeCode(t){return m`
    <div class="cmp-video util-margin-top-lg">
        <iframe class="cmp-video__embed" width="560" height="315" src="https://www.youtube.com/embed/${t}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
    ${this.includeRating?m`<uga-rating .contentId="${t}" contentType="video" .ou=${this.ou} .contentName=${this.name} contentPlatform="youtube"></uga-rating>`:m``}
    `}render(){if(this.loaded){const t=[];if(this.host===""||this.host.toLowerCase()==="kaltura")for(let e in this.videos)t.push(this.kalturaCode(this.videos[e]));else if(this.host.toLowerCase()==="youtube")for(let e in this.videos)t.push(this.youtubeCode(this.videos[e]));return t.length>0?m`
          <link rel="stylesheet" href="https://design.online.uga.edu/css/base.css" />
          ${t.map(e=>m`${e}`)}
        `:m`<p>No videos available.</p>`}return m`<p>Loading video...</p>`}updated(t){(t.has("loaded")||t.has("videos"))&&this.loaded&&this.videos.length>0&&this.updateComplete.then(()=>{this.videos.forEach(e=>{if(!this.playerInstances.has(e)){const s=`kaltura_player_${this.componentId}_${e}`;this.initKalturaPlayer(e,s)}})})}};te([b({type:String})],X.prototype,"ou",2);te([b({type:Object})],X.prototype,"videodata",2);te([b({type:String})],X.prototype,"type",2);te([b({type:String})],X.prototype,"filename",2);te([b({type:String})],X.prototype,"program",2);te([b({type:Boolean})],X.prototype,"loaded",2);te([b({type:String})],X.prototype,"host",2);te([b({type:String})],X.prototype,"videoid",2);te([b({type:String})],X.prototype,"playerid",2);te([b({type:Object})],X.prototype,"versions",2);te([b({type:Array})],X.prototype,"videos",2);te([b({type:Boolean})],X.prototype,"includeRating",2);te([b({type:String})],X.prototype,"name",2);X=te([ee("uga-video")],X);
//# sourceMappingURL=uga-components.js.map
