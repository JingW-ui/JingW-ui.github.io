(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const vh=1024,Nd=["axes","volcano","gates"],iu={axes:"THE PENDULUM VAULT",volcano:"THE MOLTEN ARTERY",gates:"THE SHIFTING SEALS"},Vn=[25600];for(;Vn.at(-1)<95600;){const n=Vn.at(-1),e=Math.max(2560,7168-Math.floor((n-25600)/14e3)*1024);Vn.push(n+e)}const go=Vn.at(-1);function fi(n,e=0){if(n<Vn[0]-e)return null;let t;n>=go?t=Vn.length-1+Math.floor((n-go)/2560):(t=Vn.findIndex(i=>i>n)-1,t<0&&(t=0));for(let i=Math.max(0,t);i<=t+1;i++){const s=i<Vn.length?Vn[i]:go+(i-Vn.length+1)*2560;if(n>=s-e&&n<s+vh)return{id:i,start:s,end:s+vh,type:Nd[i%3]}}return null}const _c=n=>fi(n);function Fd(n){return Array.from({length:8},(e,t)=>({id:t,s:n.start+128+t*112,phase:t*1.13}))}function Od(n,e){const t=Math.sin(e*1.45+n.phase)*1.02,i=n.id%2?45:32;return{angle:t,pivot:i,x:Math.sin(t)*24,y:i-Math.cos(t)*24}}function su(n,e){return{x:Math.sin(e*.68+n.phase)*11,y:15+Math.sin(e*.51+n.phase)*4,width:20,height:19}}function Bd(n,e){const t=su(n,e),i=t.x-t.width/2,s=t.x+t.width/2,r=t.y-t.height/2,a=t.y+t.height/2;return[{x:(-29+i)/2,bottom:0,width:i+29,height:32},{x:(s+29)/2,bottom:0,width:29-s,height:32},{x:t.x,bottom:0,width:t.width,height:r},{x:t.x,bottom:a,width:t.width,height:32-a}].map(o=>({...o,s:n.s,depth:3,flatBase:!0}))}/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Mc="185",zd=0,_h=1,kd=2,Ta=1,ru=2,mr=3,ui=0,nn=1,Sn=2,ci=0,Ns=1,Ar=2,Mh=3,yh=4,Gd=5,Zi=100,Hd=101,Vd=102,Wd=103,Xd=104,Yd=200,qd=201,$d=202,Kd=203,Ml=204,yl=205,Zd=206,Jd=207,Qd=208,jd=209,ep=210,tp=211,np=212,ip=213,sp=214,bl=0,Sl=1,El=2,ks=3,wl=4,Tl=5,Al=6,Rl=7,yc=0,rp=1,ap=2,Dn=0,au=1,ou=2,lu=3,cu=4,hu=5,fu=6,uu=7,du=300,rs=301,Gs=302,xo=303,vo=304,eo=306,Ba=1e3,ai=1001,Cl=1002,Qt=1003,op=1004,Xr=1005,Vt=1006,_o=1007,Ci=1008,fn=1009,pu=1010,mu=1011,Rr=1012,bc=1013,Nn=1014,Ln=1015,Kn=1016,Sc=1017,Ec=1018,Cr=1020,gu=35902,xu=35899,vu=1021,_u=1022,En=1023,di=1026,ji=1027,wc=1028,Tc=1029,as=1030,Ac=1031,Rc=1033,Aa=33776,Ra=33777,Ca=33778,Pa=33779,Pl=35840,Ll=35841,Il=35842,Dl=35843,Ul=36196,Nl=37492,Fl=37496,Ol=37488,Bl=37489,za=37490,zl=37491,kl=37808,Gl=37809,Hl=37810,Vl=37811,Wl=37812,Xl=37813,Yl=37814,ql=37815,$l=37816,Kl=37817,Zl=37818,Jl=37819,Ql=37820,jl=37821,ec=36492,tc=36494,nc=36495,ic=36283,sc=36284,ka=36285,rc=36286,lp=3200,Ga=0,cp=1,ii="",mn="srgb",Ha="srgb-linear",Va="linear",xt="srgb",xs=7680,bh=519,hp=512,fp=513,up=514,Cc=515,dp=516,pp=517,Pc=518,mp=519,Sh=35044,es=35048,Eh="300 es",qn=2e3,Pr=2001;function gp(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Wa(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function xp(){const n=Wa("canvas");return n.style.display="block",n}const wh={};function Th(...n){const e="THREE."+n.shift();console.log(e,...n)}function Mu(n){const e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Ve(...n){n=Mu(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function ft(...n){n=Mu(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function Fs(...n){const e=n.join(" ");e in wh||(wh[e]=!0,Ve(...n))}function vp(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}const _p={[bl]:Sl,[El]:Al,[wl]:Rl,[ks]:Tl,[Sl]:bl,[Al]:El,[Rl]:wl,[Tl]:ks};class hs{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const s=i[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const en=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Ah=1234567;const Mr=Math.PI/180,Lr=180/Math.PI;function fs(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(en[n&255]+en[n>>8&255]+en[n>>16&255]+en[n>>24&255]+"-"+en[e&255]+en[e>>8&255]+"-"+en[e>>16&15|64]+en[e>>24&255]+"-"+en[t&63|128]+en[t>>8&255]+"-"+en[t>>16&255]+en[t>>24&255]+en[i&255]+en[i>>8&255]+en[i>>16&255]+en[i>>24&255]).toLowerCase()}function it(n,e,t){return Math.max(e,Math.min(t,n))}function Lc(n,e){return(n%e+e)%e}function Mp(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function yp(n,e,t){return n!==e?(t-n)/(e-n):0}function yr(n,e,t){return(1-t)*n+t*e}function bp(n,e,t,i){return yr(n,e,1-Math.exp(-t*i))}function Sp(n,e=1){return e-Math.abs(Lc(n,e*2)-e)}function Ep(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function wp(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function Tp(n,e){return n+Math.floor(Math.random()*(e-n+1))}function Ap(n,e){return n+Math.random()*(e-n)}function Rp(n){return n*(.5-Math.random())}function Cp(n){n!==void 0&&(Ah=n);let e=Ah+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Pp(n){return n*Mr}function Lp(n){return n*Lr}function Ip(n){return(n&n-1)===0&&n!==0}function Dp(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Up(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Np(n,e,t,i,s){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+i)/2),f=a((e+i)/2),u=r((e-i)/2),h=a((e-i)/2),d=r((i-e)/2),m=a((i-e)/2);switch(s){case"XYX":n.set(o*f,l*u,l*h,o*c);break;case"YZY":n.set(l*h,o*f,l*u,o*c);break;case"ZXZ":n.set(l*u,l*h,o*f,o*c);break;case"XZX":n.set(o*f,l*m,l*d,o*c);break;case"YXY":n.set(l*d,o*f,l*m,o*c);break;case"ZYZ":n.set(l*m,l*d,o*f,o*c);break;default:Ve("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Ds(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function rn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const Di={DEG2RAD:Mr,RAD2DEG:Lr,generateUUID:fs,clamp:it,euclideanModulo:Lc,mapLinear:Mp,inverseLerp:yp,lerp:yr,damp:bp,pingpong:Sp,smoothstep:Ep,smootherstep:wp,randInt:Tp,randFloat:Ap,randFloatSpread:Rp,seededRandom:Cp,degToRad:Pp,radToDeg:Lp,isPowerOfTwo:Ip,ceilPowerOfTwo:Dp,floorPowerOfTwo:Up,setQuaternionFromProperEuler:Np,normalize:rn,denormalize:Ds},sh=class sh{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(it(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(it(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};sh.prototype.isVector2=!0;let oe=sh;class $s{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let l=i[s+0],c=i[s+1],f=i[s+2],u=i[s+3],h=r[a+0],d=r[a+1],m=r[a+2],_=r[a+3];if(u!==_||l!==h||c!==d||f!==m){let g=l*h+c*d+f*m+u*_;g<0&&(h=-h,d=-d,m=-m,_=-_,g=-g);let p=1-o;if(g<.9995){const M=Math.acos(g),x=Math.sin(M);p=Math.sin(p*M)/x,o=Math.sin(o*M)/x,l=l*p+h*o,c=c*p+d*o,f=f*p+m*o,u=u*p+_*o}else{l=l*p+h*o,c=c*p+d*o,f=f*p+m*o,u=u*p+_*o;const M=1/Math.sqrt(l*l+c*c+f*f+u*u);l*=M,c*=M,f*=M,u*=M}}e[t]=l,e[t+1]=c,e[t+2]=f,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,s,r,a){const o=i[s],l=i[s+1],c=i[s+2],f=i[s+3],u=r[a],h=r[a+1],d=r[a+2],m=r[a+3];return e[t]=o*m+f*u+l*d-c*h,e[t+1]=l*m+f*h+c*u-o*d,e[t+2]=c*m+f*d+o*h-l*u,e[t+3]=f*m-o*u-l*h-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),f=o(s/2),u=o(r/2),h=l(i/2),d=l(s/2),m=l(r/2);switch(a){case"XYZ":this._x=h*f*u+c*d*m,this._y=c*d*u-h*f*m,this._z=c*f*m+h*d*u,this._w=c*f*u-h*d*m;break;case"YXZ":this._x=h*f*u+c*d*m,this._y=c*d*u-h*f*m,this._z=c*f*m-h*d*u,this._w=c*f*u+h*d*m;break;case"ZXY":this._x=h*f*u-c*d*m,this._y=c*d*u+h*f*m,this._z=c*f*m+h*d*u,this._w=c*f*u-h*d*m;break;case"ZYX":this._x=h*f*u-c*d*m,this._y=c*d*u+h*f*m,this._z=c*f*m-h*d*u,this._w=c*f*u+h*d*m;break;case"YZX":this._x=h*f*u+c*d*m,this._y=c*d*u+h*f*m,this._z=c*f*m-h*d*u,this._w=c*f*u-h*d*m;break;case"XZY":this._x=h*f*u-c*d*m,this._y=c*d*u-h*f*m,this._z=c*f*m+h*d*u,this._w=c*f*u+h*d*m;break;default:Ve("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],f=t[6],u=t[10],h=i+o+u;if(h>0){const d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(f-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(i>o&&i>u){const d=2*Math.sqrt(1+i-o-u);this._w=(f-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>u){const d=2*Math.sqrt(1+o-i-u);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+f)/d}else{const d=2*Math.sqrt(1+u-i-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+f)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(it(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,f=t._w;return this._x=i*f+a*o+s*c-r*l,this._y=s*f+a*l+r*o-i*c,this._z=r*f+a*c+i*l-s*o,this._w=a*f-i*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),f=Math.sin(c);l=Math.sin(l*c)/f,t=Math.sin(t*c)/f,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const rh=class rh{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Rh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Rh.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*i),f=2*(o*t-r*s),u=2*(r*i-a*t);return this.x=t+l*c+a*u-o*f,this.y=i+l*f+o*c-r*u,this.z=s+l*u+r*f-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this.z=it(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this.z=it(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(it(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-i*l,this.z=i*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Mo.copy(this).projectOnVector(e),this.sub(Mo)}reflect(e){return this.sub(Mo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(it(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};rh.prototype.isVector3=!0;let C=rh;const Mo=new C,Rh=new $s,ah=class ah{constructor(e,t,i,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c)}set(e,t,i,s,r,a,o,l,c){const f=this.elements;return f[0]=e,f[1]=s,f[2]=o,f[3]=t,f[4]=r,f[5]=l,f[6]=i,f[7]=a,f[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],f=i[4],u=i[7],h=i[2],d=i[5],m=i[8],_=s[0],g=s[3],p=s[6],M=s[1],x=s[4],v=s[7],E=s[2],w=s[5],R=s[8];return r[0]=a*_+o*M+l*E,r[3]=a*g+o*x+l*w,r[6]=a*p+o*v+l*R,r[1]=c*_+f*M+u*E,r[4]=c*g+f*x+u*w,r[7]=c*p+f*v+u*R,r[2]=h*_+d*M+m*E,r[5]=h*g+d*x+m*w,r[8]=h*p+d*v+m*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],f=e[8];return t*a*f-t*o*c-i*r*f+i*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],f=e[8],u=f*a-o*c,h=o*l-f*r,d=c*r-a*l,m=t*u+i*h+s*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/m;return e[0]=u*_,e[1]=(s*c-f*i)*_,e[2]=(o*i-s*a)*_,e[3]=h*_,e[4]=(f*t-s*l)*_,e[5]=(s*r-o*t)*_,e[6]=d*_,e[7]=(i*l-c*t)*_,e[8]=(a*t-i*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Fs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(yo.makeScale(e,t)),this}rotate(e){return Fs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(yo.makeRotation(-e)),this}translate(e,t){return Fs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(yo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};ah.prototype.isMatrix3=!0;let Ke=ah;const yo=new Ke,Ch=new Ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ph=new Ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Fp(){const n={enabled:!0,workingColorSpace:Ha,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===xt&&(s.r=hi(s.r),s.g=hi(s.g),s.b=hi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===xt&&(s.r=Os(s.r),s.g=Os(s.g),s.b=Os(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ii?Va:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Fs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Fs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Ha]:{primaries:e,whitePoint:i,transfer:Va,toXYZ:Ch,fromXYZ:Ph,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:mn},outputColorSpaceConfig:{drawingBufferColorSpace:mn}},[mn]:{primaries:e,whitePoint:i,transfer:xt,toXYZ:Ch,fromXYZ:Ph,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:mn}}}),n}const ot=Fp();function hi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Os(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let vs;class Op{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{vs===void 0&&(vs=Wa("canvas")),vs.width=e.width,vs.height=e.height;const s=vs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=vs}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Wa("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=hi(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(hi(t[i]/255)*255):t[i]=hi(t[i]);return{data:t,width:e.width,height:e.height}}else return Ve("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Bp=0;class Ic{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Bp++}),this.uuid=fs(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(bo(s[a].image)):r.push(bo(s[a]))}else r=bo(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function bo(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Op.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ve("Texture: Unable to serialize Texture."),{})}let zp=0;const So=new C;class ln extends hs{constructor(e=ln.DEFAULT_IMAGE,t=ln.DEFAULT_MAPPING,i=ai,s=ai,r=Vt,a=Ci,o=En,l=fn,c=ln.DEFAULT_ANISOTROPY,f=ii){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:zp++}),this.uuid=fs(),this.name="",this.source=new Ic(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new oe(0,0),this.repeat=new oe(1,1),this.center=new oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(So).x}get height(){return this.source.getSize(So).y}get depth(){return this.source.getSize(So).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Ve(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ve(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==du)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ba:e.x=e.x-Math.floor(e.x);break;case ai:e.x=e.x<0?0:1;break;case Cl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ba:e.y=e.y-Math.floor(e.y);break;case ai:e.y=e.y<0?0:1;break;case Cl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}ln.DEFAULT_IMAGE=null;ln.DEFAULT_MAPPING=du;ln.DEFAULT_ANISOTROPY=1;const oh=class oh{constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,c=l[0],f=l[4],u=l[8],h=l[1],d=l[5],m=l[9],_=l[2],g=l[6],p=l[10];if(Math.abs(f-h)<.01&&Math.abs(u-_)<.01&&Math.abs(m-g)<.01){if(Math.abs(f+h)<.1&&Math.abs(u+_)<.1&&Math.abs(m+g)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const x=(c+1)/2,v=(d+1)/2,E=(p+1)/2,w=(f+h)/4,R=(u+_)/4,y=(m+g)/4;return x>v&&x>E?x<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(x),s=w/i,r=R/i):v>E?v<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),i=w/s,r=y/s):E<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),i=R/r,s=y/r),this.set(i,s,r,t),this}let M=Math.sqrt((g-m)*(g-m)+(u-_)*(u-_)+(h-f)*(h-f));return Math.abs(M)<.001&&(M=1),this.x=(g-m)/M,this.y=(u-_)/M,this.z=(h-f)/M,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this.z=it(this.z,e.z,t.z),this.w=it(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this.z=it(this.z,e,t),this.w=it(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(it(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};oh.prototype.isVector4=!0;let At=oh;class kp extends hs{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Vt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new At(0,0,e,t),this.scissorTest=!1,this.viewport=new At(0,0,e,t),this.textures=[];const s={width:e,height:t,depth:i.depth},r=new ln(s),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Vt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Ic(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class vn extends kp{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class yu extends ln{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Qt,this.minFilter=Qt,this.wrapR=ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Gp extends ln{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Qt,this.minFilter=Qt,this.wrapR=ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const ja=class ja{constructor(e,t,i,s,r,a,o,l,c,f,u,h,d,m,_,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c,f,u,h,d,m,_,g)}set(e,t,i,s,r,a,o,l,c,f,u,h,d,m,_,g){const p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=f,p[10]=u,p[14]=h,p[3]=d,p[7]=m,p[11]=_,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ja().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,i=e.elements,s=1/_s.setFromMatrixColumn(e,0).length(),r=1/_s.setFromMatrixColumn(e,1).length(),a=1/_s.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),f=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const h=a*f,d=a*u,m=o*f,_=o*u;t[0]=l*f,t[4]=-l*u,t[8]=c,t[1]=d+m*c,t[5]=h-_*c,t[9]=-o*l,t[2]=_-h*c,t[6]=m+d*c,t[10]=a*l}else if(e.order==="YXZ"){const h=l*f,d=l*u,m=c*f,_=c*u;t[0]=h+_*o,t[4]=m*o-d,t[8]=a*c,t[1]=a*u,t[5]=a*f,t[9]=-o,t[2]=d*o-m,t[6]=_+h*o,t[10]=a*l}else if(e.order==="ZXY"){const h=l*f,d=l*u,m=c*f,_=c*u;t[0]=h-_*o,t[4]=-a*u,t[8]=m+d*o,t[1]=d+m*o,t[5]=a*f,t[9]=_-h*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const h=a*f,d=a*u,m=o*f,_=o*u;t[0]=l*f,t[4]=m*c-d,t[8]=h*c+_,t[1]=l*u,t[5]=_*c+h,t[9]=d*c-m,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const h=a*l,d=a*c,m=o*l,_=o*c;t[0]=l*f,t[4]=_-h*u,t[8]=m*u+d,t[1]=u,t[5]=a*f,t[9]=-o*f,t[2]=-c*f,t[6]=d*u+m,t[10]=h-_*u}else if(e.order==="XZY"){const h=a*l,d=a*c,m=o*l,_=o*c;t[0]=l*f,t[4]=-u,t[8]=c*f,t[1]=h*u+_,t[5]=a*f,t[9]=d*u-m,t[2]=m*u-d,t[6]=o*f,t[10]=_*u+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Hp,e,Vp)}lookAt(e,t,i){const s=this.elements;return dn.subVectors(e,t),dn.lengthSq()===0&&(dn.z=1),dn.normalize(),_i.crossVectors(i,dn),_i.lengthSq()===0&&(Math.abs(i.z)===1?dn.x+=1e-4:dn.z+=1e-4,dn.normalize(),_i.crossVectors(i,dn)),_i.normalize(),Yr.crossVectors(dn,_i),s[0]=_i.x,s[4]=Yr.x,s[8]=dn.x,s[1]=_i.y,s[5]=Yr.y,s[9]=dn.y,s[2]=_i.z,s[6]=Yr.z,s[10]=dn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],f=i[1],u=i[5],h=i[9],d=i[13],m=i[2],_=i[6],g=i[10],p=i[14],M=i[3],x=i[7],v=i[11],E=i[15],w=s[0],R=s[4],y=s[8],T=s[12],P=s[1],L=s[5],O=s[9],$=s[13],Z=s[2],z=s[6],K=s[10],G=s[14],ee=s[3],re=s[7],de=s[11],he=s[15];return r[0]=a*w+o*P+l*Z+c*ee,r[4]=a*R+o*L+l*z+c*re,r[8]=a*y+o*O+l*K+c*de,r[12]=a*T+o*$+l*G+c*he,r[1]=f*w+u*P+h*Z+d*ee,r[5]=f*R+u*L+h*z+d*re,r[9]=f*y+u*O+h*K+d*de,r[13]=f*T+u*$+h*G+d*he,r[2]=m*w+_*P+g*Z+p*ee,r[6]=m*R+_*L+g*z+p*re,r[10]=m*y+_*O+g*K+p*de,r[14]=m*T+_*$+g*G+p*he,r[3]=M*w+x*P+v*Z+E*ee,r[7]=M*R+x*L+v*z+E*re,r[11]=M*y+x*O+v*K+E*de,r[15]=M*T+x*$+v*G+E*he,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],f=e[2],u=e[6],h=e[10],d=e[14],m=e[3],_=e[7],g=e[11],p=e[15],M=l*d-c*h,x=o*d-c*u,v=o*h-l*u,E=a*d-c*f,w=a*h-l*f,R=a*u-o*f;return t*(_*M-g*x+p*v)-i*(m*M-g*E+p*w)+s*(m*x-_*E+p*R)-r*(m*v-_*w+g*R)}determinantAffine(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],f=e[10];return t*(a*f-o*c)-i*(r*f-o*l)+s*(r*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],f=e[8],u=e[9],h=e[10],d=e[11],m=e[12],_=e[13],g=e[14],p=e[15],M=t*o-i*a,x=t*l-s*a,v=t*c-r*a,E=i*l-s*o,w=i*c-r*o,R=s*c-r*l,y=f*_-u*m,T=f*g-h*m,P=f*p-d*m,L=u*g-h*_,O=u*p-d*_,$=h*p-d*g,Z=M*$-x*O+v*L+E*P-w*T+R*y;if(Z===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const z=1/Z;return e[0]=(o*$-l*O+c*L)*z,e[1]=(s*O-i*$-r*L)*z,e[2]=(_*R-g*w+p*E)*z,e[3]=(h*w-u*R-d*E)*z,e[4]=(l*P-a*$-c*T)*z,e[5]=(t*$-s*P+r*T)*z,e[6]=(g*v-m*R-p*x)*z,e[7]=(f*R-h*v+d*x)*z,e[8]=(a*O-o*P+c*y)*z,e[9]=(i*P-t*O-r*y)*z,e[10]=(m*w-_*v+p*M)*z,e[11]=(u*v-f*w-d*M)*z,e[12]=(o*T-a*L-l*y)*z,e[13]=(t*L-i*T+s*y)*z,e[14]=(_*x-m*E-g*M)*z,e[15]=(f*E-u*x+h*M)*z,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,l=e.z,c=r*a,f=r*o;return this.set(c*a+i,c*o-s*l,c*l+s*o,0,c*o+s*l,f*o+i,f*l-s*a,0,c*l-s*o,f*l+s*a,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,f=a+a,u=o+o,h=r*c,d=r*f,m=r*u,_=a*f,g=a*u,p=o*u,M=l*c,x=l*f,v=l*u,E=i.x,w=i.y,R=i.z;return s[0]=(1-(_+p))*E,s[1]=(d+v)*E,s[2]=(m-x)*E,s[3]=0,s[4]=(d-v)*w,s[5]=(1-(h+p))*w,s[6]=(g+M)*w,s[7]=0,s[8]=(m+x)*R,s[9]=(g-M)*R,s[10]=(1-(h+_))*R,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let a=_s.set(s[0],s[1],s[2]).length();const o=_s.set(s[4],s[5],s[6]).length(),l=_s.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Tn.copy(this);const c=1/a,f=1/o,u=1/l;return Tn.elements[0]*=c,Tn.elements[1]*=c,Tn.elements[2]*=c,Tn.elements[4]*=f,Tn.elements[5]*=f,Tn.elements[6]*=f,Tn.elements[8]*=u,Tn.elements[9]*=u,Tn.elements[10]*=u,t.setFromRotationMatrix(Tn),i.x=a,i.y=o,i.z=l,this}makePerspective(e,t,i,s,r,a,o=qn,l=!1){const c=this.elements,f=2*r/(t-e),u=2*r/(i-s),h=(t+e)/(t-e),d=(i+s)/(i-s);let m,_;if(l)m=r/(a-r),_=a*r/(a-r);else if(o===qn)m=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===Pr)m=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=u,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=qn,l=!1){const c=this.elements,f=2/(t-e),u=2/(i-s),h=-(t+e)/(t-e),d=-(i+s)/(i-s);let m,_;if(l)m=1/(a-r),_=a/(a-r);else if(o===qn)m=-2/(a-r),_=-(a+r)/(a-r);else if(o===Pr)m=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=f,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=u,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};ja.prototype.isMatrix4=!0;let bt=ja;const _s=new C,Tn=new bt,Hp=new C(0,0,0),Vp=new C(1,1,1),_i=new C,Yr=new C,dn=new C,Lh=new bt,Ih=new $s;class Oi{constructor(e=0,t=0,i=0,s=Oi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],f=s[9],u=s[2],h=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(it(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-f,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-it(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(it(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-it(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(it(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-it(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-f,d),this._y=0);break;default:Ve("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Lh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Lh,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ih.setFromEuler(this),this.setFromQuaternion(Ih,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Oi.DEFAULT_ORDER="XYZ";class bu{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Wp=0;const Dh=new C,Ms=new $s,Jn=new bt,qr=new C,tr=new C,Xp=new C,Yp=new $s,Uh=new C(1,0,0),Nh=new C(0,1,0),Fh=new C(0,0,1),Oh={type:"added"},qp={type:"removed"},ys={type:"childadded",child:null},Eo={type:"childremoved",child:null};class Rt extends hs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Wp++}),this.uuid=fs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Rt.DEFAULT_UP.clone();const e=new C,t=new Oi,i=new $s,s=new C(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new bt},normalMatrix:{value:new Ke}}),this.matrix=new bt,this.matrixWorld=new bt,this.matrixAutoUpdate=Rt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new bu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ms.setFromAxisAngle(e,t),this.quaternion.multiply(Ms),this}rotateOnWorldAxis(e,t){return Ms.setFromAxisAngle(e,t),this.quaternion.premultiply(Ms),this}rotateX(e){return this.rotateOnAxis(Uh,e)}rotateY(e){return this.rotateOnAxis(Nh,e)}rotateZ(e){return this.rotateOnAxis(Fh,e)}translateOnAxis(e,t){return Dh.copy(e).applyQuaternion(this.quaternion),this.position.add(Dh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Uh,e)}translateY(e){return this.translateOnAxis(Nh,e)}translateZ(e){return this.translateOnAxis(Fh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Jn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?qr.copy(e):qr.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),tr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Jn.lookAt(tr,qr,this.up):Jn.lookAt(qr,tr,this.up),this.quaternion.setFromRotationMatrix(Jn),s&&(Jn.extractRotation(s.matrixWorld),Ms.setFromRotationMatrix(Jn),this.quaternion.premultiply(Ms.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ft("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Oh),ys.child=e,this.dispatchEvent(ys),ys.child=null):ft("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(qp),Eo.child=e,this.dispatchEvent(Eo),Eo.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Jn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Jn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Jn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Oh),ys.child=e,this.dispatchEvent(ys),ys.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,e,Xp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,Yp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,f=l.length;c<f;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),f=a(e.images),u=a(e.shapes),h=a(e.skeletons),d=a(e.animations),m=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),f.length>0&&(i.images=f),u.length>0&&(i.shapes=u),h.length>0&&(i.skeletons=h),d.length>0&&(i.animations=d),m.length>0&&(i.nodes=m)}return i.object=s,i;function a(o){const l=[];for(const c in o){const f=o[c];delete f.metadata,l.push(f)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}Rt.DEFAULT_UP=new C(0,1,0);Rt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class ct extends Rt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const $p={type:"move"};class wo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ct,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ct,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ct,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const _ of e.hand.values()){const g=t.getJointPose(_,i),p=this._getHandJoint(c,_);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}const f=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],h=f.position.distanceTo(u.position),d=.02,m=.005;c.inputState.pinching&&h>d+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=d-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent($p)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new ct;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const Su={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Mi={h:0,s:0,l:0},$r={h:0,s:0,l:0};function To(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Ae{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=mn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ot.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=ot.workingColorSpace){return this.r=e,this.g=t,this.b=i,ot.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=ot.workingColorSpace){if(e=Lc(e,1),t=it(t,0,1),i=it(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=To(a,r,e+1/3),this.g=To(a,r,e),this.b=To(a,r,e-1/3)}return ot.colorSpaceToWorking(this,s),this}setStyle(e,t=mn){function i(r){r!==void 0&&parseFloat(r)<1&&Ve("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ve("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Ve("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=mn){const i=Su[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ve("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=hi(e.r),this.g=hi(e.g),this.b=hi(e.b),this}copyLinearToSRGB(e){return this.r=Os(e.r),this.g=Os(e.g),this.b=Os(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=mn){return ot.workingToColorSpace(tn.copy(this),e),Math.round(it(tn.r*255,0,255))*65536+Math.round(it(tn.g*255,0,255))*256+Math.round(it(tn.b*255,0,255))}getHexString(e=mn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ot.workingColorSpace){ot.workingToColorSpace(tn.copy(this),t);const i=tn.r,s=tn.g,r=tn.b,a=Math.max(i,s,r),o=Math.min(i,s,r);let l,c;const f=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=f<=.5?u/(a+o):u/(2-a-o),a){case i:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-i)/u+2;break;case r:l=(i-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=f,e}getRGB(e,t=ot.workingColorSpace){return ot.workingToColorSpace(tn.copy(this),t),e.r=tn.r,e.g=tn.g,e.b=tn.b,e}getStyle(e=mn){ot.workingToColorSpace(tn.copy(this),e);const t=tn.r,i=tn.g,s=tn.b;return e!==mn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Mi),this.setHSL(Mi.h+e,Mi.s+t,Mi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Mi),e.getHSL($r);const i=yr(Mi.h,$r.h,t),s=yr(Mi.s,$r.s,t),r=yr(Mi.l,$r.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const tn=new Ae;Ae.NAMES=Su;class Dc{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ae(e),this.near=t,this.far=i}clone(){return new Dc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class ac extends Rt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Oi,this.environmentIntensity=1,this.environmentRotation=new Oi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const An=new C,Qn=new C,Ao=new C,jn=new C,bs=new C,Ss=new C,Bh=new C,Ro=new C,Co=new C,Po=new C,Lo=new At,Io=new At,Do=new At;class Pn{constructor(e=new C,t=new C,i=new C){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),An.subVectors(e,t),s.cross(An);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){An.subVectors(s,t),Qn.subVectors(i,t),Ao.subVectors(e,t);const a=An.dot(An),o=An.dot(Qn),l=An.dot(Ao),c=Qn.dot(Qn),f=Qn.dot(Ao),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const h=1/u,d=(c*l-o*f)*h,m=(a*f-o*l)*h;return r.set(1-d-m,m,d)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,jn)===null?!1:jn.x>=0&&jn.y>=0&&jn.x+jn.y<=1}static getInterpolation(e,t,i,s,r,a,o,l){return this.getBarycoord(e,t,i,s,jn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,jn.x),l.addScaledVector(a,jn.y),l.addScaledVector(o,jn.z),l)}static getInterpolatedAttribute(e,t,i,s,r,a){return Lo.setScalar(0),Io.setScalar(0),Do.setScalar(0),Lo.fromBufferAttribute(e,t),Io.fromBufferAttribute(e,i),Do.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Lo,r.x),a.addScaledVector(Io,r.y),a.addScaledVector(Do,r.z),a}static isFrontFacing(e,t,i,s){return An.subVectors(i,t),Qn.subVectors(e,t),An.cross(Qn).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return An.subVectors(this.c,this.b),Qn.subVectors(this.a,this.b),An.cross(Qn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Pn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Pn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return Pn.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return Pn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Pn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let a,o;bs.subVectors(s,i),Ss.subVectors(r,i),Ro.subVectors(e,i);const l=bs.dot(Ro),c=Ss.dot(Ro);if(l<=0&&c<=0)return t.copy(i);Co.subVectors(e,s);const f=bs.dot(Co),u=Ss.dot(Co);if(f>=0&&u<=f)return t.copy(s);const h=l*u-f*c;if(h<=0&&l>=0&&f<=0)return a=l/(l-f),t.copy(i).addScaledVector(bs,a);Po.subVectors(e,r);const d=bs.dot(Po),m=Ss.dot(Po);if(m>=0&&d<=m)return t.copy(r);const _=d*c-l*m;if(_<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(i).addScaledVector(Ss,o);const g=f*m-d*u;if(g<=0&&u-f>=0&&d-m>=0)return Bh.subVectors(r,s),o=(u-f)/(u-f+(d-m)),t.copy(s).addScaledVector(Bh,o);const p=1/(g+_+h);return a=_*p,o=h*p,t.copy(i).addScaledVector(bs,a).addScaledVector(Ss,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class us{constructor(e=new C(1/0,1/0,1/0),t=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Rn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Rn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Rn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Rn):Rn.fromBufferAttribute(r,a),Rn.applyMatrix4(e.matrixWorld),this.expandByPoint(Rn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Kr.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Kr.copy(i.boundingBox)),Kr.applyMatrix4(e.matrixWorld),this.union(Kr)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Rn),Rn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(nr),Zr.subVectors(this.max,nr),Es.subVectors(e.a,nr),ws.subVectors(e.b,nr),Ts.subVectors(e.c,nr),yi.subVectors(ws,Es),bi.subVectors(Ts,ws),Gi.subVectors(Es,Ts);let t=[0,-yi.z,yi.y,0,-bi.z,bi.y,0,-Gi.z,Gi.y,yi.z,0,-yi.x,bi.z,0,-bi.x,Gi.z,0,-Gi.x,-yi.y,yi.x,0,-bi.y,bi.x,0,-Gi.y,Gi.x,0];return!Uo(t,Es,ws,Ts,Zr)||(t=[1,0,0,0,1,0,0,0,1],!Uo(t,Es,ws,Ts,Zr))?!1:(Jr.crossVectors(yi,bi),t=[Jr.x,Jr.y,Jr.z],Uo(t,Es,ws,Ts,Zr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Rn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Rn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ei[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ei[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ei[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ei[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ei[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ei[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ei[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ei[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ei),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const ei=[new C,new C,new C,new C,new C,new C,new C,new C],Rn=new C,Kr=new us,Es=new C,ws=new C,Ts=new C,yi=new C,bi=new C,Gi=new C,nr=new C,Zr=new C,Jr=new C,Hi=new C;function Uo(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){Hi.fromArray(n,r);const o=s.x*Math.abs(Hi.x)+s.y*Math.abs(Hi.y)+s.z*Math.abs(Hi.z),l=e.dot(Hi),c=t.dot(Hi),f=i.dot(Hi);if(Math.max(-Math.max(l,c,f),Math.min(l,c,f))>o)return!1}return!0}const kt=new C,Qr=new oe;let Kp=0;class Ht extends hs{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Kp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Sh,this.updateRanges=[],this.gpuType=Ln,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Qr.fromBufferAttribute(this,t),Qr.applyMatrix3(e),this.setXY(t,Qr.x,Qr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix3(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix4(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyNormalMatrix(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.transformDirection(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Ds(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=rn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ds(t,this.array)),t}setX(e,t){return this.normalized&&(t=rn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ds(t,this.array)),t}setY(e,t){return this.normalized&&(t=rn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ds(t,this.array)),t}setZ(e,t){return this.normalized&&(t=rn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ds(t,this.array)),t}setW(e,t){return this.normalized&&(t=rn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=rn(t,this.array),i=rn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=rn(t,this.array),i=rn(i,this.array),s=rn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=rn(t,this.array),i=rn(i,this.array),s=rn(s,this.array),r=rn(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Sh&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class Eu extends Ht{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class wu extends Ht{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class je extends Ht{constructor(e,t,i){super(new Float32Array(e),t,i)}}const Zp=new us,ir=new C,No=new C;class ds{constructor(e=new C,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Zp.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ir.subVectors(e,this.center);const t=ir.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(ir,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(No.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ir.copy(e.center).add(No)),this.expandByPoint(ir.copy(e.center).sub(No))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Jp=0;const bn=new bt,Fo=new Rt,As=new C,pn=new us,sr=new us,$t=new C;class vt extends hs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Jp++}),this.uuid=fs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(gp(e)?wu:Eu)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new Ke().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return bn.makeRotationFromQuaternion(e),this.applyMatrix4(bn),this}rotateX(e){return bn.makeRotationX(e),this.applyMatrix4(bn),this}rotateY(e){return bn.makeRotationY(e),this.applyMatrix4(bn),this}rotateZ(e){return bn.makeRotationZ(e),this.applyMatrix4(bn),this}translate(e,t,i){return bn.makeTranslation(e,t,i),this.applyMatrix4(bn),this}scale(e,t,i){return bn.makeScale(e,t,i),this.applyMatrix4(bn),this}lookAt(e){return Fo.lookAt(e),Fo.updateMatrix(),this.applyMatrix4(Fo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(As).negate(),this.translate(As.x,As.y,As.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new je(i,3))}else{const i=Math.min(e.length,t.count);for(let s=0;s<i;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ve("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new us);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ft("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];pn.setFromBufferAttribute(r),this.morphTargetsRelative?($t.addVectors(this.boundingBox.min,pn.min),this.boundingBox.expandByPoint($t),$t.addVectors(this.boundingBox.max,pn.max),this.boundingBox.expandByPoint($t)):(this.boundingBox.expandByPoint(pn.min),this.boundingBox.expandByPoint(pn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ft('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ds);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ft("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(e){const i=this.boundingSphere.center;if(pn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];sr.setFromBufferAttribute(o),this.morphTargetsRelative?($t.addVectors(pn.min,sr.min),pn.expandByPoint($t),$t.addVectors(pn.max,sr.max),pn.expandByPoint($t)):(pn.expandByPoint(sr.min),pn.expandByPoint(sr.max))}pn.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)$t.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared($t));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,f=o.count;c<f;c++)$t.fromBufferAttribute(o,c),l&&(As.fromBufferAttribute(e,c),$t.add(As)),s=Math.max(s,i.distanceToSquared($t))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ft('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ft("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new Ht(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));const o=[],l=[];for(let y=0;y<i.count;y++)o[y]=new C,l[y]=new C;const c=new C,f=new C,u=new C,h=new oe,d=new oe,m=new oe,_=new C,g=new C;function p(y,T,P){c.fromBufferAttribute(i,y),f.fromBufferAttribute(i,T),u.fromBufferAttribute(i,P),h.fromBufferAttribute(r,y),d.fromBufferAttribute(r,T),m.fromBufferAttribute(r,P),f.sub(c),u.sub(c),d.sub(h),m.sub(h);const L=1/(d.x*m.y-m.x*d.y);isFinite(L)&&(_.copy(f).multiplyScalar(m.y).addScaledVector(u,-d.y).multiplyScalar(L),g.copy(u).multiplyScalar(d.x).addScaledVector(f,-m.x).multiplyScalar(L),o[y].add(_),o[T].add(_),o[P].add(_),l[y].add(g),l[T].add(g),l[P].add(g))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let y=0,T=M.length;y<T;++y){const P=M[y],L=P.start,O=P.count;for(let $=L,Z=L+O;$<Z;$+=3)p(e.getX($+0),e.getX($+1),e.getX($+2))}const x=new C,v=new C,E=new C,w=new C;function R(y){E.fromBufferAttribute(s,y),w.copy(E);const T=o[y];x.copy(T),x.sub(E.multiplyScalar(E.dot(T))).normalize(),v.crossVectors(w,T);const L=v.dot(l[y])<0?-1:1;a.setXYZW(y,x.x,x.y,x.z,L)}for(let y=0,T=M.length;y<T;++y){const P=M[y],L=P.start,O=P.count;for(let $=L,Z=L+O;$<Z;$+=3)R(e.getX($+0)),R(e.getX($+1)),R(e.getX($+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new Ht(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let h=0,d=i.count;h<d;h++)i.setXYZ(h,0,0,0);const s=new C,r=new C,a=new C,o=new C,l=new C,c=new C,f=new C,u=new C;if(e)for(let h=0,d=e.count;h<d;h+=3){const m=e.getX(h+0),_=e.getX(h+1),g=e.getX(h+2);s.fromBufferAttribute(t,m),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,g),f.subVectors(a,r),u.subVectors(s,r),f.cross(u),o.fromBufferAttribute(i,m),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,g),o.add(f),l.add(f),c.add(f),i.setXYZ(m,o.x,o.y,o.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let h=0,d=t.count;h<d;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),f.subVectors(a,r),u.subVectors(s,r),f.cross(u),i.setXYZ(h+0,f.x,f.y,f.z),i.setXYZ(h+1,f.x,f.y,f.z),i.setXYZ(h+2,f.x,f.y,f.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)$t.fromBufferAttribute(e,t),$t.normalize(),e.setXYZ(t,$t.x,$t.y,$t.z)}toNonIndexed(){function e(o,l){const c=o.array,f=o.itemSize,u=o.normalized,h=new c.constructor(l.length*f);let d=0,m=0;for(let _=0,g=l.length;_<g;_++){o.isInterleavedBufferAttribute?d=l[_]*o.data.stride+o.offset:d=l[_]*f;for(let p=0;p<f;p++)h[m++]=c[d++]}return new Ht(h,f,u)}if(this.index===null)return Ve("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new vt,i=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,i);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let f=0,u=c.length;f<u;f++){const h=c[f],d=e(h,i);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],f=[];for(let u=0,h=c.length;u<h;u++){const d=c[u];f.push(d.toJSON(e.data))}f.length>0&&(s[l]=f,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const s=e.attributes;for(const c in s){const f=s[c];this.setAttribute(c,f.clone(t))}const r=e.morphAttributes;for(const c in r){const f=[],u=r[c];for(let h=0,d=u.length;h<d;h++)f.push(u[h].clone(t));this.morphAttributes[c]=f}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,f=a.length;c<f;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}let Qp=0;class zi extends hs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Qp++}),this.uuid=fs(),this.name="",this.type="Material",this.blending=Ns,this.side=ui,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ml,this.blendDst=yl,this.blendEquation=Zi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ae(0,0,0),this.blendAlpha=0,this.depthFunc=ks,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=bh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=xs,this.stencilZFail=xs,this.stencilZPass=xs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Ve(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ve(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ns&&(i.blending=this.blending),this.side!==ui&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Ml&&(i.blendSrc=this.blendSrc),this.blendDst!==yl&&(i.blendDst=this.blendDst),this.blendEquation!==Zi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ks&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==bh&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==xs&&(i.stencilFail=this.stencilFail),this.stencilZFail!==xs&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==xs&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ae().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new oe().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new oe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const ti=new C,Oo=new C,jr=new C,Si=new C,Bo=new C,ea=new C,zo=new C;class Uc{constructor(e=new C,t=new C(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ti)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ti.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ti.copy(this.origin).addScaledVector(this.direction,t),ti.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Oo.copy(e).add(t).multiplyScalar(.5),jr.copy(t).sub(e).normalize(),Si.copy(this.origin).sub(Oo);const r=e.distanceTo(t)*.5,a=-this.direction.dot(jr),o=Si.dot(this.direction),l=-Si.dot(jr),c=Si.lengthSq(),f=Math.abs(1-a*a);let u,h,d,m;if(f>0)if(u=a*l-o,h=a*o-l,m=r*f,u>=0)if(h>=-m)if(h<=m){const _=1/f;u*=_,h*=_,d=u*(u+a*h+2*o)+h*(a*u+h+2*l)+c}else h=r,u=Math.max(0,-(a*h+o)),d=-u*u+h*(h+2*l)+c;else h=-r,u=Math.max(0,-(a*h+o)),d=-u*u+h*(h+2*l)+c;else h<=-m?(u=Math.max(0,-(-a*r+o)),h=u>0?-r:Math.min(Math.max(-r,-l),r),d=-u*u+h*(h+2*l)+c):h<=m?(u=0,h=Math.min(Math.max(-r,-l),r),d=h*(h+2*l)+c):(u=Math.max(0,-(a*r+o)),h=u>0?r:Math.min(Math.max(-r,-l),r),d=-u*u+h*(h+2*l)+c);else h=a>0?-r:r,u=Math.max(0,-(a*h+o)),d=-u*u+h*(h+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Oo).addScaledVector(jr,h),d}intersectSphere(e,t){ti.subVectors(e.center,this.origin);const i=ti.dot(this.direction),s=ti.dot(ti)-i*i,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,l;const c=1/this.direction.x,f=1/this.direction.y,u=1/this.direction.z,h=this.origin;return c>=0?(i=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(i=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),f>=0?(r=(e.min.y-h.y)*f,a=(e.max.y-h.y)*f):(r=(e.max.y-h.y)*f,a=(e.min.y-h.y)*f),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-h.z)*u,l=(e.max.z-h.z)*u):(o=(e.max.z-h.z)*u,l=(e.min.z-h.z)*u),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,ti)!==null}intersectTriangle(e,t,i,s,r){Bo.subVectors(t,e),ea.subVectors(i,e),zo.crossVectors(Bo,ea);let a=this.direction.dot(zo),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Si.subVectors(this.origin,e);const l=o*this.direction.dot(ea.crossVectors(Si,ea));if(l<0)return null;const c=o*this.direction.dot(Bo.cross(Si));if(c<0||l+c>a)return null;const f=-o*Si.dot(zo);return f<0?null:this.at(f/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Lt extends zi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.combine=yc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const zh=new bt,Vi=new Uc,ta=new ds,kh=new C,na=new C,ia=new C,sa=new C,ko=new C,ra=new C,Gh=new C,aa=new C;class at extends Rt{constructor(e=new vt,t=new Lt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){ra.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const f=o[l],u=r[l];f!==0&&(ko.fromBufferAttribute(u,e),a?ra.addScaledVector(ko,f):ra.addScaledVector(ko.sub(t),f))}t.add(ra)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),ta.copy(i.boundingSphere),ta.applyMatrix4(r),Vi.copy(e.ray).recast(e.near),!(ta.containsPoint(Vi.origin)===!1&&(Vi.intersectSphere(ta,kh)===null||Vi.origin.distanceToSquared(kh)>(e.far-e.near)**2))&&(zh.copy(r).invert(),Vi.copy(e.ray).applyMatrix4(zh),!(i.boundingBox!==null&&Vi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Vi)))}_computeIntersections(e,t,i){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,f=r.attributes.uv1,u=r.attributes.normal,h=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,_=h.length;m<_;m++){const g=h[m],p=a[g.materialIndex],M=Math.max(g.start,d.start),x=Math.min(o.count,Math.min(g.start+g.count,d.start+d.count));for(let v=M,E=x;v<E;v+=3){const w=o.getX(v),R=o.getX(v+1),y=o.getX(v+2);s=oa(this,p,e,i,c,f,u,w,R,y),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{const m=Math.max(0,d.start),_=Math.min(o.count,d.start+d.count);for(let g=m,p=_;g<p;g+=3){const M=o.getX(g),x=o.getX(g+1),v=o.getX(g+2);s=oa(this,a,e,i,c,f,u,M,x,v),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,_=h.length;m<_;m++){const g=h[m],p=a[g.materialIndex],M=Math.max(g.start,d.start),x=Math.min(l.count,Math.min(g.start+g.count,d.start+d.count));for(let v=M,E=x;v<E;v+=3){const w=v,R=v+1,y=v+2;s=oa(this,p,e,i,c,f,u,w,R,y),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{const m=Math.max(0,d.start),_=Math.min(l.count,d.start+d.count);for(let g=m,p=_;g<p;g+=3){const M=g,x=g+1,v=g+2;s=oa(this,a,e,i,c,f,u,M,x,v),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}}function jp(n,e,t,i,s,r,a,o){let l;if(e.side===nn?l=i.intersectTriangle(a,r,s,!0,o):l=i.intersectTriangle(s,r,a,e.side===ui,o),l===null)return null;aa.copy(o),aa.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(aa);return c<t.near||c>t.far?null:{distance:c,point:aa.clone(),object:n}}function oa(n,e,t,i,s,r,a,o,l,c){n.getVertexPosition(o,na),n.getVertexPosition(l,ia),n.getVertexPosition(c,sa);const f=jp(n,e,t,i,na,ia,sa,Gh);if(f){const u=new C;Pn.getBarycoord(Gh,na,ia,sa,u),s&&(f.uv=Pn.getInterpolatedAttribute(s,o,l,c,u,new oe)),r&&(f.uv1=Pn.getInterpolatedAttribute(r,o,l,c,u,new oe)),a&&(f.normal=Pn.getInterpolatedAttribute(a,o,l,c,u,new C),f.normal.dot(i.direction)>0&&f.normal.multiplyScalar(-1));const h={a:o,b:l,c,normal:new C,materialIndex:0};Pn.getNormal(na,ia,sa,h.normal),f.face=h,f.barycoord=u}return f}class Nc extends ln{constructor(e=null,t=1,i=1,s,r,a,o,l,c=Qt,f=Qt,u,h){super(null,a,o,l,c,f,s,r,u,h),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Hh extends Ht{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Rs=new bt,Vh=new bt,la=[],Wh=new us,em=new bt,rr=new at,ar=new ds;class os extends at{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Hh(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,em)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new us),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Rs),Wh.copy(e.boundingBox).applyMatrix4(Rs),this.boundingBox.union(Wh)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ds),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Rs),ar.copy(e.boundingSphere).applyMatrix4(Rs),this.boundingSphere.union(ar)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=e*r+1;for(let o=0;o<i.length;o++)i[o]=s[a+o]}raycast(e,t){const i=this.matrixWorld,s=this.count;if(rr.geometry=this.geometry,rr.material=this.material,rr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ar.copy(this.boundingSphere),ar.applyMatrix4(i),e.ray.intersectsSphere(ar)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Rs),Vh.multiplyMatrices(i,Rs),rr.matrixWorld=Vh,rr.raycast(e,la);for(let a=0,o=la.length;a<o;a++){const l=la[a];l.instanceId=r,l.object=this,t.push(l)}la.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Hh(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){const i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new Nc(new Float32Array(s*this.count),s,this.count,wc,Ln));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<i.length;c++)a+=i[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(i,l+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Go=new C,tm=new C,nm=new Ke;class qi{constructor(e=new C(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=Go.subVectors(i,t).cross(tm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){const s=e.delta(Go),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||nm.getNormalMatrix(e),s=this.coplanarPoint(Go).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Wi=new ds,im=new oe(.5,.5),ca=new C;class Fc{constructor(e=new qi,t=new qi,i=new qi,s=new qi,r=new qi,a=new qi){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=qn,i=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],f=r[4],u=r[5],h=r[6],d=r[7],m=r[8],_=r[9],g=r[10],p=r[11],M=r[12],x=r[13],v=r[14],E=r[15];if(s[0].setComponents(c-a,d-f,p-m,E-M).normalize(),s[1].setComponents(c+a,d+f,p+m,E+M).normalize(),s[2].setComponents(c+o,d+u,p+_,E+x).normalize(),s[3].setComponents(c-o,d-u,p-_,E-x).normalize(),i)s[4].setComponents(l,h,g,v).normalize(),s[5].setComponents(c-l,d-h,p-g,E-v).normalize();else if(s[4].setComponents(c-l,d-h,p-g,E-v).normalize(),t===qn)s[5].setComponents(c+l,d+h,p+g,E+v).normalize();else if(t===Pr)s[5].setComponents(l,h,g,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Wi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Wi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Wi)}intersectsSprite(e){Wi.center.set(0,0,0);const t=im.distanceTo(e.center);return Wi.radius=.7071067811865476+t,Wi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Wi)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(ca.x=s.normal.x>0?e.max.x:e.min.x,ca.y=s.normal.y>0?e.max.y:e.min.y,ca.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(ca)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class oc extends zi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ae(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Xa=new C,Ya=new C,Xh=new bt,or=new Uc,ha=new ds,Ho=new C,Yh=new C;class sm extends Rt{constructor(e=new vt,t=new oc){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)Xa.fromBufferAttribute(t,s-1),Ya.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=Xa.distanceTo(Ya);e.setAttribute("lineDistance",new je(i,1))}else Ve("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ha.copy(i.boundingSphere),ha.applyMatrix4(s),ha.radius+=r,e.ray.intersectsSphere(ha)===!1)return;Xh.copy(s).invert(),or.copy(e.ray).applyMatrix4(Xh);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,f=i.index,h=i.attributes.position;if(f!==null){const d=Math.max(0,a.start),m=Math.min(f.count,a.start+a.count);for(let _=d,g=m-1;_<g;_+=c){const p=f.getX(_),M=f.getX(_+1),x=fa(this,e,or,l,p,M,_);x&&t.push(x)}if(this.isLineLoop){const _=f.getX(m-1),g=f.getX(d),p=fa(this,e,or,l,_,g,m-1);p&&t.push(p)}}else{const d=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let _=d,g=m-1;_<g;_+=c){const p=fa(this,e,or,l,_,_+1,_);p&&t.push(p)}if(this.isLineLoop){const _=fa(this,e,or,l,m-1,d,m-1);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function fa(n,e,t,i,s,r,a){const o=n.geometry.attributes.position;if(Xa.fromBufferAttribute(o,s),Ya.fromBufferAttribute(o,r),t.distanceSqToSegment(Xa,Ya,Ho,Yh)>i)return;Ho.applyMatrix4(n.matrixWorld);const c=e.ray.origin.distanceTo(Ho);if(!(c<e.near||c>e.far))return{distance:c,point:Yh.clone().applyMatrix4(n.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:n}}const qh=new C,$h=new C;class Kh extends sm{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)qh.fromBufferAttribute(t,s),$h.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+qh.distanceTo($h);e.setAttribute("lineDistance",new je(i,1))}else Ve("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Tu extends zi{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ae(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Zh=new bt,lc=new Uc,ua=new ds,da=new C;class Au extends Rt{constructor(e=new vt,t=new Tu){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ua.copy(i.boundingSphere),ua.applyMatrix4(s),ua.radius+=r,e.ray.intersectsSphere(ua)===!1)return;Zh.copy(s).invert(),lc.copy(e.ray).applyMatrix4(Zh);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,u=i.attributes.position;if(c!==null){const h=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let m=h,_=d;m<_;m++){const g=c.getX(m);da.fromBufferAttribute(u,g),Jh(da,g,l,s,e,t,this)}}else{const h=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let m=h,_=d;m<_;m++)da.fromBufferAttribute(u,m),Jh(da,m,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Jh(n,e,t,i,s,r,a){const o=lc.distanceSqToPoint(n);if(o<t){const l=new C;lc.closestPointToPoint(n,l),l.applyMatrix4(i);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class Ru extends ln{constructor(e=[],t=rs,i,s,r,a,o,l,c,f){super(e,t,i,s,r,a,o,l,c,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class ls extends ln{constructor(e,t,i=Nn,s,r,a,o=Qt,l=Qt,c,f=di,u=1){if(f!==di&&f!==ji)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:u};super(h,s,r,a,o,l,f,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ic(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class rm extends ls{constructor(e,t=Nn,i=rs,s,r,a=Qt,o=Qt,l,c=di){const f={width:e,height:e,depth:1},u=[f,f,f,f,f,f];super(e,e,t,i,s,r,a,o,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Cu extends ln{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Fn extends vt{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],f=[],u=[];let h=0,d=0;m("z","y","x",-1,-1,i,t,e,a,r,0),m("z","y","x",1,-1,i,t,-e,a,r,1),m("x","z","y",1,1,e,i,t,s,a,2),m("x","z","y",1,-1,e,i,-t,s,a,3),m("x","y","z",1,-1,e,t,i,s,r,4),m("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new je(c,3)),this.setAttribute("normal",new je(f,3)),this.setAttribute("uv",new je(u,2));function m(_,g,p,M,x,v,E,w,R,y,T){const P=v/R,L=E/y,O=v/2,$=E/2,Z=w/2,z=R+1,K=y+1;let G=0,ee=0;const re=new C;for(let de=0;de<K;de++){const he=de*L-$;for(let Ee=0;Ee<z;Ee++){const tt=Ee*P-O;re[_]=tt*M,re[g]=he*x,re[p]=Z,c.push(re.x,re.y,re.z),re[_]=0,re[g]=0,re[p]=w>0?1:-1,f.push(re.x,re.y,re.z),u.push(Ee/R),u.push(1-de/y),G+=1}}for(let de=0;de<y;de++)for(let he=0;he<R;he++){const Ee=h+he+z*de,tt=h+he+z*(de+1),St=h+(he+1)+z*(de+1),ht=h+(he+1)+z*de;l.push(Ee,tt,ht),l.push(tt,St,ht),ee+=6}o.addGroup(d,ee,T),d+=ee,h+=G}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class Bs extends vt{constructor(e=1,t=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:s},t=Math.max(3,t);const r=[],a=[],o=[],l=[],c=new C,f=new oe;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,h=3;u<=t;u++,h+=3){const d=i+u/t*s;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),f.x=(a[h]/e+1)/2,f.y=(a[h+1]/e+1)/2,l.push(f.x,f.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new je(a,3)),this.setAttribute("normal",new je(o,3)),this.setAttribute("uv",new je(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Bs(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Ks extends vt{constructor(e=1,t=1,i=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const f=[],u=[],h=[],d=[];let m=0;const _=[],g=i/2;let p=0;M(),a===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(f),this.setAttribute("position",new je(u,3)),this.setAttribute("normal",new je(h,3)),this.setAttribute("uv",new je(d,2));function M(){const v=new C,E=new C;let w=0;const R=(t-e)/i;for(let y=0;y<=r;y++){const T=[],P=y/r,L=P*(t-e)+e;for(let O=0;O<=s;O++){const $=O/s,Z=$*l+o,z=Math.sin(Z),K=Math.cos(Z);E.x=L*z,E.y=-P*i+g,E.z=L*K,u.push(E.x,E.y,E.z),v.set(z,R,K).normalize(),h.push(v.x,v.y,v.z),d.push($,1-P),T.push(m++)}_.push(T)}for(let y=0;y<s;y++)for(let T=0;T<r;T++){const P=_[T][y],L=_[T+1][y],O=_[T+1][y+1],$=_[T][y+1];(e>0||T!==0)&&(f.push(P,L,$),w+=3),(t>0||T!==r-1)&&(f.push(L,O,$),w+=3)}c.addGroup(p,w,0),p+=w}function x(v){const E=m,w=new oe,R=new C;let y=0;const T=v===!0?e:t,P=v===!0?1:-1;for(let O=1;O<=s;O++)u.push(0,g*P,0),h.push(0,P,0),d.push(.5,.5),m++;const L=m;for(let O=0;O<=s;O++){const Z=O/s*l+o,z=Math.cos(Z),K=Math.sin(Z);R.x=T*K,R.y=g*P,R.z=T*z,u.push(R.x,R.y,R.z),h.push(0,P,0),w.x=z*.5+.5,w.y=K*.5*P+.5,d.push(w.x,w.y),m++}for(let O=0;O<s;O++){const $=E+O,Z=L+O;v===!0?f.push(Z,Z+1,$):f.push(Z+1,Z,$),y+=3}c.addGroup(p,y,v===!0?1:2),p+=y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ks(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class to extends Ks{constructor(e=1,t=1,i=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,i,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new to(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class no extends vt{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};const r=[],a=[];o(s),c(i),f(),this.setAttribute("position",new je(r,3)),this.setAttribute("normal",new je(r.slice(),3)),this.setAttribute("uv",new je(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(M){const x=new C,v=new C,E=new C;for(let w=0;w<t.length;w+=3)d(t[w+0],x),d(t[w+1],v),d(t[w+2],E),l(x,v,E,M)}function l(M,x,v,E){const w=E+1,R=[];for(let y=0;y<=w;y++){R[y]=[];const T=M.clone().lerp(v,y/w),P=x.clone().lerp(v,y/w),L=w-y;for(let O=0;O<=L;O++)O===0&&y===w?R[y][O]=T:R[y][O]=T.clone().lerp(P,O/L)}for(let y=0;y<w;y++)for(let T=0;T<2*(w-y)-1;T++){const P=Math.floor(T/2);T%2===0?(h(R[y][P+1]),h(R[y+1][P]),h(R[y][P])):(h(R[y][P+1]),h(R[y+1][P+1]),h(R[y+1][P]))}}function c(M){const x=new C;for(let v=0;v<r.length;v+=3)x.x=r[v+0],x.y=r[v+1],x.z=r[v+2],x.normalize().multiplyScalar(M),r[v+0]=x.x,r[v+1]=x.y,r[v+2]=x.z}function f(){const M=new C;for(let x=0;x<r.length;x+=3){M.x=r[x+0],M.y=r[x+1],M.z=r[x+2];const v=g(M)/2/Math.PI+.5,E=p(M)/Math.PI+.5;a.push(v,1-E)}m(),u()}function u(){for(let M=0;M<a.length;M+=6){const x=a[M+0],v=a[M+2],E=a[M+4],w=Math.max(x,v,E),R=Math.min(x,v,E);w>.9&&R<.1&&(x<.2&&(a[M+0]+=1),v<.2&&(a[M+2]+=1),E<.2&&(a[M+4]+=1))}}function h(M){r.push(M.x,M.y,M.z)}function d(M,x){const v=M*3;x.x=e[v+0],x.y=e[v+1],x.z=e[v+2]}function m(){const M=new C,x=new C,v=new C,E=new C,w=new oe,R=new oe,y=new oe;for(let T=0,P=0;T<r.length;T+=9,P+=6){M.set(r[T+0],r[T+1],r[T+2]),x.set(r[T+3],r[T+4],r[T+5]),v.set(r[T+6],r[T+7],r[T+8]),w.set(a[P+0],a[P+1]),R.set(a[P+2],a[P+3]),y.set(a[P+4],a[P+5]),E.copy(M).add(x).add(v).divideScalar(3);const L=g(E);_(w,P+0,M,L),_(R,P+2,x,L),_(y,P+4,v,L)}}function _(M,x,v,E){E<0&&M.x===1&&(a[x]=M.x-1),v.x===0&&v.z===0&&(a[x]=E/2/Math.PI+.5)}function g(M){return Math.atan2(M.z,-M.x)}function p(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new no(e.vertices,e.indices,e.radius,e.detail)}}class Zn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Ve("Curve: .getPoint() not implemented.")}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const i=this.getLengths();let s=0;const r=i.length;let a;t?a=t:a=e*i[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=i[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===a)return s/(r-1);const f=i[s],h=i[s+1]-f,d=(a-f)/h;return(s+d)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new oe:new C);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){const i=new C,s=[],r=[],a=[],o=new C,l=new bt;for(let d=0;d<=e;d++){const m=d/e;s[d]=this.getTangentAt(m,new C)}r[0]=new C,a[0]=new C;let c=Number.MAX_VALUE;const f=Math.abs(s[0].x),u=Math.abs(s[0].y),h=Math.abs(s[0].z);f<=c&&(c=f,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),h<=c&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(s[d-1],s[d]),o.length()>Number.EPSILON){o.normalize();const m=Math.acos(it(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(o,m))}a[d].crossVectors(s[d],r[d])}if(t===!0){let d=Math.acos(it(r[0].dot(r[e]),-1,1));d/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(d=-d);for(let m=1;m<=e;m++)r[m].applyMatrix4(l.makeRotationAxis(s[m],d*m)),a[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Oc extends Zn{constructor(e=0,t=0,i=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new oe){const i=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);const o=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const f=Math.cos(this.aRotation),u=Math.sin(this.aRotation),h=l-this.aX,d=c-this.aY;l=h*f-d*u+this.aX,c=h*u+d*f+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class am extends Oc{constructor(e,t,i,s,r,a){super(e,t,i,i,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Bc(){let n=0,e=0,t=0,i=0;function s(r,a,o,l){n=r,e=o,t=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,f,u){let h=(a-r)/c-(o-r)/(c+f)+(o-a)/f,d=(o-a)/f-(l-a)/(f+u)+(l-o)/u;h*=f,d*=f,s(a,o,h,d)},calc:function(r){const a=r*r,o=a*r;return n+e*r+t*a+i*o}}}const Qh=new C,jh=new C,Vo=new Bc,Wo=new Bc,Xo=new Bc;class Pu extends Zn{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new C){const i=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,f;this.closed||o>0?c=s[(o-1)%r]:(jh.subVectors(s[0],s[1]).add(s[0]),c=jh);const u=s[o%r],h=s[(o+1)%r];if(this.closed||o+2<r?f=s[(o+2)%r]:(Qh.subVectors(s[r-1],s[r-2]).add(s[r-1]),f=Qh),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let m=Math.pow(c.distanceToSquared(u),d),_=Math.pow(u.distanceToSquared(h),d),g=Math.pow(h.distanceToSquared(f),d);_<1e-4&&(_=1),m<1e-4&&(m=_),g<1e-4&&(g=_),Vo.initNonuniformCatmullRom(c.x,u.x,h.x,f.x,m,_,g),Wo.initNonuniformCatmullRom(c.y,u.y,h.y,f.y,m,_,g),Xo.initNonuniformCatmullRom(c.z,u.z,h.z,f.z,m,_,g)}else this.curveType==="catmullrom"&&(Vo.initCatmullRom(c.x,u.x,h.x,f.x,this.tension),Wo.initCatmullRom(c.y,u.y,h.y,f.y,this.tension),Xo.initCatmullRom(c.z,u.z,h.z,f.z,this.tension));return i.set(Vo.calc(l),Wo.calc(l),Xo.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new C().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function ef(n,e,t,i,s){const r=(i-e)*.5,a=(s-t)*.5,o=n*n,l=n*o;return(2*t-2*i+r+a)*l+(-3*t+3*i-2*r-a)*o+r*n+t}function om(n,e){const t=1-n;return t*t*e}function lm(n,e){return 2*(1-n)*n*e}function cm(n,e){return n*n*e}function br(n,e,t,i){return om(n,e)+lm(n,t)+cm(n,i)}function hm(n,e){const t=1-n;return t*t*t*e}function fm(n,e){const t=1-n;return 3*t*t*n*e}function um(n,e){return 3*(1-n)*n*n*e}function dm(n,e){return n*n*n*e}function Sr(n,e,t,i,s){return hm(n,e)+fm(n,t)+um(n,i)+dm(n,s)}class Lu extends Zn{constructor(e=new oe,t=new oe,i=new oe,s=new oe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new oe){const i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Sr(e,s.x,r.x,a.x,o.x),Sr(e,s.y,r.y,a.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class pm extends Zn{constructor(e=new C,t=new C,i=new C,s=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new C){const i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Sr(e,s.x,r.x,a.x,o.x),Sr(e,s.y,r.y,a.y,o.y),Sr(e,s.z,r.z,a.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Iu extends Zn{constructor(e=new oe,t=new oe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new oe){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new oe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class mm extends Zn{constructor(e=new C,t=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new C){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new C){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Du extends Zn{constructor(e=new oe,t=new oe,i=new oe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new oe){const i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(br(e,s.x,r.x,a.x),br(e,s.y,r.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Uu extends Zn{constructor(e=new C,t=new C,i=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new C){const i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(br(e,s.x,r.x,a.x),br(e,s.y,r.y,a.y),br(e,s.z,r.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Nu extends Zn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new oe){const i=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],f=s[a>s.length-2?s.length-1:a+1],u=s[a>s.length-3?s.length-1:a+2];return i.set(ef(o,l.x,c.x,f.x,u.x),ef(o,l.y,c.y,f.y,u.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new oe().fromArray(s))}return this}}var qa=Object.freeze({__proto__:null,ArcCurve:am,CatmullRomCurve3:Pu,CubicBezierCurve:Lu,CubicBezierCurve3:pm,EllipseCurve:Oc,LineCurve:Iu,LineCurve3:mm,QuadraticBezierCurve:Du,QuadraticBezierCurve3:Uu,SplineCurve:Nu});class gm extends Zn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new qa[i](t,e))}return this}getPoint(e,t){const i=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=i){const a=s[r]-i,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let i;for(let s=0,r=this.curves;s<r.length;s++){const a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){const f=l[c];i&&i.equals(f)||(t.push(f),i=f)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(new qa[s.type]().fromJSON(s))}return this}}class tf extends gm{constructor(e){super(),this.type="Path",this.currentPoint=new oe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const i=new Iu(this.currentPoint.clone(),new oe(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){const r=new Du(this.currentPoint.clone(),new oe(e,t),new oe(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,a){const o=new Lu(this.currentPoint.clone(),new oe(e,t),new oe(i,s),new oe(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),i=new Nu(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,i,s,r,a),this}absarc(e,t,i,s,r,a){return this.absellipse(e,t,i,i,s,r,a),this}ellipse(e,t,i,s,r,a,o,l){const c=this.currentPoint.x,f=this.currentPoint.y;return this.absellipse(e+c,t+f,i,s,r,a,o,l),this}absellipse(e,t,i,s,r,a,o,l){const c=new Oc(e,t,i,s,r,a,o,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const f=c.getPoint(1);return this.currentPoint.copy(f),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class kr extends tf{constructor(e){super(e),this.uuid=fs(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const s=e.holes[t];this.holes.push(new tf().fromJSON(s))}return this}}function xm(n,e,t=2){const i=e&&e.length,s=i?e[0]*t:n.length;let r=Fu(n,0,s,t,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(i&&(r=bm(n,e,r,t)),n.length>80*t){o=n[0],l=n[1];let f=o,u=l;for(let h=t;h<s;h+=t){const d=n[h],m=n[h+1];d<o&&(o=d),m<l&&(l=m),d>f&&(f=d),m>u&&(u=m)}c=Math.max(f-o,u-l),c=c!==0?32767/c:0}return Ir(r,a,t,o,l,c,0),a}function Fu(n,e,t,i,s){let r;if(s===Dm(n,e,t,i)>0)for(let a=e;a<t;a+=i)r=nf(a/i|0,n[a],n[a+1],r);else for(let a=t-i;a>=e;a-=i)r=nf(a/i|0,n[a],n[a+1],r);return r&&Hs(r,r.next)&&(Ur(r),r=r.next),r}function cs(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(Hs(t,t.next)||It(t.prev,t,t.next)===0)){if(Ur(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Ir(n,e,t,i,s,r,a){if(!n)return;!a&&r&&Am(n,i,s,r);let o=n;for(;n.prev!==n.next;){const l=n.prev,c=n.next;if(r?_m(n,i,s,r):vm(n)){e.push(l.i,n.i,c.i),Ur(n),n=c.next,o=c.next;continue}if(n=c,n===o){a?a===1?(n=Mm(cs(n),e),Ir(n,e,t,i,s,r,2)):a===2&&ym(n,e,t,i,s,r):Ir(cs(n),e,t,i,s,r,1);break}}}function vm(n){const e=n.prev,t=n,i=n.next;if(It(e,t,i)>=0)return!1;const s=e.x,r=t.x,a=i.x,o=e.y,l=t.y,c=i.y,f=Math.min(s,r,a),u=Math.min(o,l,c),h=Math.max(s,r,a),d=Math.max(o,l,c);let m=i.next;for(;m!==e;){if(m.x>=f&&m.x<=h&&m.y>=u&&m.y<=d&&gr(s,o,r,l,a,c,m.x,m.y)&&It(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function _m(n,e,t,i){const s=n.prev,r=n,a=n.next;if(It(s,r,a)>=0)return!1;const o=s.x,l=r.x,c=a.x,f=s.y,u=r.y,h=a.y,d=Math.min(o,l,c),m=Math.min(f,u,h),_=Math.max(o,l,c),g=Math.max(f,u,h),p=cc(d,m,e,t,i),M=cc(_,g,e,t,i);let x=n.prevZ,v=n.nextZ;for(;x&&x.z>=p&&v&&v.z<=M;){if(x.x>=d&&x.x<=_&&x.y>=m&&x.y<=g&&x!==s&&x!==a&&gr(o,f,l,u,c,h,x.x,x.y)&&It(x.prev,x,x.next)>=0||(x=x.prevZ,v.x>=d&&v.x<=_&&v.y>=m&&v.y<=g&&v!==s&&v!==a&&gr(o,f,l,u,c,h,v.x,v.y)&&It(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;x&&x.z>=p;){if(x.x>=d&&x.x<=_&&x.y>=m&&x.y<=g&&x!==s&&x!==a&&gr(o,f,l,u,c,h,x.x,x.y)&&It(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;v&&v.z<=M;){if(v.x>=d&&v.x<=_&&v.y>=m&&v.y<=g&&v!==s&&v!==a&&gr(o,f,l,u,c,h,v.x,v.y)&&It(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function Mm(n,e){let t=n;do{const i=t.prev,s=t.next.next;!Hs(i,s)&&Bu(i,t,t.next,s)&&Dr(i,s)&&Dr(s,i)&&(e.push(i.i,t.i,s.i),Ur(t),Ur(t.next),t=n=s),t=t.next}while(t!==n);return cs(t)}function ym(n,e,t,i,s,r){let a=n;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Pm(a,o)){let l=zu(a,o);a=cs(a,a.next),l=cs(l,l.next),Ir(a,e,t,i,s,r,0),Ir(l,e,t,i,s,r,0);return}o=o.next}a=a.next}while(a!==n)}function bm(n,e,t,i){const s=[];for(let r=0,a=e.length;r<a;r++){const o=e[r]*i,l=r<a-1?e[r+1]*i:n.length,c=Fu(n,o,l,i,!1);c===c.next&&(c.steiner=!0),s.push(Cm(c))}s.sort(Sm);for(let r=0;r<s.length;r++)t=Em(s[r],t);return t}function Sm(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){const i=(n.next.y-n.y)/(n.next.x-n.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=i-s}return t}function Em(n,e){const t=wm(n,e);if(!t)return e;const i=zu(t,n);return cs(i,i.next),cs(t,t.next)}function wm(n,e){let t=e;const i=n.x,s=n.y;let r=-1/0,a;if(Hs(n,t))return t;do{if(Hs(n,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const u=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=i&&u>r&&(r=u,a=t.x<t.next.x?t:t.next,u===i))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,l=a.x,c=a.y;let f=1/0;t=a;do{if(i>=t.x&&t.x>=l&&i!==t.x&&Ou(s<c?i:r,s,l,c,s<c?r:i,s,t.x,t.y)){const u=Math.abs(s-t.y)/(i-t.x);Dr(t,n)&&(u<f||u===f&&(t.x>a.x||t.x===a.x&&Tm(a,t)))&&(a=t,f=u)}t=t.next}while(t!==o);return a}function Tm(n,e){return It(n.prev,n,e.prev)<0&&It(e.next,n,n.next)<0}function Am(n,e,t,i){let s=n;do s.z===0&&(s.z=cc(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,Rm(s)}function Rm(n){let e,t=1;do{let i=n,s;n=null;let r=null;for(e=0;i;){e++;let a=i,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||i.z<=a.z)?(s=i,i=i.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=a}r.nextZ=null,t*=2}while(e>1);return n}function cc(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function Cm(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function Ou(n,e,t,i,s,r,a,o){return(s-a)*(e-o)>=(n-a)*(r-o)&&(n-a)*(i-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(i-o)}function gr(n,e,t,i,s,r,a,o){return!(n===a&&e===o)&&Ou(n,e,t,i,s,r,a,o)}function Pm(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!Lm(n,e)&&(Dr(n,e)&&Dr(e,n)&&Im(n,e)&&(It(n.prev,n,e.prev)||It(n,e.prev,e))||Hs(n,e)&&It(n.prev,n,n.next)>0&&It(e.prev,e,e.next)>0)}function It(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function Hs(n,e){return n.x===e.x&&n.y===e.y}function Bu(n,e,t,i){const s=ma(It(n,e,t)),r=ma(It(n,e,i)),a=ma(It(t,i,n)),o=ma(It(t,i,e));return!!(s!==r&&a!==o||s===0&&pa(n,t,e)||r===0&&pa(n,i,e)||a===0&&pa(t,n,i)||o===0&&pa(t,e,i))}function pa(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function ma(n){return n>0?1:n<0?-1:0}function Lm(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Bu(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function Dr(n,e){return It(n.prev,n,n.next)<0?It(n,e,n.next)>=0&&It(n,n.prev,e)>=0:It(n,e,n.prev)<0||It(n,n.next,e)<0}function Im(n,e){let t=n,i=!1;const s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function zu(n,e){const t=hc(n.i,n.x,n.y),i=hc(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function nf(n,e,t,i){const s=hc(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function Ur(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function hc(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Dm(n,e,t,i){let s=0;for(let r=e,a=t-i;r<t;r+=i)s+=(n[a]-n[r])*(n[r+1]+n[a+1]),a=r;return s}class Um{static triangulate(e,t,i=2){return xm(e,t,i)}}class oi{static area(e){const t=e.length;let i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return oi.area(e)<0}static triangulateShape(e,t){const i=[],s=[],r=[];sf(e),rf(i,e);let a=e.length;t.forEach(sf);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,rf(i,t[l]);const o=Um.triangulate(i,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function sf(n){const e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function rf(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}class zc extends vt{constructor(e=new kr([new oe(.5,.5),new oe(-.5,.5),new oe(-.5,-.5),new oe(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const i=this,s=[],r=[];for(let o=0,l=e.length;o<l;o++){const c=e[o];a(c)}this.setAttribute("position",new je(s,3)),this.setAttribute("uv",new je(r,2)),this.computeVertexNormals();function a(o){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,f=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1;let h=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,m=t.bevelSize!==void 0?t.bevelSize:d-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3;const p=t.extrudePath,M=t.UVGenerator!==void 0?t.UVGenerator:Nm;let x,v=!1,E,w,R,y;if(p){x=p.getSpacedPoints(f),v=!0,h=!1;const te=p.isCatmullRomCurve3?p.closed:!1;E=p.computeFrenetFrames(f,te),w=new C,R=new C,y=new C}h||(g=0,d=0,m=0,_=0);const T=o.extractPoints(c);let P=T.shape;const L=T.holes;if(!oi.isClockWise(P)){P=P.reverse();for(let te=0,se=L.length;te<se;te++){const ie=L[te];oi.isClockWise(ie)&&(L[te]=ie.reverse())}}function $(te){const ie=10000000000000001e-36;let Me=te[0];for(let ve=1;ve<=te.length;ve++){const He=ve%te.length,Le=te[He],Ye=Le.x-Me.x,$e=Le.y-Me.y,I=Ye*Ye+$e*$e,_t=Math.max(Math.abs(Le.x),Math.abs(Le.y),Math.abs(Me.x),Math.abs(Me.y)),st=ie*_t*_t;if(I<=st){te.splice(He,1),ve--;continue}Me=Le}}$(P),L.forEach($);const Z=L.length,z=P;for(let te=0;te<Z;te++){const se=L[te];P=P.concat(se)}function K(te,se,ie){return se||ft("ExtrudeGeometry: vec does not exist"),te.clone().addScaledVector(se,ie)}const G=P.length;function ee(te,se,ie){let Me,ve,He;const Le=te.x-se.x,Ye=te.y-se.y,$e=ie.x-te.x,I=ie.y-te.y,_t=Le*Le+Ye*Ye,st=Le*I-Ye*$e;if(Math.abs(st)>Number.EPSILON){const A=Math.sqrt(_t),b=Math.sqrt($e*$e+I*I),B=se.x-Ye/A,W=se.y+Le/A,Y=ie.x-I/b,le=ie.y+$e/b,ce=((Y-B)*I-(le-W)*$e)/(Le*I-Ye*$e);Me=B+Le*ce-te.x,ve=W+Ye*ce-te.y;const q=Me*Me+ve*ve;if(q<=2)return new oe(Me,ve);He=Math.sqrt(q/2)}else{let A=!1;Le>Number.EPSILON?$e>Number.EPSILON&&(A=!0):Le<-Number.EPSILON?$e<-Number.EPSILON&&(A=!0):Math.sign(Ye)===Math.sign(I)&&(A=!0),A?(Me=-Ye,ve=Le,He=Math.sqrt(_t)):(Me=Le,ve=Ye,He=Math.sqrt(_t/2))}return new oe(Me/He,ve/He)}const re=[];for(let te=0,se=z.length,ie=se-1,Me=te+1;te<se;te++,ie++,Me++)ie===se&&(ie=0),Me===se&&(Me=0),re[te]=ee(z[te],z[ie],z[Me]);const de=[];let he,Ee=re.concat();for(let te=0,se=Z;te<se;te++){const ie=L[te];he=[];for(let Me=0,ve=ie.length,He=ve-1,Le=Me+1;Me<ve;Me++,He++,Le++)He===ve&&(He=0),Le===ve&&(Le=0),he[Me]=ee(ie[Me],ie[He],ie[Le]);de.push(he),Ee=Ee.concat(he)}let tt;if(g===0)tt=oi.triangulateShape(z,L);else{const te=[],se=[];for(let ie=0;ie<g;ie++){const Me=ie/g,ve=d*Math.cos(Me*Math.PI/2),He=m*Math.sin(Me*Math.PI/2)+_;for(let Le=0,Ye=z.length;Le<Ye;Le++){const $e=K(z[Le],re[Le],He);Ne($e.x,$e.y,-ve),Me===0&&te.push($e)}for(let Le=0,Ye=Z;Le<Ye;Le++){const $e=L[Le];he=de[Le];const I=[];for(let _t=0,st=$e.length;_t<st;_t++){const A=K($e[_t],he[_t],He);Ne(A.x,A.y,-ve),Me===0&&I.push(A)}Me===0&&se.push(I)}}tt=oi.triangulateShape(te,se)}const St=tt.length,ht=m+_;for(let te=0;te<G;te++){const se=h?K(P[te],Ee[te],ht):P[te];v?(R.copy(E.normals[0]).multiplyScalar(se.x),w.copy(E.binormals[0]).multiplyScalar(se.y),y.copy(x[0]).add(R).add(w),Ne(y.x,y.y,y.z)):Ne(se.x,se.y,0)}for(let te=1;te<=f;te++)for(let se=0;se<G;se++){const ie=h?K(P[se],Ee[se],ht):P[se];v?(R.copy(E.normals[te]).multiplyScalar(ie.x),w.copy(E.binormals[te]).multiplyScalar(ie.y),y.copy(x[te]).add(R).add(w),Ne(y.x,y.y,y.z)):Ne(ie.x,ie.y,u/f*te)}for(let te=g-1;te>=0;te--){const se=te/g,ie=d*Math.cos(se*Math.PI/2),Me=m*Math.sin(se*Math.PI/2)+_;for(let ve=0,He=z.length;ve<He;ve++){const Le=K(z[ve],re[ve],Me);Ne(Le.x,Le.y,u+ie)}for(let ve=0,He=L.length;ve<He;ve++){const Le=L[ve];he=de[ve];for(let Ye=0,$e=Le.length;Ye<$e;Ye++){const I=K(Le[Ye],he[Ye],Me);v?Ne(I.x,I.y+x[f-1].y,x[f-1].x+ie):Ne(I.x,I.y,u+ie)}}}Q(),fe();function Q(){const te=s.length/3;if(h){let se=0,ie=G*se;for(let Me=0;Me<St;Me++){const ve=tt[Me];Xe(ve[2]+ie,ve[1]+ie,ve[0]+ie)}se=f+g*2,ie=G*se;for(let Me=0;Me<St;Me++){const ve=tt[Me];Xe(ve[0]+ie,ve[1]+ie,ve[2]+ie)}}else{for(let se=0;se<St;se++){const ie=tt[se];Xe(ie[2],ie[1],ie[0])}for(let se=0;se<St;se++){const ie=tt[se];Xe(ie[0]+G*f,ie[1]+G*f,ie[2]+G*f)}}i.addGroup(te,s.length/3-te,0)}function fe(){const te=s.length/3;let se=0;ae(z,se),se+=z.length;for(let ie=0,Me=L.length;ie<Me;ie++){const ve=L[ie];ae(ve,se),se+=ve.length}i.addGroup(te,s.length/3-te,1)}function ae(te,se){let ie=te.length;for(;--ie>=0;){const Me=ie;let ve=ie-1;ve<0&&(ve=te.length-1);for(let He=0,Le=f+g*2;He<Le;He++){const Ye=G*He,$e=G*(He+1),I=se+Me+Ye,_t=se+ve+Ye,st=se+ve+$e,A=se+Me+$e;ke(I,_t,st,A)}}}function Ne(te,se,ie){l.push(te),l.push(se),l.push(ie)}function Xe(te,se,ie){mt(te),mt(se),mt(ie);const Me=s.length/3,ve=M.generateTopUV(i,s,Me-3,Me-2,Me-1);qe(ve[0]),qe(ve[1]),qe(ve[2])}function ke(te,se,ie,Me){mt(te),mt(se),mt(Me),mt(se),mt(ie),mt(Me);const ve=s.length/3,He=M.generateSideWallUV(i,s,ve-6,ve-3,ve-2,ve-1);qe(He[0]),qe(He[1]),qe(He[3]),qe(He[1]),qe(He[2]),qe(He[3])}function mt(te){s.push(l[te*3+0]),s.push(l[te*3+1]),s.push(l[te*3+2])}function qe(te){r.push(te.x),r.push(te.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return Fm(t,i,e)}static fromJSON(e,t){const i=[];for(let r=0,a=e.shapes.length;r<a;r++){const o=t[e.shapes[r]];i.push(o)}const s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new qa[s.type]().fromJSON(s)),new zc(i,e.options)}}const Nm={generateTopUV:function(n,e,t,i,s){const r=e[t*3],a=e[t*3+1],o=e[i*3],l=e[i*3+1],c=e[s*3],f=e[s*3+1];return[new oe(r,a),new oe(o,l),new oe(c,f)]},generateSideWallUV:function(n,e,t,i,s,r){const a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[i*3],f=e[i*3+1],u=e[i*3+2],h=e[s*3],d=e[s*3+1],m=e[s*3+2],_=e[r*3],g=e[r*3+1],p=e[r*3+2];return Math.abs(o-f)<Math.abs(a-c)?[new oe(a,1-l),new oe(c,1-u),new oe(h,1-m),new oe(_,1-p)]:[new oe(o,1-l),new oe(f,1-u),new oe(d,1-m),new oe(g,1-p)]}};function Fm(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){const r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class kc extends no{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new kc(e.radius,e.detail)}}class ps extends no{constructor(e=1,t=0){const i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new ps(e.radius,e.detail)}}class Zs extends vt{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(i),l=Math.floor(s),c=o+1,f=l+1,u=e/o,h=t/l,d=[],m=[],_=[],g=[];for(let p=0;p<f;p++){const M=p*h-a;for(let x=0;x<c;x++){const v=x*u-r;m.push(v,-M,0),_.push(0,0,1),g.push(x/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<o;M++){const x=M+c*p,v=M+c*(p+1),E=M+1+c*(p+1),w=M+1+c*p;d.push(x,v,w),d.push(v,E,w)}this.setIndex(d),this.setAttribute("position",new je(m,3)),this.setAttribute("normal",new je(_,3)),this.setAttribute("uv",new je(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zs(e.width,e.height,e.widthSegments,e.heightSegments)}}class Gc extends vt{constructor(e=.5,t=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);const o=[],l=[],c=[],f=[];let u=e;const h=(t-e)/s,d=new C,m=new oe;for(let _=0;_<=s;_++){for(let g=0;g<=i;g++){const p=r+g/i*a;d.x=u*Math.cos(p),d.y=u*Math.sin(p),l.push(d.x,d.y,d.z),c.push(0,0,1),m.x=(d.x/t+1)/2,m.y=(d.y/t+1)/2,f.push(m.x,m.y)}u+=h}for(let _=0;_<s;_++){const g=_*(i+1);for(let p=0;p<i;p++){const M=p+g,x=M,v=M+i+1,E=M+i+2,w=M+1;o.push(x,v,w),o.push(v,E,w)}}this.setIndex(o),this.setAttribute("position",new je(l,3)),this.setAttribute("normal",new je(c,3)),this.setAttribute("uv",new je(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gc(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class io extends vt{constructor(e=new kr([new oe(0,.5),new oe(-.5,-.5),new oe(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const i=[],s=[],r=[],a=[];let o=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let f=0;f<e.length;f++)c(e[f]),this.addGroup(o,l,f),o+=l,l=0;this.setIndex(i),this.setAttribute("position",new je(s,3)),this.setAttribute("normal",new je(r,3)),this.setAttribute("uv",new je(a,2));function c(f){const u=s.length/3,h=f.extractPoints(t);let d=h.shape;const m=h.holes;oi.isClockWise(d)===!1&&(d=d.reverse());for(let g=0,p=m.length;g<p;g++){const M=m[g];oi.isClockWise(M)===!0&&(m[g]=M.reverse())}const _=oi.triangulateShape(d,m);for(let g=0,p=m.length;g<p;g++){const M=m[g];d=d.concat(M)}for(let g=0,p=d.length;g<p;g++){const M=d[g];s.push(M.x,M.y,0),r.push(0,0,1),a.push(M.x,M.y)}for(let g=0,p=_.length;g<p;g++){const M=_[g],x=M[0]+u,v=M[1]+u,E=M[2]+u;i.push(x,v,E),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return Om(t,e)}static fromJSON(e,t){const i=[];for(let s=0,r=e.shapes.length;s<r;s++){const a=t[e.shapes[s]];i.push(a)}return new io(i,e.curveSegments)}}function Om(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){const s=n[t];e.shapes.push(s.uuid)}else e.shapes.push(n.uuid);return e}class Ui extends vt{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(a+o,Math.PI);let c=0;const f=[],u=new C,h=new C,d=[],m=[],_=[],g=[];for(let p=0;p<=i;p++){const M=[],x=p/i,v=a+x*o,E=e*Math.cos(v),w=Math.sqrt(e*e-E*E);let R=0;p===0&&a===0?R=.5/t:p===i&&l===Math.PI&&(R=-.5/t);for(let y=0;y<=t;y++){const T=y/t,P=s+T*r;u.x=-w*Math.cos(P),u.y=E,u.z=w*Math.sin(P),m.push(u.x,u.y,u.z),h.copy(u).normalize(),_.push(h.x,h.y,h.z),g.push(T+R,1-x),M.push(c++)}f.push(M)}for(let p=0;p<i;p++)for(let M=0;M<t;M++){const x=f[p][M+1],v=f[p][M],E=f[p+1][M],w=f[p+1][M+1];(p!==0||a>0)&&d.push(x,v,w),(p!==i-1||l<Math.PI)&&d.push(v,E,w)}this.setIndex(d),this.setAttribute("position",new je(m,3)),this.setAttribute("normal",new je(_,3)),this.setAttribute("uv",new je(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ui(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class pi extends vt{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},i=Math.floor(i),s=Math.floor(s);const l=[],c=[],f=[],u=[],h=new C,d=new C,m=new C;for(let _=0;_<=i;_++){const g=a+_/i*o;for(let p=0;p<=s;p++){const M=p/s*r;d.x=(e+t*Math.cos(g))*Math.cos(M),d.y=(e+t*Math.cos(g))*Math.sin(M),d.z=t*Math.sin(g),c.push(d.x,d.y,d.z),h.x=e*Math.cos(M),h.y=e*Math.sin(M),m.subVectors(d,h).normalize(),f.push(m.x,m.y,m.z),u.push(p/s),u.push(_/i)}}for(let _=1;_<=i;_++)for(let g=1;g<=s;g++){const p=(s+1)*_+g-1,M=(s+1)*(_-1)+g-1,x=(s+1)*(_-1)+g,v=(s+1)*_+g;l.push(p,M,v),l.push(M,x,v)}this.setIndex(l),this.setAttribute("position",new je(c,3)),this.setAttribute("normal",new je(f,3)),this.setAttribute("uv",new je(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new pi(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Hc extends vt{constructor(e=new Uu(new C(-1,-1,0),new C(-1,1,0),new C(1,1,0)),t=64,i=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:s,closed:r};const a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;const o=new C,l=new C,c=new oe;let f=new C;const u=[],h=[],d=[],m=[];_(),this.setIndex(m),this.setAttribute("position",new je(u,3)),this.setAttribute("normal",new je(h,3)),this.setAttribute("uv",new je(d,2));function _(){for(let x=0;x<t;x++)g(x);g(r===!1?t:0),M(),p()}function g(x){f=e.getPointAt(x/t,f);const v=a.normals[x],E=a.binormals[x];for(let w=0;w<=s;w++){const R=w/s*Math.PI*2,y=Math.sin(R),T=-Math.cos(R);l.x=T*v.x+y*E.x,l.y=T*v.y+y*E.y,l.z=T*v.z+y*E.z,l.normalize(),h.push(l.x,l.y,l.z),o.x=f.x+i*l.x,o.y=f.y+i*l.y,o.z=f.z+i*l.z,u.push(o.x,o.y,o.z)}}function p(){for(let x=1;x<=t;x++)for(let v=1;v<=s;v++){const E=(s+1)*(x-1)+(v-1),w=(s+1)*x+(v-1),R=(s+1)*x+v,y=(s+1)*(x-1)+v;m.push(E,w,y),m.push(w,R,y)}}function M(){for(let x=0;x<=t;x++)for(let v=0;v<=s;v++)c.x=x/t,c.y=v/s,d.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Hc(new qa[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}function Vs(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];if(af(s))s.isRenderTargetTexture?(Ve("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if(af(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function an(n){const e={};for(let t=0;t<n.length;t++){const i=Vs(n[t]);for(const s in i)e[s]=i[s]}return e}function af(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function Bm(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function ku(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ot.workingColorSpace}const Gu={clone:Vs,merge:an};var zm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,km=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class sn extends zi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=zm,this.fragmentShader=km,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Vs(e.uniforms),this.uniformsGroups=Bm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const i in e.uniforms){const s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new Ae().setHex(s.value);break;case"v2":this.uniforms[i].value=new oe().fromArray(s.value);break;case"v3":this.uniforms[i].value=new C().fromArray(s.value);break;case"v4":this.uniforms[i].value=new At().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Ke().fromArray(s.value);break;case"m4":this.uniforms[i].value=new bt().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Gm extends sn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Hm extends zi{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new Ae(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ga,this.normalScale=new oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}class Vm extends zi{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ga,this.normalScale=new oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Oi,this.combine=yc,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Wm extends zi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=lp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Xm extends zi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Vc extends Rt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ae(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Ym extends Vc{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ae(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const Yo=new bt,of=new C,lf=new C;class Hu{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new oe(512,512),this.mapType=fn,this.map=null,this.mapPass=null,this.matrix=new bt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Fc,this._frameExtents=new oe(1,1),this._viewportCount=1,this._viewports=[new At(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;of.setFromMatrixPosition(e.matrixWorld),t.position.copy(of),lf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(lf),t.updateMatrixWorld(),Yo.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Yo,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===Pr||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Yo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const ga=new C,xa=new $s,kn=new C;class Wc extends Rt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new bt,this.projectionMatrix=new bt,this.projectionMatrixInverse=new bt,this.coordinateSystem=qn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ga,xa,kn),kn.x===1&&kn.y===1&&kn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ga,xa,kn.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(ga,xa,kn),kn.x===1&&kn.y===1&&kn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ga,xa,kn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Ei=new C,cf=new oe,hf=new oe;class gn extends Wc{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Lr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Mr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Lr*2*Math.atan(Math.tan(Mr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Ei.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ei.x,Ei.y).multiplyScalar(-e/Ei.z),Ei.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ei.x,Ei.y).multiplyScalar(-e/Ei.z)}getViewSize(e,t){return this.getViewBounds(e,cf,hf),t.subVectors(hf,cf)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Mr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*i/c,s*=a.width/l,i*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class qm extends Hu{constructor(){super(new gn(90,1,.5,500)),this.isPointLightShadow=!0}}class Vu extends Vc{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new qm}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class Xc extends Wc{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,a=i+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=f*this.view.offsetY,l=o-f*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class $m extends Hu{constructor(){super(new Xc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Km extends Vc{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.target=new Rt,this.shadow=new $m}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}const Cs=-90,Ps=1;class Zm extends Rt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new gn(Cs,Ps,e,t);s.layers=this.layers,this.add(s);const r=new gn(Cs,Ps,e,t);r.layers=this.layers,this.add(r);const a=new gn(Cs,Ps,e,t);a.layers=this.layers,this.add(a);const o=new gn(Cs,Ps,e,t);o.layers=this.layers,this.add(o);const l=new gn(Cs,Ps,e,t);l.layers=this.layers,this.add(l);const c=new gn(Cs,Ps,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===qn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Pr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,f]=this.children,u=e.getRenderTarget(),h=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,f),e.setRenderTarget(u,h,d),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}}class Jm extends gn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const lh=class lh{constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){const r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};lh.prototype.isMatrix2=!0;let ff=lh;function uf(n,e,t,i){const s=Qm(i);switch(t){case vu:return n*e;case wc:return n*e/s.components*s.byteLength;case Tc:return n*e/s.components*s.byteLength;case as:return n*e*2/s.components*s.byteLength;case Ac:return n*e*2/s.components*s.byteLength;case _u:return n*e*3/s.components*s.byteLength;case En:return n*e*4/s.components*s.byteLength;case Rc:return n*e*4/s.components*s.byteLength;case Aa:case Ra:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Ca:case Pa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Ll:case Dl:return Math.max(n,16)*Math.max(e,8)/4;case Pl:case Il:return Math.max(n,8)*Math.max(e,8)/2;case Ul:case Nl:case Ol:case Bl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Fl:case za:case zl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case kl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Gl:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Hl:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Vl:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Wl:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Xl:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Yl:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case ql:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case $l:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Kl:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Zl:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Jl:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Ql:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case jl:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case ec:case tc:case nc:return Math.ceil(n/4)*Math.ceil(e/4)*16;case ic:case sc:return Math.ceil(n/4)*Math.ceil(e/4)*8;case ka:case rc:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Qm(n){switch(n){case fn:case pu:return{byteLength:1,components:1};case Rr:case mu:case Kn:return{byteLength:2,components:1};case Sc:case Ec:return{byteLength:2,components:4};case Nn:case bc:case Ln:return{byteLength:4,components:1};case gu:case xu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Mc}}));typeof window<"u"&&(window.__THREE__?Ve("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Mc);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Wu(){let n=null,e=!1,t=null,i=null;function s(r,a){t(r,a),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function jm(n){const e=new WeakMap;function t(o,l){const c=o.array,f=o.usage,u=c.byteLength,h=n.createBuffer();n.bindBuffer(l,h),n.bufferData(l,c,f),o.onUploadCallback();let d;if(c instanceof Float32Array)d=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=n.HALF_FLOAT:d=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=n.SHORT;else if(c instanceof Uint32Array)d=n.UNSIGNED_INT;else if(c instanceof Int32Array)d=n.INT;else if(c instanceof Int8Array)d=n.BYTE;else if(c instanceof Uint8Array)d=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function i(o,l,c){const f=l.array,u=l.updateRanges;if(n.bindBuffer(c,o),u.length===0)n.bufferSubData(c,0,f);else{u.sort((d,m)=>d.start-m.start);let h=0;for(let d=1;d<u.length;d++){const m=u[h],_=u[d];_.start<=m.start+m.count+1?m.count=Math.max(m.count,_.start+_.count-m.start):(++h,u[h]=_)}u.length=h+1;for(let d=0,m=u.length;d<m;d++){const _=u[d];n.bufferSubData(c,_.start*f.BYTES_PER_ELEMENT,f,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(n.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const f=e.get(o);(!f||f.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var e0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,t0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,n0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,i0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,s0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,r0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,a0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,o0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,l0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,c0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,h0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,f0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,u0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,d0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,p0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,m0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,g0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,x0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,v0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,_0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,M0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,y0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,b0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,S0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,E0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,w0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,T0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,A0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,R0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,C0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,P0="gl_FragColor = linearToOutputTexel( gl_FragColor );",L0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,I0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,D0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,U0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,N0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,F0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,O0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,B0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,z0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,k0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,G0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,H0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,V0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,W0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,X0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Y0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,q0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,$0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,K0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Z0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,J0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Q0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,j0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,eg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,tg=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ng=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,ig=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,sg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,rg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ag=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,og=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,lg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,cg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,hg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,fg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ug=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,dg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,pg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,mg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,gg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,xg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,vg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,_g=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Mg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,yg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,bg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Sg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Eg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,wg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Tg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ag=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Rg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Cg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Pg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Lg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ig=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Dg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ug=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Ng=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Fg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Og=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Bg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,zg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,kg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Gg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Hg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Vg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Wg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Xg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Yg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,qg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,$g=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Kg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Zg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Jg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Qg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,jg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const ex=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,tx=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,nx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ix=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,rx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ax=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,ox=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,lx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,cx=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,hx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,fx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ux=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,dx=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,px=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,mx=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gx=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xx=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vx=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,_x=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Mx=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,yx=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,bx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Sx=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ex=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,wx=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tx=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ax=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Rx=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Cx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Px=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Lx=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ix=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Dx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,et={alphahash_fragment:e0,alphahash_pars_fragment:t0,alphamap_fragment:n0,alphamap_pars_fragment:i0,alphatest_fragment:s0,alphatest_pars_fragment:r0,aomap_fragment:a0,aomap_pars_fragment:o0,batching_pars_vertex:l0,batching_vertex:c0,begin_vertex:h0,beginnormal_vertex:f0,bsdfs:u0,iridescence_fragment:d0,bumpmap_pars_fragment:p0,clipping_planes_fragment:m0,clipping_planes_pars_fragment:g0,clipping_planes_pars_vertex:x0,clipping_planes_vertex:v0,color_fragment:_0,color_pars_fragment:M0,color_pars_vertex:y0,color_vertex:b0,common:S0,cube_uv_reflection_fragment:E0,defaultnormal_vertex:w0,displacementmap_pars_vertex:T0,displacementmap_vertex:A0,emissivemap_fragment:R0,emissivemap_pars_fragment:C0,colorspace_fragment:P0,colorspace_pars_fragment:L0,envmap_fragment:I0,envmap_common_pars_fragment:D0,envmap_pars_fragment:U0,envmap_pars_vertex:N0,envmap_physical_pars_fragment:Y0,envmap_vertex:F0,fog_vertex:O0,fog_pars_vertex:B0,fog_fragment:z0,fog_pars_fragment:k0,gradientmap_pars_fragment:G0,lightmap_pars_fragment:H0,lights_lambert_fragment:V0,lights_lambert_pars_fragment:W0,lights_pars_begin:X0,lights_toon_fragment:q0,lights_toon_pars_fragment:$0,lights_phong_fragment:K0,lights_phong_pars_fragment:Z0,lights_physical_fragment:J0,lights_physical_pars_fragment:Q0,lights_fragment_begin:j0,lights_fragment_maps:eg,lights_fragment_end:tg,lightprobes_pars_fragment:ng,logdepthbuf_fragment:ig,logdepthbuf_pars_fragment:sg,logdepthbuf_pars_vertex:rg,logdepthbuf_vertex:ag,map_fragment:og,map_pars_fragment:lg,map_particle_fragment:cg,map_particle_pars_fragment:hg,metalnessmap_fragment:fg,metalnessmap_pars_fragment:ug,morphinstance_vertex:dg,morphcolor_vertex:pg,morphnormal_vertex:mg,morphtarget_pars_vertex:gg,morphtarget_vertex:xg,normal_fragment_begin:vg,normal_fragment_maps:_g,normal_pars_fragment:Mg,normal_pars_vertex:yg,normal_vertex:bg,normalmap_pars_fragment:Sg,clearcoat_normal_fragment_begin:Eg,clearcoat_normal_fragment_maps:wg,clearcoat_pars_fragment:Tg,iridescence_pars_fragment:Ag,opaque_fragment:Rg,packing:Cg,premultiplied_alpha_fragment:Pg,project_vertex:Lg,dithering_fragment:Ig,dithering_pars_fragment:Dg,roughnessmap_fragment:Ug,roughnessmap_pars_fragment:Ng,shadowmap_pars_fragment:Fg,shadowmap_pars_vertex:Og,shadowmap_vertex:Bg,shadowmask_pars_fragment:zg,skinbase_vertex:kg,skinning_pars_vertex:Gg,skinning_vertex:Hg,skinnormal_vertex:Vg,specularmap_fragment:Wg,specularmap_pars_fragment:Xg,tonemapping_fragment:Yg,tonemapping_pars_fragment:qg,transmission_fragment:$g,transmission_pars_fragment:Kg,uv_pars_fragment:Zg,uv_pars_vertex:Jg,uv_vertex:Qg,worldpos_vertex:jg,background_vert:ex,background_frag:tx,backgroundCube_vert:nx,backgroundCube_frag:ix,cube_vert:sx,cube_frag:rx,depth_vert:ax,depth_frag:ox,distance_vert:lx,distance_frag:cx,equirect_vert:hx,equirect_frag:fx,linedashed_vert:ux,linedashed_frag:dx,meshbasic_vert:px,meshbasic_frag:mx,meshlambert_vert:gx,meshlambert_frag:xx,meshmatcap_vert:vx,meshmatcap_frag:_x,meshnormal_vert:Mx,meshnormal_frag:yx,meshphong_vert:bx,meshphong_frag:Sx,meshphysical_vert:Ex,meshphysical_frag:wx,meshtoon_vert:Tx,meshtoon_frag:Ax,points_vert:Rx,points_frag:Cx,shadow_vert:Px,shadow_frag:Lx,sprite_vert:Ix,sprite_frag:Dx},xe={common:{diffuse:{value:new Ae(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ke},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ke}},envmap:{envMap:{value:null},envMapRotation:{value:new Ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ke},normalScale:{value:new oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ae(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new C},probesMax:{value:new C},probesResolution:{value:new C}},points:{diffuse:{value:new Ae(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0},uvTransform:{value:new Ke}},sprite:{diffuse:{value:new Ae(16777215)},opacity:{value:1},center:{value:new oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ke},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0}}},Wn={basic:{uniforms:an([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.fog]),vertexShader:et.meshbasic_vert,fragmentShader:et.meshbasic_frag},lambert:{uniforms:an([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new Ae(0)},envMapIntensity:{value:1}}]),vertexShader:et.meshlambert_vert,fragmentShader:et.meshlambert_frag},phong:{uniforms:an([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new Ae(0)},specular:{value:new Ae(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:et.meshphong_vert,fragmentShader:et.meshphong_frag},standard:{uniforms:an([xe.common,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.roughnessmap,xe.metalnessmap,xe.fog,xe.lights,{emissive:{value:new Ae(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag},toon:{uniforms:an([xe.common,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.gradientmap,xe.fog,xe.lights,{emissive:{value:new Ae(0)}}]),vertexShader:et.meshtoon_vert,fragmentShader:et.meshtoon_frag},matcap:{uniforms:an([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,{matcap:{value:null}}]),vertexShader:et.meshmatcap_vert,fragmentShader:et.meshmatcap_frag},points:{uniforms:an([xe.points,xe.fog]),vertexShader:et.points_vert,fragmentShader:et.points_frag},dashed:{uniforms:an([xe.common,xe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:et.linedashed_vert,fragmentShader:et.linedashed_frag},depth:{uniforms:an([xe.common,xe.displacementmap]),vertexShader:et.depth_vert,fragmentShader:et.depth_frag},normal:{uniforms:an([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,{opacity:{value:1}}]),vertexShader:et.meshnormal_vert,fragmentShader:et.meshnormal_frag},sprite:{uniforms:an([xe.sprite,xe.fog]),vertexShader:et.sprite_vert,fragmentShader:et.sprite_frag},background:{uniforms:{uvTransform:{value:new Ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:et.background_vert,fragmentShader:et.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ke}},vertexShader:et.backgroundCube_vert,fragmentShader:et.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:et.cube_vert,fragmentShader:et.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:et.equirect_vert,fragmentShader:et.equirect_frag},distance:{uniforms:an([xe.common,xe.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:et.distance_vert,fragmentShader:et.distance_frag},shadow:{uniforms:an([xe.lights,xe.fog,{color:{value:new Ae(0)},opacity:{value:1}}]),vertexShader:et.shadow_vert,fragmentShader:et.shadow_frag}};Wn.physical={uniforms:an([Wn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ke},clearcoatNormalScale:{value:new oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ke},sheen:{value:0},sheenColor:{value:new Ae(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ke},transmissionSamplerSize:{value:new oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ke},attenuationDistance:{value:0},attenuationColor:{value:new Ae(0)},specularColor:{value:new Ae(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ke},anisotropyVector:{value:new oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ke}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag};const va={r:0,b:0,g:0},Ux=new bt,Xu=new Ke;Xu.set(-1,0,0,0,1,0,0,0,1);function Nx(n,e,t,i,s,r){const a=new Ae(0);let o=s===!0?0:1,l,c,f=null,u=0,h=null;function d(M){let x=M.isScene===!0?M.background:null;if(x&&x.isTexture){const v=M.backgroundBlurriness>0;x=e.get(x,v)}return x}function m(M){let x=!1;const v=d(M);v===null?g(a,o):v&&v.isColor&&(g(v,1),x=!0);const E=n.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||x)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function _(M,x){const v=d(x);v&&(v.isCubeTexture||v.mapping===eo)?(c===void 0&&(c=new at(new Fn(1,1,1),new sn({name:"BackgroundCubeMaterial",uniforms:Vs(Wn.backgroundCube.uniforms),vertexShader:Wn.backgroundCube.vertexShader,fragmentShader:Wn.backgroundCube.fragmentShader,side:nn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,w,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Ux.makeRotationFromEuler(x.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Xu),c.material.toneMapped=ot.getTransfer(v.colorSpace)!==xt,(f!==v||u!==v.version||h!==n.toneMapping)&&(c.material.needsUpdate=!0,f=v,u=v.version,h=n.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new at(new Zs(2,2),new sn({name:"BackgroundMaterial",uniforms:Vs(Wn.background.uniforms),vertexShader:Wn.background.vertexShader,fragmentShader:Wn.background.fragmentShader,side:ui,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,l.material.toneMapped=ot.getTransfer(v.colorSpace)!==xt,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(f!==v||u!==v.version||h!==n.toneMapping)&&(l.material.needsUpdate=!0,f=v,u=v.version,h=n.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function g(M,x){M.getRGB(va,ku(n)),t.buffers.color.setClear(va.r,va.g,va.b,x,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,x=1){a.set(M),o=x,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,g(a,o)},render:m,addToRenderList:_,dispose:p}}function Fx(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=h(null);let r=s,a=!1;function o(L,O,$,Z,z){let K=!1;const G=u(L,Z,$,O);r!==G&&(r=G,c(r.object)),K=d(L,Z,$,z),K&&m(L,Z,$,z),z!==null&&e.update(z,n.ELEMENT_ARRAY_BUFFER),(K||a)&&(a=!1,v(L,O,$,Z),z!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(z).buffer))}function l(){return n.createVertexArray()}function c(L){return n.bindVertexArray(L)}function f(L){return n.deleteVertexArray(L)}function u(L,O,$,Z){const z=Z.wireframe===!0;let K=i[O.id];K===void 0&&(K={},i[O.id]=K);const G=L.isInstancedMesh===!0?L.id:0;let ee=K[G];ee===void 0&&(ee={},K[G]=ee);let re=ee[$.id];re===void 0&&(re={},ee[$.id]=re);let de=re[z];return de===void 0&&(de=h(l()),re[z]=de),de}function h(L){const O=[],$=[],Z=[];for(let z=0;z<t;z++)O[z]=0,$[z]=0,Z[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:$,attributeDivisors:Z,object:L,attributes:{},index:null}}function d(L,O,$,Z){const z=r.attributes,K=O.attributes;let G=0;const ee=$.getAttributes();for(const re in ee)if(ee[re].location>=0){const he=z[re];let Ee=K[re];if(Ee===void 0&&(re==="instanceMatrix"&&L.instanceMatrix&&(Ee=L.instanceMatrix),re==="instanceColor"&&L.instanceColor&&(Ee=L.instanceColor)),he===void 0||he.attribute!==Ee||Ee&&he.data!==Ee.data)return!0;G++}return r.attributesNum!==G||r.index!==Z}function m(L,O,$,Z){const z={},K=O.attributes;let G=0;const ee=$.getAttributes();for(const re in ee)if(ee[re].location>=0){let he=K[re];he===void 0&&(re==="instanceMatrix"&&L.instanceMatrix&&(he=L.instanceMatrix),re==="instanceColor"&&L.instanceColor&&(he=L.instanceColor));const Ee={};Ee.attribute=he,he&&he.data&&(Ee.data=he.data),z[re]=Ee,G++}r.attributes=z,r.attributesNum=G,r.index=Z}function _(){const L=r.newAttributes;for(let O=0,$=L.length;O<$;O++)L[O]=0}function g(L){p(L,0)}function p(L,O){const $=r.newAttributes,Z=r.enabledAttributes,z=r.attributeDivisors;$[L]=1,Z[L]===0&&(n.enableVertexAttribArray(L),Z[L]=1),z[L]!==O&&(n.vertexAttribDivisor(L,O),z[L]=O)}function M(){const L=r.newAttributes,O=r.enabledAttributes;for(let $=0,Z=O.length;$<Z;$++)O[$]!==L[$]&&(n.disableVertexAttribArray($),O[$]=0)}function x(L,O,$,Z,z,K,G){G===!0?n.vertexAttribIPointer(L,O,$,z,K):n.vertexAttribPointer(L,O,$,Z,z,K)}function v(L,O,$,Z){_();const z=Z.attributes,K=$.getAttributes(),G=O.defaultAttributeValues;for(const ee in K){const re=K[ee];if(re.location>=0){let de=z[ee];if(de===void 0&&(ee==="instanceMatrix"&&L.instanceMatrix&&(de=L.instanceMatrix),ee==="instanceColor"&&L.instanceColor&&(de=L.instanceColor)),de!==void 0){const he=de.normalized,Ee=de.itemSize,tt=e.get(de);if(tt===void 0)continue;const St=tt.buffer,ht=tt.type,Q=tt.bytesPerElement,fe=ht===n.INT||ht===n.UNSIGNED_INT||de.gpuType===bc;if(de.isInterleavedBufferAttribute){const ae=de.data,Ne=ae.stride,Xe=de.offset;if(ae.isInstancedInterleavedBuffer){for(let ke=0;ke<re.locationSize;ke++)p(re.location+ke,ae.meshPerAttribute);L.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let ke=0;ke<re.locationSize;ke++)g(re.location+ke);n.bindBuffer(n.ARRAY_BUFFER,St);for(let ke=0;ke<re.locationSize;ke++)x(re.location+ke,Ee/re.locationSize,ht,he,Ne*Q,(Xe+Ee/re.locationSize*ke)*Q,fe)}else{if(de.isInstancedBufferAttribute){for(let ae=0;ae<re.locationSize;ae++)p(re.location+ae,de.meshPerAttribute);L.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let ae=0;ae<re.locationSize;ae++)g(re.location+ae);n.bindBuffer(n.ARRAY_BUFFER,St);for(let ae=0;ae<re.locationSize;ae++)x(re.location+ae,Ee/re.locationSize,ht,he,Ee*Q,Ee/re.locationSize*ae*Q,fe)}}else if(G!==void 0){const he=G[ee];if(he!==void 0)switch(he.length){case 2:n.vertexAttrib2fv(re.location,he);break;case 3:n.vertexAttrib3fv(re.location,he);break;case 4:n.vertexAttrib4fv(re.location,he);break;default:n.vertexAttrib1fv(re.location,he)}}}}M()}function E(){T();for(const L in i){const O=i[L];for(const $ in O){const Z=O[$];for(const z in Z){const K=Z[z];for(const G in K)f(K[G].object),delete K[G];delete Z[z]}}delete i[L]}}function w(L){if(i[L.id]===void 0)return;const O=i[L.id];for(const $ in O){const Z=O[$];for(const z in Z){const K=Z[z];for(const G in K)f(K[G].object),delete K[G];delete Z[z]}}delete i[L.id]}function R(L){for(const O in i){const $=i[O];for(const Z in $){const z=$[Z];if(z[L.id]===void 0)continue;const K=z[L.id];for(const G in K)f(K[G].object),delete K[G];delete z[L.id]}}}function y(L){for(const O in i){const $=i[O],Z=L.isInstancedMesh===!0?L.id:0,z=$[Z];if(z!==void 0){for(const K in z){const G=z[K];for(const ee in G)f(G[ee].object),delete G[ee];delete z[K]}delete $[Z],Object.keys($).length===0&&delete i[O]}}}function T(){P(),a=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:T,resetDefaultState:P,dispose:E,releaseStatesOfGeometry:w,releaseStatesOfObject:y,releaseStatesOfProgram:R,initAttributes:_,enableAttribute:g,disableUnusedAttributes:M}}function Ox(n,e,t){let i;function s(l){i=l}function r(l,c){n.drawArrays(i,l,c),t.update(c,i,1)}function a(l,c,f){f!==0&&(n.drawArraysInstanced(i,l,c,f),t.update(c,i,f))}function o(l,c,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,f);let h=0;for(let d=0;d<f;d++)h+=c[d];t.update(h,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Bx(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(R){return!(R!==En&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){const y=R===Kn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==fn&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==Ln&&!y)}function l(R){if(R==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const f=l(c);f!==c&&(Ve("WebGLRenderer:",c,"not supported, using",f,"instead."),c=f);const u=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&Ve("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const d=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),M=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),x=n.getParameter(n.MAX_VARYING_VECTORS),v=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),E=n.getParameter(n.MAX_SAMPLES),w=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:h,maxTextures:d,maxVertexTextures:m,maxTextureSize:_,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:M,maxVaryings:x,maxFragmentUniforms:v,maxSamples:E,samples:w}}function zx(n){const e=this;let t=null,i=0,s=!1,r=!1;const a=new qi,o=new Ke,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,h){const d=u.length!==0||h||i!==0||s;return s=h,i=u.length,d},this.beginShadows=function(){r=!0,f(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,h){t=f(u,h,0)},this.setState=function(u,h,d){const m=u.clippingPlanes,_=u.clipIntersection,g=u.clipShadows,p=n.get(u);if(!s||m===null||m.length===0||r&&!g)r?f(null):c();else{const M=r?0:i,x=M*4;let v=p.clippingState||null;l.value=v,v=f(m,h,x,d);for(let E=0;E!==x;++E)v[E]=t[E];p.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function f(u,h,d,m){const _=u!==null?u.length:0;let g=null;if(_!==0){if(g=l.value,m!==!0||g===null){const p=d+_*4,M=h.matrixWorldInverse;o.getNormalMatrix(M),(g===null||g.length<p)&&(g=new Float32Array(p));for(let x=0,v=d;x!==_;++x,v+=4)a.copy(u[x]).applyMatrix4(M,o),a.normal.toArray(g,v),g[v+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,g}}const Pi=4,df=[.125,.215,.35,.446,.526,.582],Ji=20,kx=256,lr=new Xc,pf=new Ae;let qo=null,$o=0,Ko=0,Zo=!1;const Gx=new C;class mf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){const{size:a=256,position:o=Gx}=r;qo=this._renderer.getRenderTarget(),$o=this._renderer.getActiveCubeFace(),Ko=this._renderer.getActiveMipmapLevel(),Zo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=vf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=xf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(qo,$o,Ko),this._renderer.xr.enabled=Zo,e.scissorTest=!1,Ls(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===rs||e.mapping===Gs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),qo=this._renderer.getRenderTarget(),$o=this._renderer.getActiveCubeFace(),Ko=this._renderer.getActiveMipmapLevel(),Zo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Vt,minFilter:Vt,generateMipmaps:!1,type:Kn,format:En,colorSpace:Ha,depthBuffer:!1},s=gf(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=gf(e,t,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Hx(r)),this._blurMaterial=Wx(r,e,t),this._ggxMaterial=Vx(r,e,t)}return s}_compileMaterial(e){const t=new at(new vt,e);this._renderer.compile(t,lr)}_sceneToCubeUV(e,t,i,s,r){const l=new gn(90,1,t,i),c=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(pf),u.toneMapping=Dn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new at(new Fn,new Lt({name:"PMREM.Background",side:nn,depthWrite:!1,depthTest:!1})));const _=this._backgroundBox,g=_.material;let p=!1;const M=e.background;M?M.isColor&&(g.color.copy(M),e.background=null,p=!0):(g.color.copy(pf),p=!0);for(let x=0;x<6;x++){const v=x%3;v===0?(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+f[x],r.y,r.z)):v===1?(l.up.set(0,0,c[x]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+f[x],r.z)):(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+f[x]));const E=this._cubeSize;Ls(s,v*E,x>2?E:0,E,E),u.setRenderTarget(s),p&&u.render(_,l),u.render(e,l)}u.toneMapping=d,u.autoClear=h,e.background=M}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===rs||e.mapping===Gs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=vf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=xf());const r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;Ls(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,lr)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){const s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;const l=a.uniforms,c=i/(this._lodMeshes.length-1),f=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-f*f),h=0+c*1.25,d=u*h,{_lodMax:m}=this,_=this._sizeLods[i],g=3*_*(i>m-Pi?i-m+Pi:0),p=4*(this._cubeSize-_);l.envMap.value=e.texture,l.roughness.value=d,l.mipInt.value=m-t,Ls(r,g,p,3*_,2*_),s.setRenderTarget(r),s.render(o,lr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-i,Ls(e,g,p,3*_,2*_),s.setRenderTarget(e),s.render(o,lr)}_blur(e,t,i,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,s,"latitudinal",r),this._halfBlur(a,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&ft("blur direction must be either latitudinal or longitudinal!");const f=3,u=this._lodMeshes[s];u.material=c;const h=c.uniforms,d=this._sizeLods[i]-1,m=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*Ji-1),_=r/m,g=isFinite(r)?1+Math.floor(f*_):Ji;g>Ji&&Ve(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Ji}`);const p=[];let M=0;for(let R=0;R<Ji;++R){const y=R/_,T=Math.exp(-y*y/2);p.push(T),R===0?M+=T:R<g&&(M+=2*T)}for(let R=0;R<p.length;R++)p[R]=p[R]/M;h.envMap.value=e.texture,h.samples.value=g,h.weights.value=p,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);const{_lodMax:x}=this;h.dTheta.value=m,h.mipInt.value=x-i;const v=this._sizeLods[s],E=3*v*(s>x-Pi?s-x+Pi:0),w=4*(this._cubeSize-v);Ls(t,E,w,3*v,2*v),l.setRenderTarget(t),l.render(u,lr)}}function Hx(n){const e=[],t=[],i=[];let s=n;const r=n-Pi+1+df.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>n-Pi?l=df[a-n+Pi-1]:a===0&&(l=0),t.push(l);const c=1/(o-2),f=-c,u=1+c,h=[f,f,u,f,u,u,f,f,u,u,f,u],d=6,m=6,_=3,g=2,p=1,M=new Float32Array(_*m*d),x=new Float32Array(g*m*d),v=new Float32Array(p*m*d);for(let w=0;w<d;w++){const R=w%3*2/3-1,y=w>2?0:-1,T=[R,y,0,R+2/3,y,0,R+2/3,y+1,0,R,y,0,R+2/3,y+1,0,R,y+1,0];M.set(T,_*m*w),x.set(h,g*m*w);const P=[w,w,w,w,w,w];v.set(P,p*m*w)}const E=new vt;E.setAttribute("position",new Ht(M,_)),E.setAttribute("uv",new Ht(x,g)),E.setAttribute("faceIndex",new Ht(v,p)),i.push(new at(E,null)),s>Pi&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function gf(n,e,t){const i=new vn(n,e,t);return i.texture.mapping=eo,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ls(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Vx(n,e,t){return new sn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:kx,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:so(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:ci,depthTest:!1,depthWrite:!1})}function Wx(n,e,t){const i=new Float32Array(Ji),s=new C(0,1,0);return new sn({name:"SphericalGaussianBlur",defines:{n:Ji,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:so(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:ci,depthTest:!1,depthWrite:!1})}function xf(){return new sn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:so(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ci,depthTest:!1,depthWrite:!1})}function vf(){return new sn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:so(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ci,depthTest:!1,depthWrite:!1})}function so(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class Yu extends vn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new Ru(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Fn(5,5,5),r=new sn({name:"CubemapFromEquirect",uniforms:Vs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:nn,blending:ci});r.uniforms.tEquirect.value=t;const a=new at(s,r),o=t.minFilter;return t.minFilter===Ci&&(t.minFilter=Vt),new Zm(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}}function Xx(n){let e=new WeakMap,t=new WeakMap,i=null;function s(h,d=!1){return h==null?null:d?a(h):r(h)}function r(h){if(h&&h.isTexture){const d=h.mapping;if(d===xo||d===vo)if(e.has(h)){const m=e.get(h).texture;return o(m,h.mapping)}else{const m=h.image;if(m&&m.height>0){const _=new Yu(m.height);return _.fromEquirectangularTexture(n,h),e.set(h,_),h.addEventListener("dispose",c),o(_.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){const d=h.mapping,m=d===xo||d===vo,_=d===rs||d===Gs;if(m||_){let g=t.get(h);const p=g!==void 0?g.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==p)return i===null&&(i=new mf(n)),g=m?i.fromEquirectangular(h,g):i.fromCubemap(h,g),g.texture.pmremVersion=h.pmremVersion,t.set(h,g),g.texture;if(g!==void 0)return g.texture;{const M=h.image;return m&&M&&M.height>0||_&&M&&l(M)?(i===null&&(i=new mf(n)),g=m?i.fromEquirectangular(h):i.fromCubemap(h),g.texture.pmremVersion=h.pmremVersion,t.set(h,g),h.addEventListener("dispose",f),g.texture):null}}}return h}function o(h,d){return d===xo?h.mapping=rs:d===vo&&(h.mapping=Gs),h}function l(h){let d=0;const m=6;for(let _=0;_<m;_++)h[_]!==void 0&&d++;return d===m}function c(h){const d=h.target;d.removeEventListener("dispose",c);const m=e.get(d);m!==void 0&&(e.delete(d),m.dispose())}function f(h){const d=h.target;d.removeEventListener("dispose",f);const m=t.get(d);m!==void 0&&(t.delete(d),m.dispose())}function u(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:u}}function Yx(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&Fs("WebGLRenderer: "+i+" extension not supported."),s}}}function qx(n,e,t,i){const s={},r=new WeakMap;function a(u){const h=u.target;h.index!==null&&e.remove(h.index);for(const m in h.attributes)e.remove(h.attributes[m]);h.removeEventListener("dispose",a),delete s[h.id];const d=r.get(h);d&&(e.remove(d),r.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function o(u,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,t.memory.geometries++),h}function l(u){const h=u.attributes;for(const d in h)e.update(h[d],n.ARRAY_BUFFER)}function c(u){const h=[],d=u.index,m=u.attributes.position;let _=0;if(m===void 0)return;if(d!==null){const M=d.array;_=d.version;for(let x=0,v=M.length;x<v;x+=3){const E=M[x+0],w=M[x+1],R=M[x+2];h.push(E,w,w,R,R,E)}}else{const M=m.array;_=m.version;for(let x=0,v=M.length/3-1;x<v;x+=3){const E=x+0,w=x+1,R=x+2;h.push(E,w,w,R,R,E)}}const g=new(m.count>=65535?wu:Eu)(h,1);g.version=_;const p=r.get(u);p&&e.remove(p),r.set(u,g)}function f(u){const h=r.get(u);if(h){const d=u.index;d!==null&&h.version<d.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:f}}function $x(n,e,t){let i;function s(u){i=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function l(u,h){n.drawElements(i,h,r,u*a),t.update(h,i,1)}function c(u,h,d){d!==0&&(n.drawElementsInstanced(i,h,r,u*a,d),t.update(h,i,d))}function f(u,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,h,0,r,u,0,d);let _=0;for(let g=0;g<d;g++)_+=h[g];t.update(_,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=f}function Kx(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:ft("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function Zx(n,e,t){const i=new WeakMap,s=new At;function r(a,o,l){const c=a.morphTargetInfluences,f=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=f!==void 0?f.length:0;let h=i.get(o);if(h===void 0||h.count!==u){let P=function(){y.dispose(),i.delete(o),o.removeEventListener("dispose",P)};var d=P;h!==void 0&&h.texture.dispose();const m=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],M=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let v=0;m===!0&&(v=1),_===!0&&(v=2),g===!0&&(v=3);let E=o.attributes.position.count*v,w=1;E>e.maxTextureSize&&(w=Math.ceil(E/e.maxTextureSize),E=e.maxTextureSize);const R=new Float32Array(E*w*4*u),y=new yu(R,E,w,u);y.type=Ln,y.needsUpdate=!0;const T=v*4;for(let L=0;L<u;L++){const O=p[L],$=M[L],Z=x[L],z=E*w*4*L;for(let K=0;K<O.count;K++){const G=K*T;m===!0&&(s.fromBufferAttribute(O,K),R[z+G+0]=s.x,R[z+G+1]=s.y,R[z+G+2]=s.z,R[z+G+3]=0),_===!0&&(s.fromBufferAttribute($,K),R[z+G+4]=s.x,R[z+G+5]=s.y,R[z+G+6]=s.z,R[z+G+7]=0),g===!0&&(s.fromBufferAttribute(Z,K),R[z+G+8]=s.x,R[z+G+9]=s.y,R[z+G+10]=s.z,R[z+G+11]=Z.itemSize===4?s.w:1)}}h={count:u,texture:y,size:new oe(E,w)},i.set(o,h),o.addEventListener("dispose",P)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let m=0;for(let g=0;g<c.length;g++)m+=c[g];const _=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(n,"morphTargetBaseInfluence",_),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",h.size)}return{update:r}}function Jx(n,e,t,i,s){let r=new WeakMap;function a(c){const f=s.render.frame,u=c.geometry,h=e.get(c,u);if(r.get(h)!==f&&(e.update(h),r.set(h,f)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==f&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,f))),c.isSkinnedMesh){const d=c.skeleton;r.get(d)!==f&&(d.update(),r.set(d,f))}return h}function o(){r=new WeakMap}function l(c){const f=c.target;f.removeEventListener("dispose",l),i.releaseStatesOfObject(f),t.remove(f.instanceMatrix),f.instanceColor!==null&&t.remove(f.instanceColor)}return{update:a,dispose:o}}const Qx={[au]:"LINEAR_TONE_MAPPING",[ou]:"REINHARD_TONE_MAPPING",[lu]:"CINEON_TONE_MAPPING",[cu]:"ACES_FILMIC_TONE_MAPPING",[fu]:"AGX_TONE_MAPPING",[uu]:"NEUTRAL_TONE_MAPPING",[hu]:"CUSTOM_TONE_MAPPING"};function jx(n,e,t,i,s,r){const a=new vn(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,depthTexture:s?new ls(e,t):void 0}),o=new vn(e,t,{type:Kn,depthBuffer:!1,stencilBuffer:!1}),l=new vt;l.setAttribute("position",new je([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new je([0,2,0,0,2,0],2));const c=new Gm({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new at(l,c),u=new Xc(-1,1,1,-1,0,1);let h=null,d=null,m=!1,_,g=null,p=[],M=!1;this.setSize=function(x,v){a.setSize(x,v),o.setSize(x,v);for(let E=0;E<p.length;E++){const w=p[E];w.setSize&&w.setSize(x,v)}},this.setEffects=function(x){p=x,M=p.length>0&&p[0].isRenderPass===!0;const v=a.width,E=a.height;for(let w=0;w<p.length;w++){const R=p[w];R.setSize&&R.setSize(v,E)}},this.begin=function(x,v){if(m||x.toneMapping===Dn&&p.length===0)return!1;if(g=v,v!==null){const E=v.width,w=v.height;(a.width!==E||a.height!==w)&&this.setSize(E,w)}return M===!1&&x.setRenderTarget(a),_=x.toneMapping,x.toneMapping=Dn,!0},this.hasRenderPass=function(){return M},this.end=function(x,v){x.toneMapping=_,m=!0;let E=a,w=o;for(let R=0;R<p.length;R++){const y=p[R];if(y.enabled!==!1&&(y.render(x,w,E,v),y.needsSwap!==!1)){const T=E;E=w,w=T}}if(h!==x.outputColorSpace||d!==x.toneMapping){h=x.outputColorSpace,d=x.toneMapping,c.defines={},ot.getTransfer(h)===xt&&(c.defines.SRGB_TRANSFER="");const R=Qx[d];R&&(c.defines[R]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=E.texture,x.setRenderTarget(g),x.render(f,u),g=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),l.dispose(),c.dispose()}}const qu=new ln,fc=new ls(1,1),$u=new yu,Ku=new Gp,Zu=new Ru,_f=[],Mf=[],yf=new Float32Array(16),bf=new Float32Array(9),Sf=new Float32Array(4);function Js(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=_f[s];if(r===void 0&&(r=new Float32Array(s),_f[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function Yt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function qt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function ro(n,e){let t=Mf[e];t===void 0&&(t=new Int32Array(e),Mf[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function ev(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function tv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Yt(t,e))return;n.uniform2fv(this.addr,e),qt(t,e)}}function nv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Yt(t,e))return;n.uniform3fv(this.addr,e),qt(t,e)}}function iv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Yt(t,e))return;n.uniform4fv(this.addr,e),qt(t,e)}}function sv(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Yt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(Yt(t,i))return;Sf.set(i),n.uniformMatrix2fv(this.addr,!1,Sf),qt(t,i)}}function rv(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Yt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(Yt(t,i))return;bf.set(i),n.uniformMatrix3fv(this.addr,!1,bf),qt(t,i)}}function av(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Yt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(Yt(t,i))return;yf.set(i),n.uniformMatrix4fv(this.addr,!1,yf),qt(t,i)}}function ov(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function lv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Yt(t,e))return;n.uniform2iv(this.addr,e),qt(t,e)}}function cv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Yt(t,e))return;n.uniform3iv(this.addr,e),qt(t,e)}}function hv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Yt(t,e))return;n.uniform4iv(this.addr,e),qt(t,e)}}function fv(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function uv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Yt(t,e))return;n.uniform2uiv(this.addr,e),qt(t,e)}}function dv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Yt(t,e))return;n.uniform3uiv(this.addr,e),qt(t,e)}}function pv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Yt(t,e))return;n.uniform4uiv(this.addr,e),qt(t,e)}}function mv(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(fc.compareFunction=t.isReversedDepthBuffer()?Pc:Cc,r=fc):r=qu,t.setTexture2D(e||r,s)}function gv(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||Ku,s)}function xv(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||Zu,s)}function vv(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||$u,s)}function _v(n){switch(n){case 5126:return ev;case 35664:return tv;case 35665:return nv;case 35666:return iv;case 35674:return sv;case 35675:return rv;case 35676:return av;case 5124:case 35670:return ov;case 35667:case 35671:return lv;case 35668:case 35672:return cv;case 35669:case 35673:return hv;case 5125:return fv;case 36294:return uv;case 36295:return dv;case 36296:return pv;case 35678:case 36198:case 36298:case 36306:case 35682:return mv;case 35679:case 36299:case 36307:return gv;case 35680:case 36300:case 36308:case 36293:return xv;case 36289:case 36303:case 36311:case 36292:return vv}}function Mv(n,e){n.uniform1fv(this.addr,e)}function yv(n,e){const t=Js(e,this.size,2);n.uniform2fv(this.addr,t)}function bv(n,e){const t=Js(e,this.size,3);n.uniform3fv(this.addr,t)}function Sv(n,e){const t=Js(e,this.size,4);n.uniform4fv(this.addr,t)}function Ev(n,e){const t=Js(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function wv(n,e){const t=Js(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Tv(n,e){const t=Js(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Av(n,e){n.uniform1iv(this.addr,e)}function Rv(n,e){n.uniform2iv(this.addr,e)}function Cv(n,e){n.uniform3iv(this.addr,e)}function Pv(n,e){n.uniform4iv(this.addr,e)}function Lv(n,e){n.uniform1uiv(this.addr,e)}function Iv(n,e){n.uniform2uiv(this.addr,e)}function Dv(n,e){n.uniform3uiv(this.addr,e)}function Uv(n,e){n.uniform4uiv(this.addr,e)}function Nv(n,e,t){const i=this.cache,s=e.length,r=ro(t,s);Yt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=fc:a=qu;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Fv(n,e,t){const i=this.cache,s=e.length,r=ro(t,s);Yt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Ku,r[a])}function Ov(n,e,t){const i=this.cache,s=e.length,r=ro(t,s);Yt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Zu,r[a])}function Bv(n,e,t){const i=this.cache,s=e.length,r=ro(t,s);Yt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||$u,r[a])}function zv(n){switch(n){case 5126:return Mv;case 35664:return yv;case 35665:return bv;case 35666:return Sv;case 35674:return Ev;case 35675:return wv;case 35676:return Tv;case 5124:case 35670:return Av;case 35667:case 35671:return Rv;case 35668:case 35672:return Cv;case 35669:case 35673:return Pv;case 5125:return Lv;case 36294:return Iv;case 36295:return Dv;case 36296:return Uv;case 35678:case 36198:case 36298:case 36306:case 35682:return Nv;case 35679:case 36299:case 36307:return Fv;case 35680:case 36300:case 36308:case 36293:return Ov;case 36289:case 36303:case 36311:case 36292:return Bv}}class kv{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=_v(t.type)}}class Gv{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=zv(t.type)}}class Hv{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],i)}}}const Jo=/(\w+)(\])?(\[|\.)?/g;function Ef(n,e){n.seq.push(e),n.map[e.id]=e}function Vv(n,e,t){const i=n.name,s=i.length;for(Jo.lastIndex=0;;){const r=Jo.exec(i),a=Jo.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Ef(t,c===void 0?new kv(o,n,e):new Gv(o,n,e));break}else{let u=t.map[o];u===void 0&&(u=new Hv(o),Ef(t,u)),t=u}}}class La{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);Vv(o,l,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&i.push(a)}return i}}function wf(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const Wv=37297;let Xv=0;function Yv(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}const Tf=new Ke;function qv(n){ot._getMatrix(Tf,ot.workingColorSpace,n);const e=`mat3( ${Tf.elements.map(t=>t.toFixed(4))} )`;switch(ot.getTransfer(n)){case Va:return[e,"LinearTransferOETF"];case xt:return[e,"sRGBTransferOETF"];default:return Ve("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Af(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Yv(n.getShaderSource(e),o)}else return r}function $v(n,e){const t=qv(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const Kv={[au]:"Linear",[ou]:"Reinhard",[lu]:"Cineon",[cu]:"ACESFilmic",[fu]:"AgX",[uu]:"Neutral",[hu]:"Custom"};function Zv(n,e){const t=Kv[e];return t===void 0?(Ve("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const _a=new C;function Jv(){ot.getLuminanceCoefficients(_a);const n=_a.x.toFixed(4),e=_a.y.toFixed(4),t=_a.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Qv(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(xr).join(`
`)}function jv(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function e_(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),a=r.name;let o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function xr(n){return n!==""}function Rf(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Cf(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const t_=/^[ \t]*#include +<([\w\d./]+)>/gm;function uc(n){return n.replace(t_,i_)}const n_=new Map;function i_(n,e){let t=et[e];if(t===void 0){const i=n_.get(e);if(i!==void 0)t=et[i],Ve('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return uc(t)}const s_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Pf(n){return n.replace(s_,r_)}function r_(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Lf(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const a_={[Ta]:"SHADOWMAP_TYPE_PCF",[mr]:"SHADOWMAP_TYPE_VSM"};function o_(n){return a_[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const l_={[rs]:"ENVMAP_TYPE_CUBE",[Gs]:"ENVMAP_TYPE_CUBE",[eo]:"ENVMAP_TYPE_CUBE_UV"};function c_(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":l_[n.envMapMode]||"ENVMAP_TYPE_CUBE"}const h_={[Gs]:"ENVMAP_MODE_REFRACTION"};function f_(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":h_[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const u_={[yc]:"ENVMAP_BLENDING_MULTIPLY",[rp]:"ENVMAP_BLENDING_MIX",[ap]:"ENVMAP_BLENDING_ADD"};function d_(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":u_[n.combine]||"ENVMAP_BLENDING_NONE"}function p_(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function m_(n,e,t,i){const s=n.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=o_(t),c=c_(t),f=f_(t),u=d_(t),h=p_(t),d=Qv(t),m=jv(r),_=s.createProgram();let g,p,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(xr).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(xr).join(`
`),p.length>0&&(p+=`
`)):(g=[Lf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(xr).join(`
`),p=[Lf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+f:"",t.envMap?"#define "+u:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Dn?"#define TONE_MAPPING":"",t.toneMapping!==Dn?et.tonemapping_pars_fragment:"",t.toneMapping!==Dn?Zv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",et.colorspace_pars_fragment,$v("linearToOutputTexel",t.outputColorSpace),Jv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(xr).join(`
`)),a=uc(a),a=Rf(a,t),a=Cf(a,t),o=uc(o),o=Rf(o,t),o=Cf(o,t),a=Pf(a),o=Pf(o),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,g=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===Eh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Eh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const x=M+g+a,v=M+p+o,E=wf(s,s.VERTEX_SHADER,x),w=wf(s,s.FRAGMENT_SHADER,v);s.attachShader(_,E),s.attachShader(_,w),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function R(L){if(n.debug.checkShaderErrors){const O=s.getProgramInfoLog(_)||"",$=s.getShaderInfoLog(E)||"",Z=s.getShaderInfoLog(w)||"",z=O.trim(),K=$.trim(),G=Z.trim();let ee=!0,re=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(ee=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,_,E,w);else{const de=Af(s,E,"vertex"),he=Af(s,w,"fragment");ft("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+z+`
`+de+`
`+he)}else z!==""?Ve("WebGLProgram: Program Info Log:",z):(K===""||G==="")&&(re=!1);re&&(L.diagnostics={runnable:ee,programLog:z,vertexShader:{log:K,prefix:g},fragmentShader:{log:G,prefix:p}})}s.deleteShader(E),s.deleteShader(w),y=new La(s,_),T=e_(s,_)}let y;this.getUniforms=function(){return y===void 0&&R(this),y};let T;this.getAttributes=function(){return T===void 0&&R(this),T};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(_,Wv)),P},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Xv++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=E,this.fragmentShader=w,this}let g_=0;class x_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new v_(e),t.set(e,i)),i}}class v_{constructor(e){this.id=g_++,this.code=e,this.usedTimes=0}}function __(n){return n===as||n===za||n===ka}function M_(n,e,t,i,s,r){const a=new bu,o=new x_,l=new Set,c=[],f=new Map,u=i.logarithmicDepthBuffer;let h=i.precision;const d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(y){return l.add(y),y===0?"uv":`uv${y}`}function _(y,T,P,L,O,$){const Z=L.fog,z=O.geometry,K=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?L.environment:null,G=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap,ee=e.get(y.envMap||K,G),re=ee&&ee.mapping===eo?ee.image.height:null,de=d[y.type];y.precision!==null&&(h=i.getMaxPrecision(y.precision),h!==y.precision&&Ve("WebGLProgram.getParameters:",y.precision,"not supported, using",h,"instead."));const he=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Ee=he!==void 0?he.length:0;let tt=0;z.morphAttributes.position!==void 0&&(tt=1),z.morphAttributes.normal!==void 0&&(tt=2),z.morphAttributes.color!==void 0&&(tt=3);let St,ht,Q,fe;if(de){const Re=Wn[de];St=Re.vertexShader,ht=Re.fragmentShader}else{St=y.vertexShader,ht=y.fragmentShader;const Re=o.getVertexShaderStage(y),Dt=o.getFragmentShaderStage(y);o.update(y,Re,Dt),Q=Re.id,fe=Dt.id}const ae=n.getRenderTarget(),Ne=n.state.buffers.depth.getReversed(),Xe=O.isInstancedMesh===!0,ke=O.isBatchedMesh===!0,mt=!!y.map,qe=!!y.matcap,te=!!ee,se=!!y.aoMap,ie=!!y.lightMap,Me=!!y.bumpMap&&y.wireframe===!1,ve=!!y.normalMap,He=!!y.displacementMap,Le=!!y.emissiveMap,Ye=!!y.metalnessMap,$e=!!y.roughnessMap,I=y.anisotropy>0,_t=y.clearcoat>0,st=y.dispersion>0,A=y.iridescence>0,b=y.sheen>0,B=y.transmission>0,W=I&&!!y.anisotropyMap,Y=_t&&!!y.clearcoatMap,le=_t&&!!y.clearcoatNormalMap,ce=_t&&!!y.clearcoatRoughnessMap,q=A&&!!y.iridescenceMap,j=A&&!!y.iridescenceThicknessMap,pe=b&&!!y.sheenColorMap,Ie=b&&!!y.sheenRoughnessMap,_e=!!y.specularMap,me=!!y.specularColorMap,ze=!!y.specularIntensityMap,We=B&&!!y.transmissionMap,Je=B&&!!y.thicknessMap,U=!!y.gradientMap,ue=!!y.alphaMap,J=y.alphaTest>0,ge=!!y.alphaHash,Se=!!y.extensions;let ne=Dn;y.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(ne=n.toneMapping);const Pe={shaderID:de,shaderType:y.type,shaderName:y.name,vertexShader:St,fragmentShader:ht,defines:y.defines,customVertexShaderID:Q,customFragmentShaderID:fe,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:h,batching:ke,batchingColor:ke&&O._colorsTexture!==null,instancing:Xe,instancingColor:Xe&&O.instanceColor!==null,instancingMorph:Xe&&O.morphTexture!==null,outputColorSpace:ae===null?n.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:ot.workingColorSpace,alphaToCoverage:!!y.alphaToCoverage,map:mt,matcap:qe,envMap:te,envMapMode:te&&ee.mapping,envMapCubeUVHeight:re,aoMap:se,lightMap:ie,bumpMap:Me,normalMap:ve,displacementMap:He,emissiveMap:Le,normalMapObjectSpace:ve&&y.normalMapType===cp,normalMapTangentSpace:ve&&y.normalMapType===Ga,packedNormalMap:ve&&y.normalMapType===Ga&&__(y.normalMap.format),metalnessMap:Ye,roughnessMap:$e,anisotropy:I,anisotropyMap:W,clearcoat:_t,clearcoatMap:Y,clearcoatNormalMap:le,clearcoatRoughnessMap:ce,dispersion:st,iridescence:A,iridescenceMap:q,iridescenceThicknessMap:j,sheen:b,sheenColorMap:pe,sheenRoughnessMap:Ie,specularMap:_e,specularColorMap:me,specularIntensityMap:ze,transmission:B,transmissionMap:We,thicknessMap:Je,gradientMap:U,opaque:y.transparent===!1&&y.blending===Ns&&y.alphaToCoverage===!1,alphaMap:ue,alphaTest:J,alphaHash:ge,combine:y.combine,mapUv:mt&&m(y.map.channel),aoMapUv:se&&m(y.aoMap.channel),lightMapUv:ie&&m(y.lightMap.channel),bumpMapUv:Me&&m(y.bumpMap.channel),normalMapUv:ve&&m(y.normalMap.channel),displacementMapUv:He&&m(y.displacementMap.channel),emissiveMapUv:Le&&m(y.emissiveMap.channel),metalnessMapUv:Ye&&m(y.metalnessMap.channel),roughnessMapUv:$e&&m(y.roughnessMap.channel),anisotropyMapUv:W&&m(y.anisotropyMap.channel),clearcoatMapUv:Y&&m(y.clearcoatMap.channel),clearcoatNormalMapUv:le&&m(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ce&&m(y.clearcoatRoughnessMap.channel),iridescenceMapUv:q&&m(y.iridescenceMap.channel),iridescenceThicknessMapUv:j&&m(y.iridescenceThicknessMap.channel),sheenColorMapUv:pe&&m(y.sheenColorMap.channel),sheenRoughnessMapUv:Ie&&m(y.sheenRoughnessMap.channel),specularMapUv:_e&&m(y.specularMap.channel),specularColorMapUv:me&&m(y.specularColorMap.channel),specularIntensityMapUv:ze&&m(y.specularIntensityMap.channel),transmissionMapUv:We&&m(y.transmissionMap.channel),thicknessMapUv:Je&&m(y.thicknessMap.channel),alphaMapUv:ue&&m(y.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(ve||I),vertexNormals:!!z.attributes.normal,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!z.attributes.uv&&(mt||ue),fog:!!Z,useFog:y.fog===!0,fogExp2:!!Z&&Z.isFogExp2,flatShading:y.wireframe===!1&&(y.flatShading===!0||z.attributes.normal===void 0&&ve===!1&&(y.isMeshLambertMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isMeshPhysicalMaterial)),sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:Ne,skinning:O.isSkinnedMesh===!0,hasPositionAttribute:z.attributes.position!==void 0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:Ee,morphTextureStride:tt,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:$.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:ne,decodeVideoTexture:mt&&y.map.isVideoTexture===!0&&ot.getTransfer(y.map.colorSpace)===xt,decodeVideoTextureEmissive:Le&&y.emissiveMap.isVideoTexture===!0&&ot.getTransfer(y.emissiveMap.colorSpace)===xt,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Sn,flipSided:y.side===nn,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:Se&&y.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Se&&y.extensions.multiDraw===!0||ke)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Pe.vertexUv1s=l.has(1),Pe.vertexUv2s=l.has(2),Pe.vertexUv3s=l.has(3),l.clear(),Pe}function g(y){const T=[];if(y.shaderID?T.push(y.shaderID):(T.push(y.customVertexShaderID),T.push(y.customFragmentShaderID)),y.defines!==void 0)for(const P in y.defines)T.push(P),T.push(y.defines[P]);return y.isRawShaderMaterial===!1&&(p(T,y),M(T,y),T.push(n.outputColorSpace)),T.push(y.customProgramCacheKey),T.join()}function p(y,T){y.push(T.precision),y.push(T.outputColorSpace),y.push(T.envMapMode),y.push(T.envMapCubeUVHeight),y.push(T.mapUv),y.push(T.alphaMapUv),y.push(T.lightMapUv),y.push(T.aoMapUv),y.push(T.bumpMapUv),y.push(T.normalMapUv),y.push(T.displacementMapUv),y.push(T.emissiveMapUv),y.push(T.metalnessMapUv),y.push(T.roughnessMapUv),y.push(T.anisotropyMapUv),y.push(T.clearcoatMapUv),y.push(T.clearcoatNormalMapUv),y.push(T.clearcoatRoughnessMapUv),y.push(T.iridescenceMapUv),y.push(T.iridescenceThicknessMapUv),y.push(T.sheenColorMapUv),y.push(T.sheenRoughnessMapUv),y.push(T.specularMapUv),y.push(T.specularColorMapUv),y.push(T.specularIntensityMapUv),y.push(T.transmissionMapUv),y.push(T.thicknessMapUv),y.push(T.combine),y.push(T.fogExp2),y.push(T.sizeAttenuation),y.push(T.morphTargetsCount),y.push(T.morphAttributeCount),y.push(T.numDirLights),y.push(T.numPointLights),y.push(T.numSpotLights),y.push(T.numSpotLightMaps),y.push(T.numHemiLights),y.push(T.numRectAreaLights),y.push(T.numDirLightShadows),y.push(T.numPointLightShadows),y.push(T.numSpotLightShadows),y.push(T.numSpotLightShadowsWithMaps),y.push(T.numLightProbes),y.push(T.shadowMapType),y.push(T.toneMapping),y.push(T.numClippingPlanes),y.push(T.numClipIntersection),y.push(T.depthPacking)}function M(y,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),y.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),y.push(a.mask)}function x(y){const T=d[y.type];let P;if(T){const L=Wn[T];P=Gu.clone(L.uniforms)}else P=y.uniforms;return P}function v(y,T){let P=f.get(T);return P!==void 0?++P.usedTimes:(P=new m_(n,T,y,s),c.push(P),f.set(T,P)),P}function E(y){if(--y.usedTimes===0){const T=c.indexOf(y);c[T]=c[c.length-1],c.pop(),f.delete(y.cacheKey),y.destroy()}}function w(y){o.remove(y)}function R(){o.dispose()}return{getParameters:_,getProgramCacheKey:g,getUniforms:x,acquireProgram:v,releaseProgram:E,releaseShaderCache:w,programs:c,dispose:R}}function y_(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,l){n.get(a)[o]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function b_(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function If(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Df(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(h){let d=0;return h.isInstancedMesh&&(d+=2),h.isSkinnedMesh&&(d+=1),d}function o(h,d,m,_,g,p){let M=n[e];return M===void 0?(M={id:h.id,object:h,geometry:d,material:m,materialVariant:a(h),groupOrder:_,renderOrder:h.renderOrder,z:g,group:p},n[e]=M):(M.id=h.id,M.object=h,M.geometry=d,M.material=m,M.materialVariant=a(h),M.groupOrder=_,M.renderOrder=h.renderOrder,M.z=g,M.group=p),e++,M}function l(h,d,m,_,g,p){const M=o(h,d,m,_,g,p);m.transmission>0?i.push(M):m.transparent===!0?s.push(M):t.push(M)}function c(h,d,m,_,g,p){const M=o(h,d,m,_,g,p);m.transmission>0?i.unshift(M):m.transparent===!0?s.unshift(M):t.unshift(M)}function f(h,d,m){t.length>1&&t.sort(h||b_),i.length>1&&i.sort(d||If),s.length>1&&s.sort(d||If),m&&(t.reverse(),i.reverse(),s.reverse())}function u(){for(let h=e,d=n.length;h<d;h++){const m=n[h];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:u,sort:f}}function S_(){let n=new WeakMap;function e(i,s){const r=n.get(i);let a;return r===void 0?(a=new Df,n.set(i,[a])):s>=r.length?(a=new Df,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function E_(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new C,color:new Ae};break;case"SpotLight":t={position:new C,direction:new C,color:new Ae,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new C,color:new Ae,distance:0,decay:0};break;case"HemisphereLight":t={direction:new C,skyColor:new Ae,groundColor:new Ae};break;case"RectAreaLight":t={color:new Ae,position:new C,halfWidth:new C,halfHeight:new C};break}return n[e.id]=t,t}}}function w_(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let T_=0;function A_(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function R_(n){const e=new E_,t=w_(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new C);const s=new C,r=new bt,a=new bt;function o(c){let f=0,u=0,h=0;for(let T=0;T<9;T++)i.probe[T].set(0,0,0);let d=0,m=0,_=0,g=0,p=0,M=0,x=0,v=0,E=0,w=0,R=0;c.sort(A_);for(let T=0,P=c.length;T<P;T++){const L=c[T],O=L.color,$=L.intensity,Z=L.distance;let z=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===as?z=L.shadow.map.texture:z=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)f+=O.r*$,u+=O.g*$,h+=O.b*$;else if(L.isLightProbe){for(let K=0;K<9;K++)i.probe[K].addScaledVector(L.sh.coefficients[K],$);R++}else if(L.isDirectionalLight){const K=e.get(L);if(K.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const G=L.shadow,ee=t.get(L);ee.shadowIntensity=G.intensity,ee.shadowBias=G.bias,ee.shadowNormalBias=G.normalBias,ee.shadowRadius=G.radius,ee.shadowMapSize=G.mapSize,i.directionalShadow[d]=ee,i.directionalShadowMap[d]=z,i.directionalShadowMatrix[d]=L.shadow.matrix,M++}i.directional[d]=K,d++}else if(L.isSpotLight){const K=e.get(L);K.position.setFromMatrixPosition(L.matrixWorld),K.color.copy(O).multiplyScalar($),K.distance=Z,K.coneCos=Math.cos(L.angle),K.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),K.decay=L.decay,i.spot[_]=K;const G=L.shadow;if(L.map&&(i.spotLightMap[E]=L.map,E++,G.updateMatrices(L),L.castShadow&&w++),i.spotLightMatrix[_]=G.matrix,L.castShadow){const ee=t.get(L);ee.shadowIntensity=G.intensity,ee.shadowBias=G.bias,ee.shadowNormalBias=G.normalBias,ee.shadowRadius=G.radius,ee.shadowMapSize=G.mapSize,i.spotShadow[_]=ee,i.spotShadowMap[_]=z,v++}_++}else if(L.isRectAreaLight){const K=e.get(L);K.color.copy(O).multiplyScalar($),K.halfWidth.set(L.width*.5,0,0),K.halfHeight.set(0,L.height*.5,0),i.rectArea[g]=K,g++}else if(L.isPointLight){const K=e.get(L);if(K.color.copy(L.color).multiplyScalar(L.intensity),K.distance=L.distance,K.decay=L.decay,L.castShadow){const G=L.shadow,ee=t.get(L);ee.shadowIntensity=G.intensity,ee.shadowBias=G.bias,ee.shadowNormalBias=G.normalBias,ee.shadowRadius=G.radius,ee.shadowMapSize=G.mapSize,ee.shadowCameraNear=G.camera.near,ee.shadowCameraFar=G.camera.far,i.pointShadow[m]=ee,i.pointShadowMap[m]=z,i.pointShadowMatrix[m]=L.shadow.matrix,x++}i.point[m]=K,m++}else if(L.isHemisphereLight){const K=e.get(L);K.skyColor.copy(L.color).multiplyScalar($),K.groundColor.copy(L.groundColor).multiplyScalar($),i.hemi[p]=K,p++}}g>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=xe.LTC_FLOAT_1,i.rectAreaLTC2=xe.LTC_FLOAT_2):(i.rectAreaLTC1=xe.LTC_HALF_1,i.rectAreaLTC2=xe.LTC_HALF_2)),i.ambient[0]=f,i.ambient[1]=u,i.ambient[2]=h;const y=i.hash;(y.directionalLength!==d||y.pointLength!==m||y.spotLength!==_||y.rectAreaLength!==g||y.hemiLength!==p||y.numDirectionalShadows!==M||y.numPointShadows!==x||y.numSpotShadows!==v||y.numSpotMaps!==E||y.numLightProbes!==R)&&(i.directional.length=d,i.spot.length=_,i.rectArea.length=g,i.point.length=m,i.hemi.length=p,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.pointShadow.length=x,i.pointShadowMap.length=x,i.spotShadow.length=v,i.spotShadowMap.length=v,i.directionalShadowMatrix.length=M,i.pointShadowMatrix.length=x,i.spotLightMatrix.length=v+E-w,i.spotLightMap.length=E,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=R,y.directionalLength=d,y.pointLength=m,y.spotLength=_,y.rectAreaLength=g,y.hemiLength=p,y.numDirectionalShadows=M,y.numPointShadows=x,y.numSpotShadows=v,y.numSpotMaps=E,y.numLightProbes=R,i.version=T_++)}function l(c,f){let u=0,h=0,d=0,m=0,_=0;const g=f.matrixWorldInverse;for(let p=0,M=c.length;p<M;p++){const x=c[p];if(x.isDirectionalLight){const v=i.directional[u];v.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(g),u++}else if(x.isSpotLight){const v=i.spot[d];v.position.setFromMatrixPosition(x.matrixWorld),v.position.applyMatrix4(g),v.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(g),d++}else if(x.isRectAreaLight){const v=i.rectArea[m];v.position.setFromMatrixPosition(x.matrixWorld),v.position.applyMatrix4(g),a.identity(),r.copy(x.matrixWorld),r.premultiply(g),a.extractRotation(r),v.halfWidth.set(x.width*.5,0,0),v.halfHeight.set(0,x.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),m++}else if(x.isPointLight){const v=i.point[h];v.position.setFromMatrixPosition(x.matrixWorld),v.position.applyMatrix4(g),h++}else if(x.isHemisphereLight){const v=i.hemi[_];v.direction.setFromMatrixPosition(x.matrixWorld),v.direction.transformDirection(g),_++}}}return{setup:o,setupView:l,state:i}}function Uf(n){const e=new R_(n),t=[],i=[],s=[];function r(h){u.camera=h,t.length=0,i.length=0,s.length=0}function a(h){t.push(h)}function o(h){i.push(h)}function l(h){s.push(h)}function c(){e.setup(t)}function f(h){e.setupView(t,h)}const u={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:f,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function C_(n){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new Uf(n),e.set(s,[o])):r>=a.length?(o=new Uf(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}const P_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,L_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,I_=[new C(1,0,0),new C(-1,0,0),new C(0,1,0),new C(0,-1,0),new C(0,0,1),new C(0,0,-1)],D_=[new C(0,-1,0),new C(0,-1,0),new C(0,0,1),new C(0,0,-1),new C(0,-1,0),new C(0,-1,0)],Nf=new bt,cr=new C,Qo=new C;function U_(n,e,t){let i=new Fc;const s=new oe,r=new oe,a=new At,o=new Wm,l=new Xm,c={},f=t.maxTextureSize,u={[ui]:nn,[nn]:ui,[Sn]:Sn},h=new sn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new oe},radius:{value:4}},vertexShader:P_,fragmentShader:L_}),d=h.clone();d.defines.HORIZONTAL_PASS=1;const m=new vt;m.setAttribute("position",new Ht(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new at(m,h),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ta;let p=this.type;this.render=function(w,R,y){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||w.length===0)return;this.type===ru&&(Ve("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Ta);const T=n.getRenderTarget(),P=n.getActiveCubeFace(),L=n.getActiveMipmapLevel(),O=n.state;O.setBlending(ci),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const $=p!==this.type;$&&R.traverse(function(Z){Z.material&&(Array.isArray(Z.material)?Z.material.forEach(z=>z.needsUpdate=!0):Z.material.needsUpdate=!0)});for(let Z=0,z=w.length;Z<z;Z++){const K=w[Z],G=K.shadow;if(G===void 0){Ve("WebGLShadowMap:",K,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);const ee=G.getFrameExtents();s.multiply(ee),r.copy(G.mapSize),(s.x>f||s.y>f)&&(s.x>f&&(r.x=Math.floor(f/ee.x),s.x=r.x*ee.x,G.mapSize.x=r.x),s.y>f&&(r.y=Math.floor(f/ee.y),s.y=r.y*ee.y,G.mapSize.y=r.y));const re=n.state.buffers.depth.getReversed();if(G.camera._reversedDepth=re,G.map===null||$===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===mr){if(K.isPointLight){Ve("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new vn(s.x,s.y,{format:as,type:Kn,minFilter:Vt,magFilter:Vt,generateMipmaps:!1}),G.map.texture.name=K.name+".shadowMap",G.map.depthTexture=new ls(s.x,s.y,Ln),G.map.depthTexture.name=K.name+".shadowMapDepth",G.map.depthTexture.format=di,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=Qt,G.map.depthTexture.magFilter=Qt}else K.isPointLight?(G.map=new Yu(s.x),G.map.depthTexture=new rm(s.x,Nn)):(G.map=new vn(s.x,s.y),G.map.depthTexture=new ls(s.x,s.y,Nn)),G.map.depthTexture.name=K.name+".shadowMap",G.map.depthTexture.format=di,this.type===Ta?(G.map.depthTexture.compareFunction=re?Pc:Cc,G.map.depthTexture.minFilter=Vt,G.map.depthTexture.magFilter=Vt):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=Qt,G.map.depthTexture.magFilter=Qt);G.camera.updateProjectionMatrix()}const de=G.map.isWebGLCubeRenderTarget?6:1;for(let he=0;he<de;he++){if(G.map.isWebGLCubeRenderTarget)n.setRenderTarget(G.map,he),n.clear();else{he===0&&(n.setRenderTarget(G.map),n.clear());const Ee=G.getViewport(he);a.set(r.x*Ee.x,r.y*Ee.y,r.x*Ee.z,r.y*Ee.w),O.viewport(a)}if(K.isPointLight){const Ee=G.camera,tt=G.matrix,St=K.distance||Ee.far;St!==Ee.far&&(Ee.far=St,Ee.updateProjectionMatrix()),cr.setFromMatrixPosition(K.matrixWorld),Ee.position.copy(cr),Qo.copy(Ee.position),Qo.add(I_[he]),Ee.up.copy(D_[he]),Ee.lookAt(Qo),Ee.updateMatrixWorld(),tt.makeTranslation(-cr.x,-cr.y,-cr.z),Nf.multiplyMatrices(Ee.projectionMatrix,Ee.matrixWorldInverse),G._frustum.setFromProjectionMatrix(Nf,Ee.coordinateSystem,Ee.reversedDepth)}else G.updateMatrices(K);i=G.getFrustum(),v(R,y,G.camera,K,this.type)}G.isPointLightShadow!==!0&&this.type===mr&&M(G,y),G.needsUpdate=!1}p=this.type,g.needsUpdate=!1,n.setRenderTarget(T,P,L)};function M(w,R){const y=e.update(_);h.defines.VSM_SAMPLES!==w.blurSamples&&(h.defines.VSM_SAMPLES=w.blurSamples,d.defines.VSM_SAMPLES=w.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new vn(s.x,s.y,{format:as,type:Kn})),h.uniforms.shadow_pass.value=w.map.depthTexture,h.uniforms.resolution.value=w.mapSize,h.uniforms.radius.value=w.radius,n.setRenderTarget(w.mapPass),n.clear(),n.renderBufferDirect(R,null,y,h,_,null),d.uniforms.shadow_pass.value=w.mapPass.texture,d.uniforms.resolution.value=w.mapSize,d.uniforms.radius.value=w.radius,n.setRenderTarget(w.map),n.clear(),n.renderBufferDirect(R,null,y,d,_,null)}function x(w,R,y,T){let P=null;const L=y.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(L!==void 0)P=L;else if(P=y.isPointLight===!0?l:o,n.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){const O=P.uuid,$=R.uuid;let Z=c[O];Z===void 0&&(Z={},c[O]=Z);let z=Z[$];z===void 0&&(z=P.clone(),Z[$]=z,R.addEventListener("dispose",E)),P=z}if(P.visible=R.visible,P.wireframe=R.wireframe,T===mr?P.side=R.shadowSide!==null?R.shadowSide:R.side:P.side=R.shadowSide!==null?R.shadowSide:u[R.side],P.alphaMap=R.alphaMap,P.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,P.map=R.map,P.clipShadows=R.clipShadows,P.clippingPlanes=R.clippingPlanes,P.clipIntersection=R.clipIntersection,P.displacementMap=R.displacementMap,P.displacementScale=R.displacementScale,P.displacementBias=R.displacementBias,P.wireframeLinewidth=R.wireframeLinewidth,P.linewidth=R.linewidth,y.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const O=n.properties.get(P);O.light=y}return P}function v(w,R,y,T,P){if(w.visible===!1)return;if(w.layers.test(R.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&P===mr)&&(!w.frustumCulled||i.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,w.matrixWorld);const $=e.update(w),Z=w.material;if(Array.isArray(Z)){const z=$.groups;for(let K=0,G=z.length;K<G;K++){const ee=z[K],re=Z[ee.materialIndex];if(re&&re.visible){const de=x(w,re,T,P);w.onBeforeShadow(n,w,R,y,$,de,ee),n.renderBufferDirect(y,null,$,de,w,ee),w.onAfterShadow(n,w,R,y,$,de,ee)}}}else if(Z.visible){const z=x(w,Z,T,P);w.onBeforeShadow(n,w,R,y,$,z,null),n.renderBufferDirect(y,null,$,z,w,null),w.onAfterShadow(n,w,R,y,$,z,null)}}const O=w.children;for(let $=0,Z=O.length;$<Z;$++)v(O[$],R,y,T,P)}function E(w){w.target.removeEventListener("dispose",E);for(const y in c){const T=c[y],P=w.target.uuid;P in T&&(T[P].dispose(),delete T[P])}}}function N_(n,e){function t(){let U=!1;const ue=new At;let J=null;const ge=new At(0,0,0,0);return{setMask:function(Se){J!==Se&&!U&&(n.colorMask(Se,Se,Se,Se),J=Se)},setLocked:function(Se){U=Se},setClear:function(Se,ne,Pe,Re,Dt){Dt===!0&&(Se*=Re,ne*=Re,Pe*=Re),ue.set(Se,ne,Pe,Re),ge.equals(ue)===!1&&(n.clearColor(Se,ne,Pe,Re),ge.copy(ue))},reset:function(){U=!1,J=null,ge.set(-1,0,0,0)}}}function i(){let U=!1,ue=!1,J=null,ge=null,Se=null;return{setReversed:function(ne){if(ue!==ne){const Pe=e.get("EXT_clip_control");ne?Pe.clipControlEXT(Pe.LOWER_LEFT_EXT,Pe.ZERO_TO_ONE_EXT):Pe.clipControlEXT(Pe.LOWER_LEFT_EXT,Pe.NEGATIVE_ONE_TO_ONE_EXT),ue=ne;const Re=Se;Se=null,this.setClear(Re)}},getReversed:function(){return ue},setTest:function(ne){ne?ae(n.DEPTH_TEST):Ne(n.DEPTH_TEST)},setMask:function(ne){J!==ne&&!U&&(n.depthMask(ne),J=ne)},setFunc:function(ne){if(ue&&(ne=_p[ne]),ge!==ne){switch(ne){case bl:n.depthFunc(n.NEVER);break;case Sl:n.depthFunc(n.ALWAYS);break;case El:n.depthFunc(n.LESS);break;case ks:n.depthFunc(n.LEQUAL);break;case wl:n.depthFunc(n.EQUAL);break;case Tl:n.depthFunc(n.GEQUAL);break;case Al:n.depthFunc(n.GREATER);break;case Rl:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ge=ne}},setLocked:function(ne){U=ne},setClear:function(ne){Se!==ne&&(Se=ne,ue&&(ne=1-ne),n.clearDepth(ne))},reset:function(){U=!1,J=null,ge=null,Se=null,ue=!1}}}function s(){let U=!1,ue=null,J=null,ge=null,Se=null,ne=null,Pe=null,Re=null,Dt=null;return{setTest:function(Ct){U||(Ct?ae(n.STENCIL_TEST):Ne(n.STENCIL_TEST))},setMask:function(Ct){ue!==Ct&&!U&&(n.stencilMask(Ct),ue=Ct)},setFunc:function(Ct,On,Bn){(J!==Ct||ge!==On||Se!==Bn)&&(n.stencilFunc(Ct,On,Bn),J=Ct,ge=On,Se=Bn)},setOp:function(Ct,On,Bn){(ne!==Ct||Pe!==On||Re!==Bn)&&(n.stencilOp(Ct,On,Bn),ne=Ct,Pe=On,Re=Bn)},setLocked:function(Ct){U=Ct},setClear:function(Ct){Dt!==Ct&&(n.clearStencil(Ct),Dt=Ct)},reset:function(){U=!1,ue=null,J=null,ge=null,Se=null,ne=null,Pe=null,Re=null,Dt=null}}}const r=new t,a=new i,o=new s,l=new WeakMap,c=new WeakMap;let f={},u={},h={},d=new WeakMap,m=[],_=null,g=!1,p=null,M=null,x=null,v=null,E=null,w=null,R=null,y=new Ae(0,0,0),T=0,P=!1,L=null,O=null,$=null,Z=null,z=null;const K=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let G=!1,ee=0;const re=n.getParameter(n.VERSION);re.indexOf("WebGL")!==-1?(ee=parseFloat(/^WebGL (\d)/.exec(re)[1]),G=ee>=1):re.indexOf("OpenGL ES")!==-1&&(ee=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),G=ee>=2);let de=null,he={};const Ee=n.getParameter(n.SCISSOR_BOX),tt=n.getParameter(n.VIEWPORT),St=new At().fromArray(Ee),ht=new At().fromArray(tt);function Q(U,ue,J,ge){const Se=new Uint8Array(4),ne=n.createTexture();n.bindTexture(U,ne),n.texParameteri(U,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(U,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Pe=0;Pe<J;Pe++)U===n.TEXTURE_3D||U===n.TEXTURE_2D_ARRAY?n.texImage3D(ue,0,n.RGBA,1,1,ge,0,n.RGBA,n.UNSIGNED_BYTE,Se):n.texImage2D(ue+Pe,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Se);return ne}const fe={};fe[n.TEXTURE_2D]=Q(n.TEXTURE_2D,n.TEXTURE_2D,1),fe[n.TEXTURE_CUBE_MAP]=Q(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),fe[n.TEXTURE_2D_ARRAY]=Q(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),fe[n.TEXTURE_3D]=Q(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ae(n.DEPTH_TEST),a.setFunc(ks),Me(!1),ve(_h),ae(n.CULL_FACE),se(ci);function ae(U){f[U]!==!0&&(n.enable(U),f[U]=!0)}function Ne(U){f[U]!==!1&&(n.disable(U),f[U]=!1)}function Xe(U,ue){return h[U]!==ue?(n.bindFramebuffer(U,ue),h[U]=ue,U===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=ue),U===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=ue),!0):!1}function ke(U,ue){let J=m,ge=!1;if(U){J=d.get(ue),J===void 0&&(J=[],d.set(ue,J));const Se=U.textures;if(J.length!==Se.length||J[0]!==n.COLOR_ATTACHMENT0){for(let ne=0,Pe=Se.length;ne<Pe;ne++)J[ne]=n.COLOR_ATTACHMENT0+ne;J.length=Se.length,ge=!0}}else J[0]!==n.BACK&&(J[0]=n.BACK,ge=!0);ge&&n.drawBuffers(J)}function mt(U){return _!==U?(n.useProgram(U),_=U,!0):!1}const qe={[Zi]:n.FUNC_ADD,[Hd]:n.FUNC_SUBTRACT,[Vd]:n.FUNC_REVERSE_SUBTRACT};qe[Wd]=n.MIN,qe[Xd]=n.MAX;const te={[Yd]:n.ZERO,[qd]:n.ONE,[$d]:n.SRC_COLOR,[Ml]:n.SRC_ALPHA,[ep]:n.SRC_ALPHA_SATURATE,[Qd]:n.DST_COLOR,[Zd]:n.DST_ALPHA,[Kd]:n.ONE_MINUS_SRC_COLOR,[yl]:n.ONE_MINUS_SRC_ALPHA,[jd]:n.ONE_MINUS_DST_COLOR,[Jd]:n.ONE_MINUS_DST_ALPHA,[tp]:n.CONSTANT_COLOR,[np]:n.ONE_MINUS_CONSTANT_COLOR,[ip]:n.CONSTANT_ALPHA,[sp]:n.ONE_MINUS_CONSTANT_ALPHA};function se(U,ue,J,ge,Se,ne,Pe,Re,Dt,Ct){if(U===ci){g===!0&&(Ne(n.BLEND),g=!1);return}if(g===!1&&(ae(n.BLEND),g=!0),U!==Gd){if(U!==p||Ct!==P){if((M!==Zi||E!==Zi)&&(n.blendEquation(n.FUNC_ADD),M=Zi,E=Zi),Ct)switch(U){case Ns:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ar:n.blendFunc(n.ONE,n.ONE);break;case Mh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case yh:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:ft("WebGLState: Invalid blending: ",U);break}else switch(U){case Ns:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ar:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Mh:ft("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case yh:ft("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ft("WebGLState: Invalid blending: ",U);break}x=null,v=null,w=null,R=null,y.set(0,0,0),T=0,p=U,P=Ct}return}Se=Se||ue,ne=ne||J,Pe=Pe||ge,(ue!==M||Se!==E)&&(n.blendEquationSeparate(qe[ue],qe[Se]),M=ue,E=Se),(J!==x||ge!==v||ne!==w||Pe!==R)&&(n.blendFuncSeparate(te[J],te[ge],te[ne],te[Pe]),x=J,v=ge,w=ne,R=Pe),(Re.equals(y)===!1||Dt!==T)&&(n.blendColor(Re.r,Re.g,Re.b,Dt),y.copy(Re),T=Dt),p=U,P=!1}function ie(U,ue){U.side===Sn?Ne(n.CULL_FACE):ae(n.CULL_FACE);let J=U.side===nn;ue&&(J=!J),Me(J),U.blending===Ns&&U.transparent===!1?se(ci):se(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),r.setMask(U.colorWrite);const ge=U.stencilWrite;o.setTest(ge),ge&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),Le(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?ae(n.SAMPLE_ALPHA_TO_COVERAGE):Ne(n.SAMPLE_ALPHA_TO_COVERAGE)}function Me(U){L!==U&&(U?n.frontFace(n.CW):n.frontFace(n.CCW),L=U)}function ve(U){U!==zd?(ae(n.CULL_FACE),U!==O&&(U===_h?n.cullFace(n.BACK):U===kd?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Ne(n.CULL_FACE),O=U}function He(U){U!==$&&(G&&n.lineWidth(U),$=U)}function Le(U,ue,J){U?(ae(n.POLYGON_OFFSET_FILL),(Z!==ue||z!==J)&&(Z=ue,z=J,a.getReversed()&&(ue=-ue),n.polygonOffset(ue,J))):Ne(n.POLYGON_OFFSET_FILL)}function Ye(U){U?ae(n.SCISSOR_TEST):Ne(n.SCISSOR_TEST)}function $e(U){U===void 0&&(U=n.TEXTURE0+K-1),de!==U&&(n.activeTexture(U),de=U)}function I(U,ue,J){J===void 0&&(de===null?J=n.TEXTURE0+K-1:J=de);let ge=he[J];ge===void 0&&(ge={type:void 0,texture:void 0},he[J]=ge),(ge.type!==U||ge.texture!==ue)&&(de!==J&&(n.activeTexture(J),de=J),n.bindTexture(U,ue||fe[U]),ge.type=U,ge.texture=ue)}function _t(){const U=he[de];U!==void 0&&U.type!==void 0&&(n.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function st(){try{n.compressedTexImage2D(...arguments)}catch(U){ft("WebGLState:",U)}}function A(){try{n.compressedTexImage3D(...arguments)}catch(U){ft("WebGLState:",U)}}function b(){try{n.texSubImage2D(...arguments)}catch(U){ft("WebGLState:",U)}}function B(){try{n.texSubImage3D(...arguments)}catch(U){ft("WebGLState:",U)}}function W(){try{n.compressedTexSubImage2D(...arguments)}catch(U){ft("WebGLState:",U)}}function Y(){try{n.compressedTexSubImage3D(...arguments)}catch(U){ft("WebGLState:",U)}}function le(){try{n.texStorage2D(...arguments)}catch(U){ft("WebGLState:",U)}}function ce(){try{n.texStorage3D(...arguments)}catch(U){ft("WebGLState:",U)}}function q(){try{n.texImage2D(...arguments)}catch(U){ft("WebGLState:",U)}}function j(){try{n.texImage3D(...arguments)}catch(U){ft("WebGLState:",U)}}function pe(U){return u[U]!==void 0?u[U]:n.getParameter(U)}function Ie(U,ue){u[U]!==ue&&(n.pixelStorei(U,ue),u[U]=ue)}function _e(U){St.equals(U)===!1&&(n.scissor(U.x,U.y,U.z,U.w),St.copy(U))}function me(U){ht.equals(U)===!1&&(n.viewport(U.x,U.y,U.z,U.w),ht.copy(U))}function ze(U,ue){let J=c.get(ue);J===void 0&&(J=new WeakMap,c.set(ue,J));let ge=J.get(U);ge===void 0&&(ge=n.getUniformBlockIndex(ue,U.name),J.set(U,ge))}function We(U,ue){const ge=c.get(ue).get(U);l.get(ue)!==ge&&(n.uniformBlockBinding(ue,ge,U.__bindingPointIndex),l.set(ue,ge))}function Je(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),f={},u={},de=null,he={},h={},d=new WeakMap,m=[],_=null,g=!1,p=null,M=null,x=null,v=null,E=null,w=null,R=null,y=new Ae(0,0,0),T=0,P=!1,L=null,O=null,$=null,Z=null,z=null,St.set(0,0,n.canvas.width,n.canvas.height),ht.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ae,disable:Ne,bindFramebuffer:Xe,drawBuffers:ke,useProgram:mt,setBlending:se,setMaterial:ie,setFlipSided:Me,setCullFace:ve,setLineWidth:He,setPolygonOffset:Le,setScissorTest:Ye,activeTexture:$e,bindTexture:I,unbindTexture:_t,compressedTexImage2D:st,compressedTexImage3D:A,texImage2D:q,texImage3D:j,pixelStorei:Ie,getParameter:pe,updateUBOMapping:ze,uniformBlockBinding:We,texStorage2D:le,texStorage3D:ce,texSubImage2D:b,texSubImage3D:B,compressedTexSubImage2D:W,compressedTexSubImage3D:Y,scissor:_e,viewport:me,reset:Je}}function F_(n,e,t,i,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new oe,f=new WeakMap,u=new Set;let h;const d=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(A,b){return m?new OffscreenCanvas(A,b):Wa("canvas")}function g(A,b,B){let W=1;const Y=st(A);if((Y.width>B||Y.height>B)&&(W=B/Math.max(Y.width,Y.height)),W<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const le=Math.floor(W*Y.width),ce=Math.floor(W*Y.height);h===void 0&&(h=_(le,ce));const q=b?_(le,ce):h;return q.width=le,q.height=ce,q.getContext("2d").drawImage(A,0,0,le,ce),Ve("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+le+"x"+ce+")."),q}else return"data"in A&&Ve("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),A;return A}function p(A){return A.generateMipmaps}function M(A){n.generateMipmap(A)}function x(A){return A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?n.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function v(A,b,B,W,Y,le=!1){if(A!==null){if(n[A]!==void 0)return n[A];Ve("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let ce;W&&(ce=e.get("EXT_texture_norm16"),ce||Ve("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let q=b;if(b===n.RED&&(B===n.FLOAT&&(q=n.R32F),B===n.HALF_FLOAT&&(q=n.R16F),B===n.UNSIGNED_BYTE&&(q=n.R8),B===n.UNSIGNED_SHORT&&ce&&(q=ce.R16_EXT),B===n.SHORT&&ce&&(q=ce.R16_SNORM_EXT)),b===n.RED_INTEGER&&(B===n.UNSIGNED_BYTE&&(q=n.R8UI),B===n.UNSIGNED_SHORT&&(q=n.R16UI),B===n.UNSIGNED_INT&&(q=n.R32UI),B===n.BYTE&&(q=n.R8I),B===n.SHORT&&(q=n.R16I),B===n.INT&&(q=n.R32I)),b===n.RG&&(B===n.FLOAT&&(q=n.RG32F),B===n.HALF_FLOAT&&(q=n.RG16F),B===n.UNSIGNED_BYTE&&(q=n.RG8),B===n.UNSIGNED_SHORT&&ce&&(q=ce.RG16_EXT),B===n.SHORT&&ce&&(q=ce.RG16_SNORM_EXT)),b===n.RG_INTEGER&&(B===n.UNSIGNED_BYTE&&(q=n.RG8UI),B===n.UNSIGNED_SHORT&&(q=n.RG16UI),B===n.UNSIGNED_INT&&(q=n.RG32UI),B===n.BYTE&&(q=n.RG8I),B===n.SHORT&&(q=n.RG16I),B===n.INT&&(q=n.RG32I)),b===n.RGB_INTEGER&&(B===n.UNSIGNED_BYTE&&(q=n.RGB8UI),B===n.UNSIGNED_SHORT&&(q=n.RGB16UI),B===n.UNSIGNED_INT&&(q=n.RGB32UI),B===n.BYTE&&(q=n.RGB8I),B===n.SHORT&&(q=n.RGB16I),B===n.INT&&(q=n.RGB32I)),b===n.RGBA_INTEGER&&(B===n.UNSIGNED_BYTE&&(q=n.RGBA8UI),B===n.UNSIGNED_SHORT&&(q=n.RGBA16UI),B===n.UNSIGNED_INT&&(q=n.RGBA32UI),B===n.BYTE&&(q=n.RGBA8I),B===n.SHORT&&(q=n.RGBA16I),B===n.INT&&(q=n.RGBA32I)),b===n.RGB&&(B===n.UNSIGNED_SHORT&&ce&&(q=ce.RGB16_EXT),B===n.SHORT&&ce&&(q=ce.RGB16_SNORM_EXT),B===n.UNSIGNED_INT_5_9_9_9_REV&&(q=n.RGB9_E5),B===n.UNSIGNED_INT_10F_11F_11F_REV&&(q=n.R11F_G11F_B10F)),b===n.RGBA){const j=le?Va:ot.getTransfer(Y);B===n.FLOAT&&(q=n.RGBA32F),B===n.HALF_FLOAT&&(q=n.RGBA16F),B===n.UNSIGNED_BYTE&&(q=j===xt?n.SRGB8_ALPHA8:n.RGBA8),B===n.UNSIGNED_SHORT&&ce&&(q=ce.RGBA16_EXT),B===n.SHORT&&ce&&(q=ce.RGBA16_SNORM_EXT),B===n.UNSIGNED_SHORT_4_4_4_4&&(q=n.RGBA4),B===n.UNSIGNED_SHORT_5_5_5_1&&(q=n.RGB5_A1)}return(q===n.R16F||q===n.R32F||q===n.RG16F||q===n.RG32F||q===n.RGBA16F||q===n.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function E(A,b){let B;return A?b===null||b===Nn||b===Cr?B=n.DEPTH24_STENCIL8:b===Ln?B=n.DEPTH32F_STENCIL8:b===Rr&&(B=n.DEPTH24_STENCIL8,Ve("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Nn||b===Cr?B=n.DEPTH_COMPONENT24:b===Ln?B=n.DEPTH_COMPONENT32F:b===Rr&&(B=n.DEPTH_COMPONENT16),B}function w(A,b){return p(A)===!0||A.isFramebufferTexture&&A.minFilter!==Qt&&A.minFilter!==Vt?Math.log2(Math.max(b.width,b.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?b.mipmaps.length:1}function R(A){const b=A.target;b.removeEventListener("dispose",R),T(b),b.isVideoTexture&&f.delete(b),b.isHTMLTexture&&u.delete(b)}function y(A){const b=A.target;b.removeEventListener("dispose",y),L(b)}function T(A){const b=i.get(A);if(b.__webglInit===void 0)return;const B=A.source,W=d.get(B);if(W){const Y=W[b.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&P(A),Object.keys(W).length===0&&d.delete(B)}i.remove(A)}function P(A){const b=i.get(A);n.deleteTexture(b.__webglTexture);const B=A.source,W=d.get(B);delete W[b.__cacheKey],a.memory.textures--}function L(A){const b=i.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),i.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(b.__webglFramebuffer[W]))for(let Y=0;Y<b.__webglFramebuffer[W].length;Y++)n.deleteFramebuffer(b.__webglFramebuffer[W][Y]);else n.deleteFramebuffer(b.__webglFramebuffer[W]);b.__webglDepthbuffer&&n.deleteRenderbuffer(b.__webglDepthbuffer[W])}else{if(Array.isArray(b.__webglFramebuffer))for(let W=0;W<b.__webglFramebuffer.length;W++)n.deleteFramebuffer(b.__webglFramebuffer[W]);else n.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&n.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&n.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let W=0;W<b.__webglColorRenderbuffer.length;W++)b.__webglColorRenderbuffer[W]&&n.deleteRenderbuffer(b.__webglColorRenderbuffer[W]);b.__webglDepthRenderbuffer&&n.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const B=A.textures;for(let W=0,Y=B.length;W<Y;W++){const le=i.get(B[W]);le.__webglTexture&&(n.deleteTexture(le.__webglTexture),a.memory.textures--),i.remove(B[W])}i.remove(A)}let O=0;function $(){O=0}function Z(){return O}function z(A){O=A}function K(){const A=O;return A>=s.maxTextures&&Ve("WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+s.maxTextures),O+=1,A}function G(A){const b=[];return b.push(A.wrapS),b.push(A.wrapT),b.push(A.wrapR||0),b.push(A.magFilter),b.push(A.minFilter),b.push(A.anisotropy),b.push(A.internalFormat),b.push(A.format),b.push(A.type),b.push(A.generateMipmaps),b.push(A.premultiplyAlpha),b.push(A.flipY),b.push(A.unpackAlignment),b.push(A.colorSpace),b.join()}function ee(A,b){const B=i.get(A);if(A.isVideoTexture&&I(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&B.__version!==A.version){const W=A.image;if(W===null)Ve("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Ve("WebGLRenderer: Texture marked for update but image is incomplete");else{Ne(B,A,b);return}}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,B.__webglTexture,n.TEXTURE0+b)}function re(A,b){const B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){Ne(B,A,b);return}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,B.__webglTexture,n.TEXTURE0+b)}function de(A,b){const B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){Ne(B,A,b);return}t.bindTexture(n.TEXTURE_3D,B.__webglTexture,n.TEXTURE0+b)}function he(A,b){const B=i.get(A);if(A.isCubeDepthTexture!==!0&&A.version>0&&B.__version!==A.version){Xe(B,A,b);return}t.bindTexture(n.TEXTURE_CUBE_MAP,B.__webglTexture,n.TEXTURE0+b)}const Ee={[Ba]:n.REPEAT,[ai]:n.CLAMP_TO_EDGE,[Cl]:n.MIRRORED_REPEAT},tt={[Qt]:n.NEAREST,[op]:n.NEAREST_MIPMAP_NEAREST,[Xr]:n.NEAREST_MIPMAP_LINEAR,[Vt]:n.LINEAR,[_o]:n.LINEAR_MIPMAP_NEAREST,[Ci]:n.LINEAR_MIPMAP_LINEAR},St={[hp]:n.NEVER,[mp]:n.ALWAYS,[fp]:n.LESS,[Cc]:n.LEQUAL,[up]:n.EQUAL,[Pc]:n.GEQUAL,[dp]:n.GREATER,[pp]:n.NOTEQUAL};function ht(A,b){if(b.type===Ln&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===Vt||b.magFilter===_o||b.magFilter===Xr||b.magFilter===Ci||b.minFilter===Vt||b.minFilter===_o||b.minFilter===Xr||b.minFilter===Ci)&&Ve("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(A,n.TEXTURE_WRAP_S,Ee[b.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,Ee[b.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,Ee[b.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,tt[b.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,tt[b.minFilter]),b.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,St[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Qt||b.minFilter!==Xr&&b.minFilter!==Ci||b.type===Ln&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||i.get(b).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");n.texParameterf(A,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),i.get(b).__currentAnisotropy=b.anisotropy}}}function Q(A,b){let B=!1;A.__webglInit===void 0&&(A.__webglInit=!0,b.addEventListener("dispose",R));const W=b.source;let Y=d.get(W);Y===void 0&&(Y={},d.set(W,Y));const le=G(b);if(le!==A.__cacheKey){Y[le]===void 0&&(Y[le]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,B=!0),Y[le].usedTimes++;const ce=Y[A.__cacheKey];ce!==void 0&&(Y[A.__cacheKey].usedTimes--,ce.usedTimes===0&&P(b)),A.__cacheKey=le,A.__webglTexture=Y[le].texture}return B}function fe(A,b,B){return Math.floor(Math.floor(A/B)/b)}function ae(A,b,B,W){const le=A.updateRanges;if(le.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,b.width,b.height,B,W,b.data);else{le.sort((Ie,_e)=>Ie.start-_e.start);let ce=0;for(let Ie=1;Ie<le.length;Ie++){const _e=le[ce],me=le[Ie],ze=_e.start+_e.count,We=fe(me.start,b.width,4),Je=fe(_e.start,b.width,4);me.start<=ze+1&&We===Je&&fe(me.start+me.count-1,b.width,4)===We?_e.count=Math.max(_e.count,me.start+me.count-_e.start):(++ce,le[ce]=me)}le.length=ce+1;const q=t.getParameter(n.UNPACK_ROW_LENGTH),j=t.getParameter(n.UNPACK_SKIP_PIXELS),pe=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,b.width);for(let Ie=0,_e=le.length;Ie<_e;Ie++){const me=le[Ie],ze=Math.floor(me.start/4),We=Math.ceil(me.count/4),Je=ze%b.width,U=Math.floor(ze/b.width),ue=We,J=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,Je),t.pixelStorei(n.UNPACK_SKIP_ROWS,U),t.texSubImage2D(n.TEXTURE_2D,0,Je,U,ue,J,B,W,b.data)}A.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,q),t.pixelStorei(n.UNPACK_SKIP_PIXELS,j),t.pixelStorei(n.UNPACK_SKIP_ROWS,pe)}}function Ne(A,b,B){let W=n.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(W=n.TEXTURE_2D_ARRAY),b.isData3DTexture&&(W=n.TEXTURE_3D);const Y=Q(A,b),le=b.source;t.bindTexture(W,A.__webglTexture,n.TEXTURE0+B);const ce=i.get(le);if(le.version!==ce.__version||Y===!0){if(t.activeTexture(n.TEXTURE0+B),(typeof ImageBitmap<"u"&&b.image instanceof ImageBitmap)===!1){const J=ot.getPrimaries(ot.workingColorSpace),ge=b.colorSpace===ii?null:ot.getPrimaries(b.colorSpace),Se=b.colorSpace===ii||J===ge?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se)}t.pixelStorei(n.UNPACK_ALIGNMENT,b.unpackAlignment);let j=g(b.image,!1,s.maxTextureSize);j=_t(b,j);const pe=r.convert(b.format,b.colorSpace),Ie=r.convert(b.type);let _e=v(b.internalFormat,pe,Ie,b.normalized,b.colorSpace,b.isVideoTexture);ht(W,b);let me;const ze=b.mipmaps,We=b.isVideoTexture!==!0,Je=ce.__version===void 0||Y===!0,U=le.dataReady,ue=w(b,j);if(b.isDepthTexture)_e=E(b.format===ji,b.type),Je&&(We?t.texStorage2D(n.TEXTURE_2D,1,_e,j.width,j.height):t.texImage2D(n.TEXTURE_2D,0,_e,j.width,j.height,0,pe,Ie,null));else if(b.isDataTexture)if(ze.length>0){We&&Je&&t.texStorage2D(n.TEXTURE_2D,ue,_e,ze[0].width,ze[0].height);for(let J=0,ge=ze.length;J<ge;J++)me=ze[J],We?U&&t.texSubImage2D(n.TEXTURE_2D,J,0,0,me.width,me.height,pe,Ie,me.data):t.texImage2D(n.TEXTURE_2D,J,_e,me.width,me.height,0,pe,Ie,me.data);b.generateMipmaps=!1}else We?(Je&&t.texStorage2D(n.TEXTURE_2D,ue,_e,j.width,j.height),U&&ae(b,j,pe,Ie)):t.texImage2D(n.TEXTURE_2D,0,_e,j.width,j.height,0,pe,Ie,j.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){We&&Je&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ue,_e,ze[0].width,ze[0].height,j.depth);for(let J=0,ge=ze.length;J<ge;J++)if(me=ze[J],b.format!==En)if(pe!==null)if(We){if(U)if(b.layerUpdates.size>0){const Se=uf(me.width,me.height,b.format,b.type);for(const ne of b.layerUpdates){const Pe=me.data.subarray(ne*Se/me.data.BYTES_PER_ELEMENT,(ne+1)*Se/me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,ne,me.width,me.height,1,pe,Pe)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,me.width,me.height,j.depth,pe,me.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,J,_e,me.width,me.height,j.depth,0,me.data,0,0);else Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else We?U&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,me.width,me.height,j.depth,pe,Ie,me.data):t.texImage3D(n.TEXTURE_2D_ARRAY,J,_e,me.width,me.height,j.depth,0,pe,Ie,me.data)}else{We&&Je&&t.texStorage2D(n.TEXTURE_2D,ue,_e,ze[0].width,ze[0].height);for(let J=0,ge=ze.length;J<ge;J++)me=ze[J],b.format!==En?pe!==null?We?U&&t.compressedTexSubImage2D(n.TEXTURE_2D,J,0,0,me.width,me.height,pe,me.data):t.compressedTexImage2D(n.TEXTURE_2D,J,_e,me.width,me.height,0,me.data):Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):We?U&&t.texSubImage2D(n.TEXTURE_2D,J,0,0,me.width,me.height,pe,Ie,me.data):t.texImage2D(n.TEXTURE_2D,J,_e,me.width,me.height,0,pe,Ie,me.data)}else if(b.isDataArrayTexture)if(We){if(Je&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ue,_e,j.width,j.height,j.depth),U)if(b.layerUpdates.size>0){const J=uf(j.width,j.height,b.format,b.type);for(const ge of b.layerUpdates){const Se=j.data.subarray(ge*J/j.data.BYTES_PER_ELEMENT,(ge+1)*J/j.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ge,j.width,j.height,1,pe,Ie,Se)}b.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,j.width,j.height,j.depth,pe,Ie,j.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,_e,j.width,j.height,j.depth,0,pe,Ie,j.data);else if(b.isData3DTexture)We?(Je&&t.texStorage3D(n.TEXTURE_3D,ue,_e,j.width,j.height,j.depth),U&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,j.width,j.height,j.depth,pe,Ie,j.data)):t.texImage3D(n.TEXTURE_3D,0,_e,j.width,j.height,j.depth,0,pe,Ie,j.data);else if(b.isFramebufferTexture){if(Je)if(We)t.texStorage2D(n.TEXTURE_2D,ue,_e,j.width,j.height);else{let J=j.width,ge=j.height;for(let Se=0;Se<ue;Se++)t.texImage2D(n.TEXTURE_2D,Se,_e,J,ge,0,pe,Ie,null),J>>=1,ge>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in n){const J=n.canvas;if(J.hasAttribute("layoutsubtree")||J.setAttribute("layoutsubtree","true"),j.parentNode!==J){J.appendChild(j),u.add(b),J.onpaint=ge=>{const Se=ge.changedElements;for(const ne of u)Se.includes(ne.image)&&(ne.needsUpdate=!0)},J.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,j);else{const Se=n.RGBA,ne=n.RGBA,Pe=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,Se,ne,Pe,j)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(ze.length>0){if(We&&Je){const J=st(ze[0]);t.texStorage2D(n.TEXTURE_2D,ue,_e,J.width,J.height)}for(let J=0,ge=ze.length;J<ge;J++)me=ze[J],We?U&&t.texSubImage2D(n.TEXTURE_2D,J,0,0,pe,Ie,me):t.texImage2D(n.TEXTURE_2D,J,_e,pe,Ie,me);b.generateMipmaps=!1}else if(We){if(Je){const J=st(j);t.texStorage2D(n.TEXTURE_2D,ue,_e,J.width,J.height)}U&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,pe,Ie,j)}else t.texImage2D(n.TEXTURE_2D,0,_e,pe,Ie,j);p(b)&&M(W),ce.__version=le.version,b.onUpdate&&b.onUpdate(b)}A.__version=b.version}function Xe(A,b,B){if(b.image.length!==6)return;const W=Q(A,b),Y=b.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+B);const le=i.get(Y);if(Y.version!==le.__version||W===!0){t.activeTexture(n.TEXTURE0+B);const ce=ot.getPrimaries(ot.workingColorSpace),q=b.colorSpace===ii?null:ot.getPrimaries(b.colorSpace),j=b.colorSpace===ii||ce===q?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,b.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,j);const pe=b.isCompressedTexture||b.image[0].isCompressedTexture,Ie=b.image[0]&&b.image[0].isDataTexture,_e=[];for(let ne=0;ne<6;ne++)!pe&&!Ie?_e[ne]=g(b.image[ne],!0,s.maxCubemapSize):_e[ne]=Ie?b.image[ne].image:b.image[ne],_e[ne]=_t(b,_e[ne]);const me=_e[0],ze=r.convert(b.format,b.colorSpace),We=r.convert(b.type),Je=v(b.internalFormat,ze,We,b.normalized,b.colorSpace),U=b.isVideoTexture!==!0,ue=le.__version===void 0||W===!0,J=Y.dataReady;let ge=w(b,me);ht(n.TEXTURE_CUBE_MAP,b);let Se;if(pe){U&&ue&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ge,Je,me.width,me.height);for(let ne=0;ne<6;ne++){Se=_e[ne].mipmaps;for(let Pe=0;Pe<Se.length;Pe++){const Re=Se[Pe];b.format!==En?ze!==null?U?J&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Pe,0,0,Re.width,Re.height,ze,Re.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Pe,Je,Re.width,Re.height,0,Re.data):Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?J&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Pe,0,0,Re.width,Re.height,ze,We,Re.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Pe,Je,Re.width,Re.height,0,ze,We,Re.data)}}}else{if(Se=b.mipmaps,U&&ue){Se.length>0&&ge++;const ne=st(_e[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ge,Je,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(Ie){U?J&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,_e[ne].width,_e[ne].height,ze,We,_e[ne].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,Je,_e[ne].width,_e[ne].height,0,ze,We,_e[ne].data);for(let Pe=0;Pe<Se.length;Pe++){const Dt=Se[Pe].image[ne].image;U?J&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Pe+1,0,0,Dt.width,Dt.height,ze,We,Dt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Pe+1,Je,Dt.width,Dt.height,0,ze,We,Dt.data)}}else{U?J&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,ze,We,_e[ne]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,Je,ze,We,_e[ne]);for(let Pe=0;Pe<Se.length;Pe++){const Re=Se[Pe];U?J&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Pe+1,0,0,ze,We,Re.image[ne]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Pe+1,Je,ze,We,Re.image[ne])}}}p(b)&&M(n.TEXTURE_CUBE_MAP),le.__version=Y.version,b.onUpdate&&b.onUpdate(b)}A.__version=b.version}function ke(A,b,B,W,Y,le){const ce=r.convert(B.format,B.colorSpace),q=r.convert(B.type),j=v(B.internalFormat,ce,q,B.normalized,B.colorSpace),pe=i.get(b),Ie=i.get(B);if(Ie.__renderTarget=b,!pe.__hasExternalTextures){const _e=Math.max(1,b.width>>le),me=Math.max(1,b.height>>le);Y===n.TEXTURE_3D||Y===n.TEXTURE_2D_ARRAY?t.texImage3D(Y,le,j,_e,me,b.depth,0,ce,q,null):t.texImage2D(Y,le,j,_e,me,0,ce,q,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),$e(b)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,W,Y,Ie.__webglTexture,0,Ye(b)):(Y===n.TEXTURE_2D||Y>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,W,Y,Ie.__webglTexture,le),t.bindFramebuffer(n.FRAMEBUFFER,null)}function mt(A,b,B){if(n.bindRenderbuffer(n.RENDERBUFFER,A),b.depthBuffer){const W=b.depthTexture,Y=W&&W.isDepthTexture?W.type:null,le=E(b.stencilBuffer,Y),ce=b.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;$e(b)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ye(b),le,b.width,b.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ye(b),le,b.width,b.height):n.renderbufferStorage(n.RENDERBUFFER,le,b.width,b.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ce,n.RENDERBUFFER,A)}else{const W=b.textures;for(let Y=0;Y<W.length;Y++){const le=W[Y],ce=r.convert(le.format,le.colorSpace),q=r.convert(le.type),j=v(le.internalFormat,ce,q,le.normalized,le.colorSpace);$e(b)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ye(b),j,b.width,b.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ye(b),j,b.width,b.height):n.renderbufferStorage(n.RENDERBUFFER,j,b.width,b.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function qe(A,b,B){const W=b.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const Y=i.get(b.depthTexture);if(Y.__renderTarget=b,(!Y.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),W){if(Y.__webglInit===void 0&&(Y.__webglInit=!0,b.depthTexture.addEventListener("dispose",R)),Y.__webglTexture===void 0){Y.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,Y.__webglTexture),ht(n.TEXTURE_CUBE_MAP,b.depthTexture);const pe=r.convert(b.depthTexture.format),Ie=r.convert(b.depthTexture.type);let _e;b.depthTexture.format===di?_e=n.DEPTH_COMPONENT24:b.depthTexture.format===ji&&(_e=n.DEPTH24_STENCIL8);for(let me=0;me<6;me++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,_e,b.width,b.height,0,pe,Ie,null)}}else ee(b.depthTexture,0);const le=Y.__webglTexture,ce=Ye(b),q=W?n.TEXTURE_CUBE_MAP_POSITIVE_X+B:n.TEXTURE_2D,j=b.depthTexture.format===ji?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(b.depthTexture.format===di)$e(b)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,j,q,le,0,ce):n.framebufferTexture2D(n.FRAMEBUFFER,j,q,le,0);else if(b.depthTexture.format===ji)$e(b)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,j,q,le,0,ce):n.framebufferTexture2D(n.FRAMEBUFFER,j,q,le,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function te(A){const b=i.get(A),B=A.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==A.depthTexture){const W=A.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),W){const Y=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,W.removeEventListener("dispose",Y)};W.addEventListener("dispose",Y),b.__depthDisposeCallback=Y}b.__boundDepthTexture=W}if(A.depthTexture&&!b.__autoAllocateDepthBuffer)if(B)for(let W=0;W<6;W++)qe(b.__webglFramebuffer[W],A,W);else{const W=A.texture.mipmaps;W&&W.length>0?qe(b.__webglFramebuffer[0],A,0):qe(b.__webglFramebuffer,A,0)}else if(B){b.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(n.FRAMEBUFFER,b.__webglFramebuffer[W]),b.__webglDepthbuffer[W]===void 0)b.__webglDepthbuffer[W]=n.createRenderbuffer(),mt(b.__webglDepthbuffer[W],A,!1);else{const Y=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,le=b.__webglDepthbuffer[W];n.bindRenderbuffer(n.RENDERBUFFER,le),n.framebufferRenderbuffer(n.FRAMEBUFFER,Y,n.RENDERBUFFER,le)}}else{const W=A.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(n.FRAMEBUFFER,b.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=n.createRenderbuffer(),mt(b.__webglDepthbuffer,A,!1);else{const Y=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,le=b.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,le),n.framebufferRenderbuffer(n.FRAMEBUFFER,Y,n.RENDERBUFFER,le)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function se(A,b,B){const W=i.get(A);b!==void 0&&ke(W.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),B!==void 0&&te(A)}function ie(A){const b=A.texture,B=i.get(A),W=i.get(b);A.addEventListener("dispose",y);const Y=A.textures,le=A.isWebGLCubeRenderTarget===!0,ce=Y.length>1;if(ce||(W.__webglTexture===void 0&&(W.__webglTexture=n.createTexture()),W.__version=b.version,a.memory.textures++),le){B.__webglFramebuffer=[];for(let q=0;q<6;q++)if(b.mipmaps&&b.mipmaps.length>0){B.__webglFramebuffer[q]=[];for(let j=0;j<b.mipmaps.length;j++)B.__webglFramebuffer[q][j]=n.createFramebuffer()}else B.__webglFramebuffer[q]=n.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){B.__webglFramebuffer=[];for(let q=0;q<b.mipmaps.length;q++)B.__webglFramebuffer[q]=n.createFramebuffer()}else B.__webglFramebuffer=n.createFramebuffer();if(ce)for(let q=0,j=Y.length;q<j;q++){const pe=i.get(Y[q]);pe.__webglTexture===void 0&&(pe.__webglTexture=n.createTexture(),a.memory.textures++)}if(A.samples>0&&$e(A)===!1){B.__webglMultisampledFramebuffer=n.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let q=0;q<Y.length;q++){const j=Y[q];B.__webglColorRenderbuffer[q]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,B.__webglColorRenderbuffer[q]);const pe=r.convert(j.format,j.colorSpace),Ie=r.convert(j.type),_e=v(j.internalFormat,pe,Ie,j.normalized,j.colorSpace,A.isXRRenderTarget===!0),me=Ye(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,me,_e,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+q,n.RENDERBUFFER,B.__webglColorRenderbuffer[q])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(B.__webglDepthRenderbuffer=n.createRenderbuffer(),mt(B.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(le){t.bindTexture(n.TEXTURE_CUBE_MAP,W.__webglTexture),ht(n.TEXTURE_CUBE_MAP,b);for(let q=0;q<6;q++)if(b.mipmaps&&b.mipmaps.length>0)for(let j=0;j<b.mipmaps.length;j++)ke(B.__webglFramebuffer[q][j],A,b,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+q,j);else ke(B.__webglFramebuffer[q],A,b,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+q,0);p(b)&&M(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ce){for(let q=0,j=Y.length;q<j;q++){const pe=Y[q],Ie=i.get(pe);let _e=n.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(_e=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(_e,Ie.__webglTexture),ht(_e,pe),ke(B.__webglFramebuffer,A,pe,n.COLOR_ATTACHMENT0+q,_e,0),p(pe)&&M(_e)}t.unbindTexture()}else{let q=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(q=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(q,W.__webglTexture),ht(q,b),b.mipmaps&&b.mipmaps.length>0)for(let j=0;j<b.mipmaps.length;j++)ke(B.__webglFramebuffer[j],A,b,n.COLOR_ATTACHMENT0,q,j);else ke(B.__webglFramebuffer,A,b,n.COLOR_ATTACHMENT0,q,0);p(b)&&M(q),t.unbindTexture()}A.depthBuffer&&te(A)}function Me(A){const b=A.textures;for(let B=0,W=b.length;B<W;B++){const Y=b[B];if(p(Y)){const le=x(A),ce=i.get(Y).__webglTexture;t.bindTexture(le,ce),M(le),t.unbindTexture()}}}const ve=[],He=[];function Le(A){if(A.samples>0){if($e(A)===!1){const b=A.textures,B=A.width,W=A.height;let Y=n.COLOR_BUFFER_BIT;const le=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ce=i.get(A),q=b.length>1;if(q)for(let pe=0;pe<b.length;pe++)t.bindFramebuffer(n.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+pe,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,ce.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+pe,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,ce.__webglMultisampledFramebuffer);const j=A.texture.mipmaps;j&&j.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ce.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ce.__webglFramebuffer);for(let pe=0;pe<b.length;pe++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(Y|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(Y|=n.STENCIL_BUFFER_BIT)),q){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ce.__webglColorRenderbuffer[pe]);const Ie=i.get(b[pe]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ie,0)}n.blitFramebuffer(0,0,B,W,0,0,B,W,Y,n.NEAREST),l===!0&&(ve.length=0,He.length=0,ve.push(n.COLOR_ATTACHMENT0+pe),A.depthBuffer&&A.resolveDepthBuffer===!1&&(ve.push(le),He.push(le),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,He)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,ve))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),q)for(let pe=0;pe<b.length;pe++){t.bindFramebuffer(n.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+pe,n.RENDERBUFFER,ce.__webglColorRenderbuffer[pe]);const Ie=i.get(b[pe]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,ce.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+pe,n.TEXTURE_2D,Ie,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ce.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&l){const b=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[b])}}}function Ye(A){return Math.min(s.maxSamples,A.samples)}function $e(A){const b=i.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function I(A){const b=a.render.frame;f.get(A)!==b&&(f.set(A,b),A.update())}function _t(A,b){const B=A.colorSpace,W=A.format,Y=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||B!==Ha&&B!==ii&&(ot.getTransfer(B)===xt?(W!==En||Y!==fn)&&Ve("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ft("WebGLTextures: Unsupported texture color space:",B)),b}function st(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=K,this.resetTextureUnits=$,this.getTextureUnits=Z,this.setTextureUnits=z,this.setTexture2D=ee,this.setTexture2DArray=re,this.setTexture3D=de,this.setTextureCube=he,this.rebindTextures=se,this.setupRenderTarget=ie,this.updateRenderTargetMipmap=Me,this.updateMultisampleRenderTarget=Le,this.setupDepthRenderbuffer=te,this.setupFrameBufferTexture=ke,this.useMultisampledRTT=$e,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function O_(n,e){function t(i,s=ii){let r;const a=ot.getTransfer(s);if(i===fn)return n.UNSIGNED_BYTE;if(i===Sc)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Ec)return n.UNSIGNED_SHORT_5_5_5_1;if(i===gu)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===xu)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===pu)return n.BYTE;if(i===mu)return n.SHORT;if(i===Rr)return n.UNSIGNED_SHORT;if(i===bc)return n.INT;if(i===Nn)return n.UNSIGNED_INT;if(i===Ln)return n.FLOAT;if(i===Kn)return n.HALF_FLOAT;if(i===vu)return n.ALPHA;if(i===_u)return n.RGB;if(i===En)return n.RGBA;if(i===di)return n.DEPTH_COMPONENT;if(i===ji)return n.DEPTH_STENCIL;if(i===wc)return n.RED;if(i===Tc)return n.RED_INTEGER;if(i===as)return n.RG;if(i===Ac)return n.RG_INTEGER;if(i===Rc)return n.RGBA_INTEGER;if(i===Aa||i===Ra||i===Ca||i===Pa)if(a===xt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Aa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ra)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Ca)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Pa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Aa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ra)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Ca)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Pa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Pl||i===Ll||i===Il||i===Dl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Pl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ll)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Il)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Dl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ul||i===Nl||i===Fl||i===Ol||i===Bl||i===za||i===zl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Ul||i===Nl)return a===xt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Fl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Ol)return r.COMPRESSED_R11_EAC;if(i===Bl)return r.COMPRESSED_SIGNED_R11_EAC;if(i===za)return r.COMPRESSED_RG11_EAC;if(i===zl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===kl||i===Gl||i===Hl||i===Vl||i===Wl||i===Xl||i===Yl||i===ql||i===$l||i===Kl||i===Zl||i===Jl||i===Ql||i===jl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===kl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Gl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Hl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Vl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Wl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Xl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Yl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===ql)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===$l)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Kl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Zl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Jl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Ql)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===jl)return a===xt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===ec||i===tc||i===nc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===ec)return a===xt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===tc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===nc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===ic||i===sc||i===ka||i===rc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===ic)return r.COMPRESSED_RED_RGTC1_EXT;if(i===sc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===ka)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===rc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Cr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const B_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,z_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class k_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new Cu(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new sn({vertexShader:B_,fragmentShader:z_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new at(new Zs(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class G_ extends hs{constructor(e,t){super();const i=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,f=null,u=null,h=null,d=null,m=null;const _=typeof XRWebGLBinding<"u",g=new k_,p={},M=t.getContextAttributes();let x=null,v=null;const E=[],w=[],R=new oe;let y=null;const T=new gn;T.viewport=new At;const P=new gn;P.viewport=new At;const L=[T,P],O=new Jm;let $=null,Z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Q){let fe=E[Q];return fe===void 0&&(fe=new wo,E[Q]=fe),fe.getTargetRaySpace()},this.getControllerGrip=function(Q){let fe=E[Q];return fe===void 0&&(fe=new wo,E[Q]=fe),fe.getGripSpace()},this.getHand=function(Q){let fe=E[Q];return fe===void 0&&(fe=new wo,E[Q]=fe),fe.getHandSpace()};function z(Q){const fe=w.indexOf(Q.inputSource);if(fe===-1)return;const ae=E[fe];ae!==void 0&&(ae.update(Q.inputSource,Q.frame,c||a),ae.dispatchEvent({type:Q.type,data:Q.inputSource}))}function K(){s.removeEventListener("select",z),s.removeEventListener("selectstart",z),s.removeEventListener("selectend",z),s.removeEventListener("squeeze",z),s.removeEventListener("squeezestart",z),s.removeEventListener("squeezeend",z),s.removeEventListener("end",K),s.removeEventListener("inputsourceschange",G);for(let Q=0;Q<E.length;Q++){const fe=w[Q];fe!==null&&(w[Q]=null,E[Q].disconnect(fe))}$=null,Z=null,g.reset();for(const Q in p)delete p[Q];e.setRenderTarget(x),d=null,h=null,u=null,s=null,v=null,ht.stop(),i.isPresenting=!1,e.setPixelRatio(y),e.setSize(R.width,R.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Q){r=Q,i.isPresenting===!0&&Ve("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Q){o=Q,i.isPresenting===!0&&Ve("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Q){c=Q},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(Q){if(s=Q,s!==null){if(x=e.getRenderTarget(),s.addEventListener("select",z),s.addEventListener("selectstart",z),s.addEventListener("selectend",z),s.addEventListener("squeeze",z),s.addEventListener("squeezestart",z),s.addEventListener("squeezeend",z),s.addEventListener("end",K),s.addEventListener("inputsourceschange",G),M.xrCompatible!==!0&&await t.makeXRCompatible(),y=e.getPixelRatio(),e.getSize(R),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let ae=null,Ne=null,Xe=null;M.depth&&(Xe=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ae=M.stencil?ji:di,Ne=M.stencil?Cr:Nn);const ke={colorFormat:t.RGBA8,depthFormat:Xe,scaleFactor:r};u=this.getBinding(),h=u.createProjectionLayer(ke),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),v=new vn(h.textureWidth,h.textureHeight,{format:En,type:fn,depthTexture:new ls(h.textureWidth,h.textureHeight,Ne,void 0,void 0,void 0,void 0,void 0,void 0,ae),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const ae={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,ae),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),v=new vn(d.framebufferWidth,d.framebufferHeight,{format:En,type:fn,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),ht.setContext(s),ht.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function G(Q){for(let fe=0;fe<Q.removed.length;fe++){const ae=Q.removed[fe],Ne=w.indexOf(ae);Ne>=0&&(w[Ne]=null,E[Ne].disconnect(ae))}for(let fe=0;fe<Q.added.length;fe++){const ae=Q.added[fe];let Ne=w.indexOf(ae);if(Ne===-1){for(let ke=0;ke<E.length;ke++)if(ke>=w.length){w.push(ae),Ne=ke;break}else if(w[ke]===null){w[ke]=ae,Ne=ke;break}if(Ne===-1)break}const Xe=E[Ne];Xe&&Xe.connect(ae)}}const ee=new C,re=new C;function de(Q,fe,ae){ee.setFromMatrixPosition(fe.matrixWorld),re.setFromMatrixPosition(ae.matrixWorld);const Ne=ee.distanceTo(re),Xe=fe.projectionMatrix.elements,ke=ae.projectionMatrix.elements,mt=Xe[14]/(Xe[10]-1),qe=Xe[14]/(Xe[10]+1),te=(Xe[9]+1)/Xe[5],se=(Xe[9]-1)/Xe[5],ie=(Xe[8]-1)/Xe[0],Me=(ke[8]+1)/ke[0],ve=mt*ie,He=mt*Me,Le=Ne/(-ie+Me),Ye=Le*-ie;if(fe.matrixWorld.decompose(Q.position,Q.quaternion,Q.scale),Q.translateX(Ye),Q.translateZ(Le),Q.matrixWorld.compose(Q.position,Q.quaternion,Q.scale),Q.matrixWorldInverse.copy(Q.matrixWorld).invert(),Xe[10]===-1)Q.projectionMatrix.copy(fe.projectionMatrix),Q.projectionMatrixInverse.copy(fe.projectionMatrixInverse);else{const $e=mt+Le,I=qe+Le,_t=ve-Ye,st=He+(Ne-Ye),A=te*qe/I*$e,b=se*qe/I*$e;Q.projectionMatrix.makePerspective(_t,st,A,b,$e,I),Q.projectionMatrixInverse.copy(Q.projectionMatrix).invert()}}function he(Q,fe){fe===null?Q.matrixWorld.copy(Q.matrix):Q.matrixWorld.multiplyMatrices(fe.matrixWorld,Q.matrix),Q.matrixWorldInverse.copy(Q.matrixWorld).invert()}this.updateCamera=function(Q){if(s===null)return;let fe=Q.near,ae=Q.far;g.texture!==null&&(g.depthNear>0&&(fe=g.depthNear),g.depthFar>0&&(ae=g.depthFar)),O.near=P.near=T.near=fe,O.far=P.far=T.far=ae,($!==O.near||Z!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),$=O.near,Z=O.far),O.layers.mask=Q.layers.mask|6,T.layers.mask=O.layers.mask&-5,P.layers.mask=O.layers.mask&-3;const Ne=Q.parent,Xe=O.cameras;he(O,Ne);for(let ke=0;ke<Xe.length;ke++)he(Xe[ke],Ne);Xe.length===2?de(O,T,P):O.projectionMatrix.copy(T.projectionMatrix),Ee(Q,O,Ne)};function Ee(Q,fe,ae){ae===null?Q.matrix.copy(fe.matrixWorld):(Q.matrix.copy(ae.matrixWorld),Q.matrix.invert(),Q.matrix.multiply(fe.matrixWorld)),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale),Q.updateMatrixWorld(!0),Q.projectionMatrix.copy(fe.projectionMatrix),Q.projectionMatrixInverse.copy(fe.projectionMatrixInverse),Q.isPerspectiveCamera&&(Q.fov=Lr*2*Math.atan(1/Q.projectionMatrix.elements[5]),Q.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(h===null&&d===null))return l},this.setFoveation=function(Q){l=Q,h!==null&&(h.fixedFoveation=Q),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Q)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(O)},this.getCameraTexture=function(Q){return p[Q]};let tt=null;function St(Q,fe){if(f=fe.getViewerPose(c||a),m=fe,f!==null){const ae=f.views;d!==null&&(e.setRenderTargetFramebuffer(v,d.framebuffer),e.setRenderTarget(v));let Ne=!1;ae.length!==O.cameras.length&&(O.cameras.length=0,Ne=!0);for(let qe=0;qe<ae.length;qe++){const te=ae[qe];let se=null;if(d!==null)se=d.getViewport(te);else{const Me=u.getViewSubImage(h,te);se=Me.viewport,qe===0&&(e.setRenderTargetTextures(v,Me.colorTexture,Me.depthStencilTexture),e.setRenderTarget(v))}let ie=L[qe];ie===void 0&&(ie=new gn,ie.layers.enable(qe),ie.viewport=new At,L[qe]=ie),ie.matrix.fromArray(te.transform.matrix),ie.matrix.decompose(ie.position,ie.quaternion,ie.scale),ie.projectionMatrix.fromArray(te.projectionMatrix),ie.projectionMatrixInverse.copy(ie.projectionMatrix).invert(),ie.viewport.set(se.x,se.y,se.width,se.height),qe===0&&(O.matrix.copy(ie.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),Ne===!0&&O.cameras.push(ie)}const Xe=s.enabledFeatures;if(Xe&&Xe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=i.getBinding();const qe=u.getDepthInformation(ae[0]);qe&&qe.isValid&&qe.texture&&g.init(qe,s.renderState)}if(Xe&&Xe.includes("camera-access")&&_){e.state.unbindTexture(),u=i.getBinding();for(let qe=0;qe<ae.length;qe++){const te=ae[qe].camera;if(te){let se=p[te];se||(se=new Cu,p[te]=se);const ie=u.getCameraImage(te);se.sourceTexture=ie}}}}for(let ae=0;ae<E.length;ae++){const Ne=w[ae],Xe=E[ae];Ne!==null&&Xe!==void 0&&Xe.update(Ne,fe,c||a)}tt&&tt(Q,fe),fe.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:fe}),m=null}const ht=new Wu;ht.setAnimationLoop(St),this.setAnimationLoop=function(Q){tt=Q},this.dispose=function(){}}}const H_=new bt,Ju=new Ke;Ju.set(-1,0,0,0,1,0,0,0,1);function V_(n,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function i(g,p){p.color.getRGB(g.fogColor.value,ku(n)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,M,x,v){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(g,p):p.isMeshLambertMaterial?(r(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(g,p),u(g,p)):p.isMeshPhongMaterial?(r(g,p),f(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(g,p),h(g,p),p.isMeshPhysicalMaterial&&d(g,p,v)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),_(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,M,x):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===nn&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===nn&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);const M=e.get(p),x=M.envMap,v=M.envMapRotation;x&&(g.envMap.value=x,g.envMapRotation.value.setFromMatrix4(H_.makeRotationFromEuler(v)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(Ju),g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,M,x){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*M,g.scale.value=x*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function f(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function u(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function h(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function d(g,p,M){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===nn&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=M.texture,g.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function _(g,p){const M=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(M.matrixWorld),g.nearDistance.value=M.shadow.camera.near,g.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function W_(n,e,t,i){let s={},r={},a=[];const o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,E){const w=E.program;i.uniformBlockBinding(v,w)}function c(v,E){let w=s[v.id];w===void 0&&(g(v),w=f(v),s[v.id]=w,v.addEventListener("dispose",M));const R=E.program;i.updateUBOMapping(v,R);const y=e.render.frame;r[v.id]!==y&&(h(v),r[v.id]=y)}function f(v){const E=u();v.__bindingPointIndex=E;const w=n.createBuffer(),R=v.__size,y=v.usage;return n.bindBuffer(n.UNIFORM_BUFFER,w),n.bufferData(n.UNIFORM_BUFFER,R,y),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,E,w),w}function u(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return ft("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(v){const E=s[v.id],w=v.uniforms,R=v.__cache;n.bindBuffer(n.UNIFORM_BUFFER,E);for(let y=0,T=w.length;y<T;y++){const P=w[y];if(Array.isArray(P))for(let L=0,O=P.length;L<O;L++)d(P[L],y,L,R);else d(P,y,0,R)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(v,E,w,R){if(_(v,E,w,R)===!0){const y=v.__offset,T=v.value;if(Array.isArray(T)){let P=0;for(let L=0;L<T.length;L++){const O=T[L],$=p(O);m(O,v.__data,P),typeof O!="number"&&typeof O!="boolean"&&!O.isMatrix3&&!ArrayBuffer.isView(O)&&(P+=$.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(T,v.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,y,v.__data)}}function m(v,E,w){typeof v=="number"||typeof v=="boolean"?E[0]=v:v.isMatrix3?(E[0]=v.elements[0],E[1]=v.elements[1],E[2]=v.elements[2],E[3]=0,E[4]=v.elements[3],E[5]=v.elements[4],E[6]=v.elements[5],E[7]=0,E[8]=v.elements[6],E[9]=v.elements[7],E[10]=v.elements[8],E[11]=0):ArrayBuffer.isView(v)?E.set(new v.constructor(v.buffer,v.byteOffset,E.length)):v.toArray(E,w)}function _(v,E,w,R){const y=v.value,T=E+"_"+w;if(R[T]===void 0)return typeof y=="number"||typeof y=="boolean"?R[T]=y:ArrayBuffer.isView(y)?R[T]=y.slice():R[T]=y.clone(),!0;{const P=R[T];if(typeof y=="number"||typeof y=="boolean"){if(P!==y)return R[T]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(P.equals(y)===!1)return P.copy(y),!0}}return!1}function g(v){const E=v.uniforms;let w=0;const R=16;for(let T=0,P=E.length;T<P;T++){const L=Array.isArray(E[T])?E[T]:[E[T]];for(let O=0,$=L.length;O<$;O++){const Z=L[O],z=Array.isArray(Z.value)?Z.value:[Z.value];for(let K=0,G=z.length;K<G;K++){const ee=z[K],re=p(ee),de=w%R,he=de%re.boundary,Ee=de+he;w+=he,Ee!==0&&R-Ee<re.storage&&(w+=R-Ee),Z.__data=new Float32Array(re.storage/Float32Array.BYTES_PER_ELEMENT),Z.__offset=w,w+=re.storage}}}const y=w%R;return y>0&&(w+=R-y),v.__size=w,v.__cache={},this}function p(v){const E={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(E.boundary=4,E.storage=4):v.isVector2?(E.boundary=8,E.storage=8):v.isVector3||v.isColor?(E.boundary=16,E.storage=12):v.isVector4?(E.boundary=16,E.storage=16):v.isMatrix3?(E.boundary=48,E.storage=48):v.isMatrix4?(E.boundary=64,E.storage=64):v.isTexture?Ve("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(E.boundary=16,E.storage=v.byteLength):Ve("WebGLRenderer: Unsupported uniform value type.",v),E}function M(v){const E=v.target;E.removeEventListener("dispose",M);const w=a.indexOf(E.__bindingPointIndex);a.splice(w,1),n.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function x(){for(const v in s)n.deleteBuffer(s[v]);a=[],s={},r={}}return{bind:l,update:c,dispose:x}}const X_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Gn=null;function Y_(){return Gn===null&&(Gn=new Nc(X_,16,16,as,Kn),Gn.name="DFG_LUT",Gn.minFilter=Vt,Gn.magFilter=Vt,Gn.wrapS=ai,Gn.wrapT=ai,Gn.generateMipmaps=!1,Gn.needsUpdate=!0),Gn}class q_{constructor(e={}){const{canvas:t=xp(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:h=!1,outputBufferType:d=fn}=e;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=a;const _=d,g=new Set([Rc,Ac,Tc]),p=new Set([fn,Nn,Rr,Cr,Sc,Ec]),M=new Uint32Array(4),x=new Int32Array(4),v=new C;let E=null,w=null;const R=[],y=[];let T=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Dn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let L=!1,O=null,$=null,Z=null,z=null;this._outputColorSpace=mn;let K=0,G=0,ee=null,re=-1,de=null;const he=new At,Ee=new At;let tt=null;const St=new Ae(0);let ht=0,Q=t.width,fe=t.height,ae=1,Ne=null,Xe=null;const ke=new At(0,0,Q,fe),mt=new At(0,0,Q,fe);let qe=!1;const te=new Fc;let se=!1,ie=!1;const Me=new bt,ve=new C,He=new At,Le={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ye=!1;function $e(){return ee===null?ae:1}let I=i;function _t(S,F){return t.getContext(S,F)}try{const S={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:f,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Mc}`),t.addEventListener("webglcontextlost",Dt,!1),t.addEventListener("webglcontextrestored",Ct,!1),t.addEventListener("webglcontextcreationerror",On,!1),I===null){const F="webgl2";if(I=_t(F,S),I===null)throw _t(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(S){throw ft("WebGLRenderer: "+S.message),S}let st,A,b,B,W,Y,le,ce,q,j,pe,Ie,_e,me,ze,We,Je,U,ue,J,ge,Se,ne;function Pe(){st=new Yx(I),st.init(),ge=new O_(I,st),A=new Bx(I,st,e,ge),b=new N_(I,st),A.reversedDepthBuffer&&h&&b.buffers.depth.setReversed(!0),$=I.createFramebuffer(),Z=I.createFramebuffer(),z=I.createFramebuffer(),B=new Kx(I),W=new y_,Y=new F_(I,st,b,W,A,ge,B),le=new Xx(P),ce=new jm(I),Se=new Fx(I,ce),q=new qx(I,ce,B,Se),j=new Jx(I,q,ce,Se,B),U=new Zx(I,A,Y),ze=new zx(W),pe=new M_(P,le,st,A,Se,ze),Ie=new V_(P,W),_e=new S_,me=new C_(st),Je=new Nx(P,le,b,j,m,l),We=new U_(P,j,A),ne=new W_(I,B,A,b),ue=new Ox(I,st,B),J=new $x(I,st,B),B.programs=pe.programs,P.capabilities=A,P.extensions=st,P.properties=W,P.renderLists=_e,P.shadowMap=We,P.state=b,P.info=B}Pe(),_!==fn&&(T=new jx(_,t.width,t.height,o,s,r));const Re=new G_(P,I);this.xr=Re,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){const S=st.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=st.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return ae},this.setPixelRatio=function(S){S!==void 0&&(ae=S,this.setSize(Q,fe,!1))},this.getSize=function(S){return S.set(Q,fe)},this.setSize=function(S,F,X=!0){if(Re.isPresenting){Ve("WebGLRenderer: Can't change size while VR device is presenting.");return}Q=S,fe=F,t.width=Math.floor(S*ae),t.height=Math.floor(F*ae),X===!0&&(t.style.width=S+"px",t.style.height=F+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,S,F)},this.getDrawingBufferSize=function(S){return S.set(Q*ae,fe*ae).floor()},this.setDrawingBufferSize=function(S,F,X){Q=S,fe=F,ae=X,t.width=Math.floor(S*X),t.height=Math.floor(F*X),this.setViewport(0,0,S,F)},this.setEffects=function(S){if(_===fn){ft("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let F=0;F<S.length;F++)if(S[F].isOutputPass===!0){Ve("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(he)},this.getViewport=function(S){return S.copy(ke)},this.setViewport=function(S,F,X,H){S.isVector4?ke.set(S.x,S.y,S.z,S.w):ke.set(S,F,X,H),b.viewport(he.copy(ke).multiplyScalar(ae).round())},this.getScissor=function(S){return S.copy(mt)},this.setScissor=function(S,F,X,H){S.isVector4?mt.set(S.x,S.y,S.z,S.w):mt.set(S,F,X,H),b.scissor(Ee.copy(mt).multiplyScalar(ae).round())},this.getScissorTest=function(){return qe},this.setScissorTest=function(S){b.setScissorTest(qe=S)},this.setOpaqueSort=function(S){Ne=S},this.setTransparentSort=function(S){Xe=S},this.getClearColor=function(S){return S.copy(Je.getClearColor())},this.setClearColor=function(){Je.setClearColor(...arguments)},this.getClearAlpha=function(){return Je.getClearAlpha()},this.setClearAlpha=function(){Je.setClearAlpha(...arguments)},this.clear=function(S=!0,F=!0,X=!0){let H=0;if(S){let V=!1;if(ee!==null){const be=ee.texture.format;V=g.has(be)}if(V){const be=ee.texture.type,Te=p.has(be),ye=Je.getClearColor(),Ce=Je.getClearAlpha(),De=ye.r,Qe=ye.g,nt=ye.b;Te?(M[0]=De,M[1]=Qe,M[2]=nt,M[3]=Ce,I.clearBufferuiv(I.COLOR,0,M)):(x[0]=De,x[1]=Qe,x[2]=nt,x[3]=Ce,I.clearBufferiv(I.COLOR,0,x))}else H|=I.COLOR_BUFFER_BIT}F&&(H|=I.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),X&&(H|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),H!==0&&I.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),O=S},this.dispose=function(){t.removeEventListener("webglcontextlost",Dt,!1),t.removeEventListener("webglcontextrestored",Ct,!1),t.removeEventListener("webglcontextcreationerror",On,!1),Je.dispose(),_e.dispose(),me.dispose(),W.dispose(),le.dispose(),j.dispose(),Se.dispose(),ne.dispose(),pe.dispose(),Re.dispose(),Re.removeEventListener("sessionstart",hh),Re.removeEventListener("sessionend",fh),ki.stop()};function Dt(S){S.preventDefault(),Th("WebGLRenderer: Context Lost."),L=!0}function Ct(){Th("WebGLRenderer: Context Restored."),L=!1;const S=B.autoReset,F=We.enabled,X=We.autoUpdate,H=We.needsUpdate,V=We.type;Pe(),B.autoReset=S,We.enabled=F,We.autoUpdate=X,We.needsUpdate=H,We.type=V}function On(S){ft("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function Bn(S){const F=S.target;F.removeEventListener("dispose",Bn),Rd(F)}function Rd(S){Cd(S),W.remove(S)}function Cd(S){const F=W.get(S).programs;F!==void 0&&(F.forEach(function(X){pe.releaseProgram(X)}),S.isShaderMaterial&&pe.releaseShaderCache(S))}this.renderBufferDirect=function(S,F,X,H,V,be){F===null&&(F=Le);const Te=V.isMesh&&V.matrixWorld.determinantAffine()<0,ye=Id(S,F,X,H,V);b.setMaterial(H,Te);let Ce=X.index,De=1;if(H.wireframe===!0){if(Ce=q.getWireframeAttribute(X),Ce===void 0)return;De=2}const Qe=X.drawRange,nt=X.attributes.position;let Fe=Qe.start*De,Mt=(Qe.start+Qe.count)*De;be!==null&&(Fe=Math.max(Fe,be.start*De),Mt=Math.min(Mt,(be.start+be.count)*De)),Ce!==null?(Fe=Math.max(Fe,0),Mt=Math.min(Mt,Ce.count)):nt!=null&&(Fe=Math.max(Fe,0),Mt=Math.min(Mt,nt.count));const Ot=Mt-Fe;if(Ot<0||Ot===1/0)return;Se.setup(V,H,ye,X,Ce);let Ut,Et=ue;if(Ce!==null&&(Ut=ce.get(Ce),Et=J,Et.setIndex(Ut)),V.isMesh)H.wireframe===!0?(b.setLineWidth(H.wireframeLinewidth*$e()),Et.setMode(I.LINES)):Et.setMode(I.TRIANGLES);else if(V.isLine){let jt=H.linewidth;jt===void 0&&(jt=1),b.setLineWidth(jt*$e()),V.isLineSegments?Et.setMode(I.LINES):V.isLineLoop?Et.setMode(I.LINE_LOOP):Et.setMode(I.LINE_STRIP)}else V.isPoints?Et.setMode(I.POINTS):V.isSprite&&Et.setMode(I.TRIANGLES);if(V.isBatchedMesh)if(st.get("WEBGL_multi_draw"))Et.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{const jt=V._multiDrawStarts,we=V._multiDrawCounts,un=V._multiDrawCount,dt=Ce?ce.get(Ce).bytesPerElement:1,yn=W.get(H).currentProgram.getUniforms();for(let zn=0;zn<un;zn++)yn.setValue(I,"_gl_DrawID",zn),Et.render(jt[zn]/dt,we[zn])}else if(V.isInstancedMesh)Et.renderInstances(Fe,Ot,V.count);else if(X.isInstancedBufferGeometry){const jt=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,we=Math.min(X.instanceCount,jt);Et.renderInstances(Fe,Ot,we)}else Et.render(Fe,Ot)};function ch(S,F,X){S.transparent===!0&&S.side===Sn&&S.forceSinglePass===!1?(S.side=nn,S.needsUpdate=!0,Wr(S,F,X),S.side=ui,S.needsUpdate=!0,Wr(S,F,X),S.side=Sn):Wr(S,F,X)}this.compile=function(S,F,X=null){X===null&&(X=S),w=me.get(X),w.init(F),y.push(w),X.traverseVisible(function(V){V.isLight&&V.layers.test(F.layers)&&(w.pushLight(V),V.castShadow&&w.pushShadow(V))}),S!==X&&S.traverseVisible(function(V){V.isLight&&V.layers.test(F.layers)&&(w.pushLight(V),V.castShadow&&w.pushShadow(V))}),w.setupLights();const H=new Set;return S.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;const be=V.material;if(be)if(Array.isArray(be))for(let Te=0;Te<be.length;Te++){const ye=be[Te];ch(ye,X,V),H.add(ye)}else ch(be,X,V),H.add(be)}),w=y.pop(),H},this.compileAsync=function(S,F,X=null){const H=this.compile(S,F,X);return new Promise(V=>{function be(){if(H.forEach(function(Te){W.get(Te).currentProgram.isReady()&&H.delete(Te)}),H.size===0){V(S);return}setTimeout(be,10)}st.get("KHR_parallel_shader_compile")!==null?be():setTimeout(be,10)})};let po=null;function Pd(S){po&&po(S)}function hh(){ki.stop()}function fh(){ki.start()}const ki=new Wu;ki.setAnimationLoop(Pd),typeof self<"u"&&ki.setContext(self),this.setAnimationLoop=function(S){po=S,Re.setAnimationLoop(S),S===null?ki.stop():ki.start()},Re.addEventListener("sessionstart",hh),Re.addEventListener("sessionend",fh),this.render=function(S,F){if(F!==void 0&&F.isCamera!==!0){ft("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;O!==null&&O.renderStart(S,F);const X=Re.enabled===!0&&Re.isPresenting===!0,H=T!==null&&(ee===null||X)&&T.begin(P,ee);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Re.enabled===!0&&Re.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(Re.cameraAutoUpdate===!0&&Re.updateCamera(F),F=Re.getCamera()),S.isScene===!0&&S.onBeforeRender(P,S,F,ee),w=me.get(S,y.length),w.init(F),w.state.textureUnits=Y.getTextureUnits(),y.push(w),Me.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),te.setFromProjectionMatrix(Me,qn,F.reversedDepth),ie=this.localClippingEnabled,se=ze.init(this.clippingPlanes,ie),E=_e.get(S,R.length),E.init(),R.push(E),Re.enabled===!0&&Re.isPresenting===!0){const Te=P.xr.getDepthSensingMesh();Te!==null&&mo(Te,F,-1/0,P.sortObjects)}mo(S,F,0,P.sortObjects),E.finish(),P.sortObjects===!0&&E.sort(Ne,Xe,F.reversedDepth),Ye=Re.enabled===!1||Re.isPresenting===!1||Re.hasDepthSensing()===!1,Ye&&Je.addToRenderList(E,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),se===!0&&ze.beginShadows();const V=w.state.shadowsArray;if(We.render(V,S,F),se===!0&&ze.endShadows(),(H&&T.hasRenderPass())===!1){const Te=E.opaque,ye=E.transmissive;if(w.setupLights(),F.isArrayCamera){const Ce=F.cameras;if(ye.length>0)for(let De=0,Qe=Ce.length;De<Qe;De++){const nt=Ce[De];dh(Te,ye,S,nt)}Ye&&Je.render(S);for(let De=0,Qe=Ce.length;De<Qe;De++){const nt=Ce[De];uh(E,S,nt,nt.viewport)}}else ye.length>0&&dh(Te,ye,S,F),Ye&&Je.render(S),uh(E,S,F)}ee!==null&&G===0&&(Y.updateMultisampleRenderTarget(ee),Y.updateRenderTargetMipmap(ee)),H&&T.end(P),S.isScene===!0&&S.onAfterRender(P,S,F),Se.resetDefaultState(),re=-1,de=null,y.pop(),y.length>0?(w=y[y.length-1],Y.setTextureUnits(w.state.textureUnits),se===!0&&ze.setGlobalState(P.clippingPlanes,w.state.camera)):w=null,R.pop(),R.length>0?E=R[R.length-1]:E=null,O!==null&&O.renderEnd()};function mo(S,F,X,H){if(S.visible===!1)return;if(S.layers.test(F.layers)){if(S.isGroup)X=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(F);else if(S.isLightProbeGrid)w.pushLightProbeGrid(S);else if(S.isLight)w.pushLight(S),S.castShadow&&w.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||te.intersectsSprite(S)){H&&He.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Me);const Te=j.update(S),ye=S.material;ye.visible&&E.push(S,Te,ye,X,He.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||te.intersectsObject(S))){const Te=j.update(S),ye=S.material;if(H&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),He.copy(S.boundingSphere.center)):(Te.boundingSphere===null&&Te.computeBoundingSphere(),He.copy(Te.boundingSphere.center)),He.applyMatrix4(S.matrixWorld).applyMatrix4(Me)),Array.isArray(ye)){const Ce=Te.groups;for(let De=0,Qe=Ce.length;De<Qe;De++){const nt=Ce[De],Fe=ye[nt.materialIndex];Fe&&Fe.visible&&E.push(S,Te,Fe,X,He.z,nt)}}else ye.visible&&E.push(S,Te,ye,X,He.z,null)}}const be=S.children;for(let Te=0,ye=be.length;Te<ye;Te++)mo(be[Te],F,X,H)}function uh(S,F,X,H){const{opaque:V,transmissive:be,transparent:Te}=S;w.setupLightsView(X),se===!0&&ze.setGlobalState(P.clippingPlanes,X),H&&b.viewport(he.copy(H)),V.length>0&&Vr(V,F,X),be.length>0&&Vr(be,F,X),Te.length>0&&Vr(Te,F,X),b.buffers.depth.setTest(!0),b.buffers.depth.setMask(!0),b.buffers.color.setMask(!0),b.setPolygonOffset(!1)}function dh(S,F,X,H){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[H.id]===void 0){const Fe=st.has("EXT_color_buffer_half_float")||st.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[H.id]=new vn(1,1,{generateMipmaps:!0,type:Fe?Kn:fn,minFilter:Ci,samples:Math.max(4,A.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ot.workingColorSpace})}const be=w.state.transmissionRenderTarget[H.id],Te=H.viewport||he;be.setSize(Te.z*P.transmissionResolutionScale,Te.w*P.transmissionResolutionScale);const ye=P.getRenderTarget(),Ce=P.getActiveCubeFace(),De=P.getActiveMipmapLevel();P.setRenderTarget(be),P.getClearColor(St),ht=P.getClearAlpha(),ht<1&&P.setClearColor(16777215,.5),P.clear(),Ye&&Je.render(X);const Qe=P.toneMapping;P.toneMapping=Dn;const nt=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),w.setupLightsView(H),se===!0&&ze.setGlobalState(P.clippingPlanes,H),Vr(S,X,H),Y.updateMultisampleRenderTarget(be),Y.updateRenderTargetMipmap(be),st.has("WEBGL_multisampled_render_to_texture")===!1){let Fe=!1;for(let Mt=0,Ot=F.length;Mt<Ot;Mt++){const Ut=F[Mt],{object:Et,geometry:jt,material:we,group:un}=Ut;if(we.side===Sn&&Et.layers.test(H.layers)){const dt=we.side;we.side=nn,we.needsUpdate=!0,ph(Et,X,H,jt,we,un),we.side=dt,we.needsUpdate=!0,Fe=!0}}Fe===!0&&(Y.updateMultisampleRenderTarget(be),Y.updateRenderTargetMipmap(be))}P.setRenderTarget(ye,Ce,De),P.setClearColor(St,ht),nt!==void 0&&(H.viewport=nt),P.toneMapping=Qe}function Vr(S,F,X){const H=F.isScene===!0?F.overrideMaterial:null;for(let V=0,be=S.length;V<be;V++){const Te=S[V],{object:ye,geometry:Ce,group:De}=Te;let Qe=Te.material;Qe.allowOverride===!0&&H!==null&&(Qe=H),ye.layers.test(X.layers)&&ph(ye,F,X,Ce,Qe,De)}}function ph(S,F,X,H,V,be){S.onBeforeRender(P,F,X,H,V,be),S.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),V.onBeforeRender(P,F,X,H,S,be),V.transparent===!0&&V.side===Sn&&V.forceSinglePass===!1?(V.side=nn,V.needsUpdate=!0,P.renderBufferDirect(X,F,H,V,S,be),V.side=ui,V.needsUpdate=!0,P.renderBufferDirect(X,F,H,V,S,be),V.side=Sn):P.renderBufferDirect(X,F,H,V,S,be),S.onAfterRender(P,F,X,H,V,be)}function Wr(S,F,X){F.isScene!==!0&&(F=Le);const H=W.get(S),V=w.state.lights,be=w.state.shadowsArray,Te=V.state.version,ye=pe.getParameters(S,V.state,be,F,X,w.state.lightProbeGridArray),Ce=pe.getProgramCacheKey(ye);let De=H.programs;H.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?F.environment:null,H.fog=F.fog;const Qe=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;H.envMap=le.get(S.envMap||H.environment,Qe),H.envMapRotation=H.environment!==null&&S.envMap===null?F.environmentRotation:S.envMapRotation,De===void 0&&(S.addEventListener("dispose",Bn),De=new Map,H.programs=De);let nt=De.get(Ce);if(nt!==void 0){if(H.currentProgram===nt&&H.lightsStateVersion===Te)return gh(S,ye),nt}else ye.uniforms=pe.getUniforms(S),O!==null&&S.isNodeMaterial&&O.build(S,X,ye),S.onBeforeCompile(ye,P),nt=pe.acquireProgram(ye,Ce),De.set(Ce,nt),H.uniforms=ye.uniforms;const Fe=H.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Fe.clippingPlanes=ze.uniform),gh(S,ye),H.needsLights=Ud(S),H.lightsStateVersion=Te,H.needsLights&&(Fe.ambientLightColor.value=V.state.ambient,Fe.lightProbe.value=V.state.probe,Fe.directionalLights.value=V.state.directional,Fe.directionalLightShadows.value=V.state.directionalShadow,Fe.spotLights.value=V.state.spot,Fe.spotLightShadows.value=V.state.spotShadow,Fe.rectAreaLights.value=V.state.rectArea,Fe.ltc_1.value=V.state.rectAreaLTC1,Fe.ltc_2.value=V.state.rectAreaLTC2,Fe.pointLights.value=V.state.point,Fe.pointLightShadows.value=V.state.pointShadow,Fe.hemisphereLights.value=V.state.hemi,Fe.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Fe.spotLightMatrix.value=V.state.spotLightMatrix,Fe.spotLightMap.value=V.state.spotLightMap,Fe.pointShadowMatrix.value=V.state.pointShadowMatrix),H.lightProbeGrid=w.state.lightProbeGridArray.length>0,H.currentProgram=nt,H.uniformsList=null,nt}function mh(S){if(S.uniformsList===null){const F=S.currentProgram.getUniforms();S.uniformsList=La.seqWithValue(F.seq,S.uniforms)}return S.uniformsList}function gh(S,F){const X=W.get(S);X.outputColorSpace=F.outputColorSpace,X.batching=F.batching,X.batchingColor=F.batchingColor,X.instancing=F.instancing,X.instancingColor=F.instancingColor,X.instancingMorph=F.instancingMorph,X.skinning=F.skinning,X.morphTargets=F.morphTargets,X.morphNormals=F.morphNormals,X.morphColors=F.morphColors,X.morphTargetsCount=F.morphTargetsCount,X.numClippingPlanes=F.numClippingPlanes,X.numIntersection=F.numClipIntersection,X.vertexAlphas=F.vertexAlphas,X.vertexTangents=F.vertexTangents,X.toneMapping=F.toneMapping}function Ld(S,F){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;v.setFromMatrixPosition(F.matrixWorld);for(let X=0,H=S.length;X<H;X++){const V=S[X];if(V.texture!==null&&V.boundingBox.containsPoint(v))return V}return null}function Id(S,F,X,H,V){F.isScene!==!0&&(F=Le),Y.resetTextureUnits();const be=F.fog,Te=H.isMeshStandardMaterial||H.isMeshLambertMaterial||H.isMeshPhongMaterial?F.environment:null,ye=ee===null?P.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:ot.workingColorSpace,Ce=H.isMeshStandardMaterial||H.isMeshLambertMaterial&&!H.envMap||H.isMeshPhongMaterial&&!H.envMap,De=le.get(H.envMap||Te,Ce),Qe=H.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,nt=!!X.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Fe=!!X.morphAttributes.position,Mt=!!X.morphAttributes.normal,Ot=!!X.morphAttributes.color;let Ut=Dn;H.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Ut=P.toneMapping);const Et=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,jt=Et!==void 0?Et.length:0,we=W.get(H),un=w.state.lights;if(se===!0&&(ie===!0||S!==de)){const Pt=S===de&&H.id===re;ze.setState(H,S,Pt)}let dt=!1;H.version===we.__version?(we.needsLights&&we.lightsStateVersion!==un.state.version||we.outputColorSpace!==ye||V.isBatchedMesh&&we.batching===!1||!V.isBatchedMesh&&we.batching===!0||V.isBatchedMesh&&we.batchingColor===!0&&V.colorTexture===null||V.isBatchedMesh&&we.batchingColor===!1&&V.colorTexture!==null||V.isInstancedMesh&&we.instancing===!1||!V.isInstancedMesh&&we.instancing===!0||V.isSkinnedMesh&&we.skinning===!1||!V.isSkinnedMesh&&we.skinning===!0||V.isInstancedMesh&&we.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&we.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&we.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&we.instancingMorph===!1&&V.morphTexture!==null||we.envMap!==De||H.fog===!0&&we.fog!==be||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==ze.numPlanes||we.numIntersection!==ze.numIntersection)||we.vertexAlphas!==Qe||we.vertexTangents!==nt||we.morphTargets!==Fe||we.morphNormals!==Mt||we.morphColors!==Ot||we.toneMapping!==Ut||we.morphTargetsCount!==jt||!!we.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(dt=!0):(dt=!0,we.__version=H.version);let yn=we.currentProgram;dt===!0&&(yn=Wr(H,F,V),O&&H.isNodeMaterial&&O.onUpdateProgram(H,yn,we));let zn=!1,gi=!1,ms=!1;const wt=yn.getUniforms(),Bt=we.uniforms;if(b.useProgram(yn.program)&&(zn=!0,gi=!0,ms=!0),H.id!==re&&(re=H.id,gi=!0),we.needsLights){const Pt=Ld(w.state.lightProbeGridArray,V);we.lightProbeGrid!==Pt&&(we.lightProbeGrid=Pt,gi=!0)}if(zn||de!==S){b.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),wt.setValue(I,"projectionMatrix",S.projectionMatrix),wt.setValue(I,"viewMatrix",S.matrixWorldInverse);const vi=wt.map.cameraPosition;vi!==void 0&&vi.setValue(I,ve.setFromMatrixPosition(S.matrixWorld)),A.logarithmicDepthBuffer&&wt.setValue(I,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&wt.setValue(I,"isOrthographic",S.isOrthographicCamera===!0),de!==S&&(de=S,gi=!0,ms=!0)}if(we.needsLights&&(un.state.directionalShadowMap.length>0&&wt.setValue(I,"directionalShadowMap",un.state.directionalShadowMap,Y),un.state.spotShadowMap.length>0&&wt.setValue(I,"spotShadowMap",un.state.spotShadowMap,Y),un.state.pointShadowMap.length>0&&wt.setValue(I,"pointShadowMap",un.state.pointShadowMap,Y)),V.isSkinnedMesh){wt.setOptional(I,V,"bindMatrix"),wt.setOptional(I,V,"bindMatrixInverse");const Pt=V.skeleton;Pt&&(Pt.boneTexture===null&&Pt.computeBoneTexture(),wt.setValue(I,"boneTexture",Pt.boneTexture,Y))}V.isBatchedMesh&&(wt.setOptional(I,V,"batchingTexture"),wt.setValue(I,"batchingTexture",V._matricesTexture,Y),wt.setOptional(I,V,"batchingIdTexture"),wt.setValue(I,"batchingIdTexture",V._indirectTexture,Y),wt.setOptional(I,V,"batchingColorTexture"),V._colorsTexture!==null&&wt.setValue(I,"batchingColorTexture",V._colorsTexture,Y));const xi=X.morphAttributes;if((xi.position!==void 0||xi.normal!==void 0||xi.color!==void 0)&&U.update(V,X,yn),(gi||we.receiveShadow!==V.receiveShadow)&&(we.receiveShadow=V.receiveShadow,wt.setValue(I,"receiveShadow",V.receiveShadow)),(H.isMeshStandardMaterial||H.isMeshLambertMaterial||H.isMeshPhongMaterial)&&H.envMap===null&&F.environment!==null&&(Bt.envMapIntensity.value=F.environmentIntensity),Bt.dfgLUT!==void 0&&(Bt.dfgLUT.value=Y_()),gi){if(wt.setValue(I,"toneMappingExposure",P.toneMappingExposure),we.needsLights&&Dd(Bt,ms),be&&H.fog===!0&&Ie.refreshFogUniforms(Bt,be),Ie.refreshMaterialUniforms(Bt,H,ae,fe,w.state.transmissionRenderTarget[S.id]),we.needsLights&&we.lightProbeGrid){const Pt=we.lightProbeGrid;Bt.probesSH.value=Pt.texture,Bt.probesMin.value.copy(Pt.boundingBox.min),Bt.probesMax.value.copy(Pt.boundingBox.max),Bt.probesResolution.value.copy(Pt.resolution)}La.upload(I,mh(we),Bt,Y)}if(H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(La.upload(I,mh(we),Bt,Y),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&wt.setValue(I,"center",V.center),wt.setValue(I,"modelViewMatrix",V.modelViewMatrix),wt.setValue(I,"normalMatrix",V.normalMatrix),wt.setValue(I,"modelMatrix",V.matrixWorld),H.uniformsGroups!==void 0){const Pt=H.uniformsGroups;for(let vi=0,gs=Pt.length;vi<gs;vi++){const xh=Pt[vi];ne.update(xh,yn),ne.bind(xh,yn)}}return yn}function Dd(S,F){S.ambientLightColor.needsUpdate=F,S.lightProbe.needsUpdate=F,S.directionalLights.needsUpdate=F,S.directionalLightShadows.needsUpdate=F,S.pointLights.needsUpdate=F,S.pointLightShadows.needsUpdate=F,S.spotLights.needsUpdate=F,S.spotLightShadows.needsUpdate=F,S.rectAreaLights.needsUpdate=F,S.hemisphereLights.needsUpdate=F}function Ud(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return K},this.getActiveMipmapLevel=function(){return G},this.getRenderTarget=function(){return ee},this.setRenderTargetTextures=function(S,F,X){const H=W.get(S);H.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,H.__autoAllocateDepthBuffer===!1&&(H.__useRenderToTexture=!1),W.get(S.texture).__webglTexture=F,W.get(S.depthTexture).__webglTexture=H.__autoAllocateDepthBuffer?void 0:X,H.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,F){const X=W.get(S);X.__webglFramebuffer=F,X.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(S,F=0,X=0){ee=S,K=F,G=X;let H=null,V=!1,be=!1;if(S){const ye=W.get(S);if(ye.__useDefaultFramebuffer!==void 0){b.bindFramebuffer(I.FRAMEBUFFER,ye.__webglFramebuffer),he.copy(S.viewport),Ee.copy(S.scissor),tt=S.scissorTest,b.viewport(he),b.scissor(Ee),b.setScissorTest(tt),re=-1;return}else if(ye.__webglFramebuffer===void 0)Y.setupRenderTarget(S);else if(ye.__hasExternalTextures)Y.rebindTextures(S,W.get(S.texture).__webglTexture,W.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const Qe=S.depthTexture;if(ye.__boundDepthTexture!==Qe){if(Qe!==null&&W.has(Qe)&&(S.width!==Qe.image.width||S.height!==Qe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Y.setupDepthRenderbuffer(S)}}const Ce=S.texture;(Ce.isData3DTexture||Ce.isDataArrayTexture||Ce.isCompressedArrayTexture)&&(be=!0);const De=W.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(De[F])?H=De[F][X]:H=De[F],V=!0):S.samples>0&&Y.useMultisampledRTT(S)===!1?H=W.get(S).__webglMultisampledFramebuffer:Array.isArray(De)?H=De[X]:H=De,he.copy(S.viewport),Ee.copy(S.scissor),tt=S.scissorTest}else he.copy(ke).multiplyScalar(ae).floor(),Ee.copy(mt).multiplyScalar(ae).floor(),tt=qe;if(X!==0&&(H=$),b.bindFramebuffer(I.FRAMEBUFFER,H)&&b.drawBuffers(S,H),b.viewport(he),b.scissor(Ee),b.setScissorTest(tt),V){const ye=W.get(S.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+F,ye.__webglTexture,X)}else if(be){const ye=F;for(let Ce=0;Ce<S.textures.length;Ce++){const De=W.get(S.textures[Ce]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+Ce,De.__webglTexture,X,ye)}}else if(S!==null&&X!==0){const ye=W.get(S.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,ye.__webglTexture,X)}re=-1},this.readRenderTargetPixels=function(S,F,X,H,V,be,Te,ye=0){if(!(S&&S.isWebGLRenderTarget)){ft("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ce=W.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Te!==void 0&&(Ce=Ce[Te]),Ce){b.bindFramebuffer(I.FRAMEBUFFER,Ce);try{const De=S.textures[ye],Qe=De.format,nt=De.type;if(S.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+ye),!A.textureFormatReadable(Qe)){ft("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!A.textureTypeReadable(nt)){ft("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=S.width-H&&X>=0&&X<=S.height-V&&I.readPixels(F,X,H,V,ge.convert(Qe),ge.convert(nt),be)}finally{const De=ee!==null?W.get(ee).__webglFramebuffer:null;b.bindFramebuffer(I.FRAMEBUFFER,De)}}},this.readRenderTargetPixelsAsync=async function(S,F,X,H,V,be,Te,ye=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ce=W.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Te!==void 0&&(Ce=Ce[Te]),Ce)if(F>=0&&F<=S.width-H&&X>=0&&X<=S.height-V){b.bindFramebuffer(I.FRAMEBUFFER,Ce);const De=S.textures[ye],Qe=De.format,nt=De.type;if(S.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+ye),!A.textureFormatReadable(Qe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!A.textureTypeReadable(nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Fe=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,Fe),I.bufferData(I.PIXEL_PACK_BUFFER,be.byteLength,I.STREAM_READ),I.readPixels(F,X,H,V,ge.convert(Qe),ge.convert(nt),0);const Mt=ee!==null?W.get(ee).__webglFramebuffer:null;b.bindFramebuffer(I.FRAMEBUFFER,Mt);const Ot=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await vp(I,Ot,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,Fe),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,be),I.deleteBuffer(Fe),I.deleteSync(Ot),be}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,F=null,X=0){const H=Math.pow(2,-X),V=Math.floor(S.image.width*H),be=Math.floor(S.image.height*H),Te=F!==null?F.x:0,ye=F!==null?F.y:0;Y.setTexture2D(S,0),I.copyTexSubImage2D(I.TEXTURE_2D,X,0,0,Te,ye,V,be),b.unbindTexture()},this.copyTextureToTexture=function(S,F,X=null,H=null,V=0,be=0){let Te,ye,Ce,De,Qe,nt,Fe,Mt,Ot;const Ut=S.isCompressedTexture?S.mipmaps[be]:S.image;if(X!==null)Te=X.max.x-X.min.x,ye=X.max.y-X.min.y,Ce=X.isBox3?X.max.z-X.min.z:1,De=X.min.x,Qe=X.min.y,nt=X.isBox3?X.min.z:0;else{const Bt=Math.pow(2,-V);Te=Math.floor(Ut.width*Bt),ye=Math.floor(Ut.height*Bt),S.isDataArrayTexture?Ce=Ut.depth:S.isData3DTexture?Ce=Math.floor(Ut.depth*Bt):Ce=1,De=0,Qe=0,nt=0}H!==null?(Fe=H.x,Mt=H.y,Ot=H.z):(Fe=0,Mt=0,Ot=0);const Et=ge.convert(F.format),jt=ge.convert(F.type);let we;F.isData3DTexture?(Y.setTexture3D(F,0),we=I.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(Y.setTexture2DArray(F,0),we=I.TEXTURE_2D_ARRAY):(Y.setTexture2D(F,0),we=I.TEXTURE_2D),b.activeTexture(I.TEXTURE0),b.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,F.flipY),b.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),b.pixelStorei(I.UNPACK_ALIGNMENT,F.unpackAlignment);const un=b.getParameter(I.UNPACK_ROW_LENGTH),dt=b.getParameter(I.UNPACK_IMAGE_HEIGHT),yn=b.getParameter(I.UNPACK_SKIP_PIXELS),zn=b.getParameter(I.UNPACK_SKIP_ROWS),gi=b.getParameter(I.UNPACK_SKIP_IMAGES);b.pixelStorei(I.UNPACK_ROW_LENGTH,Ut.width),b.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Ut.height),b.pixelStorei(I.UNPACK_SKIP_PIXELS,De),b.pixelStorei(I.UNPACK_SKIP_ROWS,Qe),b.pixelStorei(I.UNPACK_SKIP_IMAGES,nt);const ms=S.isDataArrayTexture||S.isData3DTexture,wt=F.isDataArrayTexture||F.isData3DTexture;if(S.isDepthTexture){const Bt=W.get(S),xi=W.get(F),Pt=W.get(Bt.__renderTarget),vi=W.get(xi.__renderTarget);b.bindFramebuffer(I.READ_FRAMEBUFFER,Pt.__webglFramebuffer),b.bindFramebuffer(I.DRAW_FRAMEBUFFER,vi.__webglFramebuffer);for(let gs=0;gs<Ce;gs++)ms&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,W.get(S).__webglTexture,V,nt+gs),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,W.get(F).__webglTexture,be,Ot+gs)),I.blitFramebuffer(De,Qe,Te,ye,Fe,Mt,Te,ye,I.DEPTH_BUFFER_BIT,I.NEAREST);b.bindFramebuffer(I.READ_FRAMEBUFFER,null),b.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(V!==0||S.isRenderTargetTexture||W.has(S)){const Bt=W.get(S),xi=W.get(F);b.bindFramebuffer(I.READ_FRAMEBUFFER,Z),b.bindFramebuffer(I.DRAW_FRAMEBUFFER,z);for(let Pt=0;Pt<Ce;Pt++)ms?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Bt.__webglTexture,V,nt+Pt):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,Bt.__webglTexture,V),wt?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,xi.__webglTexture,be,Ot+Pt):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,xi.__webglTexture,be),V!==0?I.blitFramebuffer(De,Qe,Te,ye,Fe,Mt,Te,ye,I.COLOR_BUFFER_BIT,I.NEAREST):wt?I.copyTexSubImage3D(we,be,Fe,Mt,Ot+Pt,De,Qe,Te,ye):I.copyTexSubImage2D(we,be,Fe,Mt,De,Qe,Te,ye);b.bindFramebuffer(I.READ_FRAMEBUFFER,null),b.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else wt?S.isDataTexture||S.isData3DTexture?I.texSubImage3D(we,be,Fe,Mt,Ot,Te,ye,Ce,Et,jt,Ut.data):F.isCompressedArrayTexture?I.compressedTexSubImage3D(we,be,Fe,Mt,Ot,Te,ye,Ce,Et,Ut.data):I.texSubImage3D(we,be,Fe,Mt,Ot,Te,ye,Ce,Et,jt,Ut):S.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,be,Fe,Mt,Te,ye,Et,jt,Ut.data):S.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,be,Fe,Mt,Ut.width,Ut.height,Et,Ut.data):I.texSubImage2D(I.TEXTURE_2D,be,Fe,Mt,Te,ye,Et,jt,Ut);b.pixelStorei(I.UNPACK_ROW_LENGTH,un),b.pixelStorei(I.UNPACK_IMAGE_HEIGHT,dt),b.pixelStorei(I.UNPACK_SKIP_PIXELS,yn),b.pixelStorei(I.UNPACK_SKIP_ROWS,zn),b.pixelStorei(I.UNPACK_SKIP_IMAGES,gi),be===0&&F.generateMipmaps&&I.generateMipmap(we),b.unbindTexture()},this.initRenderTarget=function(S){W.get(S).__webglFramebuffer===void 0&&Y.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?Y.setTextureCube(S,0):S.isData3DTexture?Y.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Y.setTexture2DArray(S,0):Y.setTexture2D(S,0),b.unbindTexture()},this.resetState=function(){K=0,G=0,ee=null,b.reset(),Se.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return qn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=ot._getDrawingBufferColorSpace(e),t.unpackColorSpace=ot._getUnpackColorSpace()}}const $_={city:"crate",palace:"urn",desert:"rock",canyon:"rock",river:"timber",farm:"hay",ancient:"seal",fishing:"timber",mountain:"rock",jungle:"timber",beach:"crate",island:"urn",temple:"seal"};function _n(n){const e=Math.max(0,n-320);return 11*(1-Math.cos(e/270))+4*(1-Math.cos(e/113))}function Nr(n){const e=_c(n);if(e)return{...e,halfWidth:29,ceiling:32,type:"gauntlet"};const t=Math.floor(n/1792),i=n-t*1792;if(i<768||i>=1088)return null;const s=t*1792+768;return fi(s,384)||fi(s+320,384)?null:{start:t*1792+768,end:t*1792+1088,halfWidth:29,ceiling:32,type:t%2?"cave":"cliff tunnel"}}function Qu(n){if(!Nr(n))return[];const e=[],t=64.2,i=n+32,s=(r,a,o,l,c,f=!0,u=0)=>e.push({color:r,x:a,s:i,bottom:o,width:l,height:c,depth:t,hazard:f,angle:u,flatBase:!0});for(const r of[-1,1])s("#795c61",r*90,-1,58,80,!1),s("#795c61",r*45,-1,32,80);s("#725b62",0,58,240,24,!1),s("#725b62",0,32,124,26);for(const r of[-1,1])s("#725b62",r*21,30,16,8);return e}function ju(n,e,t,i){return e<2||e%3!==1?[]:Array.from({length:2},(s,r)=>{const a=e>8&&r===0,o=a?2.6:1;return{destructible:!0,kind:$_[n],x:(i()-.5)*76,y:a?7+i()*14:2.1,s:t+17+r*24,hp:a?6.5:3.8,maxHp:a?6.5:3.8,radius:2.5*o,scale:o,large:a,active:!0}})}const ed=new sn({uniforms:{time:{value:0}},vertexShader:"varying vec2 flow; void main(){flow=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`varying vec2 flow; uniform float time;
    void main(){
      vec2 p=flow*vec2(.22,.16);float t=time*.45;
      float a=sin(p.x*2.1+sin(p.y*1.7+t*.3))*sin(p.y*2.3-t+sin(p.x*1.5));
      float cracks=1.-smoothstep(.025,.18,abs(a));
      float heat=.5+.5*sin(p.y*.9-p.x*.7-t*.6);
      vec3 crust=mix(vec3(.09,.017,.025),vec3(.34,.04,.012),heat);
      vec3 molten=mix(vec3(1.45,.15,.01),vec3(2.2,.95,.12),heat);
      gl_FragColor=vec4(mix(crust,molten,cracks),1.);
    }`});function K_(n,e){const t=new Fn(34,2,64.1,4,1,16);t.translate(0,1,-32);const i=t.attributes.position,s=t.attributes.uv;for(let r=0;r<i.count;r++){const a=i.getZ(r),o=e+i.getY(r)+_n(n-a)-_n(n),l=a/e;s.setXY(r,i.getX(r),n-a),i.setY(r,Math.cos(l)*o-e),i.setZ(r,Math.sin(l)*o)}return t.computeVertexNormals(),new at(t,ed)}const jo=n=>({vertices:[-.5,.5].flatMap(e=>n.map(([t,i])=>[t,i,e])),faces:[n.map((e,t)=>t).reverse(),n.map((e,t)=>t+n.length),...n.map((e,t)=>[t,(t+1)%n.length,(t+1)%n.length+n.length,t+n.length])]}),ao={wedge:jo([[-.5,0],[.5,0],[.5,1]]),axe:jo([[-.5,.12],[-.43,0],[0,.35],[0,.65],[-.43,1],[-.5,.88]]),axeRight:jo([[.5,.12],[.43,0],[0,.35],[0,.65],[.43,1],[.5,.88]]),pyramid:{vertices:[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[0,1,0]],faces:[[0,3,2,1],[0,1,4],[1,2,4],[2,3,4],[3,0,4]]}},Ma=Array.from({length:10},(n,e)=>[Math.cos(e*Math.PI/5)*.5,Math.sin(e*Math.PI/5)*.5]);ao.pillar={vertices:[0,1].flatMap(n=>Ma.map(([e,t])=>[e,n,t])),faces:[Ma.map((n,e)=>e).reverse(),Ma.map((n,e)=>e+10),...Ma.map((n,e)=>[e,(e+1)%10,(e+1)%10+10,e+10])]};function Z_(n,e,t,i){const s=ao[n];if(!s)return null;const r=s.vertices.map(([o,l,c])=>[o*e,(l-.5)*t,c*i]),a=r.reduce((o,l)=>o.map((c,f)=>c+l[f]/r.length),[0,0,0]);return s.faces.map(o=>{const l=r[o[0]],c=r[o[1]],f=r[o[2]],u=c.map((g,p)=>g-l[p]),h=f.map((g,p)=>g-l[p]);let d=[u[1]*h[2]-u[2]*h[1],u[2]*h[0]-u[0]*h[2],u[0]*h[1]-u[1]*h[0]];const m=Math.hypot(...d);d=d.map(g=>g/m);let _=d.reduce((g,p,M)=>g+p*l[M],0);return d.reduce((g,p,M)=>g+p*a[M],0)>_&&(d=d.map(g=>-g),_=-_),{x:d[0],y:d[1],s:d[2],d:_}})}function td(n){if(n.shape!=="arch")return[n];const e=n.width*.18,t=n.height*.64,i=n.angle||0,s=Math.cos(i),r=Math.sin(i),a=(o,l,c,f)=>({...n,shape:"pillar",x:n.x+s*o,s:n.s+r*o,bottom:(n.bottom||0)+l,width:c,height:f,depth:n.depth});return[a(-(n.width-e)/2,0,e,n.height),a((n.width-e)/2,0,e,n.height),{...a(0,t,n.width,n.height-t),shape:null}]}function nd(n,e=!1){const t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),r={},a={},o=n[0].morphTargetsRelative,l=new vt;let c=0;for(let f=0;f<n.length;++f){const u=n[f];let h=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const d in u.attributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(u.attributes[d]),h++}if(h!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const d in u.morphAttributes){if(!s.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+".  .morphAttributes must be consistent throughout all geometries."),null;a[d]===void 0&&(a[d]=[]),a[d].push(u.morphAttributes[d])}if(e){let d;if(t)d=u.index.count;else if(u.attributes.position!==void 0)d=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+f+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,f),c+=d}}if(t){let f=0;const u=[];for(let h=0;h<n.length;++h){const d=n[h].index;for(let m=0;m<d.count;++m)u.push(d.getX(m)+f);f+=n[h].attributes.position.count}l.setIndex(u)}for(const f in r){const u=Ff(r[f]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+f+" attribute."),null;l.setAttribute(f,u)}for(const f in a){const u=a[f][0].length;if(u!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[f]=[];for(let h=0;h<u;++h){const d=[];for(let _=0;_<a[f].length;++_)d.push(a[f][_][h]);const m=Ff(d);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+f+" morphAttribute."),null;l.morphAttributes[f].push(m)}}}return l}function Ff(n){let e,t,i,s=-1,r=0;for(let c=0;c<n.length;++c){const f=n[c];if(e===void 0&&(e=f.array.constructor),e!==f.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=f.itemSize),t!==f.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=f.normalized),i!==f.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=f.gpuType),s!==f.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=f.count*t}const a=new e(r),o=new Ht(a,t,i);let l=0;for(let c=0;c<n.length;++c){const f=n[c];if(f.isInterleavedBufferAttribute){const u=l/t;for(let h=0,d=f.count;h<d;h++)for(let m=0;m<t;m++){const _=f.getComponent(h,m);o.setComponent(h+u,m,_)}}else a.set(f.array,l);l+=f.count*t}return s!==void 0&&(o.gpuType=s),o}const id=.82,Of=2600,el=[[0,0],[1500,.06],[2500,.1],[5e3,.28],[1e4,.48],[18e3,.7],[32e3,.86],[5e4,1]];function J_(n){const e=Math.max(0,n);for(let t=1;t<el.length;t++){const[i,s]=el[t],[r,a]=el[t-1];if(e<=i)return a+(s-a)*(e-r)/(i-r)}return 1}function Yn(n){const e=J_(n),t=Math.max(0,Math.min(1,(n-12e3)/68e3)),i=Math.max(0,n)%2048/2048,s=i<.75?0:Math.sin((i-.75)*4*Math.PI)**2;return{strength:e,mastery:t,difficulty:e*8+t*4,respite:s,obstacleChance:(.22+.6*e)*(1-.5*s),obstacleHeight:10+23*e,enemyChance:(.26+.7*e)*(1-.7*s),attackInterval:1.55-.8*e-.18*t,warning:1.35-.35*e-.1*t,projectileSpeed:.85+.25*e+.18*t,bossSpacing:Math.round(3400-1400*e-400*t),stage:e<.06?"GENTLE SKIES":e<.2?"FINDING FLOW":e<.4?"RISING WINDS":e<.64?"WILD HORIZONS":e<.86?"RELENTLESS SKIES":"LEGENDARY FLIGHT"}}const Xi=(n,e,t)=>Math.max(e,Math.min(t,n)),Qi={stalker:{name:"Dune stalker",hp:5,radius:2.4,interval:2,warning:.7,speed:48},brute:{name:"Ogre",hp:8,radius:3.1,interval:2.3,warning:.8,speed:54},hexer:{name:"Hex spirit",hp:5,radius:2.4,interval:2,warning:.7,speed:48},bandit:{name:"Bandit",hp:2.5,radius:1.6,interval:2.4,warning:.65,speed:78,arrow:!0},guard:{name:"Tower guard",hp:4,radius:1.7,interval:1.9,warning:.75,speed:88,arrow:!0},dragon:{name:"Ember drake",hp:12,radius:4,interval:1.5,warning:.65,speed:64,mobile:!0},wizard:{name:"Rogue carpet mage",hp:7,radius:2.6,interval:1.35,warning:.6,speed:68,mobile:!0},fish:{name:"River fang",hp:2,radius:1.8,interval:1/0,warning:0,speed:0},giant:{name:"Stonewalker",hp:18,radius:6,interval:2,warning:1,speed:65}};function Q_(n,e,t,i,s,r){const a=Yn(t),o=["mountain","temple"].includes(n)&&e%8===4;if(t<640||e%2||!o&&s()>a.enemyChance)return[];const l={city:["bandit","guard","wizard"],palace:["guard","wizard","dragon"],desert:["bandit","dragon","stalker"],canyon:["dragon","bandit","brute"],river:["fish","fish","wizard","guard"],farm:["bandit","wizard","dragon"],ancient:["hexer","dragon","wizard","brute"]};Object.assign(l,{fishing:["fish","guard","bandit"],mountain:["giant","giant","dragon"],jungle:["brute","wizard","bandit"],beach:["fish","bandit","dragon"],island:["wizard","dragon","bandit"],temple:["giant","guard","wizard"]});const c=(l[n]||l.desert).filter(_=>!(_==="wizard"&&t<2500)&&!(_==="dragon"&&t<5e3)&&!(_==="guard"&&t<1200)),f=c.length?c:["bandit"],u=o?"giant":f[Math.floor(s()*f.length)],h=Qi[u],d=u==="bandit"?2+Math.floor(a.strength*3)+Math.floor(s()*2):u==="fish"?2+ +(a.strength>.3):u==="guard"?1+ +(a.strength>.3):1+ +(!!h.mobile&&a.strength>.65&&s()<.45),m=[];for(let _=0;_<d;_++){const g=_%2?1:-1,p=t+10+_*7;let M=(s()-.5)*70,x=9+s()*20;u==="bandit"&&(M=g*(35+s()*16),x=1.7),u==="guard"&&(M=g*59,x=18+s()*10),u==="fish"&&(M=Math.sin(p/180)*21+g*11,x=-.8),u==="giant"&&(M=g*(35+s()*12),x=8),u==="bandit"&&r.some(v=>Math.abs(M-v.x)<13&&Math.abs(p-v.s)<16)&&(M=g*57),m.push({kind:u,x:M,y:x,s:p,hp:h.hp+Math.min(2,Math.floor(i)),radius:h.radius,phase:s()*Math.PI*2,spawnDelay:.6*(1-a.strength)+_*.35})}return m}function j_(n,e,t){var a;const i=n.frozen?.25:n.stagger?.35:1;n.age=(n.age||0)+t*i,n.phase+=t*i,n.pushS=(n.pushS||0)*Math.exp(-t*2),n.pushY=(n.pushY||0)*Math.exp(-t*2);const s=n.s-e.distance;if(n.kind==="fish"){if(n.leap==null&&s<65&&s>5&&(n.leap=0,n.leapX=Xi(e.x+e.vx*.35,-48,48),n.leapY=Xi(e.altitude+5,10,35)),n.leap!=null){n.leap+=t*i;const o=Xi(n.leap/1.65,0,1);n.x=n.baseX+(n.leapX-n.baseX)*Math.min(1,o*1.6),n.y=-.8+4*n.leapY*o*(1-o),n.s=n.baseS-o*24,o>=1&&(n.active=!1,n.visual&&(n.visual.visible=!1))}return}if(n.kind==="giant"){n.x=n.baseX+Math.sin(n.age*.7)*8,n.y=8,n.s=n.baseS-Math.sin(n.age*.5)*15;return}if(n.kind==="guard"||n.kind==="bandit"){n.x=n.baseX,n.y=n.baseY,n.s=n.baseS;return}if((a=Qi[n.kind])!=null&&a.mobile){n.travel=(n.travel||0)+t*i*(n.kind==="dragon"?47+Math.sin(n.age*1.3)*19:55+Math.sin(n.age*2.7)*13),n.s=n.baseS+n.travel+n.pushS;const o=Math.abs(n.x-e.x)<6?Math.sin(n.phase)>0?16:-16:0,l=Xi(e.x+e.vx*.35+Math.sin(n.age*2.1+n.phase)*22+o,-48,48),c=Xi(e.altitude+7+Math.sin(n.age*2.8+n.phase)*12,6,47);n.x+=Xi(l-n.x,-25*t*i,25*t*i),n.y+=Xi(c-n.y,-14*t*i,14*t*i);return}const r=n.kind==="stalker"&&s<120?.48:0;n.x=n.baseX+(e.x-n.baseX)*r+Math.sin(n.phase)*4,n.y=n.baseY+(e.altitude-n.baseY)*r+Math.sin(n.phase*1.4)*1.6+n.pushY,n.s=n.baseS+n.pushS}const eM=8;function sd(n,e){n.focus=Math.min(100,(n.focus||0)+e)}function tM(n){return n.slow?(n.slow=!1,!0):n.focus<12?!1:(n.slow=!0,!0)}function nM(n){return n.spotCooldown>0||n.slow||n.focus<5?!1:(n.focus-=5,n.ambushTime=.5,n.spotCooldown=9,!0)}function iM(n,e){return n.spotCooldown=Math.max(0,(n.spotCooldown||0)-e),n.ambushTime=Math.max(0,(n.ambushTime||0)-e),n.slow&&(n.focus=Math.max(0,n.focus-e*100/eM),n.focus||(n.slow=!1)),n.slow?.28:n.ambushTime>0?.48:1}const Ue=680,gt=64,Li=gt*40,ya=54,Bf=54,tl=22,wn=[{name:"The Amber City",subtitle:"A thousand rooftops. Not a single road.",ground:"#dfa06c",sky:"#c3ded7",fog:"#c7d8c5",accent:"#309b98",type:"city"},{name:"The Gilded Gardens",subtitle:"Even the fountains have stories to tell.",ground:"#89a679",sky:"#c6dfdb",fog:"#bbd5bf",accent:"#dfba66",type:"palace"},{name:"The Saffron Sea",subtitle:"Follow the wind. Leave only wonder.",ground:"#e6b775",sky:"#d8dfc6",fog:"#e6c895",accent:"#cd7655",type:"desert"},{name:"The Singing Canyons",subtitle:"Stone remembers every passing storm.",ground:"#bb7963",sky:"#c9c2d3",fog:"#c7a593",accent:"#ce8b69",type:"canyon"},{name:"The River of Stars",subtitle:"A ribbon of blue between two eternities.",ground:"#629f99",sky:"#b0d6d6",fog:"#a2c7be",accent:"#54b8b6",type:"river"},{name:"The Emerald Fields",subtitle:"Where the earth dreams in green.",ground:"#9ca971",sky:"#caddca",fog:"#c9cba0",accent:"#67a282",type:"farm"},{name:"The Ancestors’ Reach",subtitle:"Old magic. New horizons.",ground:"#c49186",sky:"#b9b7d1",fog:"#c2a5b3",accent:"#aa89ba",type:"ancient"},{name:"The Lantern Fishing Village",subtitle:"Sails, salt and a thousand small wishes.",ground:"#cfb995",sky:"#afd9d6",fog:"#bad1c8",accent:"#eea76e",type:"fishing"},{name:"The Waking Peaks",subtitle:"The mountains have begun to walk.",ground:"#a99baf",sky:"#c5d7ea",fog:"#b7b9d0",accent:"#e6c2a0",type:"mountain"},{name:"The Jade Jungle",subtitle:"Every leaf hides another world.",ground:"#648e77",sky:"#c5dc9f",fog:"#9ab99e",accent:"#e7a969",type:"jungle"},{name:"The Opal Beach",subtitle:"Skim the tide. Chase the foam.",ground:"#efd4a8",sky:"#9fd8dd",fog:"#bde0d8",accent:"#edb99c",type:"beach"},{name:"The Smouldering Isle",subtitle:"Ash, blossom and sleeping fire.",ground:"#bd947a",sky:"#e1bcb9",fog:"#d4bfa7",accent:"#e4a34f",type:"island"},{name:"The Mountain Temples",subtitle:"Bell and banner at the edge of paradise.",ground:"#b6b2ba",sky:"#c0c5e1",fog:"#ccbacf",accent:"#dca357",type:"temple"}],In={fire:{name:"Fireball",glyph:"♨",color:"#ffac6d",description:"Fireball · explosive splash and lingering burns"},frost:{name:"Frost",glyph:"❄",color:"#9ce8ed",description:"Frost · slows enemies; fire shatters frozen foes"},storm:{name:"Storm",glyph:"ϟ",color:"#edda86",description:"Storm · lightning jumps between enemies"},echo:{name:"Echo",glyph:"✧",color:"#d4b6ff",description:"Echo · extra spell bolts"},magnet:{name:"Magnet",glyph:"∪",color:"#8ae0b4",description:"Magnet · 18 seconds of sweeping loot · stacks reach 28 / 40 / 52m"},ward:{name:"Ward",glyph:"◇",color:"#99ddff",description:"Ward · restores a heart and shields you briefly"},heart:{name:"Heart",glyph:"♥",color:"#ff7292",description:"Heart · restores one heart"},wind:{name:"Wind blast",glyph:"≋",color:"#a6ffdd",description:"Wind blast · shove monsters, clear hostile spells, fan flames"},rapid:{name:"Rapid fire",glyph:"»",color:"#ff9ce3",description:"Rapid Fire · faster casting for 10 seconds"},fury:{name:"Fury",glyph:"✹",color:"#ff7845",description:"Fury · stronger spells and wider blasts for 10 seconds"},focus:{name:"Focus",glyph:"⊕",color:"#c0ff9f",description:"Focus · tighter volleys and piercing fireballs for 12 seconds"},overdrive:{name:"Overdrive",glyph:"✷",color:"#e4b0ff",description:"Overdrive · extra projectiles and damage for 8 seconds"}},lt=(n,e,t)=>Math.min(t,Math.max(e,n)),Wt=(n,e,t)=>n+(e-n)*t;function Mn(n){let e=n>>>0;return()=>{e+=1831565813;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function Fr(n){return Math.floor(Math.max(0,n)/Li)%wn.length}function sM(n){return Yn(n).difficulty}function rM(n,e,t=0){return(e?102:40+36*Math.exp(-Math.max(0,n-1)/7))+t*3}function oo(n=42){return{seed:n,distance:0,time:0,x:0,altitude:3.5,vx:0,vy:0,speed:30,power:25,focus:65,slow:!1,ambushTime:0,spotCooldown:0,magnetTime:0,hp:3,score:0,chain:0,chainTimer:0,bestChain:1,invulnerable:2.5,boost:!1,roll:0,rollHeld:!1,rollCooldown:0,rollDirection:1,shotCooldown:0,weapon:"fire",buffs:{rapid:0,fury:0,focus:0,overdrive:0},bosses:0,spells:{fire:1,frost:0,storm:1,wind:1,echo:0,magnet:0},kills:0,nearMisses:0,tricks:0,ended:!1,events:[]}}function Ws(n){return Math.min(8,1+Math.floor(n.chain/3))}function hn(n,e,t=0,i=!0){i&&(n.chain++,n.chainTimer=5),n.score+=Math.round(e*Ws(n)),n.power=lt(n.power+t,0,100),sd(n,t*.45),n.bestChain=Math.max(n.bestChain,Ws(n))}function nl(n,e){In[e]&&(e==="heart"?(n.hp=Math.min(3,n.hp+1),n.invulnerable=Math.max(n.invulnerable,.8)):e==="magnet"?(n.spells.magnet=Math.min(3,n.spells.magnet+1),n.magnetTime=Math.min(32,(n.magnetTime||0)+18)):e==="ward"?(n.hp=Math.min(3,n.hp+1),n.invulnerable=Math.max(n.invulnerable,5)):e in n.buffs?n.buffs[e]=e==="focus"?12:e==="overdrive"?8:10:n.spells[e]>=3?n.buffs.overdrive=8:n.spells[e]=Math.min(3,(n.spells[e]||0)+1),hn(n,100,12))}function aM(n){return n.invulnerable>0||n.ended?!1:(n.hp--,n.invulnerable=2,n.chain=0,n.chainTimer=0,n.roll=0,n.power=Math.max(0,n.power-15),n.hp<=0&&(n.ended=!0),!0)}function lo(n){const e=Math.floor(Math.max(0,n)/gt),t=e%40;if(t<10||t>16)return null;const i=Math.floor(e/40)%2?-1:1;return{side:i,edge:i*56,height:48}}function rd(n,e,t){if(n.ended)return;t=lt(t,0,.05),n.time+=t,n.invulnerable=Math.max(0,n.invulnerable-t),n.rollCooldown=Math.max(0,n.rollCooldown-t),n.shotCooldown=Math.max(0,n.shotCooldown-t);const i=t*(e.controlRate||1);n.vx=Wt(n.vx,e.steer*(n.boost?56:48),1-Math.exp(-(e.steer?28:36)*i)),n.vy=Wt(n.vy,e.lift*(e.lift<0?29:25),1-Math.exp(-(e.lift?25:34)*i)),n.x=lt(n.x+n.vx*t,-ya,ya),n.altitude=lt(n.altitude+n.vy*t,1,Bf),(n.x<=-ya&&n.vx<0||n.x>=ya&&n.vx>0)&&(n.vx=0),(n.altitude<=1&&n.vy<0||n.altitude>=Bf&&n.vy>0)&&(n.vy=0),e.roll&&!n.rollHeld&&!n.roll&&!n.rollCooldown&&n.altitude>=4&&(n.roll=.85,n.rollCooldown=1.35,n.rollDirection=e.steer<0?-1:1),n.rollHeld=!!e.roll,n.roll>0&&(n.roll=Math.max(0,n.roll-t),n.roll===0&&n.altitude>=4&&(hn(n,90,11),n.tricks++,n.events.push("roll"))),n.boost=!!e.boost&&(n.boost?n.power>0:n.power>=25);const s=e.arena?null:lo(n.distance);n.railing=!!s&&Math.abs(n.x-s.edge)<6&&n.altitude>5&&n.altitude<s.height-2,n.railClock=n.railing?(n.railClock||0)+t:0,n.railClock>=1&&(n.railClock-=1,hn(n,45,5),n.events.push("rail"));const r=n.boost?-15:n.railing?8:n.altitude<3.5?4.5:.3;n.power=lt(n.power+r*t,0,100);const a=Math.max(0,-n.vy)*.35;n.speed=Wt(n.speed,rM(n.altitude,n.boost,e.difficulty??sM(n.distance))+a+(n.railing?18:0),1-Math.exp(-5*t)),n.distance+=n.speed*t,n.score+=n.speed*t*.2,n.chainTimer=Math.max(0,n.chainTimer-t),n.chainTimer||(n.chain=0)}function zf(n,e){if(n<2)return 0;const t=[0,1,2,1,0,-1,-2,-1],i=Mn(e)()<.5?-1:1;return t[Math.floor(n/2)%t.length]*i}function Is(n,e,t,i){const s=e.x-n.x,r=e.y-n.y,a=e.s-n.s,o=s*s+r*r+a*a,l=o?lt(((t.x-n.x)*s+(t.y-n.y)*r+(t.s-n.s)*a)/o,0,1):0;return Math.hypot(n.x+s*l-t.x,n.y+r*l-t.y,n.s+a*l-t.s)<=i}function oM(n,e){const t=Mn(e+n*104729),i=n*gt,s=Fr(i),r=Yn(i),a=r.difficulty,o=wn[s].type,l=[],c=[],f=[],u=[],h=zf(n,e),d=lo(i);if(n>3)for(let x=-2;x<=2;x++)x===h||d&&x===d.side*2||t()>r.obstacleChance||l.push({x:x*tl+(t()-.5)*3,s:i+42+(t()-.5)*8,width:8+t()*6,height:9+t()*(r.obstacleHeight+(o==="canyon"?4:0)),depth:8+t()*7,angle:(t()-.5)*1.4,type:o});const m=Mn(e+n*3571+801);for(const x of l)if(n>8&&m()<.78){const v=["pillar","pyramid","wedge","arch"];x.shape=v[Math.floor(m()*v.length)],x.shape==="arch"&&(x.width=18,x.height=Math.max(20,x.height),x.angle*=.3),x.bottom=-.8,x.height+=.8}const _=h*tl,g=zf(n-1,e)*tl;for(let x=0;x<8;x++){const v=lt((6+x*7)/23,0,1),E=v*v*(3-2*v);c.push({kind:"gold",x:Wt(g,_,E)+Math.sin(n+x*.7)*.9,s:i+6+x*7,y:2.3+(n%5===0?Math.sin(x/7*Math.PI)*9:0)})}if(n>2&&n%3===0){const x=["frost","storm","echo","fire","wind","magnet","ward","rapid","fury","focus"],v=x[Math.floor(t()*x.length)],E=5.5+t()*5,w=n%12===6;c.push({kind:w?"magnet":v,x:_,s:i+40,y:w?3:E})}if(n>3&&n%9===5&&c.push({kind:"heart",x:_,s:i+28,y:4}),f.push(...Q_(o,n,i,a,t,l)),Nr(i)){l.length=0,f.length=0,u.length=0;for(const x of c)x.x*=.45,x.y=Math.min(x.y,20)}n%4===2&&u.push({x:_,s:i+15,y:10+t()*13,radius:5.2});const p=ju(o,n,i,Mn(e+n*967+91)).filter(x=>(!Nr(i)||Math.abs(x.x)+x.radius<26&&x.y+x.radius<27)&&!l.some(v=>Math.abs(x.x-v.x)<13&&Math.abs(x.s-v.s)<15)&&(x.large?Math.abs(x.x-_)>10:Math.abs(x.x-_)>7));fi(i,600)&&(f.length=0),fi(i,192)&&(l.length=0);const M=_c(i);if(M){l.length=f.length=u.length=p.length=0;for(const x of c)x.x=Math.sin((i-M.start)/160)*12,x.y=16}return{index:n,start:i,zone:s,safeLane:h,obstacles:l,pickups:c,enemies:f,rings:u,props:p,gauntlet:M}}function ad(n){const e=Math.abs(Math.cos(n.angle||0)),t=Math.abs(Math.sin(n.angle||0));return{x:(e*n.width+t*n.depth)/2,s:(t*n.width+e*n.depth)/2}}function lM(n,e){const t=ad(e),i=n.distance-e.s-t.s,s=Math.abs(n.x-e.x);return i>.7&&i<4.5&&s<t.x+4&&n.altitude<e.height+3&&(s>t.x+.7||n.altitude>e.height+.6)}function od(n,e=0){const t=Mn(e+Math.floor(Math.max(0,n)/Li)*1879);return{hue:(t()-.5)*.075,saturation:(t()-.5)*.12,lightness:(t()-.5)*.08}}const il=new Map;function vr(n,e){let t=Math.imul(n+19,374761393)^Math.imul(e+71,668265263);return t=Math.imul(t^t>>>13,1274126177),((t^t>>>16)>>>0)/4294967295}function cM(n,e,t){const i=Math.floor(n),s=Math.floor(e),r=n-i,a=e-s,o=r*r*(3-2*r),l=a*a*(3-2*a),c=vr(i%t,s%t),f=vr((i+1)%t,s%t),u=vr(i%t,(s+1)%t),h=vr((i+1)%t,(s+1)%t);return Di.lerp(Di.lerp(c,f,o),Di.lerp(u,h,o),l)}function hM(n="plaster"){if(il.has(n))return il.get(n);const e=256,t=new Uint8Array(e*e*4);for(let s=0;s<e;s++)for(let r=0;r<e;r++){const a=r/e,o=s/e,l=cM(a*8,o*8,8),c=vr(r,s);let f=.94+.045*l+.015*c;if(n==="sand"){const d=Math.sin(o*Math.PI*32+Math.sin(a*Math.PI*2)*1.6);f=.93+.045*l+.025*c-.065*Math.pow(Math.max(0,d),10)}else if(n==="cloth"){const d=r%4<2!=s%4<2?.018:-.018,m=Math.min(a,1-a,o,1-o),_=Math.abs(a-.5)*1.5+Math.abs(o-.5),g=m>.055&&m<.075||_>.28&&_<.3;f=.88+.06*l+d+(g?.12:0)}else c>.985&&(f-=.065);const u=(s*e+r)*4,h=Math.round(Di.clamp(f,0,1)*255);t[u]=t[u+1]=t[u+2]=h,t[u+3]=255}const i=new Nc(t,e,e,En);return i.name=`${n} pigment`,i.wrapS=i.wrapT=Ba,i.magFilter=Vt,i.minFilter=Ci,i.generateMipmaps=!0,i.anisotropy=4,n==="sand"&&i.repeat.set(2,8),i.colorSpace=ii,i.needsUpdate=!0,il.set(n,i),i}const fM=`
  // Quantize combined illumination, so hemisphere fill and soft shadow maps
  // cannot wash away the bands. Pigment changes color, never the band boundary.
  vec3 illumination = (reflectedLight.directDiffuse + reflectedLight.indirectDiffuse)
    / max(diffuseColor.rgb, vec3(.0001));
  float energy = dot(illumination, vec3(.2126, .7152, .0722));
  float aa = clamp(fwidth(energy) * .5, .001, .012);
  float middle = smoothstep(.30 - aa, .30 + aa, energy);
  float lit = smoothstep(.58 - aa, .58 + aa, energy);
  float band = .28 + .34 * middle + .43 * lit;
  vec3 lightTint = mix(vec3(1.), clamp(illumination / max(energy, .001), .65, 1.4), .30);
  vec3 shadowTint = mix(vec3(.78, .82, 1.08), vec3(1.), middle);
  vec3 outgoingLight = diffuseColor.rgb * band * lightTint * shadowTint + totalEmissiveRadiance;
  // A narrow, stepped rim catches the edges of robes, domes and foliage.
  float rimAngle = 1. - abs(dot(normal, geometryViewDir));
  float rimAA = max(fwidth(rimAngle), .003);
  float rim = smoothstep(.76 - rimAA, .76 + rimAA, rimAngle) * step(.13, energy);
  outgoingLight += diffuseColor.rgb * lightTint * vec3(1.08, 1.02, .88) * rim * .14;
`;function Yc(n,{surface:e="plaster",side:t=ui}={}){const i=new Hm({color:n,map:e==="smooth"?null:hM(e),side:t});return i.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace("#include <gradientmap_pars_fragment>",`
      vec3 getGradientIrradiance(vec3 normal, vec3 lightDirection) {
        return vec3(max(dot(normal, lightDirection), 0.));
      }
    `).replace("vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;",fM)},i.customProgramCacheKey=()=>"pigment-cel-3-band-rim-v2",i}const $a="#080b18";function uM(){const n=new kr;for(let e=0;e<8;e++){const t=e*Math.PI/4,i=e%2?.24:1,s=Math.sin(t)*i,r=Math.cos(t)*i;e?n.lineTo(s,r):n.moveTo(s,r)}return n.closePath(),new io(n)}function kf(n,e,t,i,s,r){const a=new ct;a.position.set(e,t,i),a.lookAt(0,0,0),n.add(a);const o=new at(new Bs(s+2.4,64),new Lt({color:$a,fog:!1})),l=new at(new Bs(s,64),new Lt({color:r,fog:!1}));l.position.z=.4,a.add(o,l);for(const[c,f,u]of[[-.32,.3,.17],[.38,-.18,.23],[-.12,-.5,.1]]){const h=new at(new Bs(s*u,20),new Lt({color:"#c2bbcf",fog:!1}));h.position.set(c*s,f*s,.6),a.add(h);const d=new at(new Gc(s*u,s*u+.7,20),new Lt({color:$a,fog:!1}));d.position.copy(h.position),d.position.z=.65,a.add(d)}return a}function dM(n){const e=new ct;e.name="Distant sky",n.add(e);const t={top:{value:new Ae("#72aaa9")},bottom:{value:new Ae("#efe1b6")},night:{value:0},aura:{value:0},time:{value:0}},i=new sn({uniforms:t,side:nn,depthWrite:!1,vertexShader:"varying vec3 vPos; void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:`varying vec3 vPos; uniform vec3 top; uniform vec3 bottom; uniform float night; uniform float aura; uniform float time;
      void main(){vec3 p=normalize(vPos); float h=p.y;
        vec3 color=mix(bottom,top,smoothstep(-.12,.68,h));
        float ribbon=pow(max(0.,1.-abs(p.y-.24-p.x*.19)*5.),3.);
        color+=vec3(.09,.10,.20)*ribbon*night;
        if(aura>.001){
          float wave=.30+sin(p.x*5.+time*.06+p.z*2.)*.10;
          float curtain=pow(max(0.,1.-abs(p.y-wave)*7.),3.);
          float folds=.6+.4*sin(p.x*29.+p.z*11.+time*.10);
          vec3 silk=mix(vec3(.06,.25,.20),vec3(.24,.09,.29),.5+.5*sin(p.x*4.+time*.025));
          color+=silk*curtain*folds*aura;
        }
        gl_FragColor=vec4(color,1.);}`}),s=new at(new Ui(1e3,32,20),i);s.renderOrder=-100,e.add(s);const r=new at(new Ui(32,32,20),new Lt({color:"#ffe5ac",fog:!1}));r.position.set(280,270,-760),e.add(r);const a=new ct;e.add(a),kf(a,-210,185,-780,58,"#fff2c7"),kf(a,290,285,-750,32,"#e0eaff");const o=Mn(61),l=uM(),c=260,f=new os(l,new Lt({color:"#fff4d7",fog:!1}),c),u=new os(l,new Lt({color:$a,fog:!1}),c),h=new Rt;for(let _=0;_<c;_++){const g=o()*Math.PI*2,p=.07+o()*.8,M=Math.sqrt(1-p*p);h.position.set(Math.cos(g)*M*890,p*890,Math.sin(g)*M*890),h.lookAt(0,0,0);const x=2.2+Math.pow(o(),3)*6.5;h.scale.setScalar(x*1.4),h.updateMatrix(),u.setMatrixAt(_,h.matrix),h.position.multiplyScalar(.999),h.scale.setScalar(x),h.updateMatrix(),f.setMatrixAt(_,h.matrix)}e.add(u,f);const d=new ct,m=[];for(let _=0;_<15;_++){const g=new ct,p=_/15*Math.PI*2+.2,M=690+o()*60;g.position.set(Math.cos(p)*M,105+o()*145,Math.sin(p)*M),g.lookAt(0,g.position.y,0);const x=[];for(let y=0;y<7;y++){const T=new Ui(1,16,10);T.scale(25+o()*15,12+Math.sin(y/6*Math.PI)*20,16+o()*9),T.translate((y-3)*24,Math.sin(y/6*Math.PI)*8,o()*8),x.push(T)}const v=nd(x);x.forEach(y=>y.dispose());const E=new Vm({color:"#fff1d6",fog:!1});m.push(E);const w=new at(v,E),R=new at(v,new Lt({color:$a,side:nn,fog:!1}));R.scale.set(1.018,1.075,1.045),g.add(R,w),d.add(g)}return e.add(d),{root:e,uniforms:t,sun:r,moons:a,stars:f,starOutlines:u,clouds:d,cloudMaterials:m}}function pM(n,e,{camera:t,night:i,daylight:s,wind:r,enclosed:a,aura:o=0,time:l=0}){n.root.position.copy(t.position),n.root.visible=!0,n.uniforms.night.value=i,n.uniforms.aura.value=Di.lerp(n.uniforms.aura.value,o,1-Math.exp(-Math.max(0,e)*.65)),n.uniforms.time.value=l,n.sun.visible=i<.7,n.sun.position.y=90+s*235,n.moons.visible=i>.2,n.stars.visible=n.starOutlines.visible=i>.35,n.clouds.rotation.y+=e*r*.006;const c=new Ae("#fff1d6").lerp(new Ae("#747997"),i);for(const f of n.cloudMaterials)f.color.copy(c)}const sl=new Map,rl=new Map;function $n(n,e=!1,t="plaster"){const i=`${n}:${e}:${t}`;if(!sl.has(i)){const s=e?new Lt({color:n}):Yc(n,{surface:t});e&&s.color.multiplyScalar(3),sl.set(i,s)}return sl.get(i)}const Gt=new Fn(1,1,1);function qc(n){const{vertices:e,faces:t}=ao[n],i=[],s=e.reduce((o,l)=>o.map((c,f)=>c+l[f]/e.length),[0,0,0]);for(const o of t)for(let l=1;l<o.length-1;l++){const c=[o[0],o[l],o[l+1]].map(u=>new C(e[u][0],e[u][1]-.5,-e[u][2]));c[1].clone().sub(c[0]).cross(c[2].clone().sub(c[0])).dot(c[0].clone().sub(new C(s[0],s[1]-.5,-s[2])))<0&&([c[1],c[2]]=[c[2],c[1]]);for(const u of c)i.push(u.x,u.y,u.z)}const r=new vt;r.setAttribute("position",new je(i,3));const a=[];for(let o=0;o<i.length;o+=3)a.push(i[o]+.5,i[o+1]+.5);return r.setAttribute("uv",new je(a,2)),r.computeVertexNormals(),r}const mM=Object.fromEntries(Object.keys(ao).map(n=>[n,qc(n)])),gM=new Fn(1,1,1,4,1,16),al=new Fn(1,1,1,4,1,16),Xt=new Ks(1,1,1,10),rt=new to(1,1,8),Ze=new Ui(1,12,8),ld=new Ui(1,16,10,0,Math.PI*2,0,Math.PI/2),yt=new ps(1,0),Zt=new pi(1,.08,5,32),xM=new pi(.72,.22,8,24,Math.PI),Qs=new kr;Qs.moveTo(-.5,0);Qs.lineTo(-.5,.62);Qs.quadraticCurveTo(-.48,.84,0,1);Qs.quadraticCurveTo(.48,.84,.5,.62);Qs.lineTo(.5,0);const vM=new io(Qs,5);function D(n,e,t,i=[0,0,0],s=[1,1,1],r=[0,0,0],a=!1){const o=new at(n,$n(e,a));return o.position.set(...i),o.scale.set(...s),o.rotation.set(...r),o.castShadow=!a,o.receiveShadow=!a,t.add(o),o}function Ge(n,e,t,i,s,r,a,o,l=0){return D(Gt,e,n,[t,i,s],[r,a,o],[0,l,0])}function Gf(n,e=0,t=null){n.updateMatrixWorld(!0);const i=new Map;n.traverse(r=>{var a;if(r.isMesh){const o=(r.geometry.index?r.geometry.toNonIndexed():r.geometry.clone()).applyMatrix4(r.matrixWorld),l=o.attributes.position;for(let h=0;h<l.count;h++){const d=l.getZ(h),m=Ue+l.getY(h)+_n(e-d)-_n(e),_=d/Ue;l.setY(h,Math.cos(_)*m-Ue),l.setZ(h,Math.sin(_)*m)}o.computeVertexNormals();const c=new Float32Array(l.count*3),f=r.material.color.clone();t&&!r.material.isMeshBasicMaterial&&f.offsetHSL(t.hue,t.saturation,t.lightness);for(let h=0;h<l.count;h++)c[h*3]=f.r,c[h*3+1]=f.g,c[h*3+2]=f.b;o.setAttribute("color",new Ht(c,3));const u=`${r.material.type}:${((a=r.material.map)==null?void 0:a.uuid)||""}:${r.material.side}`;if(!rl.has(u)){const h=r.material.isMeshBasicMaterial?new Lt({color:"#ffffff",vertexColors:!0}):Yc("#ffffff");h.map=r.material.map,h.side=r.material.side,h.vertexColors=!0,rl.set(u,h)}i.has(u)||i.set(u,{mat:rl.get(u),geos:[]}),i.get(u).geos.push(o)}});const s=new ct;for(const{mat:r,geos:a}of i.values()){const o=nd(a,!1),l=new at(o,r);l.castShadow=l.receiveShadow=!0,s.add(l),a.forEach(c=>c.dispose())}return s}function li(n,e,t,i,s,r,a="#354e60",o=0){return D(vM,a,n,[e,t,i],[s,r,1],[0,o,0])}function si(n,e,t,i,s,r,a,o=!1){const l=-e*e/(2*Ue),c=new ct;n.add(c),c.position.set(e,l,t),c.rotation.y=(a()-.5)*Math.PI*2,c.scale.set(1.1,1.25,1.1);const f=["#f1bc86","#e6a375","#efd29f","#d99672","#f7d9a6"],u=f[Math.floor(a()*f.length)],h=a()>.35?"#398e91":"#d6935e",d=Math.hypot(i,r)*.55,m=1+(Math.abs(e)*d+d*d/2)/Ue;if(Ge(c,"#b88664",0,-m/2,0,i+.3,m+.2,r+.3),Ge(c,u,0,s/2,0,i,s,r),Ge(c,"#f8d8a3",0,s-.1,0,i+.45,.45,r+.45),Ge(c,"#c88966",0,.2,0,i+.3,.4,r+.3),o||a()>.5)D(Xt,"#efcd94",c,[0,s+.5,0],[i*.43,1,i*.43]),D(ld,h,c,[0,s+.9,0],[i*.53,i*.62,i*.53]),D(rt,"#eabd65",c,[0,s+i*.65+1,0],[.18,1.2,.18]),D(Ze,"#f8d787",c,[0,s+i*.65+1.5,0],[.18,.18,.18]);else{Ge(c,"#d38f6d",0,s+.13,0,i-.4,.12,r-.4);for(const g of[-1,1])Ge(c,"#f2c48f",g*(i/2-.16),s+.45,0,.3,.8,r);for(let g=0;g<4;g++)Ge(c,"#f2c48f",-i/2+g*i/3,s+.4,r/2,.5,.75,.45)}li(c,0,.05,r/2+.02,Math.min(2.5,i*.35),Math.min(s*.65,4),"#53616b");const _=Math.max(1,Math.floor(s/4));for(let g=0;g<_;g++)for(const p of[-1,1])li(c,p*i*.28,1.7+g*3.3,r/2+.025,i*.16,1.6),li(c,i/2+.025,1.7+g*3.3,p*r*.23,i*.16,1.6,"#456073",Math.PI/2);if(!o&&a()>.45){for(let g=0;g<4;g++)D(Gt,g%2?"#f3cd96":"#b95866",c,[-i*.32+g*i*.215,3,r/2+.8],[i*.22,.13,1.8],[.2,0,0]);for(const g of[-1,1])Ge(c,"#927155",g*i*.43,1.4,r/2+1.6,.09,2.8,.09)}return c}function cd(n,e,t,i,s){const r=new ct;r.position.set(e,-e*e/(2*Ue),t),n.add(r),D(Xt,"#efd1a0",r,[0,i*.45,0],[1.05,i*.9,1.05]);for(const a of[i*.15,i*.68,i*.87])D(Xt,"#f8ddae",r,[0,a,0],[1.55,.4,1.55]),D(Xt,"#bd8666",r,[0,a-.23,0],[1.23,.14,1.23]);D(ld,"#359694",r,[0,i,0],[1.65,2.5,1.65]),D(rt,"#f7cf70",r,[0,i+2.9,0],[.15,1.2,.15]);for(let a=0;a<4;a++){const o=a*Math.PI/2;li(r,Math.sin(o)*1.07,i*.7,Math.cos(o)*1.07,.65,1.4,"#315668",o)}}function Hn(n,e,t,i,s){const r=new ct;r.position.set(e,-e*e/(2*Ue),t),n.add(r),D(Xt,"#967158",r,[.3,i/2,0],[.23,i,.23],[0,0,-.07]);for(let a=0;a<6;a++){const o=a*Math.PI/3+s()*.3,l=D(Ze,a%2?"#477f69":"#669773",r,[Math.cos(o)*1.2+.5,i+.15,Math.sin(o)*1.2],[2.4,.17,.58],[0,-o,.18]);l.rotation.z=Math.cos(o)*.22}D(Ze,"#c4955e",r,[.4,i-.2,0],[.48,.45,.48])}function Hf(n,e,t,i,s){const r=-e*e/(2*Ue);D(Xt,"#765542",n,[e,r+i*.42,t],[.65,i*.84,.65],[0,0,.12]);for(const a of[-1,1]){D(Xt,"#765542",n,[e+a*i*.13,r+i*.7,t],[.32,i*.45,.32],[0,0,a*-.65]);for(let o=0;o<3;o++)D(Ze,["#3d7157","#639160","#87ab68"][o],n,[e+a*i*.19+(s()-.5)*2,r+i*(.82+o*.055),t+(s()-.5)*3],[i*(.42-o*.055),i*.13,i*(.32-o*.04)])}}function Ia(n,e,t,i,s,r,a){D(yt,r,n,[e,s*.35-e*e/(2*Ue),t],[i,s,i*.8],[0,a()*6.28,.1])}function dc(n,e,t,i){const s=-e*e/(2*Ue);for(const r of[-1,1])Ge(n,"#cda695",e+r*2,s+i/2,t,1,i,1.4),Ge(n,"#e7c2a0",e+r*2,s+i,t,1.5,.6,1.8);Ge(n,"#dfb59a",e,s+i+.5,t,5.4,.8,1.6),D(yt,"#92d2c8",n,[e,s+i-1.3,t],[.45,.75,.45],[0,.7,0],!0)}function hd(n,e,t,i=1){const s=-e*e/(2*Ue);D(Xt,"#e8caa0",n,[e,s+.4,t],[3.4*i,.7,3.4*i]),D(Xt,"#57b9b3",n,[e,s+.79,t],[3.05*i,.1,3.05*i]),D(Xt,"#e8caa0",n,[e,s+1.7,t],[.4,2,.4]),D(Xt,"#f4dbab",n,[e,s+2.5,t],[1.6*i,.25,1.6*i]),D(rt,"#a5e0d5",n,[e,s+3.3,t],[.7*i,1.3,.7*i])}function _M(n,e,t,i){const s=t*(120+i()*28),r=-18-i()*28,a=-s*s/(2*Ue);if(e==="city"||e==="palace"){si(n,s,r,34,34,29,i,!0);for(const o of[-25,25])si(n,s+o,r+3,15,23,18,i,!0),cd(n,s+o*1.2,r+10,56);for(let o=0;o<3;o++)Ge(n,"#efd1a0",s,a+.3+o*.45,r+16-o,28-o*2,.6,8);for(let o=-2;o<=2;o++)li(n,s+o*3.5,a+5,r+10.04,2,5,"#36787f")}else if(e==="canyon"){for(const o of[-17,17])Ia(n,s+o,r,12,48,"#ba7f68",i);D(Ze,"#c88e70",n,[s,a+41,r],[32,8,9])}else if(e==="ancient"){for(const o of[-16,16])dc(n,s+o,r,40);D(Zt,"#e9b992",n,[s,a+36,r],[14,14,14],[0,0,0]),D(yt,"#9bd8d0",n,[s,a+36,r],[4,7,4],[0,.5,.15],!0);for(let o=0;o<4;o++)Ge(n,"#d7af97",s,a+o*1.1,r,19-o*3,1.2,19-o*3)}else if(e==="desert"){for(let o=0;o<4;o++)D(rt,o%2?"#aa6274":"#e4be87",n,[s+(o-1.5)*8,a+4,r+Math.sin(o)*6],[6,8,6]);Hn(n,s-18,r,14,i),Hn(n,s+16,r+8,11,i),hd(n,s,r+15,2)}else if(e==="river"){si(n,s,r,16,16,15,i,!0);for(let o=0;o<5;o++)dc(n,t*(75+o*18),r+10,13)}else{const o=si(n,s,r,8,15,8,i);for(let l=0;l<4;l++){const c=l*Math.PI/2+.6;D(Gt,"#f5dcaa",o,[Math.cos(c)*4,12+Math.sin(c)*4,4.5],[7,.75,.15],[0,0,c])}for(const l of[-14,14])si(n,s+l,r,8,5,9,i)}}function MM(n,e,t=!1){var _,g;const i=Mn(e+n.index*7919),s=new ct,r=new ct,a=wn[n.zone].type,o=["fishing","beach","island"].includes(a),l=["mountain","temple"].includes(a);for(let p=-216;p<=216;p+=12){const M=D(al,wn[n.zone].ground,s,[p,-.65-p*p/(2*Ue),-gt/2],[12.2,1.1,gt+.2]);if(M.rotation.z=-p/Ue,M.material=$n(wn[n.zone].ground,!1,"sand"),(a==="city"||a==="palace")&&Math.abs(p)<60){const x=D(al,"#eac493",s,[p,-.045-p*p/(2*Ue),-gt/2],[12.1,.05,gt]);x.rotation.z=-p/Ue}}if(a==="river")for(let p=0;p<gt;p+=8){const M=Math.sin((n.start+p)/220)*23,x=Math.atan(Math.cos((n.start+p)/220)*23/220);Ge(s,"#52a6ad",M,.02-M*M/(2*Ue),-p-4,40+Math.sin((n.start+p)/130)*8,.08,9,x)}if(o)for(const p of[-1,1]){Ge(s,"#52b8be",p*153,-3,-32,184,.2,gt+.2);for(let x=0;x<4;x++)Ge(s,"#d8f5dd",p*(68+Math.sin((n.start+x*16)/110)*4),-1.2,-x*16,3,.15,11,.15);const M=p*(93+i()*20);if(Hn(s,p*73,-14,24+i()*10,i),a==="fishing")for(const x of[-12,-43]){const v=si(s,M,x,12,10,13,i);v.position.y+=5;for(const E of[-5,5])for(const w of[-5,5])Ge(v,"#786454",E,-3,w,.55,7,.55);Ge(s,"#b88a65",M,3,x+9,16,.55,5),D(rt,"#f5d9a2",s,[M-p*18,7,x],[5,14,.12],[0,p*.4,.2]),D(Ze,"#775c4a",s,[M-p*18,-1,x],[3.2,1.2,8])}else if(a==="island"){D(rt,"#645e77",s,[p*158,40,-32],[55,120,55]),D(Zt,"#f09557",s,[p*158,100,-32],[5,5,5],[Math.PI/2,0,0],!0);for(let x=0;x<4;x++){const v=M+(x-2)*8,E=-v*v/(2*Ue);Ge(s,"#95745f",v,E-1,-34,8,3,10,.2),Ge(s,["#ba655b","#c79849","#755171"][x%3],v,E+4,-34,7,9,9,.2),D(rt,"#eed5a8",s,[v,E+11,-34],[6,6,6])}}else for(let x=0;x<4;x++){const v=p*(77+x*22);Hn(s,v,-35+i()*20,18+i()*18,i),D(yt,"#efd3b3",s,[v,-1,-50],[6,2.5,5])}}if(l)for(const p of[-1,1]){for(let M=0;M<3;M++){const x=p*(105+M*42),v=95+i()*90,E=-10-i()*45;D(rt,M%2?"#8e8198":"#a399b0",s,[x,v*.3,E],[35,v,37],[0,i(),0]),D(rt,"#eee6d9",s,[x,v*.65,E],[10,v*.3,11],[0,0,0])}if(a==="temple"){const M=p*89,x=-M*M/(2*Ue);Ge(s,"#8f7c80",M,x-1.5,-30,36,5,33);for(let v=0;v<4;v++)Ge(s,v%2?"#b77369":"#eed8b4",M,x+3+v*8,-30,30-v*5,8,27-v*4),Ge(s,"#744c65",M,x+8+v*8,-30,35-v*5,1,32-v*4);D(rt,"#e4bd72",s,[M,x+42,-30],[5,18,5]);for(let v=0;v<9;v++)D(Gt,["#d59864","#76b4ac","#b95b77","#e4c98e"][v%4],s,[p*(64+v*5),23+Math.sin(v/8*Math.PI)*-3,-6],[3,3.5,.1],[0,.2,(i()-.5)*.3])}}if(a==="jungle")for(const p of[-1,1])for(let M=0;M<7;M++){const x=p*(83+i()*95),v=-i()*64;Hf(s,x,v,40+i()*24,i),Hn(s,x+p*13,v-8,30+i()*15,i),D(Xt,"#496746",s,[x,18,v],[.18,28,.18],[0,0,.12]),D(yt,"#e8aa77",s,[x,4,v+3],[2,3,2])}for(const p of[-1,1]){if(["city","palace","river","farm"].includes(a)){const M=a==="palace"||a==="river"||a==="farm";for(let x=0;x<(M?7:3);x++){const v=p*(78+i()*115),E=-i()*gt;x%3===0?Hf(s,v,E,23+i()*22,i):Hn(s,v,E,14+i()*17,i)}for(let x=0;x<12;x++){const v=p*(64+i()*95),E=-i()*gt,w=-v*v/(2*Ue);D(Ze,x%2?"#527e59":"#7a9c64",s,[v,w+1,E],[2+i()*3,1.5+i()*2,3])}}if(a==="city"||a==="palace"){const M=4+Math.floor(i()*7);for(let x=0;x<M;x++){const v=p*(76+i()*108),E=-i()*gt;a==="palace"&&x%3===0?(hd(s,v,E,1.7),Hn(s,v+p*10,E,10+i()*7,i)):si(s,v,E,10+i()*14,10+i()*27,10+i()*13,i,a==="palace")}i()>.35&&cd(s,p*(95+i()*60),-i()*gt,34+i()*30);for(let x=0;x<4;x++)Hn(s,p*(62+i()*30),-i()*gt,8+i()*7,i);if(a==="palace")for(let x=0;x<4;x++)Ge(s,"#567f65",p*(64+i()*16),-1,-i()*gt,5,4,10,i())}else if(a==="desert"){for(let M=0;M<5;M++){const x=p*(94+i()*100);D(Ze,M%2?"#e9ba7a":"#dbab70",s,[x,-9-x*x/(2*Ue),-i()*gt],[22+i()*20,16+i()*14,28],[0,i()*3,0])}n.index%3===0&&(Hn(s,p*73,-22,13,i),D(rt,"#b45c69",s,[p*82,-1,-35],[7,8,7]))}else if(a==="canyon")for(let M=0;M<7;M++){const x=p*(80+i()*100),v=22+i()*64;Ia(s,x,-i()*gt,9+i()*16,v,M%2?"#b97867":"#ce9274",i)}else if(a==="river"){for(let M=0;M<7;M++)Hn(s,p*(67+i()*95),-i()*gt,9+i()*10,i);n.index%2===0&&si(s,p*103,-i()*gt,15,18,17,i),n.index%3===0&&(Ge(s,"#7e7666",p*66,-1.4,-28,12,.7,7,.3),D(rt,"#fbdeb0",s,[p*66,4,-28],[3,9,.08],[0,.3,.12]))}else if(a==="farm"){for(let M=0;M<5;M++){const x=p*(80+M*22);Ge(s,M%2?"#c9b76c":"#718e5a",x,-.1-x*x/(2*Ue),-32,18,.15,55,(i()-.5)*.45);for(let v=0;v<5;v++)D(rt,"#7a985b",s,[x+i()*7,.7-x*x/(2*Ue),-v*13],[3,4,3])}n.index%2===0&&si(s,p*85,-i()*gt,12,11,14,i)}else if(a==="ancient"){for(let M=0;M<4;M++)dc(s,p*(75+M*29+i()*13),-i()*gt,13+i()*29);for(let M=0;M<4;M++)Ia(s,p*(90+i()*95),-i()*gt,7+i()*10,14+i()*18,"#ad8b89",i)}}const c=n.disableRails?null:lo(n.start);if(c)for(let p=0;p<4;p++){const M=-8-p*16,x=c.side*68,v=-3136/(2*Ue);Ge(s,p%2?"#a96857":"#b87960",x,v+23,M,24,46,16.2);for(const E of[7,20,34])Ge(s,"#deb285",c.side*56.15,v+E,M,.25,.35,16.2);D(yt,"#9cf5dc",s,[c.side*55.7,v+12,M],[.18,.4,.7],[0,0,0],!0),Ia(s,c.side*(77+i()*12),M,12,52+i()*20,"#ba8168",i)}for(const p of n.enemies||[])if(p.kind==="guard"){const M=-(p.s-n.start),x=-p.x*p.x/(2*Ue),v=p.y-1.7;Ge(s,"#b99072",p.x,x+v/2,M,6,v,6),Ge(s,"#b99072",p.x,x-.5,M,6,1.4,6),Ge(s,"#efd3a0",p.x,x+v,M,7,.7,7);for(const E of[-1,1])Ge(s,"#c39e7c",p.x+E*2.6,x+v+.7,M,1,1.4,6);li(s,p.x,x+v*.65,M+3.04,1.4,3)}for(const p of n.obstacles)for(const M of td(p)){const x=new ct;x.position.set(M.x,-M.x*M.x/(2*Ue),-(M.s-n.start)),x.rotation.y=M.angle||0,r.add(x);const v=Math.hypot(M.width,M.depth)/2,E=.5+(Math.abs(M.x)*v+v*v/2)/Ue;if(x.position.y+=M.bottom||0,M.shape){D(mM[M.shape],M.shape==="pillar"?"#e3ba88":M.shape==="wedge"?"#b58a74":"#a797b3",x,[0,M.height/2,0],[M.width,M.height,M.depth]);continue}if(M.bottom>0||Ge(x,"#b28a6a",0,-E/2,0,M.width,E+.15,M.depth),a==="city"||a==="palace"||a==="farm"){Ge(x,i()>.5?"#e8b380":"#edc89b",0,M.height/2,0,M.width,M.height,M.depth),Ge(x,"#f6d9a6",0,M.height-.18,0,M.width+.2,.35,M.depth+.2),li(x,0,.05,M.depth/2+.02,2.8,Math.min(5.5,M.height*.7));for(const w of[-1,1])for(let R=4;R<M.height-2;R+=4.5)li(x,w*M.width*.3,R,M.depth/2+.025,1.2,2),li(x,w*(M.width/2+.025),R,0,1.4,2,"#354e60",w*Math.PI/2)}else a==="ancient"?(Ge(x,"#bf998c",0,M.height/2,0,M.width,M.height,M.depth),Ge(x,"#e8c5a8",0,M.height-.2,0,M.width+.4,.4,M.depth+.4)):(Ge(x,a==="canyon"?"#b97d68":"#c79876",0,M.height/2,0,M.width,M.height,M.depth),Ge(x,"#d6aa84",0,M.height-.3,0,M.width+.1,.6,M.depth+.1))}if(((_=n.gauntlet)==null?void 0:_.type)==="volcano")for(const p of[-1,1])D(al,"#45323f",s,[p*23,1.5,-32],[10,3,64.1]);if(!n.disablePassages&&Nr(n.start)){for(const p of Qu(n.start))D(gM,p.color,p.hazard?r:s,[p.x,p.bottom+p.height/2,-(p.s-n.start)],[p.width,p.height,p.depth],[0,p.angle,0]);for(const p of[-1,1]){for(let M=0;M<6;M++){const x=-5-M*10;D(yt,M%2?"#9d7970":"#896772",r,[p*30.8,20+i()*9,x],[2.2,8+i()*4,6],[0,i(),.15*p]),D(rt,"#876971",r,[p*(18+i()*8),33,x],[2.4,5,3],[Math.PI,0,0]),D(Ze,"#795c61",s,[p*(40+i()*40),77,x],[22,8+i()*8,16])}D(yt,"#74f2da",r,[p*27.7,9,-16],[.5,1.7,.5],[0,0,.2],!0),D(yt,"#ffd29a",r,[p*27.7,17,-48],[.5,1.7,.5],[0,0,-.2],!0)}}n.index%6===3&&!o&&!l&&a!=="jungle"&&_M(s,a,Math.floor(n.index/6)%2?-1:1,i);for(const p of[-1,1]){const M=p*(59+i()*3),x=-i()*gt;Ge(s,"#8f7967",M,2-M*M/(2*Ue),x,.18,4,.18),D(yt,"#ffe0a1",s,[M,4.3-M*M/(2*Ue),x],[.5,.9,.5],[0,.4,0],!0)}const u=od(n.disablePassages?n.zone*Li:n.start,e),h=new ct,d=Gf(s,n.start,u),m=Gf(r,n.start,u);return m.traverse(p=>{if(p.isMesh){const M=p.material;p.material=M.clone(),p.material.onBeforeCompile=M.onBeforeCompile,p.material.customProgramCacheKey=M.customProgramCacheKey,p.material.transparent=!0,p.material.userData.chunkOwned=!0}}),m.visible=!t,h.add(d,m),((g=n.gauntlet)==null?void 0:g.type)==="volcano"&&d.add(K_(n.start,Ue)),h.userData.scenery=d,h.userData.hazards=m,h}function yM(n,e,t,i,s){const r=(t-s)/Ue,a=Ue+i-e*e/(2*Ue);n.position.set(e,Math.cos(r)*a-Ue,-Math.sin(r)*a),n.rotation.x=-r}function Tt(n,e,t,i,s){yM(n,e,t,i+_n(t),s)}function fd(){const n=new ct,e=new ct;n.add(e);const t=new Zs(3.7,5.3,12,18);t.rotateX(-Math.PI/2);const i=new at(t,Yc("#9d3e69",{surface:"cloth",side:Sn}));i.castShadow=!0,i.receiveShadow=!0,e.add(i);const s=new ct;e.add(s);for(const u of[-1,1]){Ge(s,"#edbd71",u*1.69,.06,0,.14,.07,4.75),Ge(s,"#e9b777",0,.06,u*2.31,3.45,.07,.14);for(let h=0;h<9;h++)Ge(s,"#efc87d",-1.6+h*.4,.015,u*2.78,.045,.05,.48)}const r=D(Gt,"#e8b979",e,[0,.07,.2],[1.65,.04,1.65],[0,Math.PI/4,0]);D(Gt,"#317f8d",e,[0,.1,.2],[1.15,.04,1.15],[0,Math.PI/4,0]);for(const u of[-1.5,1.6])D(yt,"#f2c67e",e,[0,.13,u],[.24,.03,.4]);e.scale.setScalar(.83);const a=new ct;a.position.y=.13,a.rotation.y=-Math.PI/2,e.add(a);for(const u of[-1,1])D(Ze,"#343e66",a,[u*.62,.58,.03],[.25,.57,.27],[0,0,u*-.36]),D(Ze,"#55416c",a,[u*.45,1.01,.1],[.3,.38,.3],[0,0,u*.55]),D(Ze,"#e4bd79",a,[u*.79,.16,-.12],[.28,.16,.43]);D(rt,"#386b82",a,[0,1.37,.06],[.58,.94,.49]),D(Ze,"#459e9d",a,[0,1.73,.05],[.52,.53,.39]),Ge(a,"#f1bc70",0,1.17,-.02,.93,.18,.78),D(Ze,"#bd845c",a,[0,2.2,-.1],[.34,.4,.33]),D(Ze,"#dc9f73",a,[0,2.21,-.42],[.13,.13,.17]);for(const u of[-1,1])D(Ze,"#202637",a,[u*.15,2.28,-.395],[.065,.035,.035]),D(Ze,"#397b8f",a,[u*.65,1.68,-.06],[.39,.17,.22],[0,0,u*-.27]),D(Ze,"#d49a6d",a,[u*.96,1.56,-.12],[.15,.15,.15]);D(Ze,"#39334f",a,[0,2.48,.02],[.43,.27,.4]),D(rt,"#534178",a,[-.06,2.93,.08],[.48,.95,.45],[0,0,-.27]),D(rt,"#73528a",a,[.14,3.27,.08],[.24,.5,.23],[0,0,-.95]),D(Zt,"#dbb568",a,[0,2.54,.02],[.44,.44,.44],[Math.PI/2,0,0]),D(yt,"#b4ffee",a,[0,2.65,-.38],[.12,.2,.1],[0,0,0],!0);const o=Ge(a,"#dca665",.13,1.9,.48,.28,.08,.8),l=[];for(let u=0;u<12;u++){const h=u<4,d=u/12*Math.PI*2,m=h?new C(.4,2.02,(u-1.5)*.11):new C(Math.cos(d)*.34,2.39,Math.sin(d)*.35),_=[];for(let p=0;p<6;p++)_.push(D(Xt,h?"#8f6a58":u%3?"#353049":"#56405c",e));const g=D(yt,u%2?"#d9a75f":"#77d5cb",e,[0,0,0],[.075,.12,.075]);l.push({beard:h,anchor:m,segments:_,bead:g,phase:u*1.9})}const c=new at(new Bs(2.5,24),new Lt({color:"#4e545a",transparent:!0,opacity:.16,depthWrite:!1}));c.rotation.x=-Math.PI/2;const f={root:n,body:e,fabric:i,trim:s,scarf:o,pattern:r,shadow:c,rider:a,strands:l,hairFlow:0};return ud(f,{speed:30,power:25,vx:0},0,1),f}const bM=new C(0,1,0),ba=new C,hr=new C,ol=new C;function ud(n,e,t,i){const s=Math.min(1,Math.max(0,(e.speed-35)/100)*.65+e.power/100*.35+(e.boost?.25:0));n.hairFlow+=(s-n.hairFlow)*(1-Math.exp(-i*5));const r=n.hairFlow;n.rider.rotation.z=Math.sin(t*2)*.035-(e.vx||0)*.002,n.scarf.rotation.x=-.15-r*.5+Math.sin(t*7)*.1;for(const a of n.strands){const o=(a.beard?.9:1.3)+r*(a.beard?2.3:4.1);ba.copy(a.anchor);for(let l=0;l<a.segments.length;l++){const c=(l+1)/a.segments.length;hr.set(a.anchor.x+Math.sin(t*7-c*5+a.phase)*c*(.06+r*.16),a.anchor.y-c*o*(1-r*.77),a.anchor.z+c*o*(.18+r*.95));const f=a.segments[l];ol.subVectors(hr,ba),f.position.copy(ba).add(hr).multiplyScalar(.5),f.quaternion.setFromUnitVectors(bM,ol.clone().normalize());const u=(a.beard?.075:.095)*(1-c*.65);f.scale.set(u,ol.length()+.035,u),ba.copy(hr)}a.bead.position.copy(hr)}}const ll=new Map;function pc(n){var t;const e=new ct;if(n==="gold")D(yt,"#ffd88e",e,[0,0,0],[.34,.6,.34],[0,0,.3],!0),D(Zt,"#eeb564",e,[0,0,0],[.55,.55,.55]);else if(n==="magnet"){D(xM,"#8ae0b4",e,[0,-.05,0],[1,1,1],[0,0,Math.PI],!0);for(const i of[-1,1])D(Gt,"#8ae0b4",e,[i*.72,.23,0],[.44,.6,.44],[0,0,0],!0),D(Gt,"#fff2d0",e,[i*.72,.63,0],[.47,.22,.47],[0,0,0],!0);D(Zt,"#fff2d0",e,[0,0,0],[1.55,1.55,1.55],[.25,.3,0],!0)}else if(n==="heart"||n==="ward"){const i=n==="heart"?"#ff527b":"#8ddfff",s=new kr;s.moveTo(0,-1.2),s.bezierCurveTo(-2,.2,-1.3,1.7,0,.65),s.bezierCurveTo(1.3,1.7,2,.2,0,-1.2);const r=new zc(s,{depth:.35,bevelEnabled:!0,bevelSize:.12,bevelThickness:.12,bevelSegments:1,steps:1,curveSegments:8});ll.has(n)?r.dispose():ll.set(n,r),D(ll.get(n),i,e,[0,.15,0],[1,1,1],[0,0,0],!0),n==="ward"&&D(Zt,"#ffffff",e,[0,0,0],[1.65,1.65,1.65],[0,0,0],!0)}else{const i=((t=In[n])==null?void 0:t.color)||"#fff3c7";if(n==="fury"){D(Ze,i,e,[0,0,0],[.7,.7,.7],[0,0,0],!0);for(let s=0;s<8;s++){const r=s*Math.PI/4;D(yt,i,e,[Math.cos(r)*1.1,Math.sin(r)*1.1,0],[.2,.55,.2],[0,0,r-Math.PI/2],!0)}}else if(n==="fire")for(let s=0;s<3;s++)D(rt,s===1?"#fff2ae":i,e,[(s-1)*.45,s===1?.3:0,0],[.5,s===1?2.5:1.5,.45],[0,0,(s-1)*-.2],!0);else if(n==="storm")for(const[s,r,a]of[[.25,.75,-.5],[0,0,1],[-.25,-.75,-.5]])D(Gt,i,e,[s,r,0],[.36,1.3,.3],[0,0,a],!0);else if(n==="wind")for(let s=0;s<3;s++)D(Zt,i,e,[0,(s-1)*.65,0],[1.2-s*.25,.4,.65],[.7,0,0],!0);else if(n==="frost")for(let s=0;s<3;s++)D(Gt,i,e,[0,0,0],[.24,2.6,.24],[0,0,s*Math.PI/3],!0);else if(n==="echo")for(const s of[-1,1])D(Zt,i,e,[s*.6,0,0],[.7,1.1,.7],[0,0,s*.4],!0);else if(n==="rapid"||n==="overdrive"){for(let s=0;s<3;s++)D(rt,i,e,[(s-1)*.8,.1,0],[.25,1.8,.25],[0,0,0],!0),D(Gt,"#fff5db",e,[(s-1)*.8,-.8,0],[.4,.25,.4],[0,0,0],!0);n==="overdrive"&&D(Zt,i,e,[0,0,0],[1.7,1.7,1.7],[0,0,0],!0)}else{D(Zt,i,e,[0,0,0],[1.2,1.2,1.2],[0,0,0],!0);for(const s of[0,Math.PI/2])D(Gt,"#ffffff",e,[0,0,0],[.15,2.8,.15],[0,0,s],!0)}}return n!=="gold"&&(D(Zt,"#fff0cf",e,[0,0,-.3],[2,2,2],[0,0,0],!0),e.scale.setScalar(1.3)),e}function SM(n,e=!1){const t=new ct;if(n==="urn")D(Ze,"#b45772",t,[0,-.4,0],[1.7,1.7,1.7]),D(Xt,"#e6bd82",t,[0,1.15,0],[.85,.8,.85]);else if(n==="timber")for(let i=0;i<3;i++)D(Xt,"#745440",t,[i-1,-.7+i%2,0],[.7,4.5,.7],[Math.PI/2,0,i*.15]),D(Ze,"#dfb576",t,[i-1,-.7+i%2,2.2],[.65,.65,.06]);else if(n==="rock"||n==="seal")D(yt,n==="seal"?"#77749a":"#bf805e",t,[0,0,0],[2.3,2.5,2]),D(Zt,"#ffdca0",t,[0,0,1.8],[1,1,1],[0,0,.4],!0);else{Ge(t,n==="hay"?"#cda850":"#8b5b40",0,-.1,0,3.9,3.8,3.8);for(const i of[-1,1])Ge(t,"#e2b279",i*1.4,-.1,1.98,.2,3.8,.08),Ge(t,"#e2b279",0,i*1.4,1.98,3.9,.2,.08);Ge(t,"#f6d096",0,0,2,4.7,.18,.1,Math.PI/4)}if(e){for(const i of[-1,1]){D(Zt,"#ffdaa0",t,[0,0,i*2.15],[1.25,1.25,1.25],[0,0,0],!0);for(const s of[0,Math.PI/2])D(Gt,"#fff6d0",t,[0,0,i*2.18],[.1,1.3,.1],[0,0,s],!0)}D(Zt,"#f2b978",t,[0,-1.5,0],[2.3,2.3,2.3],[Math.PI/2,0,0],!0)}return t}function EM(n,e){const t=[];if(["bandit","guard","wizard"].includes(e)){const i=e==="wizard"?"#713a9c":e==="guard"?"#318287":"#a53f38";D(rt,i,n,[0,-.2,0],[.8,1.7,.7]),D(Ze,"#c69470",n,[0,.95,.1],[.48,.5,.43]),D(Ze,e==="guard"?"#c5ac79":"#233247",n,[0,1.3,.05],[.62,.35,.5]),D(Gt,"#232535",n,[0,.82,.48],[.88,.22,.07]);for(const s of[-1,1])D(Ze,"#ffe9a6",n,[s*.2,1.06,.48],[.07,.055,.06],[0,0,0],!0),D(Xt,i,n,[s*.75,.3,.1],[.18,1.1,.18],[0,0,s*.7]),D(Gt,"#233044",n,[s*.27,-1.1,.1],[.27,.7,.35]);if(e==="wizard"){D(Gt,"#2d2447",n,[0,-1.45,0],[3.9,.18,3.1]),D(Gt,"#daa96e",n,[0,-1.33,0],[3.5,.07,2.7]),D(Gt,"#8a3e91",n,[0,-1.27,0],[2.9,.06,2.1]),D(yt,"#afeeff",n,[-1,1.1,.3],[.3,.5,.3],[0,0,0],!0),D(Xt,"#4b334f",n,[1.1,.35,0],[.09,3.2,.09]),D(yt,"#e99cff",n,[1.1,2.05,0],[.36,.6,.36],[0,0,0],!0);for(const s of[-1,1])for(let r=0;r<4;r++)D(rt,"#f4c17d",n,[s*2.1,-1.45,r*.65-1],[.13,.7,.1],[0,0,s*Math.PI/2])}else D(Zt,"#e0bd7a",n,[1.02,.1,.55],[.55,1.15,.7],[0,.6,0]),D(Xt,"#673f32",n,[.8,.05,.6],[.055,2.3,.055],[Math.PI/2,0,0]),D(yt,"#ffb365",n,[.8,.05,1.75],[.15,.15,.3],[0,0,0],!0)}else if(e==="dragon"){D(Ze,"#884131",n,[0,0,-.4],[1.2,.8,2.7]),D(Ze,"#bd7650",n,[0,.6,1.85],[.75,.65,1.05]),D(rt,"#673748",n,[0,-.1,-3.8],[.7,3.5,.7],[-Math.PI/2,0,0]);for(let i=0;i<6;i++)D(rt,"#efd1a0",n,[0,1,1-i*.65],[.22,.75,.25]);for(const i of[-1,1]){const s=new ct;s.position.set(i*.8,.35,-.4),n.add(s),t.push({object:s,side:i}),D(rt,"#cb7957",s,[i*2.2,0,-.4],[2.1,4.8,.12],[Math.PI/2,0,i*-.6]),D(Xt,"#553144",s,[i*2,.1,0],[.12,4.5,.12],[0,0,i*Math.PI/2]),D(Ze,"#ffe6a1",n,[i*.53,.82,2.43],[.19,.14,.15],[0,0,0],!0),D(rt,"#eee1b7",n,[i*.48,1.45,1.45],[.19,1.15,.19],[0,0,i*-.4]);for(let r=0;r<3;r++)D(rt,"#f8ddb0",n,[i*.43,.14,2.1+r*.3],[.11,.38,.11],[Math.PI,0,0])}}else if(e==="scarab"){D(Ze,"#287d76",n,[0,0,0],[1.9,.85,2.4]),D(Gt,"#d7b16b",n,[0,.8,0],[.13,.12,4.1]),D(Ze,"#273549",n,[0,-.05,2.1],[1.1,.65,.7]);for(const i of[-1,1]){D(Ze,"#ff9c43",n,[i*.55,.3,2.6],[.23,.12,.12],[0,0,0],!0),D(rt,"#dfc582",n,[i*.75,-.1,3],[.23,1.4,.19],[Math.PI/2,0,i*.4]);for(let s=0;s<3;s++)D(rt,"#2e3445",n,[i*2,-.5,1-s*1.1],[.3,2.6,.3],[0,0,i*1.15])}}else{const i=e==="fish",s=i?"#38a9b6":"#b5925d";for(let r=0;r<(i?1:7);r++)D(Ze,s,n,[Math.sin(r*.7)*.5,Math.sin(r*.9)*.35,-r*.75],[Math.max(.25,1-r*.1),.65,1.35]);D(rt,i?"#ffba78":"#78647c",n,[0,.7,-.3],[.85,1.2,.12],[0,0,-.3]);for(const r of[-1,1])D(rt,s,n,[r*1.2,-.1,-.1],[.5,2,.13],[0,0,r*1.1]),D(Ze,"#ffef91",n,[r*.57,.3,.8],[.2,.16,.15],[0,0,0],!0),D(rt,"#fff2cc",n,[r*.35,-.1,1.25],[.14,.6,.14],[Math.PI,0,0])}n.userData.limbs=t}function dd(n="stalker"){const e=new ct,t=["bandit","guard","wizard","dragon","fish","scarab","serpent"].includes(n);if(n==="giant"){D(Ze,"#8a877b",e,[0,0,0],[1.2,1.5,.8]),D(Ze,"#aaa191",e,[0,1.55,.1],[.65,.7,.6]),D(yt,"#655d60",e,[0,1.15,.65],[.5,.65,.25]);for(const l of[-1,1])D(Ze,"#ffddb1",e,[l*.25,1.7,.65],[.12,.07,.08],[0,0,0],!0),D(Ze,"#777b71",e,[l*.65,-1.7,0],[.4,1.2,.5]),D(Ze,"#aaa08a",e,[l*.7,-2.6,.35],[.6,.3,.8]),D(Ze,"#8a877b",e,[l*1.45,.1,0],[.55,1.3,.55],[0,0,l*.22]);D(yt,"#b4a593",e,[1.8,-.6,.65],[.85,.7,.85]),Ge(e,"#684e52",0,-.7,0,2.3,.6,1.7)}else if(t)EM(e,n);else{const l=n==="hexer"?"#373050":n==="brute"?"#652c35":"#282b3d",c=n==="hexer"?"#b48bff":"#ff4c24";D(Ze,l,e,[0,0,0],[1.05,1.3,.75]),D(rt,"#211f32",e,[0,-1.3,0],[.9,2,.6],[Math.PI,0,.22]),D(yt,"#d0b690",e,[0,.95,.3],[.74,.7,.54]),D(Ze,"#1a1423",e,[0,.62,.76],[.4,.28,.12]);for(let f=-2;f<=2;f++)D(rt,"#fff1c6",e,[f*.13,.73,.85],[.065,.26,.055],[Math.PI,0,0]);for(const f of[-1,1]){D(Ze,c,e,[f*.29,1.04,.74],[.22,.1,.1],[0,0,f*-.35],!0),D(rt,"#211c2c",e,[f*.6,1.75,0],[.28,1.6,.26],[0,0,f*-.5]),D(Ze,l,e,[f*1.45,.15,.15],[.8,.3,.4],[0,0,f*-.4]);for(let u=0;u<3;u++)D(rt,"#d7bd94",e,[f*(1.85+u*.12),-.38,.25+u*.24],[.12,.95,.12],[Math.PI,0,f*.3]);(n==="stalker"||n==="boss")&&D(rt,l,e,[f*2,.4,-.35],[1.5,2.5,.12],[0,0,f*-.95]);for(let u=0;u<3;u++)D(Gt,"#9b735f",e,[f*.42,.2-u*.3,.71],[.68,.1,.12],[0,0,f*.18])}D(yt,c,e,[0,-.15,.83],[.23,.4,.17],[0,0,0],!0)}const i=Ge(e,"#413b59",0,2.05,0,1.9,.13,.1),s=Ge(e,"#f2bf83",0,2.05,.065,1.8,.09,.03),r=D(Zt,"#ffb2cd",e,[0,.2,.7],[1.5,1.5,1.5],[0,0,0],!0);r.visible=!1;const a=D(Zt,"#b8f2f2",e,[0,.1,0],[1.55,1.55,1.55],[.5,0,0],!0);a.visible=!1;const o=new ct;e.add(o),o.visible=!1;for(let l=0;l<3;l++)D(rt,l===1?"#ffe29a":"#ff6324",o,[Math.sin(l*2.1)*.8,-.3,Math.cos(l*2.1)*.8],[.3,1.7,.3],[0,0,.2],!0);return e.userData={...e.userData,health:s,healthBack:i,charge:r,frost:a,burn:o,baseScale:n==="giant"?3:n==="boss"?4.4:n==="brute"?1.65:t?1:1.25},e.scale.setScalar(e.userData.baseScale),e}function wM(n){const e=new ct;D(Zt,"#f4cc80",e,[0,0,0],[n,n,n],[0,0,0],!0);for(let t=0;t<8;t++){const i=t*Math.PI/4;D(yt,"#fff0c0",e,[Math.cos(i)*n,Math.sin(i)*n,0],[.2,.35,.2],[0,0,i-Math.PI/2],!0)}return e}function pd(n){n.traverse(e=>{e.isMesh&&(e.geometry.dispose(),e.material.userData.chunkOwned&&e.material.dispose())})}const Xn={x:1.5,s:2.1,top:2.5,bottom:.2},TM=.003,Er=["x","y","s"],Ka=n=>({x:n.x,y:n.altitude-n.x*n.x/(2*Ue),s:n.distance}),Za=(n,e)=>n.x*e.x+n.y*e.y+n.s*e.s;function md(n){const e=n.disablePassages?[]:Qu(n.start).filter(t=>!t.hazard||!n.combatClear);if(!n.combatClear){e.push(...n.obstacles.flatMap(td));for(const t of n.props||[])t.active&&e.push({x:t.x,s:t.s,bottom:t.y-t.radius,width:t.radius*2,depth:t.radius*2,height:t.radius*2})}return e}function $c(n,e,t){if(t.shape)return AM(n,e,t);const i=t.angle||0,s=Math.cos(i),r=Math.sin(i),a=x=>({x:s*(x.x-t.x)+r*(x.s-t.s),y:x.y,s:-r*(x.x-t.x)+s*(x.s-t.s)}),o=a(n),l=a(e),c={x:l.x-o.x,y:l.y-o.y,s:l.s-o.s},f=t.width/2+Math.abs(s)*Xn.x+Math.abs(r)*Xn.s,u=t.depth/2+Math.abs(r)*Xn.x+Math.abs(s)*Xn.s,h=(t.bottom||0)-(t.flatBase?0:t.x*t.x/(2*Ue)),d={x:-f,y:h-Xn.top,s:-u},m={x:f,y:h+t.height+Xn.bottom,s:u},_=(x,v)=>x==="x"?{x:s*v,y:0,s:r*v}:x==="s"?{x:-r*v,y:0,s:s*v}:{x:0,y:v,s:0};if(Er.every(x=>o[x]>d[x]&&o[x]<m[x])){let x=1/0,v;for(const E of Er)for(const w of[-1,1]){const R=w<0?o[E]-d[E]:m[E]-o[E];R<x&&(x=R,v=_(E,w))}return{t:0,normal:v,depth:x}}let g=-1/0,p=1/0,M;for(const x of Er){if(Math.abs(c[x])<1e-10){if(o[x]<=d[x]||o[x]>=m[x])return null;continue}const v=(d[x]-o[x])/c[x],E=(m[x]-o[x])/c[x],w=Math.min(v,E),R=Math.max(v,E);if(w>g&&(g=w,M=_(x,c[x]>0?-1:1)),p=Math.min(p,R),g>p)return null}return g<-1e-9||g>1||p<0||!M?null:{t:Math.max(0,g),normal:M,depth:0}}const Sa=new Map;function AM(n,e,t){const i=[t.shape,t.width,t.height,t.depth].join(":");let s=Sa.get(i);if(!s){if(s=Z_(t.shape,t.width,t.height,t.depth),!s)return $c(n,e,{...t,shape:null});Sa.size>256&&Sa.clear(),Sa.set(i,s)}const r=Math.cos(t.angle||0),a=Math.sin(t.angle||0),o=Math.cos(t.roll||0),l=Math.sin(t.roll||0),c={x:t.x,y:(t.bottom||0)+t.height/2-(t.flatBase?0:t.x*t.x/(2*Ue)),s:t.s};let f=-1/0,u=1/0,h,d=!0,m=1/0,_;for(const g of s){const p=o*g.x-l*g.y,M=l*g.x+o*g.y,x={x:r*p-a*g.s,y:M,s:a*p+r*g.s},v=g.d+Math.abs(x.x)*Xn.x+Math.abs(x.s)*Xn.s+Math.abs(x.y)*(x.y>0?Xn.bottom:Xn.top),E=Za(x,{x:n.x-c.x,y:n.y-c.y,s:n.s-c.s})-v,w=Za(x,{x:e.x-c.x,y:e.y-c.y,s:e.s-c.s})-v,R=w-E;if(E>=0&&(d=!1),-E<m&&(m=-E,_=x),Math.abs(R)<1e-10){if(E>=0)return null;continue}const y=-E/R;if(R<0?y>f&&(f=y,h=x):u=Math.min(u,y),f>u)return null}return d?{t:0,normal:_,depth:m}:f<-1e-9||f>1||u<0||!h?null:{t:Math.max(0,f),normal:h,depth:0}}function gd(n,e,t){const i=Ka(n),s=Ka(e);return t.some(r=>!!$c(i,s,r))}function RM(n,e,t){let i=Ka(e),s=Ka(n),r=!1;const a={x:n.vx,y:n.vy-n.x*n.vx/Ue,s:n.speed};for(let o=0;o<8;o++){let l=null;for(const _ of t){const g=$c(i,s,_);g&&(!l||g.t<l.t)&&(l=g)}if(!l){i=s;break}r=!0;const c=l.normal,f={},u=s.y+s.x*s.x/(2*Ue),h=a.y+s.x*a.x/Ue;for(const _ of Er){const g=s[_]-i[_];i[_]+=g*l.t+c[_]*(l.depth+TM),f[_]=g*(1-l.t)}const d=Math.min(0,Za(f,c)),m=Math.min(0,Za(a,c));for(const _ of Er)s[_]=i[_]+f[_]-c[_]*d,a[_]-=c[_]*m;c.y||(s.y=u-s.x*s.x/(2*Ue),a.y=h-s.x*a.x/Ue)}return r&&(n.score=Math.max(0,n.score-Math.max(0,n.distance-i.s)*.2),n.x=i.x,n.distance=i.s,n.altitude=i.y+i.x*i.x/(2*Ue),n.vx=a.x,n.vy=a.y+i.x*a.x/Ue,n.speed=Math.max(0,a.s)),r}const fr=new Fn(1,1,1),cl=new Ks(1,1,1,8),CM=qc("axe"),PM=qc("axeRight"),LM=new kc(1,1),ur=new pi(1,.1,5,24);class IM{constructor(e,t={}){this.scene=e,this.hooks=t,this.rows=new Map,this.trap=null,this.warned=-1,this.completed=-1,this.solids=[],this.dangers=[]}clear(){for(const e of this.rows.values())this.scene.remove(e.root);this.rows.clear(),this.trap=null,this.warned=this.completed=-1,this.solids=[],this.dangers=[]}build(e,t){const i=new ct;i.name=`${t} gauntlet ${e.id}`,this.scene.add(i);const s={...e,type:t,root:i,trigger:null};if(t==="axes"){const r=new ct;i.add(r),s.rig=r,D(cl,"#596979",r,[0,-12,0],[.38,24,.38]),D(CM,"#abc5d1",r,[0,-24,0],[16,14,2.5]),D(PM,"#abc5d1",r,[0,-24,0],[16,14,2.5]),D(cl,"#ddb684",r,[0,-24,0],[.75,6,.75]),D(fr,"#51475d",i,[0,1,0],[54,2,4]),D(ur,"#ffb567",i,[0,0,2],[1.3,1.3,1],[0,0,0],!0),s.trace=D(ur,"#dc7469",i,[0,-22,0],[7,5,1],[0,0,0],!0)}else if(t==="gates"){s.blocks=Array.from({length:4},()=>D(fr,"#817288",i)),s.frame=new ct,i.add(s.frame);for(const r of[-1,1])D(fr,"#b4ffe0",s.frame,[r*10,0,2],[.3,19,.4],[0,0,0],!0),D(fr,"#b4ffe0",s.frame,[0,r*9.5,2],[20,.3,.4],[0,0,0],!0);D(fr,"#493c56",i,[0,33,0],[58,3,5]);for(const r of[-25,25])D(ur,"#d7ac76",i,[r,16,2],[2,2,1],[0,0,0],!0)}else s.vents=[-18,0,18].map(r=>D(ur,"#ff8636",i,[r,2.5,0],[4,4,4],[Math.PI/2,0,0],!0)),s.plume=D(cl,"#ff7138",i,[0,1,0],[1,1,1],[0,0,0],!0),s.balls=Array.from({length:3},()=>D(LM,"#ffb457",i,[0,-10,0],[2.7,2.7,2.7],[0,0,0],!0)),s.warning=D(ur,"#fff29c",i,[0,1,0],[4,4,4],[Math.PI/2,0,0],!0);return s}update(e,t=!0,i=!0){var r,a,o,l,c,f,u;this.solids=[],this.dangers=[],ed.uniforms.time.value=e.time;const s=t?fi(e.distance,360):null;if(this.trap&&e.distance>=this.trap.end&&this.completed!==this.trap.id&&i&&(this.completed=this.trap.id,(a=(r=this.hooks).complete)==null||a.call(r,this.trap)),!s||((o=this.trap)==null?void 0:o.id)!==s.id){for(const h of this.rows.values())this.scene.remove(h.root);this.rows.clear()}if(this.trap=s,!!s){this.warned!==s.id&&i&&(this.warned=s.id,(c=(l=this.hooks).warn)==null||c.call(l,iu[s.type],s.type));for(const h of Fd(s)){const d=h.s-e.distance;if(d<-80||d>420){const _=this.rows.get(h.id);_&&(this.scene.remove(_.root),this.rows.delete(h.id));continue}let m=this.rows.get(h.id);if(m||(m=this.build(h,s.type),this.rows.set(h.id,m)),s.type==="axes"){const _=Od(h,e.time);Tt(m.root,0,h.s,_.pivot,e.distance),m.rig.rotation.z=_.angle,m.trace.position.set(_.x,_.y-_.pivot,0),m.trace.scale.set(7+Math.sin(e.time*8)*.3,5,1);for(const g of["axe","axeRight"])this.solids.push({shape:g,x:_.x,s:h.s,bottom:_.y-7,width:16,height:14,depth:2.5,roll:_.angle,flatBase:!0})}else if(s.type==="gates"){Tt(m.root,0,h.s,0,e.distance);const _=Bd(h,e.time),g=su(h,e.time);_.forEach((p,M)=>{m.blocks[M].position.set(p.x,p.bottom+p.height/2,0),m.blocks[M].scale.set(p.width,p.height,p.depth)}),m.frame.position.set(g.x,g.y,0),this.solids.push(..._)}else{Tt(m.root,0,h.s,0,e.distance),m.trigger===null&&i&&d<Math.max(145,e.speed*1.7)&&d>0&&(m.trigger=e.time,m.target=[-18,0,18].reduce((M,x)=>Math.abs(M-e.x)<Math.abs(x-e.x)?M:x),(u=(f=this.hooks).erupt)==null||u.call(f));const _=m.trigger===null?-1:e.time-m.trigger,g=_>=0&&_<1.05,p=_>=1.05&&_<3.1;if(m.warning.visible=g,m.warning.position.set(m.target||0,2.8,0),m.warning.scale.setScalar(4+(g?_:0)*3),m.plume.visible=p,p){const M=27*Math.min(1,(_-1.05)/.25,(3.1-_)/.4);m.plume.position.set(m.target,M/2,0),m.plume.scale.set(3.5,M,3.5),M>.1&&this.dangers.push({shape:"pillar",x:m.target,s:h.s,bottom:0,width:7,height:M,depth:7,flatBase:!0})}m.balls.forEach((M,x)=>{const v=_-1.05-x*.13,E=2+38*v-16*v*v;if(M.visible=v>=0&&v<2.5&&E>0,M.visible){const w=m.target+(x-1)*5*v,R=-22*v;Tt(M,w,h.s+R,E,e.distance),m.root.updateMatrixWorld(!0),m.root.worldToLocal(M.position),M.rotation.set(0,0,0),this.dangers.push({shape:"pillar",x:w,s:h.s+R,bottom:E-2.4,width:4.8,height:4.8,depth:4.8})}})}}s.type==="volcano"&&e.distance>=s.start&&this.dangers.push({x:0,s:(s.start+s.end)/2,bottom:-1,width:34,height:3,depth:s.end-s.start,flatBase:!0})}}hits(e,t){return gd(e,t,this.dangers)}}const Vf={city:["fire3","sky4"],palace:["sea2","sky4"],desert:["fire7","earth7"],canyon:["earth7","fire7"],river:["sea2","sea4"],farm:["earth5","sea2"],ancient:["earth7","sky4"],fishing:["sea4","sea2"],mountain:["sky5","earth7"],jungle:["earth5","sea2"],beach:["sea2","sea4"],island:["sea4","fire3"],temple:["earth7","sky4"]};function Wf({zone:n="city",altitude:e=3,speed:t=30,night:i=0,rain:s=!1,sand:r=!1,wind:a=0,boost:o=!1,running:l=!1}={}){const c=lt(1-e/38,.18,1),[f,u]=Vf[n]||Vf.city;return[{role:"air",asset:s?"sky5":r?"fire7":"sky2",gain:.72+e/160+lt(a,0,1)*.22+(o?.08:0),cutoff:lt(3600+t*45+e*40+a*1100,3600,8500),width:.5+lt(a,0,1)*.35},{role:"land",asset:f,gain:(.65*c+.1)*(l?1:.85),cutoff:2400+c*3900,width:.28},{role:"dream",asset:i>.6&&!["palace","ancient"].includes(n)?"sky4":u,gain:.28+i*.12+(o?.04:0),cutoff:3200+i*700,width:.65}]}class DM{constructor(e,t,{baseUrl:i,fetcher:s=a=>globalThis.fetch(a),seed:r=571}={}){this.ctx=e,this.output=t,this.baseUrl=i,this.fetcher=s,this.rng=Mn(r),this.buffers=new Map,this.pending=new Map,this.failed=new Map,this.voices=new Set,this.layers=new Map,this.enabled=!0,this.clock=0,this.profile=Wf();for(const a of this.profile)this.layers.set(a.role,{...a,next:0})}async load(e){if(this.buffers.has(e))return this.buffers.get(e);if(this.pending.has(e))return this.pending.get(e);if((this.failed.get(e)||0)>this.ctx.currentTime)return null;const t=(async()=>{try{const i=await this.fetcher(new URL(`${e}.mp3`,this.baseUrl).href);if(!i.ok)throw new Error("Ambient sample unavailable");const s=await this.ctx.decodeAudioData(await i.arrayBuffer());if(s.duration<2)throw new Error("Ambient sample too short");this.buffers.set(e,s),this.failed.delete(e);const r=new Set(this.profile.map(a=>a.asset));for(const a of this.buffers.keys()){if(this.buffers.size<=6)break;r.has(a)||this.buffers.delete(a)}return s}catch{return this.failed.set(e,this.ctx.currentTime+30),null}finally{this.pending.delete(e)}})();return this.pending.set(e,t),t}setEnabled(e){if(this.enabled=e,!e)this.stop();else for(const t of this.layers.values())t.next=0,t.started=!1}stop(){const e=this.ctx.currentTime;for(const t of[...this.voices]){t.envelope.gain.cancelScheduledValues(e),t.envelope.gain.setTargetAtTime(0,e,.04);try{t.source.stop(e+.18)}catch{t.cleanup()}}}spawn(e,t){if(!this.enabled||this.voices.size>=12)return;const i=this.ctx,s=i.currentTime,r=.94+this.rng()*.11,a=Math.min(9+this.rng()*4,t.duration/r-.1),o=i.createBufferSource(),l=i.createGain(),c=i.createBiquadFilter(),f=i.createStereoPanner(),u=i.createGain();o.buffer=t,o.playbackRate.value=r;const h=Math.max(0,t.duration-a*r-.05),d=this.rng()*h;c.type="lowpass",c.frequency.value=e.cutoff,c.Q.value=.4,f.pan.value=(this.rng()-.5)*e.width,f.pan.linearRampToValueAtTime((this.rng()-.5)*e.width,s+a),u.gain.value=e.gain;const m=Math.min(3.2,a*.3),_=e.started?m:.35;e.started=!0,l.gain.setValueAtTime(0,s),l.gain.linearRampToValueAtTime(.9,s+_),l.gain.setValueAtTime(.9,s+a-m),l.gain.linearRampToValueAtTime(0,s+a),o.connect(l).connect(c).connect(f).connect(u).connect(this.output);const g={source:o,envelope:l,filter:c,panner:f,level:u,role:e.role,asset:e.asset,cleanup:()=>{this.voices.delete(g),o.disconnect(),l.disconnect(),c.disconnect(),f.disconnect(),u.disconnect()}};o.onended=g.cleanup,this.voices.add(g),o.start(s,d),o.stop(s+a+.02),e.next=s+a-m}update(e,t){if(!this.enabled||(this.clock-=e,this.clock>0))return;this.clock=.25,this.profile=Wf(t);const i=this.ctx.currentTime;for(const s of this.profile){const r=this.layers.get(s.role);r.asset!==s.asset&&(r.next=0),Object.assign(r,s);for(const a of this.voices)a.role===r.role&&(a.level.gain.setTargetAtTime(a.asset===r.asset?r.gain:0,i,1.8),a.filter.frequency.setTargetAtTime(r.cutoff,i,2));if(i>=r.next){const a=this.buffers.get(r.asset);a?this.spawn(r,a):this.load(r.asset)}}}}const UM=["shoot","hit","death","fall","land","munch","jump","portal","collect-chime","milestone","victory","festival","grand-festival"],NM={fire:{asset:"shoot",gain:.85,rate:.88,gap:.08},storm:{asset:"shoot",gain:.8,rate:1.5,gap:.1},wind:{asset:"fall",gain:1.15,rate:1.25,gap:.22,length:.8},fireImpact:{asset:"land",gain:1.2,rate:.78,gap:.1},stormImpact:{asset:"hit",gain:1.05,rate:1.3,gap:.12},windImpact:{asset:"land",gain:.95,rate:1.4,gap:.15},collect:{asset:"collect-chime",gain:.58,rate:1,tuned:!0,length:.23,gap:.11},milestone:{asset:"milestone",gain:.85,rate:1,tuned:!0,music:1,length:2,gap:1.5},victory:{asset:"victory",gain:.95,rate:1,tuned:!0,music:2,length:2.8,gap:2},festival:{asset:"festival",gain:.9,rate:1,tuned:!0,music:3,length:4.5,gap:4},grandFestival:{asset:"grand-festival",gain:1,rate:1,tuned:!0,music:4,length:6.8,gap:6},trick:{asset:"jump",gain:1,rate:1.15,gap:.35},hit:{asset:"hit",gain:1.25,rate:.86,gap:.18},kill:{asset:"munch",gain:1.3,rate:.85,gap:.12},death:{asset:"death",gain:1.1,rate:.9,gap:1},roar:{asset:"death",gain:.85,rate:.62,gap:1.5},thunder:{asset:"fall",gain:1.1,rate:.6,gap:2}};class FM{constructor(e,t,{baseUrl:i,fetcher:s=a=>globalThis.fetch(a),onMusicChange:r=()=>{}}={}){Object.assign(this,{ctx:e,output:t,baseUrl:i,fetcher:s,onMusicChange:r}),this.buffers=new Map,this.pending=new Map,this.failed=new Map,this.lastCue=new Map,this.voices=new Set,this.enabled=!0,this.epoch=0}async load(e){if(this.buffers.has(e))return this.buffers.get(e);if(this.pending.has(e))return this.pending.get(e);if((this.failed.get(e)||0)>this.ctx.currentTime)return null;const t=(async()=>{try{const i=await this.fetcher(new URL(`${e}.mp3`,this.baseUrl).href);if(!i.ok)throw new Error("Effect unavailable");const s=await this.ctx.decodeAudioData(await i.arrayBuffer());return this.buffers.set(e,s),this.failed.delete(e),s}catch{return this.failed.set(e,this.ctx.currentTime+30),null}finally{this.pending.delete(e)}})();return this.pending.set(e,t),t}preload(){return Promise.all(UM.map(e=>this.load(e)))}setEnabled(e){this.enabled=e,e||this.stop()}stop(){this.epoch++;for(const e of[...this.voices]){try{e.source.stop()}catch{}e.cleanup()}this.lastCue.clear()}async play(e){const t=NM[e];if(!t||!this.enabled)return;const i=this.ctx.currentTime;if(i-(this.lastCue.get(e)??-1/0)<t.gap)return;this.lastCue.set(e,i);const s=this.epoch,r=this.buffers.get(t.asset)||await this.load(t.asset);if(!r||!this.enabled||s!==this.epoch||this.ctx.currentTime-i>.2)return;if(t.music){const m=[...this.voices].filter(_=>_.music);if(m.some(_=>_.music>=t.music))return;for(const _ of m)_.source.stop(),_.cleanup()}if(this.voices.size>=16){const m=[...this.voices].find(_=>!_.music);if(!m)return;m.source.stop(),m.cleanup()}const a=this.ctx.createBufferSource(),o=this.ctx.createGain(),l=this.ctx.createStereoPanner();a.buffer=r;const c=t.rate*(t.tuned?1:.97+Math.random()*.06);a.playbackRate.value=c;const f=this.ctx.currentTime,u=Math.min(t.length||4,r.duration/c);o.gain.setValueAtTime(0,f),o.gain.linearRampToValueAtTime(t.gain,f+.004),o.gain.setValueAtTime(t.gain,f+Math.max(.005,u-.03)),o.gain.linearRampToValueAtTime(0,f+u),l.pan.value=t.music?0:(Math.random()-.5)*.16,a.connect(o).connect(l).connect(this.output);let h=!1;const d={source:a,music:t.music||0,cleanup:()=>{h||(h=!0,this.voices.delete(d),a.disconnect(),o.disconnect(),l.disconnect(),t.music&&this.onMusicChange())}};this.voices.add(d),a.onended=d.cleanup,a.start(f),a.stop(f+u+.01),t.music&&this.onMusicChange()}}class OM{constructor({contextFactory:e,baseUrl:t,fetcher:i,storage:s}={}){var r,a;this.enabled=!1,this.ctx=null,this.paused=!1,this.keepAmbience=!1,this.ambient=null,this.effects=null,this.epoch=0,this.error=!1,this.contextFactory=e||(()=>new(window.AudioContext||window.webkitAudioContext)),this.baseUrl=t,this.fetcher=i,this.environment={},this.muted=!1,this.ambienceVolume=.85,this.effectsVolume=.8;try{this.storage=s||globalThis.localStorage,this.muted=((r=this.storage)==null?void 0:r.getItem("mcw-muted"))==="true";for(const o of["ambienceVolume","effectsVolume"]){const l=(a=this.storage)==null?void 0:a.getItem("mcw-"+o);l!=null&&Number.isFinite(Number(l))&&(this[o]=Math.max(0,Math.min(1,Number(l))))}}catch{}}save(e,t){var i;try{(i=this.storage)==null||i.setItem("mcw-"+e,String(t))}catch{}}async start(){var i,s;if(this.muted)return!1;const e=++this.epoch,t=this.enabled;try{if(!this.ctx){this.ctx=this.contextFactory(),this.master=this.ctx.createGain(),this.master.gain.value=0,this.ambienceBus=this.ctx.createGain(),this.effectBus=this.ctx.createGain();const a=this.ctx.createDynamicsCompressor();a.threshold.value=-3,a.knee.value=3,a.ratio.value=8,a.attack.value=.003,a.release.value=.18,this.ambienceBus.connect(this.master),this.effectBus.connect(this.master),this.master.connect(a),a.connect(this.ctx.destination);const o=this.baseUrl||new URL("./audio/",document.baseURI).href;this.ambient=new DM(this.ctx,this.ambienceBus,{baseUrl:new URL("slumbr/",o).href,fetcher:this.fetcher}),this.effects=new FM(this.ctx,this.effectBus,{baseUrl:new URL("effects/",o).href,fetcher:this.fetcher,onMusicChange:()=>this.applyMix()})}const r=this.ctx.resume();return this.enabled=!0,this.error=!1,t||(this.ambient.failed.clear(),this.effects.failed.clear(),this.ambient.setEnabled(!0)),this.effects.setEnabled(!this.paused),this.applyMix(),this.ambient.update(1,this.environment),this.effects.preload(),await r,e!==this.epoch||this.muted?!1:(this.master.gain.setTargetAtTime(.9,this.ctx.currentTime,.06),!0)}catch{return e===this.epoch&&(this.enabled=!1,this.error=!0,(i=this.ambient)==null||i.setEnabled(!1),(s=this.effects)==null||s.setEnabled(!1)),!1}}async toggle(){var e,t;return this.muted=this.enabled,this.save("muted",this.muted),this.muted?(this.epoch++,this.enabled=!1,this.ctx&&this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.025),(e=this.ambient)==null||e.setEnabled(!1),(t=this.effects)==null||t.setEnabled(!1),!1):this.start()}applyMix(){var t;if(!this.ctx)return;const e=[...((t=this.effects)==null?void 0:t.voices)||[]].some(i=>i.music);this.ambienceBus.gain.setTargetAtTime(this.paused&&!this.keepAmbience?0:this.ambienceVolume*(e?.65:1),this.ctx.currentTime,.1),this.effectBus.gain.setTargetAtTime(this.paused?0:this.effectsVolume,this.ctx.currentTime,.04)}setVolume(e,t){if(!["ambience","effects"].includes(e)||!Number.isFinite(t))return;const i=e+"Volume";this[i]=Math.max(0,Math.min(1,t)),this.save(i,this[i]),this.applyMix()}setPaused(e){var t;this.paused=e,this.applyMix(),(t=this.effects)==null||t.setEnabled(this.enabled&&!e)}play(e){var t;this.enabled&&!this.paused&&((t=this.effects)==null||t.play(e))}spell(e="fire"){this.play(e)}impact(e="fire"){this.play(e+"Impact")}collect(){this.play("collect")}milestone(e){this.play(["","milestone","festival","grandFestival"][e])}victory(){this.play("victory")}clearEffects(){var e;(e=this.effects)==null||e.stop()}trick(){this.play("trick")}hit(){this.play("hit")}kill(){this.play("kill")}death(){this.play("death")}roar(){this.play("roar")}thunder(){this.play("thunder")}status(){var t,i,s;if(this.error)return"Audio could not start · press M to retry";if(this.muted)return"Sound muted · press M to enable";if(!this.enabled)return"Sound starts when you take flight · M to preview";if(((t=this.ctx)==null?void 0:t.state)==="suspended")return"Audio waiting · press M to retry";if(this.paused&&!this.keepAmbience)return"Sound paused with the game";if(!this.ambienceVolume)return"Ambience volume is at zero";const e=[...((i=this.ambient)==null?void 0:i.voices)||[]].filter(r=>{var a;return r.asset===((a=this.ambient.layers.get(r.role))==null?void 0:a.asset)}).length;return e?`Ambience playing · ${e} active layers`:(s=this.ambient)!=null&&s.failed.size?"Ambience unavailable · toggle M to retry":"Loading ambience…"}update(e,t){this.environment=t,this.keepAmbience!==!!t.keepAmbience&&(this.keepAmbience=!!t.keepAmbience,this.applyMix()),!(!this.enabled||!this.ambient)&&(this.paused!==!!t.paused&&this.setPaused(!!t.paused),(!this.paused||this.keepAmbience)&&this.ambient.update(e,t))}}const Xf={city:{shadow:[.63,.97,1.16],light:[1.2,1.06,.83],haze:"#e8b88a",saturation:1.13,contrast:1.1,aura:.15},palace:{shadow:[.69,1.04,.91],light:[1.18,1.12,.86],haze:"#b9d6b6",saturation:1.12,contrast:1.08,aura:.28},desert:{shadow:[.9,.73,1.22],light:[1.28,1.02,.71],haze:"#efaa78",saturation:1.16,contrast:1.13,aura:.16},canyon:{shadow:[.71,.79,1.23],light:[1.27,.96,.8],haze:"#d89389",saturation:1.13,contrast:1.17,aura:.15},river:{shadow:[.59,1.02,1.2],light:[.96,1.13,1.16],haze:"#99d8dc",saturation:1.12,contrast:1.09,aura:.55},farm:{shadow:[.78,1.04,.83],light:[1.17,1.13,.81],haze:"#d4d69c",saturation:1.09,contrast:1.08,aura:.18},ancient:{shadow:[1.02,.7,1.19],light:[1.19,1.02,.91],haze:"#c5a1d5",saturation:1.12,contrast:1.15,aura:.9},fishing:{shadow:[.6,.95,1.24],light:[1.21,1.01,.93],haze:"#c7bacd",saturation:1.13,contrast:1.1,aura:.44},mountain:{shadow:[.65,.81,1.29],light:[1.01,1.1,1.2],haze:"#b0c9e9",saturation:1.06,contrast:1.16,aura:.8},jungle:{shadow:[.6,1.07,.89],light:[1.12,1.18,.71],haze:"#acc990",saturation:1.16,contrast:1.16,aura:.6},beach:{shadow:[.6,.97,1.23],light:[1.23,1.08,.85],haze:"#b8e1d9",saturation:1.17,contrast:1.08,aura:.38},island:{shadow:[.94,.68,1.13],light:[1.34,.93,.68],haze:"#dc958c",saturation:1.14,contrast:1.18,aura:.45},temple:{shadow:[.84,.75,1.26],light:[1.2,1.12,.89],haze:"#c5b2df",saturation:1.12,contrast:1.12,aura:1}},dr=Di.lerp,BM=Di.smoothstep;function zM(n,{daylight:e=1,night:t=0,enclosed:i=!1,rain:s=!1,sand:r=!1,slow:a=!1}={}){const o=Xf[n]||Xf.city,l=(1-BM(Math.abs(e-.43),.04,.4))*(1-t),c=i?1:0,f=o.shadow.map((d,m)=>dr(dr(d,[.66,.76,1.3][m],t*.38),[.64,.94,1.12][m],c*.6)),u=o.light.map((d,m)=>dr(dr(dr(d,[1.35,.99,.76][m],l*.65),[.88,1.06,1.24][m],t*.5),[1.15,1.02,.86][m],c*.5)),h=new Ae(o.haze).lerp(new Ae("#d77b9b"),l*.3).lerp(new Ae("#535e9b"),t*.68);return r&&h.lerp(new Ae("#d99663"),.5),s&&h.lerp(new Ae("#70849b"),.3),{shadow:f,light:u,haze:h,exposure:1.04-t*.14+c*.09,saturation:o.saturation-t*.04-(s?.06:0),contrast:o.contrast+l*.05-c*.07,strength:.92+l*.08,atmosphere:c?0:.055+t*.025+(s||r?.025:0),bloom:.32+l*.07+t*.14+c*.06,vignette:.13+t*.07,aura:o.aura*t*(c||s||r?0:1),focus:a?1:0}}function kM(){return{gradeShadow:{value:new C(1,1,1)},gradeLight:{value:new C(1,1,1)},gradeHaze:{value:new Ae("#e8b88a")},gradeSettings:{value:new At(1,1,1,0)},gradeEffects:{value:new At(0,.32,0,0)},gradeTime:{value:0}}}function GM(n,e,t,i,s=!1){const r=s?1:1-Math.exp(-Math.max(0,t)*.65);n.gradeShadow.value.lerp(new C(...e.shadow),r),n.gradeLight.value.lerp(new C(...e.light),r),n.gradeHaze.value.lerp(e.haze,r),n.gradeSettings.value.lerp(new At(e.exposure,e.saturation,e.contrast,e.strength),r),n.gradeEffects.value.lerp(new At(e.atmosphere,e.bloom,e.vignette,e.focus),r),n.gradeTime.value=i}const HM=`
  uniform vec3 gradeShadow;
  uniform vec3 gradeLight;
  uniform vec3 gradeHaze;
  uniform vec4 gradeSettings;
  uniform vec4 gradeEffects;
  uniform float gradeTime;
  vec3 cinematicGrade(vec3 color, float depth) {
    color *= gradeSettings.x;
    float luma = dot(color, vec3(.2126,.7152,.0722));
    float shadows = 1.-smoothstep(.035,.45,luma);
    float highlights = smoothstep(.09,.75,luma);
    vec3 tone = mix(vec3(1.),gradeShadow,shadows*gradeSettings.w);
    tone *= mix(vec3(1.),gradeLight,highlights*gradeSettings.w);
    color *= tone;
    luma = dot(color,vec3(.2126,.7152,.0722));
    // Gently protect very bright magic and saturated pickup colours.
    float vibrance = mix(gradeSettings.y,1.,smoothstep(.8,2.,luma));
    color = max(vec3(0.),mix(vec3(luma),color,vibrance));
    color *= (1.+(gradeSettings.z-1.)*(smoothstep(.02,.65,luma)*2.-1.));
    color /= 1.+max(color-.8,vec3(0.))*.24;
    float distanceVeil = smoothstep(65.,420.,depth)*gradeEffects.x;
    color = mix(color,gradeHaze,distanceVeil);
    vec2 centered = vUv*2.-1.;
    float edge = smoothstep(.20,1.45,dot(centered,centered));
    color *= 1.-edge*gradeEffects.z;
    // A restrained pearlescent pulse at the edges while bending time.
    if(gradeEffects.w>.001){
      float silk = .5+.5*sin(vUv.y*16.+gradeTime*.8+vUv.x*5.);
      color += vec3(.025,.065,.055)*silk*edge*gradeEffects.w;
    }
    // Fine static film grain: stable under pause, no texture or extra sample.
    float grain = fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.5;
    color += grain*.0035*smoothstep(.015,.12,luma);
    return max(color,vec3(0.));
  }
`;class VM{constructor(e,t){var l;this.renderer=e,this.camera=t,this.hdr=((l=e.extensions)==null?void 0:l.has("EXT_color_buffer_float"))||!1;const i=this.hdr?Kn:fn;this.target=new vn(1,1,{type:i,depthBuffer:!0,minFilter:Vt,magFilter:Vt}),this.glowA=new vn(1,1,{type:i,depthBuffer:!1}),this.glowB=new vn(1,1,{type:i,depthBuffer:!1}),this.target.depthTexture=new ls(1,1,Nn),this.scene=new ac,this.screenCamera=new Wc,this.uniforms={...kM(),picture:{value:this.target.texture},depth:{value:this.target.depthTexture},glow:{value:this.glowB.texture},hdr:{value:this.hdr},pixel:{value:new oe(1,1)},nearPlane:{value:t.near},farPlane:{value:t.far}};const s=new vt;s.setAttribute("position",new je([-1,-1,0,3,-1,0,-1,3,0],3)),s.setAttribute("uv",new je([0,0,2,0,0,2],2));const r="varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}";this.blurUniforms={source:{value:this.target.texture},direction:{value:new oe},extract:{value:!0},hdr:{value:this.hdr}};const a=new sn({depthTest:!1,depthWrite:!1,uniforms:this.blurUniforms,vertexShader:r,fragmentShader:`
        varying vec2 vUv;
        uniform sampler2D source;
        uniform vec2 direction;
        uniform bool extract;
        uniform bool hdr;
        vec3 sampleGlow(vec2 uv) {
          vec3 c=texture2D(source,uv).rgb;
          if(!extract) return c;
          float high=max(c.r,max(c.g,c.b)), low=min(c.r,min(c.g,c.b));
          // HDR magic exceeds the paper palette. The 8-bit fallback gates on
          // saturation as well, avoiding a glow wash over white architecture.
          float mask=hdr?smoothstep(1.05,2.1,high):smoothstep(.72,.98,high)*smoothstep(.2,.5,high-low);
          return min(c,vec3(4.))*mask;
        }
        void main(){
          vec3 c=sampleGlow(vUv)*.227027;
          c+=(sampleGlow(vUv+direction*1.384615)+sampleGlow(vUv-direction*1.384615))*.316216;
          c+=(sampleGlow(vUv+direction*3.230769)+sampleGlow(vUv-direction*3.230769))*.070270;
          gl_FragColor=vec4(c,1.);
        }`});this.blurScene=new ac,this.blurScene.add(new at(s,a));const o=new sn({uniforms:this.uniforms,depthTest:!1,depthWrite:!1,vertexShader:r,fragmentShader:`
        #include <packing>
        varying vec2 vUv;
        uniform sampler2D picture;
        uniform sampler2D depth;
        uniform sampler2D glow;
        uniform bool hdr;
        uniform vec2 pixel;
        uniform float nearPlane;
        uniform float farPlane;
        ${HM}
        float distanceAt(vec2 uv){return -perspectiveDepthToViewZ(texture2D(depth,uv).x,nearPlane,farPlane);}
        void edgePair(vec2 offset, float z, vec3 color, inout float depthEdge, inout float colorEdge, inout float nearest){
          float a=distanceAt(vUv+offset), b=distanceAt(vUv-offset);
          nearest=min(nearest,min(a,b));
          // Opposing samples cancel gradual depth slopes on the planet. A raw
          // first difference would blacken the ground near the horizon.
          float bend=abs(a+b-2.*z)/max(min(z,min(a,b)),1.);
          depthEdge=max(depthEdge,smoothstep(.014,.045,bend));
          vec3 ca=texture2D(picture,vUv+offset).rgb;
          vec3 cb=texture2D(picture,vUv-offset).rgb;
          colorEdge=max(colorEdge,smoothstep(.24,.55,max(length(ca-color),length(cb-color))));
        }
        void main(){
          vec3 color=texture2D(picture,vUv).rgb;
          float z=distanceAt(vUv);
          float depthEdge=0.0;
          float colorEdge=0.0;
          float nearest=z;
          edgePair(vec2(pixel.x,0.),z,color,depthEdge,colorEdge,nearest);
          edgePair(vec2(0.,pixel.y),z,color,depthEdge,colorEdge,nearest);
          edgePair(pixel*.7071,z,color,depthEdge,colorEdge,nearest);
          edgePair(vec2(pixel.x,-pixel.y)*.7071,z,color,depthEdge,colorEdge,nearest);
          // Carry silhouettes well into the expanded landscape, then let fog
          // absorb the ink. Fine color details use a lighter stroke weight.
          float distanceFade=1.-smoothstep(190.,440.,nearest);
          float edge=max(depthEdge,colorEdge*.55)*distanceFade;
          // Preserve luminous cores inside narrow spells and runes. Neighboring
          // background pixels still carry their black silhouette contour.
          if(hdr) edge*=1.-.82*smoothstep(1.8,3.,max(color.r,max(color.g,color.b)));
          color+=texture2D(glow,vUv).rgb*gradeEffects.y;
          color=cinematicGrade(color,z);
          color=mix(color,vec3(.001),edge);
          gl_FragColor=vec4(max(color,vec3(0.)),1.);
          #include <colorspace_fragment>
        }`});this.scene.add(new at(s,o)),this.resize()}resize(){var i,s;const e=this.renderer.getDrawingBufferSize(new oe),t=1.35*(((s=(i=this.renderer).getPixelRatio)==null?void 0:s.call(i))||1);this.target.setSize(e.x,e.y),this.uniforms.pixel.value.set(t/e.x,t/e.y),this.glowA.setSize(Math.max(1,Math.ceil(e.x/4)),Math.max(1,Math.ceil(e.y/4))),this.glowB.setSize(this.glowA.width,this.glowA.height)}setLook(e,t,i){GM(this.uniforms,e,t,i,!this.lookInitialized),this.lookInitialized=!0}render(e,t){this.renderer.setRenderTarget(this.target),this.renderer.render(e,t),this.blurUniforms.source.value=this.target.texture,this.blurUniforms.extract.value=!0,this.blurUniforms.direction.value.set(1/this.glowA.width,0),this.renderer.setRenderTarget(this.glowA),this.renderer.render(this.blurScene,this.screenCamera),this.blurUniforms.source.value=this.glowA.texture,this.blurUniforms.extract.value=!1,this.blurUniforms.direction.value.set(0,1/this.glowA.height),this.renderer.setRenderTarget(this.glowB),this.renderer.render(this.blurScene,this.screenCamera),this.renderer.setRenderTarget(null),this.renderer.render(this.scene,this.screenCamera)}}class WM{constructor(e){this.scene=e,this.ribbons=[],this.point=new Rt}burst(e,t,i,s=24){for(let r=0;r<s;r++){this.ribbons.length>=72&&this.remove(0);const a=new vt,o=new Float32Array(54),l=[];a.setAttribute("position",new Ht(o,3));for(let m=0;m<8;m++){const _=m*2;l.push(_,_+1,_+2,_+1,_+3,_+2)}a.setIndex(l),a.computeVertexNormals();const c=$n(r%3?"#c92245":"#f04642",!1,"smooth");c.side=Sn;const f=new at(a,c);f.frustumCulled=!1,this.scene.add(f);const u=Math.random()*Math.PI*2,h=5+Math.random()*14,d=1.1+Math.random()*1.3;this.ribbons.push({x:e,y:t,s:i,vx:Math.cos(u)*h,vy:4+Math.random()*12,vs:Math.sin(u)*h,life:d,maxLife:d,width:.15+Math.random()*.35,history:[],visual:f,positions:o})}}remove(e){const[t]=this.ribbons.splice(e,1);this.scene.remove(t.visual),t.visual.geometry.dispose()}clear(){for(;this.ribbons.length;)this.remove(0)}update(e,t){for(let i=this.ribbons.length-1;i>=0;i--){const s=this.ribbons[i];if(s.life-=e,s.life<=0){this.remove(i);continue}e>0&&(s.x+=s.vx*e,s.y+=s.vy*e,s.s+=s.vs*e,s.vy-=24*e,s.y<.12&&(s.y=.12,s.vy=Math.abs(s.vy)*.13,s.vx*=.9,s.vs*=.9),s.history.unshift({x:s.x,y:s.y,s:s.s}),s.history.length>9&&s.history.pop());for(let r=0;r<9;r++){const a=s.history[Math.min(r,s.history.length-1)]||s;Tt(this.point,a.x,a.s,a.y,t);const o=s.width*(1-r/9)*Math.min(1,s.life*2);for(let l=0;l<2;l++){const c=r*6+l*3,f=l?1:-1;s.positions[c]=this.point.position.x+f*o,s.positions[c+1]=this.point.position.y+f*o*Math.sin(s.life*8+r),s.positions[c+2]=this.point.position.z}}s.visual.geometry.attributes.position.needsUpdate=!0,s.visual.geometry.computeVertexNormals()}}}const Yi=["#ffcc55","#ff658c","#64ffe0","#a68aff","#fff4ca"];function XM(n,e){if(!Number.isFinite(e)||e<=n)return null;for(const[t,i]of[[5e4,3],[1e4,2],[1e3,1]]){const s=Math.floor(e/t)*t;if(s>n)return{meters:s,tier:i}}return null}class YM{constructor(e){this.scene=e,this.point=new Rt,this.color=new Ae,this.sparks=new os(new ps(1),new Lt({vertexColors:!1,transparent:!0,depthWrite:!1}),1800),this.sparks.material.color.multiplyScalar(3),this.decor=new os(new Fn(1,1,1),new Lt,1400);for(const t of[this.sparks,this.decor])t.instanceMatrix.setUsage(es),t.frustumCulled=!1,e.add(t);this.clear()}clear(){this.highWater=0,this.active=null,this.particles=[],this.parts=[],this.sparks.count=this.decor.count=0}observe(e){const t=XM(this.highWater,e.distance);return this.highWater=Math.max(this.highWater,e.distance),t?((!this.active||t.tier>=this.active.tier)&&this.start(t,e),t):null}start(e,t){const i=[0,3.5,10,16][e.tier];this.active={...e,age:0,duration:i,nextBurst:0},this.particles=[],this.parts=[];const s=(r,a,o,l,c,f,u,h="")=>this.parts.push({x:r,y:a,s:t.distance+o,w:l,h:c,d:f,color:u,motion:h});if(e.tier>1){const r=e.tier===3?12:6;for(let a=0;a<r;a++)for(const o of[-1,1]){const l=o*(e.tier===3&&a%2?83:65),c=12+a*22,f=Yi[a%Yi.length];s(l,7,c,12,1,8,f),s(l,2,c,10,3,5,"#9e5b40");for(const u of[-5,5])for(const h of[-3,3])s(l+u,4,c+h,.35,7,.35,"#ffe1a1");for(let u=0;u<5;u++)s(l-4+u*2,4,c,1.3,1,1.3,Yi[u]);for(let u=0;u<4;u++){const h=o*(57+u*3),d=c+7+u*2;s(h,2.2,d,1.1,2.4,.9,Yi[(a+u)%5],"dance"),s(h,3.9,d,.9,.9,.9,"#ffd6aa","dance");for(const m of[-.8,.8])s(h+m,3.4,d,.35,1.9,.35,"#ffd6aa","wave"),s(h+m*.45,.7,d,.35,1.4,.45,"#493c64","dance")}for(const u of[-9,9])s(l+u,7,c+9,.3,14,.3,"#e3b77d");s(l,13,c+9,18,.09,.09,"#fff0cf");for(let u=0;u<9;u++)s(l-8+u*2,11.9,c+9,1.5,2,.08,Yi[u%5],"flag")}}this.burst(t)}burst(e){const t=this.active.tier;for(let i=0;i<t*2;i++){const s=e.x+(i%2?1:-1)*(12+Math.random()*26),r=e.altitude+10+Math.random()*15,a=e.distance+38+Math.random()*70,o=Yi[Math.floor(Math.random()*Yi.length)];for(let l=0;l<45+t*18&&this.particles.length<1800;l++){const c=Math.random()*Math.PI*2,f=Math.random()*2-1,u=Math.sqrt(1-f*f),h=(7+Math.random()*7)*(t===3?1.8:1);this.particles.push({x:s,y:r,s:a,vx:Math.cos(c)*u*h,vy:f*h,vs:Math.sin(c)*u*h,life:2+Math.random(),color:o})}}this.active.nextBurst=this.active.age+(t===3?.38:t===2?.75:1.2)}instance(e,t,i,s,r,a,o,l,c,f,u=0){Tt(this.point,i,r,s,a),this.point.rotation.z=u,this.point.scale.set(o,l,c),this.point.updateMatrix(),e.setMatrixAt(t,this.point.matrix),e.setColorAt(t,this.color.set(f))}update(e,t){const i=this.active;if(!i)return;if(i.age+=e,i.age>=i.duration){this.active=null,this.particles=[],this.parts=[],this.sparks.count=this.decor.count=0;return}e>0&&i.age>=i.nextBurst&&i.age<i.duration-2&&this.burst(t),this.particles=this.particles.filter(r=>(r.life-=e)>0),this.particles.forEach((r,a)=>{r.x+=r.vx*e,r.y+=r.vy*e,r.s+=r.vs*e,r.vy-=6*e;const o=.28*Math.min(1,r.life)*(i.tier===3?1.7:1);this.instance(this.sparks,a,r.x,r.y,r.s,t.distance,o,o*2.8,o,r.color,-Math.atan2(r.vx,r.vy))});const s=Math.min(1,i.age*3,(i.duration-i.age)*1.5);this.parts.forEach((r,a)=>{const o=r.s,l=r.motion==="dance"||r.motion==="wave"?Math.sin(i.age*7+r.s)*.25:0,c=r.motion==="wave"?Math.sin(i.age*8+r.x)*.55:r.motion==="flag"?Math.sin(i.age*5+r.x)*.18:0;this.instance(this.decor,a,r.x,r.y+l,o,t.distance,r.w*s,r.h*s,r.d*s,r.color,c)});for(const[r,a]of[[this.sparks,this.particles.length],[this.decor,this.parts.length]])r.count=a,r.instanceMatrix.needsUpdate=!0,r.instanceColor&&(r.instanceColor.needsUpdate=!0)}}const ns=["fire","storm","wind"];function qM(n,e=n.weapon){const t=lt(n.spells[e]||1,1,3),i=n.buffs,s=e==="storm"?{kind:e,damage:3+t*.6,cooldown:.58-t*.035,radius:2,chains:t+1,speed:0}:e==="wind"?{kind:e,damage:1.6+t*.5,cooldown:.65-t*.045,radius:5+t*1.2,speed:230,chains:0}:{kind:e,damage:2.2+t*.7,cooldown:.4-t*.025,radius:4+t*1.5,speed:280,chains:0};return s.shots=1+Math.min(2,n.spells.echo||0),s.damage*=i.fury>0?1.4:1,s.cooldown*=i.rapid>0?.72:1,s.radius+=i.fury>0?2:0,s.pierce=i.focus>0?1:0,s.spread=i.focus>0?.012:.035,i.overdrive>0&&(s.shots=Math.min(4,s.shots+1),s.damage*=1.15),s}function $M(n,e){for(const t of Object.keys(n.buffs))n.buffs[t]=Math.max(0,n.buffs[t]-e);n.magnetTime>0&&(n.magnetTime=Math.max(0,n.magnetTime-e),n.magnetTime||(n.spells.magnet=0))}function KM(n,e){return n.damage*(n.kind==="fire"&&e.frozen>0?1.8:1)*(n.kind==="wind"&&e.burn>0?1.5:1)}function ZM(n,e){return n>e*.5?1:2}const Yf=[{kind:"dragon",name:"EMBERWRACK · THE CINDER DRAGON",hp:30,speed:57,interval:1.5,radius:7,scale:2.3},{kind:"wizard",name:"MALGRAVE · THE HOLLOW WARLOCK",hp:24,speed:61,interval:1.25,radius:5,scale:2.6},{kind:"scarab",name:"CARAPAX · THE IRON SWARM",hp:32,speed:51,interval:1.65,radius:7,scale:3.2,wards:2},{kind:"serpent",name:"VORRAX · THE SAND WYRM",hp:28,speed:55,interval:1.4,radius:6,scale:3}];function JM(n,e){const t=Yf[(n-1)%Yf.length],{strength:i,mastery:s}=Yn(e),r=Math.round(t.hp*(1.08+.48*i+.16*s));return{...t,boss:!0,number:n,x:0,y:22,s:e+105,hp:r,maxHp:r,active:!0,phase:1,pursuit:i,maxSpeed:92+78*i+20*s,maxDuration:50+30*i,age:0,cooldown:1.1,attack:0,frozen:0,burn:0,stagger:0,sigils:[],shield:!!t.wards}}function QM(n,e,t){n.age+=t;const i=n.age%5,s=i>3.9,r=n.frozen?.75:1,a=n.pursuit,o=n.s-e.distance,l=(s?44:78)-a*22,c=lt(e.speed+(l-o)*(1.1+a),12,n.maxSpeed)*r,f=(80+90*a)*t;n.speed+=lt(c-n.speed,-f,f),n.s+=n.speed*t;const u=n.kind==="wizard"?Math.sin(n.age*1.9)*28:n.kind==="serpent"?Math.sin(n.age*.85)*30:Math.sin(n.age*.9)*20,h=lt(e.x*(.6+a*.35)+u*(1-a*.5),-52,52),d=n.kind==="serpent"?6+Math.abs(Math.sin(n.age*.8))*27:n.kind==="scarab"?14+Math.sin(n.age)*7:lt(e.altitude+7+Math.sin(n.age*1.4)*10,9,43),m=(22+a*20)*t*r;n.x+=lt(h-n.x,-m,m),n.y+=lt(d-n.y,-15*t*r,15*t*r),n.charging=s}function Ea(n,e,t=!1){return(t?[-22,-11,0,11,22]:[0]).map(s=>({x:lt(e.x+s,-62,62),y:e.altitude,s:e.distance}))}const jM=new Zs(1,1),hl=new Map,fl=new Map;function ul(n){return fl.has(n)||fl.set(n,new Lt({color:new Ae(n).multiplyScalar(6),fog:!1})),fl.get(n)}function mc(n,e){hl.has(n)||hl.set(n,new sn({transparent:!0,depthWrite:!1,blending:Ar,uniforms:{tint:{value:new Ae(n).multiplyScalar(4)}},vertexShader:"varying vec2 uvHalo; void main(){uvHalo=uv; vec4 p=modelViewMatrix*vec4(0.,0.,0.,1.); vec2 s=vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz)); p.xy+=position.xy*s; gl_Position=projectionMatrix*p;}",fragmentShader:"varying vec2 uvHalo; uniform vec3 tint; void main(){float r=length(uvHalo-.5)*2.; if(r>1.)discard; float a=pow(1.-r,2.)*.48; gl_FragColor=vec4(tint,a);}"}));const t=new at(jM,hl.get(n));return t.scale.setScalar(e),t.frustumCulled=!1,t}function xd(n){return n>0?28+(Math.min(3,n)-1)*12:0}function vd(n,e,t,i=0){if(t<=0)return!1;const s=e.spells.magnet,r=xd(s)||i;if(!r)return!1;const a=Math.hypot(n.x-e.x,n.y-e.altitude,n.s-e.distance);if(!n.attracted&&a>r)return!1;n.attracted=!0;const o=1-Math.exp(-t*(6+s*1.5));return n.x+=(e.x-n.x)*o,n.y+=(e.altitude-n.y)*o,n.s+=e.speed*t,n.s+=(e.distance-n.s)*o,!0}const dl=new pi(1,.055,5,36),e1=new Ks(.07,.07,2.8,5),pr={fire:"#ff6b25",storm:"#aeeaff",wind:"#b8ffe6"},qf=new Rt,t1=new C(0,0,-1),pl=new C;function n1(n,e){Tt(n.visual,n.x,n.s,n.y,e),Tt(qf,n.x+n.vx*.01,n.s+(n.vs??-n.speed)*.01,n.y+n.vy*.01,e),pl.subVectors(qf.position,n.visual.position).normalize(),pl.lengthSq()&&n.visual.quaternion.setFromUnitVectors(t1,pl)}class i1{constructor(e,t,i,s,r){Object.assign(this,{scene:e,chunks:t,bullets:i,shots:s,hooks:r}),this.fx=[],this.drops=[],this.boss=null,this.nextBoss=Of,this.warning=!1,this.shake=0,this.killsAtBoss=0,this.castPulse=0,this.temp=new C,this.roamers=[],this.encounters=0}clear(){var e;for(const t of this.roamers)this.scene.remove(t.visual);this.roamers.length=0,this.encounters=0;for(const t of this.fx)this.scene.remove(t.visual),(e=t.geometry)==null||e.dispose();for(const t of this.drops)this.scene.remove(t.visual);this.boss&&(this.scene.remove(this.boss.visual),this.boss.sigils.forEach(t=>this.scene.remove(t.visual))),this.fx.length=this.drops.length=0,this.boss=null,this.nextBoss=Of,this.warning=!1,this.killsAtBoss=0,this.shake=this.castPulse=0,this.hooks.bossUI(null)}targets(){const e=[];for(const t of this.chunks.values())for(const i of t.enemies)i.active&&!this.boss&&e.push(i);for(const t of this.chunks.values())for(const i of t.props||[])i.active&&i.visual&&!t.combatClear&&!this.boss&&e.push(i);return this.boss||e.push(...this.roamers.filter(t=>t.active)),this.boss&&e.push(...this.boss.sigils.filter(t=>t.active),this.boss),e}retainEnemy(e,t){var i;return this.boss||!e.active||!((i=Qi[e.kind])!=null&&i.mobile)||e.s<t-35||e.s>t+220?!1:(this.roamers.length>=10&&this.scene.remove(this.roamers.shift().visual),this.roamers.push(e),!0)}lock(e,t,i){let s=null,r=.25;for(const a of this.targets()){if(a.boss&&a.shield||a.s<e.distance+3||a.s>e.distance+185||(this.temp.copy(a.visual.position).project(i),this.temp.z>1||this.temp.z<-1))continue;const o=Math.hypot(this.temp.x-t.x,this.temp.y-t.y);o<r&&(r=o,s=a)}return s}switchWeapon(e,t){ns.includes(t)&&(e.weapon=t,this.hooks.tray(),this.hooks.notify(`${In[t].name} · ${t==="wind"?"clear shots and fan burning foes":t==="storm"?"instant strikes and chaining arcs":"explosive impacts and burning damage"}`,2,1))}addFX(e){var t;if(this.fx.length>=64){const i=this.fx.shift();this.scene.remove(i.visual),(t=i.geometry)==null||t.dispose()}this.fx.push(e)}ring(e,t,i,s,r=6,a=.35){var l;(l=this.hooks.magic)==null||l.burst(e,t,i,s,r);const o=D(dl,s,this.scene,[0,0,0],[1,1,1],[0,0,0],!0);this.addFX({visual:o,x:e,y:t,s:i,life:a,maxLife:a,radius:r,ring:!0})}arc(e,t,i=pr.storm){const s=[];for(let o=0;o<=12;o++){const l=o/12,c=o===0||o===12?0:1.5,f=Wt(e.x,t.x,l)+(Math.random()-.5)*c,u=Ue+Wt(e.y,t.y,l)+(Math.random()-.5)*c-f*f/(2*Ue),h=(t.s-e.s)*l/Ue;s.push(new C(f,Math.cos(h)*u-Ue,-Math.sin(h)*u))}const r=new Hc(new Pu(s),24,.14,4,!1),a=new at(r,$n(i,!0));this.scene.add(a),this.addFX({visual:a,geometry:r,x:0,y:0,s:e.s,life:.13,maxLife:.13}),this.ring(t.x,t.y,t.s,"#ffffff",2.5,.16)}drop(e,t,i,s){if(this.drops.length>=24){const a=this.drops.shift();this.scene.remove(a.visual)}const r=pc(e);this.scene.add(r),this.drops.push({kind:e,x:t,y:i,s,visual:r})}collect(e,t){const i=t!=="magnet"&&e.spells[t]>=3;nl(e,t),this.hooks.tray(),this.hooks.sound.trick(),this.hooks.notify(i?"MAX LEVEL · OVERDRIVE! Extra shots for 8s":In[t].description,2.6,2)}kill(e,t){var s;if(!e.active)return;if(e.active=!1,e.visual.visible=!1,this.shake=Math.max(this.shake,e.boss?1.1:.32),e.destructible){this.ring(e.x,e.y,e.s,"#ffc687",6,.35),this.hooks.particles(e.x,e.y,e.s,"#d69c66",18),this.hooks.sound.impact("fire"),hn(t,30,4,!1);return}if(this.hooks.blood.burst(e.x,e.y,e.s,e.boss?60:30),this.ring(e.x,e.y,e.s,"#ff462a",e.boss?23:7,.55),this.hooks.sound.kill(),e.sigil){hn(t,80,6),this.hooks.notify("WARD SIGIL SHATTERED",1.1,2);return}if(e.boss){this.hooks.sound.victory(),t.bosses++,hn(t,2e3,50),nl(t,"ward"),nl(t,"overdrive"),this.drop(ns[t.bosses%3],t.x,t.altitude,t.distance+25),this.drop("fury",t.x,t.altitude,t.distance+40),this.hooks.notify("BOSS SLAIN · +2,000 · HEART RESTORED · OVERDRIVE",5,5),this.scene.remove(e.visual),e.sigils.forEach(r=>this.scene.remove(r.visual)),this.boss=null,this.shots.forEach(r=>this.scene.remove(r.visual)),this.shots.length=0,this.nextBoss=t.distance+Yn(t.distance).bossSpacing,this.killsAtBoss=t.kills,this.warning=!1,this.hooks.arena(!1),this.hooks.bossUI(null),this.hooks.tray();return}t.kills++,hn(t,180,12);const i=["fire","rapid","storm","fury","wind","focus","frost","echo","ward","magnet"];this.drop(t.hp<3&&t.kills%3===0?"heart":i[(t.kills-1)%i.length],e.x,e.y,e.s),this.hooks.notify(`${(((s=Qi[e.kind])==null?void 0:s.name)||e.kind).toUpperCase()} SLAIN · +${180*Ws(t)}`,1,0)}hit(e,t,i,s=1){!e.active||e.boss&&e.shield||(e.hp-=KM(t,e)*s,this.hooks.hit(),t.kind==="fire"&&(e.burn=2.5,e.burnDps=t.damage*.3),t.frost&&(e.frozen=1.2+t.frost*.35),t.kind==="wind"&&(e.stagger=e.boss?.25:1.1,!e.boss&&!e.sigil&&!e.destructible&&(e.pushS=Math.min(24,(e.pushS||0)+10),e.pushY=Math.min(10,(e.pushY||0)+3)),e.burn>0&&this.ring(e.x,e.y,e.s,pr.fire,9)),this.hooks.particles(e.x,e.y,e.s,pr[t.kind],8),e.hp<=0?this.kill(e,i):!e.sigil&&!e.destructible&&this.hooks.blood.burst(e.x,e.y,e.s,3))}fire(e,t,i){var c,f;if(e.shotCooldown>0||this.bullets.length>=60)return;const s=qM(e);s.frost=e.spells.frost,e.shotCooldown=s.cooldown,this.hooks.sound.spell(s.kind),this.castPulse=.14;let r=this.lock(e,t,i),a;if(r)a={x:r.x,y:r.y,s:r.s};else{const u=new C(t.x,t.y,.5).unproject(i).sub(i.position).normalize(),h=(-100-i.position.z)/Math.min(-.01,u.z),d=i.position.clone().addScaledVector(u,h);a={x:lt(d.x,-140,140),y:lt(d.y+1e4/(2*Ue)-_n(e.distance+100),.3,100),s:e.distance+100}}const o={x:e.x,y:e.altitude+1,s:e.distance+2};if((c=this.hooks.magic)==null||c.cast(o,s.kind),this.ring(o.x,o.y,o.s,"#fff4c5",1.6,.13),s.kind==="storm"){for(const u of this.shots)!u.friendly&&Is(o,a,u,2.5)&&(this.reflect(u,e,Math.hypot(u.x-e.x,u.y-e.altitude,u.s-e.distance)<24&&e.time-(e.parryPress??-1/0)<.2),this.arc(o,u));if(r||(r=this.targets().filter(u=>!(u.boss&&u.shield)&&Is(o,a,u,u.radius||2.4))[0]),this.arc(o,r||a),r){(f=this.hooks.magic)==null||f.burst(r.x,r.y,r.s,pr.storm,5);const u=new Set;let h=r;for(let d=0;h&&d<s.chains+s.shots-1;d++){u.add(h),this.hit(h,s,e,Math.pow(.78,d));const m=this.targets().filter(_=>!u.has(_)&&!(_.boss&&_.shield)&&Math.hypot(_.x-h.x,_.y-h.y,_.s-h.s)<42).sort((_,g)=>Math.hypot(_.x-h.x,_.y-h.y,_.s-h.s)-Math.hypot(g.x-h.x,g.y-h.y,g.s-h.s))[0];m&&this.arc(h,m),h=m}this.hooks.sound.impact("storm"),this.shake=Math.max(this.shake,.16)}return}const l=Math.max(8,a.s-o.s);for(let u=0;u<s.shots&&this.bullets.length<64;u++){const h=(u-(s.shots-1)/2)*s.spread,d=new ct;if(this.scene.add(d),s.kind==="fire")D(Ze,"#ff531b",d,[0,0,0],[.75,.75,1.3],[0,0,0],!0),D(yt,"#fff0a3",d,[0,0,.65],[.47,.47,1.1],[0,0,0],!0),D(dl,"#ffd474",d,[0,0,0],[1,1,1],[.3,.5,0],!0);else for(let m=0;m<3;m++)D(dl,m===1?"#ffffff":pr.wind,d,[0,0,m*1.7],[s.radius*(1-m*.2),s.radius*(1-m*.2),1],[0,0,m],!0);d.traverse(m=>{m.isMesh&&m.material===$n("#ff531b",!0)&&(m.material=ul("#ff722c"))}),d.add(mc(s.kind==="fire"?"#ff8d42":"#66ffc5",s.kind==="fire"?7:12)),this.bullets.push({visual:d,...o,vx:((a.x-o.x)/l+h)*s.speed,vy:(a.y-o.y)/l*s.speed,profile:s,speed:s.speed,life:1.25,trail:0,hits:new Set,pierce:s.pierce})}}launch(e,t,i,s=34){var a;const r=Yn(i.distance).projectileSpeed;s*=r;for(const o of t){if(this.shots.length>=64)break;const l=e.s<i.distance,c=l?155*r:-s,f=Math.max(.35,Math.abs(e.s-i.distance)/Math.max(25,l?c-i.speed:i.speed+s)),u=!!((a=Qi[e.kind])!=null&&a.arrow),h=u?9:0,d=new ct;this.scene.add(d),u?(D(e1,"#402b2e",d,[0,0,0],[1,1,1],[Math.PI/2,0,0]),D(yt,"#ffae39",d,[0,0,-1.5],[.25,.25,.65],[0,0,0],!0)):D(yt,e.kind==="wizard"?"#ba8bff":e.kind==="scarab"?"#a1ffb4":"#ff6631",d,[0,0,0],[.6,.6,1.3],[0,0,0],!0);const m=e.kind==="wizard"?"#c586ff":e.kind==="scarab"?"#87ff9f":"#ff7f32";d.children[d.children.length-1].material=ul(m),d.add(mc(m,u?5:7)),this.shots.push({visual:d,source:e,x:e.x,y:e.y,s:e.s,vx:(o.x-e.x)/f,vy:(o.y-e.y+.5*h*f*f)/f,speed:s,vs:c,gravity:h,arrow:u,life:5})}this.ring(e.x,e.y,e.s,"#ff7359",e.boss?12:4)}status(e,t,i){if(e.frozen=Math.max(0,(e.frozen||0)-t),e.stagger=Math.max(0,(e.stagger||0)-t),e.burn>0&&!(e.boss&&e.shield)){const s=Math.min(t,e.burn);e.burn-=s,e.hp-=s*e.burnDps,e.hp<=0&&this.kill(e,i)}}reflect(e,t,i=!1){var c,f,u;if(e.friendly)return;const s=(c=e.source)!=null&&c.active?e.source:this.targets().find(h=>!h.destructible),r=s?s.x-e.x:-e.vx,a=s?s.y-e.y:-e.vy,o=s?s.s-e.s:-(e.vs??-e.speed),l=(i?230:190)/Math.max(.01,Math.hypot(r,a,o));Object.assign(e,{friendly:!0,vx:r*l,vy:a*l,vs:o*l,gravity:0,life:2.2,reflectedDamage:i?7:4}),e.visual.traverse(h=>{h.isMesh&&h.material.isMeshBasicMaterial&&(h.material=ul("#bcffef"))}),this.ring(e.x,e.y,e.s,"#c9fff0",i?8:4,.22),hn(t,i?60:12,i?5:1,i),i&&(sd(t,10),(u=(f=this.hooks).parried)==null||u.call(f),this.hooks.notify("PERFECT PARRY · RETURN TO SENDER · +HOURGLASS",1.5,4),this.hooks.sound.impact("storm"))}parry(e,t,i){if((e.parryCooldown||0)>e.time)return!1;for(const s of this.shots){if(s.friendly)continue;const r={x:s.x-e.x,y:s.y-e.altitude,s:s.s-e.distance},a={x:s.vx-e.vx,y:s.vy-e.vy,s:(s.vs??-s.speed)-e.speed},o=Math.hypot(r.x,r.y,r.s),l=-(r.x*a.x+r.y*a.y+r.s*a.s)/Math.max(.01,o);if(this.temp.copy(s.visual.position).project(i),o<25&&l>0&&o/l<.35&&this.temp.z>-1&&this.temp.z<1&&Math.hypot(this.temp.x-t.x,this.temp.y-t.y)<.32)return this.reflect(s,e,!0),e.parryCooldown=e.time+.16,!0}return!1}updateEnemy(e,t,i,s,r,a){var l,c;if(fi(i,600)){e.visual.visible=!1;return}if(!e.active||(e.visual.visible=!this.boss&&e.s-i<230&&e.s-i>-75,!e.visual.visible))return;if(r&&e.s-i<230&&e.s-i>-75){if(this.status(e,t,s),!e.active)return;const f=Qi[e.kind]||Qi.stalker,u=e.leap!=null,h=Yn(i);if(f.arrow&&!e.spotted&&e.s-i<145&&e.s>i&&(e.spotted=!0,(c=(l=this.hooks).spotted)==null||c.call(l,e)),j_(e,s,t),e.kind==="fish"&&!u&&e.leap!=null&&this.ring(e.baseX,.25,e.baseS,"#b7ffff",5,.6),!e.active){this.ring(e.x,.25,e.s,"#b7ffff",4,.5);return}const d=e.s-i;if((d>8||f.mobile&&d>-55)&&d<170&&!e.stagger&&e.kind!=="fish"){if(e.cooldown-=t*(e.frozen?.3:1),e.cooldown<f.warning*h.warning&&!e.aimTargets&&(e.aimTargets=Ea(e,s,e.kind==="hexer"||e.kind==="dragon"),e.kind==="wizard"))for(const m of e.aimTargets)m.x=lt(m.x+s.vx*.25,-52,52),m.y=lt(m.y+s.vy*.2,2,52);e.cooldown<=0&&(this.launch(e,e.aimTargets||Ea(e,s),s,f.speed),e.aimTargets=null,e.cooldown=f.interval*h.attackInterval)}Math.abs(d)<2.5&&Math.hypot(e.x-s.x,e.y-s.altitude)<e.radius&&this.hooks.hurt()}Tt(e.visual,e.x,e.s,e.y,i),e.visual.rotation.z=Math.sin(a*1.7+e.phase)*.1,e.kind==="fish"&&(e.visual.visible=e.y>-.3,e.visual.rotation.x+=e.leap==null?0:(e.leap/1.65-.5)*2),(e.kind==="guard"||e.kind==="bandit"||e.kind==="giant")&&(e.visual.rotation.z=0,Number.isFinite(s.x)&&(e.visual.rotation.y=Math.atan2(s.x-e.x,e.s-i)));for(const f of e.visual.userData.limbs||[])f.object.rotation.z=f.side*Math.sin(a*7+e.phase)*.45;const o=e.visual.userData;o.health.scale.x=1.8*lt(e.hp/e.maxHp,0,1),o.health.position.x=-.9*(1-e.hp/e.maxHp),o.frost.visible=e.frozen>0,o.frost.rotation.y=a,o.burn.visible=e.burn>0,o.burn.scale.setScalar(1+Math.sin(a*19)*.1),o.charge.visible=!!e.aimTargets,o.charge.scale.setScalar(1.7+Math.sin(a*13)*.2),e.visual.scale.setScalar(o.baseScale*(e.stagger?.92:1))}sigils(e){e.sigils.forEach(t=>this.scene.remove(t.visual)),e.sigils=[];for(let t=0;t<(e.wards||0);t++){const i=pc("storm");i.scale.setScalar(2),this.scene.add(i),e.sigils.push({sigil:!0,active:!0,hp:3,maxHp:3,x:0,y:0,s:e.s,radius:3.5,angle:t*Math.PI*2/e.wards,visual:i,frozen:0,burn:0})}e.shield=e.sigils.length>0}startBoss(e){this.boss=JM(++this.encounters,e.distance);const t=this.boss,i=Yn(e.distance);t.interval*=i.attackInterval,t.cooldown=Math.max(2.2,t.cooldown*i.warning),t.warningTime=.65*i.warning,t.visual=dd(t.kind),t.visual.scale.setScalar(t.scale),this.scene.add(t.visual),t.visual.userData.health.visible=t.visual.userData.healthBack.visible=!1;for(const s of this.roamers)this.scene.remove(s.visual);this.roamers.length=0,this.sigils(t),this.hooks.arena(!0),this.shots.forEach(s=>this.scene.remove(s.visual)),this.shots.length=0,this.hooks.notify(`${t.name} · ${t.shield?"BREAK TWO WARDS":"ATTACK OR OUTRUN IT"}`,4,5),this.hooks.sound.roar(),this.shake=.5}escapeBoss(e,t){const i=this.boss;i&&(this.scene.remove(i.visual),i.sigils.forEach(s=>this.scene.remove(s.visual)),this.boss=null,this.shots.forEach(s=>this.scene.remove(s.visual)),this.shots.length=0,this.nextBoss=e.distance+Yn(e.distance).bossSpacing,this.killsAtBoss=e.kills,this.warning=!1,t&&hn(e,350,15),this.hooks.notify(t?"BOSS OUTRUN · +350 · THE SKY IS YOURS":"THE HUNTER BREAKS AWAY · KEEP FLYING",3,5),this.hooks.arena(!1),this.hooks.bossUI(null))}updateBoss(e,t){const i=fi(t.distance,600);if(i){this.boss&&this.escapeBoss(t,!1);for(const r of this.roamers)this.scene.remove(r.visual);this.roamers.length=0;for(const r of this.shots)this.scene.remove(r.visual);this.shots.length=0,this.nextBoss=Math.max(this.nextBoss,i.end+900);return}const s=this.boss;if(!s){t.distance>this.nextBoss-180&&!this.warning&&(this.warning=!0,this.hooks.notify("SOMETHING ENORMOUS IS HUNTING YOU…",3,4),this.hooks.sound.roar()),t.distance>=this.nextBoss&&this.startBoss(t);return}if(QM(s,t,e),s.s<t.distance-85||s.s>t.distance+310||s.age>s.maxDuration){this.escapeBoss(t,s.s<t.distance-85);return}if(this.status(s,e,t),!!this.boss){for(const r of s.sigils){if(!r.active)continue;this.status(r,e,t);const a=r.angle+s.age*.45;r.x=s.x+Math.cos(a)*15,r.y=s.y+Math.sin(a)*13,r.s=s.s-3}if(s.shield=s.sigils.some(r=>r.active),ZM(s.hp,s.maxHp)>s.phase&&(s.phase=2,s.cooldown=Math.min(s.cooldown,.8),s.aimTargets=null,this.hooks.notify("ENRAGED · FINISH IT OR BURN PAST",2,5),this.hooks.sound.roar()),s.stagger||(s.cooldown-=e*(s.frozen?.65:1)),s.cooldown<s.warningTime&&!s.aimTargets){if(s.aimTargets=Ea(s,t,s.kind==="dragon"||s.kind==="scarab"),s.kind==="wizard")for(const r of s.aimTargets)r.x=lt(r.x+t.vx*.3,-52,52),r.y=lt(r.y+t.vy*.25,2,52);s.kind==="serpent"&&s.aimTargets.push({x:t.x,y:lt(t.altitude+12,2,52)},{x:t.x,y:lt(t.altitude-12,2,52)}),this.hooks.notify(s.kind==="dragon"?"DRAGONFIRE · WEAVE!":s.kind==="wizard"?"HEX MARKED · CHANGE DIRECTION!":s.kind==="scarab"?"SWARM VOLLEY · WIND BLAST!":"WYRM STRIKE · DODGE!",.8,3)}s.cooldown<=0&&(this.launch(s,s.aimTargets||Ea(s,t),t,s.phase===2?88:70),s.attack++,s.cooldown=s.interval*(s.phase===2?.73:1),s.aimTargets=null,s.attack%3===0&&this.drop(s.attack%6===0?"ward":"rapid",t.x,t.altitude,t.distance+35)),Math.abs(s.s-t.distance)<s.radius&&Math.hypot(s.x-t.x,s.y-t.altitude)<s.radius&&!t.roll&&this.hooks.hurt(),this.hooks.bossUI(s)}}update(e,t,i,s=!1){var r;$M(t,e),s||this.updateBoss(e,t);for(const a of this.chunks.values())for(const o of a.props||[])o.active&&o.burn&&this.status(o,e,t);for(let a=this.roamers.length-1;a>=0;a--){const o=this.roamers[a];this.updateEnemy(o,e,t.distance,t,!0,t.time),(!o.active||o.s<t.distance-75||o.s>t.distance+240||o.age>16)&&(this.scene.remove(o.visual),this.roamers.splice(a,1))}for(let a=this.bullets.length-1;a>=0;a--){const o=this.bullets[a],l={x:o.x,y:o.y,s:o.s},c=o.profile;o.x+=o.vx*e,o.y+=o.vy*e,o.s+=o.speed*e,o.life-=e,o.trail+=e,c.kind==="fire"&&o.trail>.045&&(o.trail=0,this.hooks.particles(o.x,o.y,o.s,"#ff9a35",2));let f=!1;const u=this.targets().sort((h,d)=>h.s-d.s);for(const h of u)if(!(o.hits.has(h)||!h.active||!Is(l,o,h,(h.radius||2.4)+(c.kind==="wind"?c.radius:.75)))&&(o.hits.add(h),this.hit(h,c,t),f=!0,c.kind==="fire")){for(const d of u)d!==h&&d.active&&!o.hits.has(d)&&Math.hypot(d.x-h.x,d.y-h.y,d.s-h.s)<c.radius+(d.radius||2)&&(this.hit(d,c,t,.6),o.hits.add(d));if(this.ring(h.x,h.y,h.s,"#ffae43",c.radius,.4),this.hooks.sound.impact("fire"),this.shake=Math.max(this.shake,.2),o.pierce--<=0){o.life=0;break}}if(c.kind==="wind"||c.kind==="fire"){for(let h=this.shots.length-1;h>=0;h--){const d=this.shots[h];if(d.friendly)continue;const m={x:o.x-d.vx*e,y:o.y-d.vy*e,s:o.s-(d.vs??-d.speed)*e};if(Is(l,m,d,c.kind==="wind"?c.radius+1:1.5)){const _=Math.hypot(d.x-t.x,d.y-t.altitude,d.s-t.distance)<24&&t.time-(t.parryPress??-1/0)<.2;if(this.reflect(d,t,_),c.kind==="fire"){o.life=0;break}}}f&&this.hooks.sound.impact("wind")}o.life<=0&&(this.scene.remove(o.visual),this.bullets.splice(a,1))}for(let a=this.shots.length-1;a>=0;a--){const o=this.shots[a];if(!o)continue;const l={x:o.x,y:o.y,s:o.s-i};if(o.s+=(o.vs??-o.speed)*e,o.x+=o.vx*e,o.y+=o.vy*e-.5*(o.gravity||0)*e*e,o.vy-=(o.gravity||0)*e,o.life-=e,o.friendly){for(const c of this.targets())if(Is({x:l.x,y:l.y,s:l.s+i},o,c,(c.radius||2.4)+.8)){this.hit(c,{kind:"storm",damage:o.reflectedDamage},t),o.life=0;break}}else Is(l,{x:o.x,y:o.y,s:o.s-t.distance},{x:t.x,y:t.altitude,s:0},1.5)&&(t.roll?(hn(t,35,4),this.hooks.notify("SPELL SLIP · +SKYFIRE",1)):this.hooks.hurt(),o.life=0);(o.life<=0||o.s<t.distance-110||o.s>t.distance+250||o.y<-3)&&(this.scene.remove(o.visual),this.shots.splice(a,1))}for(let a=this.drops.length-1;a>=0;a--){const o=this.drops[a];vd(o,t,e,12)&&t.spells.magnet&&((r=this.hooks.magic)==null||r.pullTrail(o,e));const l=o.s-t.distance,c=Math.hypot(o.x-t.x,o.y-t.altitude,l);(c<4.5||!o.attracted&&l<-12)&&(c<4.5&&this.collect(t,o.kind),this.scene.remove(o.visual),this.drops.splice(a,1))}}render(e,t,i){var s;for(const r of this.roamers)this.updateEnemy(r,0,t,{},!1,i);this.shake=Math.max(0,this.shake-e*2.5),this.castPulse=Math.max(0,this.castPulse-e);for(let r=this.fx.length-1;r>=0;r--){const a=this.fx[r];if(a.life-=e,a.life<=0){this.scene.remove(a.visual),(s=a.geometry)==null||s.dispose(),this.fx.splice(r,1);continue}Tt(a.visual,a.x,a.s,a.y,t),a.ring&&a.visual.scale.setScalar(a.radius*(1-a.life/a.maxLife)+.2)}for(const r of this.bullets)Tt(r.visual,r.x,r.s,r.y,t),r.visual.rotation.z=i*9;for(const r of this.shots)n1(r,t);for(const r of this.drops)Tt(r.visual,r.x,r.s,r.y,t),r.visual.rotation.y=Math.sin(i*2)*.2;if(this.boss){const r=this.boss;Tt(r.visual,r.x,r.s,r.y,t),r.visual.rotation.z=Math.sin(i)*.07;for(const a of r.visual.userData.limbs||[])a.object.rotation.z=a.side*Math.sin(i*6)*.4;r.visual.userData.charge.visible=r.shield||!!r.aimTargets,r.visual.userData.charge.scale.setScalar(r.shield?2.8:1.6+Math.sin(i*14)*.3),r.visual.userData.frost.visible=r.frozen>0,r.visual.userData.burn.visible=r.burn>0&&!r.shield;for(const a of r.sigils)a.active&&(Tt(a.visual,a.x,a.s,a.y,t),a.visual.rotation.z=i)}}}const wi=(n,e)=>(n%e+e)%e;function s1(n,e){const t=Math.floor(n/24)%7,i=["desert","canyon","ancient"].includes(e),s=["clear","wind","rain","storm","wind","clear","storm"][t];return{wind:s==="clear"?.25:s==="wind"?.65:1,rain:!i&&(s==="rain"||s==="storm"),sand:i&&(s==="rain"||s==="storm"),storm:s==="storm"}}class r1{constructor(e){const t=Mn(57291);this.seeds=Array.from({length:1400},()=>[t(),t(),t(),t()]);const i=new ps(1,0);this.leaves=new os(i,$n("#85a45d",!1,"smooth"),180),this.leaves.instanceMatrix.setUsage(es),this.leaves.frustumCulled=!1,e.add(this.leaves);for(let o=0;o<180;o++)this.leaves.setColorAt(o,new Ae(["#eee4a4","#b8dc86","#e8ad65","#93bd9e"][o%4]));this.rainPositions=new Float32Array(700*6);const s=new vt;s.setAttribute("position",new Ht(this.rainPositions,3).setUsage(es)),this.rain=new Kh(s,new oc({color:"#d2e9ed",transparent:!0,opacity:.45,depthWrite:!1})),this.rain.frustumCulled=!1,e.add(this.rain),this.sandPositions=new Float32Array(1400*3);const r=new vt;r.setAttribute("position",new Ht(this.sandPositions,3).setUsage(es)),this.sand=new Au(r,new Tu({color:"#f2c087",size:.36,transparent:!0,opacity:.5,depthWrite:!1})),this.sand.frustumCulled=!1,e.add(this.sand),this.gustPositions=new Float32Array(1152);const a=new vt;a.setAttribute("position",new Ht(this.gustPositions,3).setUsage(es)),this.gusts=new Kh(a,new oc({color:"#eaf2d3",transparent:!0,opacity:.25,depthWrite:!1})),this.gusts.frustumCulled=!1,e.add(this.gusts),this.transform=new Rt,this.flash=0,this.lastFlash=-1}update(e,t,i,s,r,a){const{wind:o,rain:l,sand:c,storm:f}=a,u=["city","palace","river","farm"].includes(r),h=_n(t);this.leaves.count=u?Math.floor(70+o*110):0;for(let g=0;g<this.leaves.count;g++){const[p,M,x,v]=this.seeds[g],E=e*(1+o*2)+p*40;this.transform.position.set(wi(p*220+e*(10+o*17),220)-110+Math.cos(E)*3,h+5+M*42+Math.sin(E)*3,35-wi(x*280-t+e*o*5,280)),this.transform.rotation.set(E,E*.7,v*6+E*1.4),this.transform.scale.set(.16+v*.22,.025,.45+v*.6),this.transform.updateMatrix(),this.leaves.setMatrixAt(g,this.transform.matrix)}if(this.leaves.instanceMatrix.needsUpdate=!0,this.rain.visible=l,this.sand.visible=c,l)for(let g=0;g<700;g++){const[p,M,x]=this.seeds[g],v=wi(p*220+e*o*14,220)-110,E=h+70-(M*90+e*48)%90,w=20-wi(x*230-t,230),R=g*6;this.rainPositions.set([v,E,w,v-o*1.4,E+3,w-1],R)}if(c)for(let g=0;g<1400;g++){const[p,M,x]=this.seeds[g],v=e*1.7+M*35;this.sandPositions.set([wi(p*220+e*32,220)-110,h+M*55+Math.sin(v)*7,25-wi(x*240-t+e*9,240)],g*3)}this.rain.geometry.attributes.position.needsUpdate=l,this.sand.geometry.attributes.position.needsUpdate=c,this.gusts.material.opacity=.08+o*.22;for(let g=0;g<48;g++){const[p,M,x]=this.seeds[g],v=20-wi(x*260-t+e*7,260),E=e*.7+p*20;for(let w=0;w<4;w++)for(let R=0;R<2;R++){const y=(w+R)/4,T=E+y*1.6;this.gustPositions.set([wi(p*220+e*(12+o*14),220)-110+y*13+Math.sin(T)*3,h+M*50+Math.cos(T)*3,v-y*5],(g*8+w*2+R)*3)}}this.gusts.geometry.attributes.position.needsUpdate=!0;const d=Math.floor(e/9),m=e%9;this.flash=f&&m<.18?(1-m/.18)*.6:0;const _=this.flash>0&&d!==this.lastFlash;return _&&(this.lastFlash=d),_}}const ml={fire:"#ff762d",storm:"#94dfff",wind:"#92ffcd"};function $f(n,e){const t=new vt,i=new Float32Array(n*3),s=new Float32Array(n*3),r=new Float32Array(n),a=new Float32Array(n);for(const[c,f,u]of[["position",i,3],["tint",s,3],["size",r,1],["alpha",a,1]])t.setAttribute(c,new Ht(f,u).setUsage(es));const o=new sn({transparent:!0,depthWrite:!1,blending:Ar,fog:!0,uniforms:{...Gu.clone(xe.fog),pixelRatio:{value:e}},vertexShader:`
      attribute vec3 tint; attribute float size; attribute float alpha;
      varying vec3 vTint; varying float vAlpha;
      uniform float pixelRatio;
      #include <fog_pars_vertex>
      void main(){
        vTint=tint; vAlpha=alpha;
        vec4 mvPosition=modelViewMatrix*vec4(position,1.);
        gl_Position=projectionMatrix*mvPosition;
        gl_PointSize=clamp(size*pixelRatio*320./max(1.,-mvPosition.z),1.,72.);
        #include <fog_vertex>
      }`,fragmentShader:`
      varying vec3 vTint; varying float vAlpha;
      #include <fog_pars_fragment>
      void main(){
        vec2 p=gl_PointCoord*2.-1.; float r=length(p);
        float halo=pow(max(0.,1.-r),2.5);
        float core=1.-smoothstep(.08,.30,r);
        float rays=pow(max(0.,1.-min(abs(p.x),abs(p.y))*18.),3.)*max(0.,1.-r)*.24;
        float mask=max(halo,max(core,rays))*vAlpha;
        if(mask<.008) discard;
        gl_FragColor=vec4(vTint*3.+core*.35,mask);
        #include <fog_fragment>
        #include <colorspace_fragment>
      }`}),l=new Au(t,o);return l.frustumCulled=!1,t.setDrawRange(0,0),{visual:l,geometry:t,positions:i,tints:s,sizes:r,alphas:a,capacity:n}}class a1{constructor(e,t=1){this.scene=e,this.sparks=[],this.flashes=[],this.castLife=0,this.trailClock=0,this.wasBoosting=!1,this.point=new Rt,this.color=new Ae,this.burstCloud=$f(384,t),this.motes=$f(100,t),e.add(this.burstCloud.visual,this.motes.visual);const i=Mn(3419);this.seeds=Array.from({length:100},()=>[i(),i(),i(),i()]),this.lights=Array.from({length:4},()=>{const a=new Vu("#ffffff",0,28,2);return a.castShadow=!1,e.add(a),a}),this.aura=new ct,e.add(this.aura);const s=new pi(1,.035,4,48),r=new ps(.12);for(const a of[2.3,2.8]){const o=new at(s,$n("#9beed9",!0));o.scale.setScalar(a),this.aura.add(o)}for(let a=0;a<8;a++){const o=a*Math.PI/4,l=new at(r,$n("#ffe3a8",!0));l.position.set(Math.cos(o)*2.55,Math.sin(o)*2.55,0),l.scale.set(1,2.7,1),l.rotation.z=o,this.aura.add(l)}this.aura.visible=!1,this.magnetAura=new ct,e.add(this.magnetAura);for(let a=0;a<2;a++){const o=new at(s,$n("#8ae0b4",!0));o.scale.setScalar(3.2+a*.65),this.magnetAura.add(o)}this.magnetAura.visible=!1}clear(){this.sparks.length=this.flashes.length=0,this.castLife=this.trailClock=0,this.wasBoosting=!1,this.burstCloud.geometry.setDrawRange(0,0),this.aura.visible=this.magnetAura.visible=!1,this.lights.forEach(e=>e.intensity=0)}emit(e,t,i,s,r,a=1){this.color.set(s);const o=[this.color.r,this.color.g,this.color.b];for(let l=0;l<r&&this.sparks.length<384;l++){const c=Math.random()*Math.PI*2,f=(4+Math.random()*13)*a,u=.35+Math.random()*.7;this.sparks.push({x:e,y:t,s:i,vx:Math.cos(c)*f,vy:(Math.random()*11-2)*a,vs:Math.sin(c)*f,size:(.18+Math.random()*.42)*a,life:u,maxLife:u,curl:(Math.random()-.5)*4,tint:o})}}flash(e,t,i,s,r=1){this.flashes.length>=8&&this.flashes.shift(),this.flashes.push({x:e,y:t,s:i,color:s,power:r,life:.4,maxLife:.4})}burst(e,t,i,s,r){if(r<4)return;const a=Math.min(2,r/6);this.emit(e,t,i,s,r>12?48:20,a),this.flash(e,t,i,s,a)}cast(e,t){this.castLife=.22,this.castColor=ml[t],this.emit(e.x,e.y,e.s,this.castColor,7,.55),t==="storm"&&this.flash(e.x,e.y,e.s+12,this.castColor,.65)}pullTrail(e,t){e.pullClock=(e.pullClock||0)+t,!(e.pullClock<.075)&&(e.pullClock%=.075,this.emit(e.x,e.y,e.s,"#8ae0b4",1,.2))}checkpoint(e,t,i,s,r=!1){const a=r?"#ffda8b":"#a6ffe3";for(let o=0;o<24;o++){const l=o/24*Math.PI*2;this.emit(e+Math.cos(l)*s,t+Math.sin(l)*s,i,a,r?4:2,.7)}this.flash(e,t,i,a,r?1.4:.7)}write(e,t,i,s,r,a,o,l,c){Tt(this.point,i,r,s,a);const f=this.point.position;e.positions.set([f.x,f.y,f.z],t*3),e.tints.set(o,t*3),e.sizes[t]=l,e.alphas[t]=c}upload(e,t){e.geometry.setDrawRange(0,t);for(const i of Object.values(e.geometry.attributes))i.needsUpdate=!0}setLight(e,t,i,s,r,a,o,l){Tt(e,t,s,i,r),e.color.set(a),e.intensity=o,e.distance=l}update(e,t,i,s,r,a,o){if(this.magnetAura.visible=o&&s.spells.magnet>0,this.magnetAura.visible&&(Tt(this.magnetAura,s.x,i,s.altitude-.35,i),this.magnetAura.rotation.x-=Math.PI/2,this.magnetAura.rotation.z=-t,this.magnetAura.scale.setScalar(1+s.spells.magnet*.12+Math.sin(t*3)*.06)),e>0&&o&&s.boost&&!this.wasBoosting)for(let m=0;m<20;m++){const _=m/20*Math.PI*2;this.emit(s.x+Math.cos(_)*3,s.altitude+Math.sin(_)*2,i-3,"#a6ffe3",2,.8)}e>0&&o&&(this.wasBoosting=s.boost),this.castLife=Math.max(0,this.castLife-e);for(let m=this.flashes.length-1;m>=0;m--)this.flashes[m].life-=e,this.flashes[m].life<=0&&this.flashes.splice(m,1);if(this.trailClock+=o?e:0,this.trailClock>=.035){this.trailClock%=.035;for(const m of r.slice(0,8))this.emit(m.x,m.y,m.s,ml[m.profile.kind],1,.45);if(s.boost||s.railing)for(const m of[-1,1])this.emit(s.x+m*1.5,s.altitude-.25,i-2.5,s.railing?"#ffda8b":"#9bfce9",1,.45)}for(let m=this.sparks.length-1;m>=0;m--){const _=this.sparks[m];if(_.life-=e,_.life<=0){this.sparks.splice(m,1);continue}const g=_.curl*e,p=_.vx*Math.cos(g)-_.vs*Math.sin(g);_.vs=_.vx*Math.sin(g)+_.vs*Math.cos(g),_.vx=p,_.x+=_.vx*e,_.y+=_.vy*e,_.s+=_.vs*e,_.vy-=e*11}this.sparks.forEach((m,_)=>this.write(this.burstCloud,_,m.x,m.y,m.s,i,m.tint,m.size*(.5+m.life/m.maxLife),Math.min(1,m.life/m.maxLife*2))),this.upload(this.burstCloud,this.sparks.length);const l=a.night||0,c=a.sand||a.rain,f=l>.4?[.25,.85,.65]:[.85,.62,.25];for(let m=0;m<100;m++){const[_,g,p,M]=this.seeds[m],x=t*(.4+M)+_*20;this.write(this.motes,m,(_*160+t*(1.5+M*2))%160-80+Math.sin(x)*2,2+g*(l>.4?13:32)+Math.cos(x)*1.5,i+160-(p*190+i)%190,i,f,.12+M*.18,(c?.1:.3+l*.5)*(.55+Math.sin(x*2)*.35))}this.upload(this.motes,100),this.lights.forEach(m=>m.intensity=0);const u=this.castLife/.22;o&&(u>0||s.boost)&&this.setLight(this.lights[0],s.x,s.altitude+1.5,i,i,this.castColor||"#9fffe1",65*u+(s.boost?45:0),20),r.filter(m=>m.s>i-5&&m.s<i+170).sort((m,_)=>m.s-_.s).slice(0,2).forEach((m,_)=>this.setLight(this.lights[_+1],m.x,m.y,m.s,i,ml[m.profile.kind],m.profile.kind==="fire"?240:110,30));const d=this.flashes.reduce((m,_)=>!m||_.power*_.life>m.power*m.life?_:m,null);d&&this.setLight(this.lights[3],d.x,d.y,d.s,i,d.color,550*d.power*d.life/d.maxLife,38),this.aura.visible=o&&(s.boost||u>0),this.aura.visible&&(Tt(this.aura,s.x,i-1,s.altitude-.2,i),this.aura.rotation.x-=Math.PI/2,this.aura.rotation.z=t*(s.boost?2:-3),this.aura.scale.setScalar(s.boost?1:.7+u*.3))}}const Or={easy:{name:"Easy",length:896,spacing:224,radius:40,gateBase:14,density:.22,height:12,spread:20,zone:1,description:"Open gardens · giant forgiving gates · a few obstacles"},medium:{name:"Medium",length:1280,spacing:256,radius:10,density:.5,height:23,spread:32,zone:0,description:"Rooftop slalom · sharper turns · taller obstacles"},hard:{name:"Hard",length:1536,spacing:192,radius:8,density:.82,height:35,spread:39,zone:3,description:"Canyon sprint · tight gates · dense rock formations"}},_d=180;function Md(n="easy",e=42){const t=Or[n];if(!t)throw new Error("Unknown race difficulty");const i=Mn(e),s=[];for(let r=t.spacing;r<=t.length;r+=t.spacing)s.push({s:r,x:(i()*2-1)*t.spread,y:(t.gateBase??t.radius+1)+i()*(n==="hard"?18:7),radius:t.radius});return{...t,level:n,seed:e>>>0,gates:s}}function Kf(n,e){let t={s:0,x:0,y:3.5};for(const i of n.gates){if(e<=i.s){const s=lt((e-t.s)/(i.s-t.s),0,1);return{x:Wt(t.x,i.x,s),y:Wt(t.y,i.y,s)}}t=i}return t}function yd(n,e){const t=n*gt,i=Mn(e.seed+n*104729),s=[];if(n>0&&t<e.length)for(let a=-2;a<=2;a++){if(i()>e.density)continue;const o=t+30+i()*12,l={x:a*22+(i()-.5)*6,s:o,width:8+i()*5,depth:9+i()*5,height:6+i()*(e.height-6),angle:(i()-.5)*1.6,type:wn[e.zone].type},c=ad(l);Math.abs(l.x-Kf(e,o).x)<c.x+9||e.gates.some(f=>Math.abs(f.s-o)<c.s+22)||s.push(l)}const r=t<e.length?ju(wn[e.zone].type,n,t,Mn(e.seed+n*967+91)):[];return{index:n,start:t,zone:e.zone,safeLane:0,disableRails:!0,disablePassages:!0,obstacles:s,pickups:[],enemies:[],rings:[],props:r.filter(a=>Math.abs(a.x-Kf(e,a.s).x)>a.radius+8&&!e.gates.some(o=>Math.abs(o.s-a.s)<25)&&!s.some(o=>Math.abs(a.x-o.x)<13&&Math.abs(a.s-o.s)<15))}}function o1(n,e,t=null){const i=oo(n.seed);i.power=45,i.invulnerable=0;const s={course:n,player:e,ghost:t,run:i,countdown:3,elapsed:0,nextGate:0,crashes:0,stun:0,finished:!1,dnf:!1,splits:[],samples:[],recordAt:0};return s.collisionChunks=Array.from({length:Math.ceil(n.length/gt)},(r,a)=>yd(a,n)),Us(s,!0),s}function Us(n,e=!1){var s;if(!e&&n.elapsed<n.recordAt)return;const t=n.run,i=[n.elapsed,t.x,t.altitude,t.distance,t.vx,t.vy,t.roll,t.rollDirection];((s=n.samples.at(-1))==null?void 0:s[0])===n.elapsed?n.samples[n.samples.length-1]=i:n.samples.push(i),n.recordAt=n.elapsed+.05}function Zf(n){const e=n.course.gates[n.nextGate-1]||{s:0,x:0,y:3.5};n.crashes++,n.stun=.55,Object.assign(n.run,{distance:e.s,x:e.x,altitude:e.y,vx:0,vy:0,speed:22,roll:0,boost:!1,invulnerable:0}),Us(n,!0),n.samples.at(-1)[8]=1}function l1(n,e,t){if(n.finished||n.dnf)return null;if(n.countdown>0)return n.countdown=Math.max(0,n.countdown-t),n.countdown<1e-8&&(n.countdown=0),null;const i=t*(e.clockRate||1);if(n.elapsed+=i,n.elapsed>=_d)return n.dnf=!0,"timeout";if(n.stun>0)return n.stun=Math.max(0,n.stun-t),n.run.time+=t,Us(n),null;const s=n.run,r={s:s.distance,x:s.x,y:s.altitude};rd(s,{...e,arena:!0,difficulty:Math.min(3,Math.max(0,s.distance)/6400)},t);const a=Math.floor(s.distance/gt);for(let l=Math.max(0,a-1);l<=a+1;l++){const c=n.collisionChunks[l];if(c&&gd({x:r.x,altitude:r.y,distance:r.s},s,md(c)))return Zf(n),"crash"}const o=n.course.gates[n.nextGate];if(o&&s.distance>=o.s){const l=lt((o.s-r.s)/(s.distance-r.s),0,1),c=Wt(r.x,s.x,l),f=Wt(r.y,s.altitude,l);return Math.hypot(c-o.x,f-o.y)>o.radius-.75?(Zf(n),"miss"):(n.splits.push(n.elapsed-i*(1-l)),n.nextGate++,s.power=Math.min(100,s.power+12),n.nextGate===n.course.gates.length?(n.elapsed-=i*(1-l),Object.assign(s,{distance:o.s,x:c,altitude:f}),n.finished=!0,Us(n,!0),"finish"):(Us(n,!0),"gate"))}return Us(n),null}function c1(n,e){if(!(n!=null&&n.length)||e<0||e>n.at(-1)[0])return null;let t=0,i=n.length-1;for(;t<i;){const o=Math.ceil((t+i)/2);n[o][0]<=e?t=o:i=o-1}const s=n[t],r=n[Math.min(t+1,n.length-1)],a=r[8]||r[0]===s[0]?0:lt((e-s[0])/(r[0]-s[0]),0,1);return s.map((o,l)=>l>5?o:Wt(o,r[l],a))}function Ii(n){if(!Number.isFinite(n))return"—";const e=Math.round(n*1e3);return`${Math.floor(e/6e4)}:${String(Math.floor(e/1e3)%60).padStart(2,"0")}.${String(e%1e3).padStart(3,"0")}`}function h1(n){var i,s;const e=n.nextGate-1,t=(s=(i=n.ghost)==null?void 0:i.splits)==null?void 0:s[e];return e>=0&&Number.isFinite(t)?n.splits[e]-t:null}class f1{constructor(e){this.sessions={};try{this.storage=e||globalThis.localStorage;const t=JSON.parse(this.storage.getItem("mcw-races-v2"));for(const i of Object.keys(Or)){const s=t==null?void 0:t[i];if(!s||!Number.isInteger(s.seed)||s.seed<0||s.seed>4294967295||!Array.isArray(s.best))continue;const r=Md(i,s.seed);this.sessions[i]={seed:s.seed,best:[0,1].map(a=>u1(s.best[a],r)?s.best[a]:null)}}}catch{}}get(e){var t;return(t=this.sessions)[e]||(t[e]={seed:Math.floor(Math.random()*4294967295),best:[null,null]})}regenerate(e){const t=this.get(e).seed;this.sessions[e]={seed:t+104729>>>0,best:[null,null]},this.save()}complete(e){const t=this.get(e.course.level),i=t.best[e.player];return!e.finished||e.dnf||t.seed!==e.course.seed||i&&e.elapsed>=i.time?!1:(t.best[e.player]={time:e.elapsed,splits:e.splits.slice(),samples:e.samples.map(s=>s.slice())},this.save(),!0)}save(){try{this.storage.setItem("mcw-races-v2",JSON.stringify(this.sessions))}catch{}}}function u1(n,e){if(!n||!Number.isFinite(n.time)||n.time<=0||n.time>_d||!Array.isArray(n.samples)||n.samples.length<2||n.samples.length>12e3||n.splits!==void 0&&(!Array.isArray(n.splits)||n.splits.length!==e.gates.length||n.splits.some((i,s)=>!Number.isFinite(i)||i<=(n.splits[s-1]||0)||i>n.time)))return!1;let t=-1;for(const i of n.samples){if(!Array.isArray(i)||i.length<8||i.length>9||!i.every(Number.isFinite)||i[0]<=t||i[0]>n.time||Math.abs(i[1])>54||i[2]<1||i[2]>54||i[3]<0||i[3]>e.length||Math.abs(i[4])>56||Math.abs(i[5])>29||i[6]<0||i[6]>.85||Math.abs(i[7])!==1)return!1;t=i[0]}return n.samples[0][0]===0&&Math.abs(t-n.time)<.001&&n.samples.at(-1)[3]===e.length}class d1{constructor(e){this.scene=e,this.gates=[],this.ghost=fd(),this.ghostMaterial=new Lt({color:"#89ffff",transparent:!0,opacity:.65,depthWrite:!1,fog:!1}),this.ghost.root.traverse(t=>{t.isMesh&&(t.material=this.ghostMaterial,t.castShadow=!1)}),this.ghostHalos=["#ff66ae","#46ffe7"].map(t=>{const i=mc(t,13);return i.position.y=.5,this.ghost.root.add(i),i}),this.ghost.root.visible=!1,e.add(this.ghost.root)}clear(){for(const e of this.gates)this.scene.remove(e),e.traverse(t=>{t.isMesh&&(t.geometry.dispose(),t.material.dispose())});this.gates=[],this.ghost.root.visible=!1}start(e,t){this.clear(),this.ghostMaterial.color.set(t===0?"#ff66ae":"#46ffe7").multiplyScalar(5),this.ghostHalos.forEach((i,s)=>i.visible=s===t),e.gates.forEach((i,s)=>{const r=new ct,a=s===e.gates.length-1,o=a?16:1;for(let u=0;u<o;u++){const h=new Lt({color:a?u%2?"#162431":"#fff6dc":"#ffd77e"}),d=new at(new pi(i.radius,a?.65:.38,6,a?8:72,Math.PI*2/o),h);d.rotation.z=u*Math.PI*2/o,r.add(d)}if(!a){const u=new at(new pi(i.radius,.62,6,72),new Lt({color:"#142c35"}));u.position.z=-.55,r.add(u)}const l=new at(new to(1.6,3,3),new Lt({color:"#fff6dc"}));l.position.y=i.radius+4,l.rotation.z=Math.PI,r.add(l);const c=new os(new ps(.55),new Lt({color:"#c3ffe6",fog:!1}),12),f=new Rt;for(let u=0;u<12;u++){const h=u/12*Math.PI*2;f.position.set(Math.cos(h)*(i.radius+1.6),Math.sin(h)*(i.radius+1.6),0),f.rotation.z=h,f.scale.set(.65,1.8,.65),f.updateMatrix(),c.setMatrixAt(u,f.matrix)}r.add(c),r.userData.runes=c,r.userData.pointer=l,this.scene.add(r),this.gates.push(r)})}update(e){var i;if(!e)return;this.gates.forEach((s,r)=>{const a=e.course.gates[r];s.visible=r>=e.nextGate&&a.s-e.run.distance<520,Tt(s,a.x,a.s,a.y,e.run.distance);const o=r===e.nextGate;r<this.gates.length-1&&s.children[0].material.color.set(o?"#a6ffe3":"#cfaa68").multiplyScalar(o?3.3:1),s.userData.runes.visible=o,s.userData.runes.rotation.z=e.elapsed*.35,s.userData.runes.material.color.set(r===this.gates.length-1?"#ffd99c":"#a6ffe3").multiplyScalar(3.5),s.userData.pointer.position.y=a.radius+4+Math.sin(e.elapsed*3)*.7});const t=e.countdown===0?c1((i=e.ghost)==null?void 0:i.samples,e.elapsed):null;if(this.ghost.root.visible=!!t&&!e.finished&&!e.dnf&&Math.abs(t[3]-e.run.distance)<500,!!this.ghost.root.visible){if(Tt(this.ghost.root,t[1],t[3],t[2],e.run.distance),this.ghost.body.rotation.z=-t[4]*.015,t[6]>0){const s=1-t[6]/.85;this.ghost.body.rotation.z+=s*s*(3-2*s)*Math.PI*2*t[7]}this.ghost.body.rotation.x=t[5]*.018}}}class p1{constructor(e){this.root=e,this.point=new C,this.markers=Array.from({length:4},()=>{const t=document.createElement("div");return t.className="threat-marker",e.append(t),t})}update(e,t,i,s,r){if(this.root.hidden=!s,!s)return;const a=e.filter(o=>["bandit","guard","giant"].includes(o.kind)&&o.s>t.distance-45&&o.s<t.distance+165).sort((o,l)=>Math.abs(o.s-t.distance)-Math.abs(l.s-t.distance)).slice(0,4);this.markers.forEach((o,l)=>{const c=a[l];if(o.hidden=!c,!c)return;this.point.copy(c.visual.position).project(i);const f=c.s<t.distance,u=f?c.x<t.x?-.95:.95:Math.max(-.9,Math.min(.9,this.point.x)),h=f?-.1:Math.max(-.4,Math.min(.5,this.point.y));o.style.left=(u+1)*50+"%",o.style.top=(1-h)*50+"%",o.classList.toggle("firing",!!c.aimTargets);const d=Math.round(Math.hypot(c.x-t.x,c.y-t.altitude,c.s-t.distance));o.textContent=`${c.x<t.x?"‹":"›"} ${c.kind==="guard"?"TOWER":c.kind==="giant"?"GIANT":"ARCHER"} · ${d}m`,o.style.setProperty("--pulse",String(1+Math.sin(r*7+l)*.08))})}}const k=n=>document.getElementById(n),Ni=k("world");let mi;try{mi=new q_({canvas:Ni,antialias:!0,powerPreference:"high-performance"})}catch{throw k("loading").innerHTML="<p>This carpet needs WebGL 2 to fly.</p><p>Please enable hardware acceleration or try a current Chrome, Edge, Firefox or Safari browser.</p>",new Error("WebGL renderer unavailable")}mi.setPixelRatio(Math.min(devicePixelRatio,1.65));mi.setSize(innerWidth,innerHeight);mi.shadowMap.enabled=!0;mi.shadowMap.type=ru;mi.outputColorSpace=mn;mi.toneMapping=Dn;const pt=new ac;pt.fog=new Dc("#c7d8c5",185,480);pt.background=new Ae("#292330");const Nt=new gn(49,innerWidth/innerHeight,.2,1100),Kc=new VM(mi,Nt),gc=new Ym("#f7dba6","#655581",1);pt.add(gc);const Da=new Vu("#ffd3a0",0,85,1.5);pt.add(Da);const on=new Km("#fff0c7",1.9);on.position.set(-60,65,25);on.castShadow=!0;on.shadow.mapSize.set(2048,2048);Object.assign(on.shadow.camera,{left:-90,right:90,top:75,bottom:-85,near:1,far:230});on.shadow.bias=-7e-4;on.shadow.normalBias=.3;on.target.position.set(0,0,-28);pt.add(on,on.target);const bd=$n("#dca773"),Zc=new at(new Ui(Ue,96,64),bd);Zc.position.y=-Ue-1;Zc.receiveShadow=!0;pt.add(Zc);const gl=dM(pt),Kt=fd();pt.add(Kt.root,Kt.shadow);const Ja=new WM(pt),$i=new YM(pt),js=new a1(pt,Math.min(devicePixelRatio,1.65)),xn=new Map,Jc=[],Ri=[],Sd=[],ut=new OM,Br=new f1,co=new d1(pt);let Oe=null,Fi="easy",Bi=0,Be="menu",N=oo(),Ft=0,Jf=performance.now(),xl=0,Xs=90,Ua=0,is=0,ss=0,zs=0,Un=!1,xc=!1,Qf=0,wr=0,Na=0,Fa=0,ts=0,wa=0,Tr=0,vc={},Gr=!0;const zt=new i1(pt,xn,Jc,Sd,{sound:ut,blood:Ja,magic:js,particles:zr,notify:cn,hurt:Td,spotted(n){!Oe&&nM(N)&&cn((n.kind==="guard"?"TOWER ARCHER":"BANDIT AMBUSH")+" · RIGHT CLICK TO BEND TIME",2,3)},parried(){N.parryFlash=.2},tray:jc,arena:v1,hit(){wr=.13,k("crosshair").classList.add("hit")},bossUI(n){if(k("boss-hud").hidden=!n,!n)return;k("boss-name").textContent=n.name,k("boss-health").style.width=Math.max(0,n.hp/n.maxHp*100)+"%",k("boss-health-track").setAttribute("aria-valuenow",Math.round(n.hp/n.maxHp*100));const e=Math.round(n.s-N.distance);k("boss-phase").textContent=(n.shield?`${n.sigils.filter(t=>t.active).length} WARDS · `:n.phase===2?"ENRAGED · ":"")+(e<0?`${-e}m BEHIND · KEEP BOOSTING`:`${e}m AHEAD · ATTACK OR PASS`)}}),Ki=1/90;let ho=new oe(0,.03),ni=0,Oa=0;const Jt=new Set;try{ni=Number(localStorage.getItem("mcw-best"))||0,Oa=Number(localStorage.getItem("mcw-score"))||0}catch{}k("menu-best").textContent=ni?`${Math.floor(ni).toLocaleString()} m`:"Your story starts here";const vl=new C,_l=new C,jf=new C(-19,1,-35),Cn=new os(yt,new Lt({color:"#ffffff"}),240);Cn.instanceMatrix.setUsage(es);Cn.count=0;Cn.frustumCulled=!1;pt.add(Cn);const ri=new Rt,m1=new Ae,Ai=[],Qc=[];for(const n of[-1,1]){const e=new vt,t=new Float32Array(192),i=new Float32Array(192),s=[];for(let a=0;a<31;a++){const o=a*2;s.push(o,o+1,o+2,o+1,o+3,o+2)}e.setAttribute("position",new Ht(t,3)),e.setAttribute("color",new Ht(i,3)),e.setIndex(s);const r=new at(e,new Lt({color:"#c0fff3",vertexColors:!0,side:Sn,transparent:!0,opacity:.55,depthWrite:!1,blending:Ar}));r.frustumCulled=!1,pt.add(r),Qc.push({side:n,visual:r,positions:t,colors:i})}const Ti=new r1(pt),g1=new p1(k("threat-radar")),_r=new IM(pt,{warn(n,e){cn(`${n} · ${e==="axes"?"WEAVE BETWEEN THE SWINGING BLADES":e==="volcano"?"RISING LAVA · WATCH THE BRIGHT VENTS":"FOLLOW THE GLOWING OPENINGS"}`,5,6),ut.roar()},erupt(){ut.impact("fire")},complete(){hn(N,1500,35),cn("GAUNTLET SURVIVED · +1,500 · +SKYFIRE",4,6),ut.victory()}});function cn(n,e=2.2,t=0){ss>0&&t<Qf||(Qf=t,k("toast").textContent=n,k("toast").classList.add("show"),ss=e)}function x1(n){const e=wn[n];k("zone-banner").querySelector("strong").textContent=e.name,k("zone-banner").querySelector("em").textContent=e.subtitle,k("zone-banner").classList.add("show"),is=4}function jc(){k("spell-tray").replaceChildren();for(const[n,e]of Object.entries(N.spells))if(e){const t=document.createElement("div");t.className="spell"+(n===N.weapon?" selected":""),t.style.setProperty("--spell-color",In[n].color),t.title=`${In[n].description} · level ${e}`,t.innerHTML=`<b>${In[n].glyph}</b><span>${In[n].name.toUpperCase()}</span><small>${ns.includes(n)?ns.indexOf(n)+1+" · ":""}LV ${e}</small>`,k("spell-tray").append(t)}}function Ed(){_r.clear(),ut.clearEffects(),$i.clear(),k("milestone-banner").hidden=!0,document.body.classList.remove("milestone-glow","milestone-grand"),Tr=0,k("boss-veil").style.opacity="0",co.clear(),zt.clear(),Ja.clear(),js.clear();for(const n of xn.values()){pt.remove(n.visual),pd(n.visual);for(const e of[...n.pickups,...n.enemies,...n.rings,...n.props||[]])pt.remove(e.visual)}xn.clear();for(const n of[Jc,Sd])n.forEach(e=>pt.remove(e.visual)),n.length=0;Ri.length=0,Cn.count=0,Ai.length=0,Qc.forEach(n=>n.visual.visible=!1)}function eh(n,e){const t=Math.floor(n/gt);for(const[i,s]of xn)if(i<t-2||i>t+8){pt.remove(s.visual),pd(s.visual);for(const r of[...s.pickups,...s.rings,...s.props||[]])pt.remove(r.visual);for(const r of s.enemies)zt.retainEnemy(r,n)||pt.remove(r.visual);xn.delete(i)}for(let i=Math.max(0,t-2);i<=t+8;i++){if(xn.has(i))continue;const s=Oe?Oe.collisionChunks[i]||yd(i,Oe.course):oM(i,e);s.combatClear=!!zt.boss&&!s.gauntlet,s.arenaBlend=s.combatClear?1:0,s.visual=MM(s,e,s.combatClear),pt.add(s.visual);for(const r of s.props||[])r.visual=SM(r.kind,r.large),r.visual.visible=r.active,pt.add(r.visual);for(const r of s.pickups)r.visual=pc(r.kind),pt.add(r.visual),r.active=!0;for(const r of s.enemies)r.visual=dd(r.kind),pt.add(r.visual),r.active=!0,r.baseX=r.x,r.baseY=r.y,r.baseS=r.s,r.radius||(r.radius=2.4),r.maxHp=r.hp,r.cooldown=.85+(r.spawnDelay||0),r.frozen=0;for(const r of s.rings)r.visual=wM(r.radius),pt.add(r.visual),r.active=!0;xn.set(i,s)}}function v1(n){if(n){Tr=1.8,N.invulnerable=Math.max(N.invulnerable,1.8),is=0,k("zone-banner").classList.remove("show");for(const e of xn.values())for(const t of e.obstacles)t.s>N.distance&&t.s<N.distance+160&&js.emit(t.x,t.height*.4,t.s,"#dab18a",12,1.8)}for(const e of xn.values())if(!e.gauntlet&&(e.combatClear=!0,!n))for(const t of e.enemies)t.active=!1,t.visual.visible=!1}function Ys(n="adventure"){Gr=!0,ut.setPaused(!1),ut.start(),Ed(),n!=="race"&&(Oe=null),N=Oe?Oe.run:oo(Math.floor(Math.random()*1e6)),Be="playing",Ua=0,document.body.classList.toggle("racing",!!Oe),Oe&&(Ft=0,co.start(Oe.course,Oe.player)),Jt.clear(),Un=!1,is=ss=zs=wr=ts=Na=Fa=0,k("damage-flash").style.opacity="0",k("crosshair").classList.remove("hit","locked");for(const e of["start-screen","end-screen","pause-screen","help-screen","menu-footer","race-setup","race-results"])k(e).hidden=!0;for(const e of["hud","pause","crosshair"])k(e).hidden=!1;document.body.classList.add("playing"),k("zone-banner").classList.remove("show"),jc(),eh(0,N.seed),k("race-hud").hidden=!Oe,k("race-countdown").hidden=!Oe,k("pause-restart").textContent=Oe?"Retry this course":"Start a fresh journey",cn(Oe?"Fly through every gate · skim low · SHIFT to boost":"1 Fireball · 2 Lightning · 3 Wind blast · hold click to cast",5),Ni.focus(),wd()}function er(){Be==="playing"&&(ut.setPaused(!0),Be="paused",ts=0,Jt.clear(),Un=!1,k("pause-screen").hidden=!1,k("crosshair").hidden=!0,document.body.classList.remove("playing","boosting"),k("resume").focus())}function th(){Be==="paused"&&(ut.setPaused(!1),Be="playing",ts=0,k("pause-screen").hidden=!0,k("crosshair").hidden=!1,document.body.classList.add("playing"))}function _1(){Be="ended",Un=!1,Jt.clear(),k("end-screen").hidden=!1,k("hud").hidden=!0,k("pause").hidden=!0,k("crosshair").hidden=!0,document.body.classList.remove("playing","boosting"),k("end-distance").textContent=Math.floor(N.distance).toLocaleString(),k("end-score").textContent=Math.floor(N.score).toLocaleString(),k("end-combo").textContent=`×${N.bestChain}`,k("end-copy").textContent=`${N.kills} monsters slain · ${N.bosses} bosses defeated · ${N.tricks} sky rolls`,k("end-best").textContent=N.distance>ni?"✦ A new farthest horizon":`Farthest horizon · ${Math.floor(ni).toLocaleString()} m`,ni=Math.max(ni,N.distance),Oa=Math.max(Oa,N.score);try{localStorage.setItem("mcw-best",String(ni)),localStorage.setItem("mcw-score",String(Oa))}catch{}k("menu-best").textContent=`${Math.floor(ni).toLocaleString()} m`,k("restart").focus()}function Hr(){Be="menu",Ed(),Oe=null,N=oo(),Xs=90,ss=is=0,["end-screen","hud","pause","crosshair","pause-screen","race-setup","race-results","race-hud","race-countdown"].forEach(n=>k(n).hidden=!0),k("start-screen").hidden=k("menu-footer").hidden=!1,k("zone-banner").classList.remove("show"),k("toast").classList.remove("show"),document.body.classList.remove("playing","racing","boosting"),k("start").focus()}function nh(){Hr(),Be="race-setup",k("start-screen").hidden=!0,k("race-setup").hidden=!1,Gr=!0,ut.setPaused(!1),ut.start(),fo(),k("race-start").focus()}function fo(){var t;const n=Br.get(Fi),e=Or[Fi];for(const i of Object.keys(Or))k("race-"+i).setAttribute("aria-pressed",String(i===Fi));k("race-description").textContent=`${e.description} · ${e.length.toLocaleString()} m`,k("race-course").textContent=`COURSE ${n.seed.toString(36).toUpperCase()} · SAME COURSE FOR BOTH RIDERS`;for(let i=0;i<2;i++)k("race-p"+(i+1)).textContent=Ii((t=n.best[i])==null?void 0:t.time);k("race-start").textContent=`Player ${Bi+1} · Ready to race ↗`}function qs(n=Bi){const e=Br.get(Fi);Oe=o1(Md(Fi,e.seed),n,e.best[1-n]),Ys("race")}function M1(){var i,s;const n=Oe,e=Br.complete(n);Be="race-ended",Bi=1-n.player,Un=!1,Jt.clear();for(const r of["hud","pause","crosshair","race-countdown"])k(r).hidden=!0;document.body.classList.remove("playing","boosting"),k("race-results").hidden=!1,k("race-result-title").textContent=n.dnf?"Time’s up.":e?"Personal best!":"Across the line.",k("race-result-time").textContent=n.dnf?"DNF":Ii(n.elapsed),k("race-result-copy").textContent=`Player ${n.player+1} · ${n.course.name} · ${n.crashes} resets${n.dnf?" · 3 minute limit":""}`;const t=Br.get(Fi).best;k("race-result-scores").textContent=`P1 ${Ii((i=t[0])==null?void 0:i.time)}   /   P2 ${Ii((s=t[1])==null?void 0:s.time)}`,k("race-result-leader").textContent=t.every(Boolean)?Math.abs(t[0].time-t[1].time)<5e-4?"A dead heat. Settle it on the next run.":`Player ${t[0].time<t[1].time?1:2} leads by ${Ii(Math.abs(t[0].time-t[1].time))}`:"Your opponent’s best finished run becomes your ghost.",k("race-next").textContent=`Pass to Player ${Bi+1} ↗`,k("race-retry").textContent=`Retry · Player ${n.player+1}`,k("race-next").focus(),co.update(n)}function wd(){if(!Oe)return;const n=Oe,e=n.course.gates[n.nextGate];k("race-timer").textContent=Ii(n.elapsed),k("race-rider").textContent=`PLAYER ${n.player+1} · ${n.course.name.toUpperCase()}`,k("race-target").textContent=e?`${n.nextGate===n.course.gates.length-1?"FINISH":"GATE "+(n.nextGate+1)+" / "+n.course.gates.length} · ${Math.max(0,Math.ceil(e.s-N.distance))} m · ${Math.round(e.y)} m HIGH`:"FINISHED",k("race-ghost-label").textContent=n.ghost?`P${2-n.player} GHOST · ${Ii(n.ghost.time)}`:"NO OPPONENT GHOST YET · SET THE FIRST TIME";const t=h1(n),i=t!==null?`GATE ${n.nextGate} · ${t<=0?"−":"+"}${Math.abs(t).toFixed(3)}s · ${Math.abs(t)<5e-4?"LEVEL":t<0?"AHEAD":"BEHIND"}`:n.nextGate?`GATE ${n.nextGate} · ${Ii(n.splits.at(-1))} · +12 SKYFIRE`:"CHECKPOINTS REFILL SKYFIRE · R TO RETRY";k("race-split").textContent!==i&&(k("race-split").textContent=i),k("race-split").classList.toggle("behind",t>0);const s=n.countdown>0?String(Math.ceil(n.countdown)):n.elapsed<.65?"GO!":"";k("race-countdown").hidden=!s||Be!=="playing",k("race-countdown").textContent!==s&&(k("race-countdown").textContent=s)}function y1(n){const e=l1(Oe,n,Ki);if((e==="crash"||e==="miss")&&(Ai.length=0,ut.hit(),zs=.3,k("damage-flash").style.opacity="1",cn(e==="miss"?"Missed gate · back to checkpoint":"Clipped it · back to checkpoint",1.6,3)),e==="gate"||e==="finish"){const t=Oe.course.gates[Oe.nextGate-1];e==="finish"?ut.victory():ut.trick(),js.checkpoint(t.x,t.y,t.s,t.radius,e==="finish"),e==="gate"&&cn(`GATE ${Oe.nextGate} CLEARED · +12 SKYFIRE`,1.2,2)}(e==="finish"||e==="timeout")&&M1()}function b1(){k("help-screen").hidden&&(xc=Be==="playing",xc&&er(),k("pause-screen").hidden=!0,k("help-screen").hidden=!1,k("close-help").focus())}function ih(){k("help-screen").hidden=!0,xc?th():Be==="paused"&&(k("pause-screen").hidden=!1)}k("start").onclick=()=>Ys();k("restart").onclick=()=>Ys();k("pause-restart").onclick=()=>Oe?qs(Oe.player):Ys();k("resume").onclick=th;k("pause").onclick=er;k("back-menu").onclick=Hr;k("race-button").onclick=nh;k("race-start").onclick=()=>qs();k("race-next").onclick=()=>qs();k("race-retry").onclick=()=>qs(Oe.player);k("race-change").onclick=nh;k("race-back").onclick=Hr;k("race-home").onclick=Hr;k("pause-menu").onclick=()=>Oe?nh():Hr();k("race-new").onclick=()=>{Br.regenerate(Fi),Bi=0,fo()};k("race-swap").onclick=()=>{Bi=1-Bi,fo()};for(const n of Object.keys(Or))k("race-"+n).onclick=()=>{Fi=n,Bi=0,fo()};k("help-button").onclick=b1;k("close-help").onclick=ih;k("guide-fly").onclick=ih;function uo(){k("sound").classList.toggle("sound-on",ut.enabled),k("sound").setAttribute("aria-label",ut.enabled?"Mute sound":"Enable ambience and effects"),k("sound").setAttribute("aria-pressed",String(ut.enabled)),k("sound").title=ut.status(),k("audio-status").textContent=ut.status(),k("audio-controls").hidden=!["menu","paused"].includes(Be)||!k("help-screen").hidden;for(const n of["ambience","effects"]){const e=Math.round(ut[n+"Volume"]*100);k(n+"-volume").value=e,k(n+"-level").textContent=e+"%"}}k("sound").onclick=async()=>{await ut.toggle(),uo()};for(const n of["ambience","effects"])k(n+"-volume").addEventListener("input",e=>{ut.setVolume(n,Number(e.target.value)/100),uo()});uo();document.addEventListener("keydown",n=>{var t;const e=["BUTTON","INPUT","SUMMARY"].includes((t=n.target)==null?void 0:t.tagName);if(!e&&["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(n.code)&&n.preventDefault(),!n.repeat){if(n.code==="KeyR"&&!e&&k("help-screen").hidden&&["playing","paused","ended","race-ended"].includes(Be)){n.preventDefault(),Oe?qs(Oe.player):Ys();return}if(n.code==="Escape"||n.code==="KeyP"){k("help-screen").hidden?Be==="playing"?er():Be==="paused"&&th():ih();return}if(n.code==="Enter"&&!e&&k("help-screen").hidden&&(Be==="menu"||Be==="ended")){n.preventDefault(),Ys();return}if(n.code==="Enter"&&!e&&k("help-screen").hidden&&["race-setup","race-ended"].includes(Be)){n.preventDefault(),qs();return}if(n.code==="KeyM"&&k("sound").click(),Be==="playing"){const i={Digit1:"fire",Digit2:"storm",Digit3:"wind"}[n.code];i&&zt.switchWeapon(N,i),n.code==="KeyQ"&&zt.switchWeapon(N,ns[(ns.indexOf(N.weapon)+1)%ns.length])}n.code==="Space"&&Be==="playing"&&N.altitude<4&&cn("Climb above 4m to barrel roll",1.5)}Jt.add(n.code)});document.addEventListener("keyup",n=>Jt.delete(n.code));window.addEventListener("blur",()=>{Gr=!1,ut.setPaused(!0),er()});window.addEventListener("focus",()=>{Gr=!0,ut.setPaused(Be==="paused"||!k("help-screen").hidden)});document.addEventListener("visibilitychange",()=>{ut.setPaused(document.hidden||Be==="paused"),document.hidden&&er()});window.addEventListener("pointermove",n=>{ho.set(n.clientX/innerWidth*2-1,-(n.clientY/innerHeight)*2+1),k("crosshair").style.left=`${n.clientX}px`,k("crosshair").style.top=`${n.clientY}px`});Ni.addEventListener("pointerdown",n=>{n.button===2&&Be==="playing"&&(!Oe||!Oe.countdown)&&(n.preventDefault(),tM(N)||cn("HOURGLASS EMPTY · EARN SKYFIRE TO REFILL",1.5,2)),n.button===0&&Be==="playing"&&(n.preventDefault(),Un=!0,N.parryPress=N.time,zt.parry(N,ho,Nt),Ni.setPointerCapture&&Ni.setPointerCapture(n.pointerId))});window.addEventListener("pointerup",n=>{n.button!==2&&(Un=!1)});Ni.addEventListener("contextmenu",n=>n.preventDefault());window.addEventListener("pointercancel",()=>Un=!1);Ni.addEventListener("lostpointercapture",()=>Un=!1);document.addEventListener("selectstart",n=>{Be==="playing"&&n.preventDefault()});document.addEventListener("dragstart",n=>{Be==="playing"&&n.preventDefault()});window.addEventListener("resize",()=>{Nt.aspect=innerWidth/innerHeight,Nt.updateProjectionMatrix(),mi.setSize(innerWidth,innerHeight),Kc.resize()});Ni.addEventListener("webglcontextlost",n=>{n.preventDefault(),er(),k("loading").hidden=!1,k("loading").style.opacity="1",k("loading").innerHTML="<p>The sky needs a moment.</p><p>Reload this page to restore the graphics.</p>"});function zr(n,e,t,i,s=12){for(let r=0;r<s&&Ri.length<240;r++){const a=Math.random()*Math.PI*2,o=1+Math.random()*5;Ri.push({color:i,x:n,y:e,s:t,vx:Math.cos(a)*o,vy:Math.random()*5,vs:Math.sin(a)*o,life:.45+Math.random()*.5})}}function Td(){aM(N)&&(zs=.4,k("damage-flash").style.opacity="1",ut.hit(),zr(N.x,N.altitude,N.distance,"#ffc1a1",18),cn(N.hp===1?"One heart. You’ve got this.":"Close call · chain lost",2,3))}function eu(){zt.fire(N,ho,Nt)}function tu(n,e,t,i=e){for(const s of xn.values()){Tt(s.visual,0,s.start,0,e),s.combatClear&&(s.arenaBlend=Math.min(1,s.arenaBlend+n/.95));const r=s.visual.userData.hazards;r.visible=s.arenaBlend<1,r.traverse(a=>{a.isMesh&&(a.material.opacity=1-s.arenaBlend,a.material.depthWrite=s.arenaBlend===0,a.castShadow=s.arenaBlend===0)});for(const a of s.props||[])a.visual.visible=a.active&&s.arenaBlend<1,a.visual.scale.setScalar((a.scale||1)*(1-s.arenaBlend)),Tt(a.visual,a.x,a.s,a.y,e);for(const a of s.pickups)if(a.active){if(t){vd(a,N,n,a.kind==="gold"?7:11)&&js.pullTrail(a,n);const o=a.kind==="gold"?3.5:5;if(Math.hypot(a.x-N.x,a.y-N.altitude,a.s-e)<o){a.active=!1,a.visual.visible=!1,a.kind==="gold"?(hn(N,15,2,!1),N.chain&&(N.chainTimer=Math.max(N.chainTimer,3)),ut.collect()):zt.collect(N,a.kind),zr(a.x,a.y,a.s,a.kind==="gold"?"#ffe5a6":In[a.kind].color,a.kind==="gold"?4:20);continue}}Tt(a.visual,a.x,a.s,a.y+Math.sin(Ft*2+a.s)*.18,e),a.visual.rotation.y=a.kind==="gold"?Ft*2+a.s:Math.sin(Ft*1.8+a.s)*.2}for(const a of s.rings)a.active&&(Tt(a.visual,a.x,a.s,a.y,e),a.visual.rotation.z=Ft*.2,t&&Math.abs(a.s-e)<1.8&&Math.hypot(a.x-N.x,a.y-N.altitude)<a.radius-.45&&(a.active=!1,a.visual.visible=!1,hn(N,120,14),ut.trick(),cn(`Thread the needle · +${120*Ws(N)}`,1.5),zr(a.x,a.y,a.s,"#ffdf92",24)));for(const a of s.enemies)zt.updateEnemy(a,n,e,N,t,Ft);if(t&&!Oe&&!s.combatClear)for(const a of s.obstacles)!a.near&&lM(N,a)&&(a.near=!0,N.nearMisses++,hn(N,70,9),cn("Silk-thin escape · +skyfire",1.1),ut.collect())}t&&!Oe&&zt.update(n,N,i)}function S1(n,e){for(let t=Ri.length-1;t>=0;t--){const i=Ri[t];if(i.life-=n,i.life<=0){Ri.splice(t,1);continue}i.x+=i.vx*n,i.y+=i.vy*n,i.s+=i.vs*n,i.vy-=3*n}Cn.count=Ri.length,Ri.forEach((t,i)=>{Tt(ri,t.x,t.s,t.y,e),ri.scale.setScalar(t.life*.22),ri.rotation.z=Ft*3,ri.updateMatrix(),Cn.setMatrixAt(i,ri.matrix),Cn.setColorAt(i,m1.set(t.color))}),Cn.instanceMatrix.needsUpdate=!0,Cn.instanceColor&&(Cn.instanceColor.needsUpdate=!0)}function Qa(n){var e;return!Oe&&!zt.boss&&!((e=xn.get(Math.floor(n/gt)))!=null&&e.combatClear)&&Nr(n)}function E1(n,e){var v,E;const t=wn[Oe?Oe.course.zone:Fr(e)],i=Be==="menu"?.14:N.time/150+.14,s=(Math.sin(i*Math.PI*2)+1)/2,r=1-Di.smoothstep(s,.12,.6),a=s1(Be==="menu"?0:N.time,t.type),{sand:o,rain:l,storm:c,wind:f}=a;vc={zone:t.type,altitude:Be==="menu"?8:N.altitude,speed:N.speed,night:r,rain:l,sand:o,boost:N.boost,wind:f};const u=od(Oe?Oe.course.zone*Li:e,N.seed),h=w=>new Ae(w).offsetHSL(u.hue,u.saturation,u.lightness),d=h(t.sky).lerp(new Ae("#407677"),.32).lerp(new Ae("#202d55"),r),m=h(t.fog).lerp(new Ae("#eba777"),(1-Math.abs(s*2-1))*.26).lerp(new Ae("#646086"),r);o&&m.lerp(new Ae("#c79562"),.72),l&&d.lerp(new Ae("#40536a"),c?.8:.5),gl.uniforms.top.value.lerp(d,n*.5),gl.uniforms.bottom.value.lerp(m,n*.5),pt.fog.color.lerp(m,n*.5),pt.fog.far=Wt(pt.fog.far,o?200:c?250:l?340:480,n*.3),bd.color.lerp(h(t.ground),n*.5);const _=Qa(e);Da.intensity=Wt(Da.intensity,_?45:0,1-Math.exp(-n*4)),Tt(Da,N.x*.35,e+15,15,e),on.position.y=65+_n(e),on.target.position.y=_n(e),gc.intensity=Wt(gc.intensity,_?.48:1.05-r*.28,n*2),on.intensity=Wt(on.intensity,_?.45:1.85-r*.85,n*2),on.color.lerp(new Ae(r>.5?"#b5c9fa":"#ffe1b1"),n*.5);const g=e-Ue*Math.atan2(Nt.position.z,Ue+Nt.position.y),p=Qa(g),M=!!p&&Math.abs(Nt.position.x)<p.halfWidth&&Nt.position.y-_n(g)<p.ceiling,x=zM(t.type,{daylight:s,night:r,enclosed:M,rain:l,sand:o,slow:N.slow});return Kc.setLook(x,n,Ft),pM(gl,n,{camera:Nt,night:r,daylight:s,wind:f,enclosed:M,aura:x.aura,time:Ft}),Ti.update(Ft,e,Be==="menu"?0:N.x,Be==="menu"?8:N.altitude,t.type,a)&&ut.thunder(),Ti.leaves.visible=Ti.rain.visible=Ti.sand.visible=!_,Ti.gusts.visible=!_,(v=Ti.rain).visible&&(v.visible=a.rain),(E=Ti.sand).visible&&(E.visible=a.sand),on.intensity+=Ti.flash*n*12,`${r>.6?"☾ MOONLIT":s>.85?"✦ DAYLIGHT":"✦ GOLDEN HOUR"} · ${o?"SANDSTORM":c?"THUNDERSTORM":l?"DRIVING RAIN":f>.5?"SWIRLING WINDS":"CLEAR SKIES"}`}function w1(n,e){const t=Be==="menu"?8:N.x,i=Be==="menu"?7+Math.sin(Ft*.8)*.5:N.altitude;Kt.root.position.set(t,i+_n(Be==="menu"?Xs:N.distance)-t*t/(2*Ue),0);const s=1-N.roll/.85,r=N.roll>0?s*s*(3-2*s)*Math.PI*2*N.rollDirection:0;Kt.body.rotation.z=Wt(Kt.body.rotation.z,lt(-N.vx*.015,-.7,.7)-t/Ue,1-Math.exp(-18*n)),Kt.root.rotation.z=r,Kt.body.rotation.x=Wt(Kt.body.rotation.x,N.vy*.018,1-Math.exp(-16*n)),Kt.body.rotation.y=Wt(Kt.body.rotation.y,lt(-N.vx*.009,-.45,.45),1-Math.exp(-16*n)),Kt.root.visible=!(e&&N.invulnerable>0&&Math.floor(Ft*12)%3===0);const a=Kt.fabric.geometry.attributes.position;for(let o=0;o<a.count;o++){const l=a.getX(o),c=a.getZ(o);a.setY(o,Math.sin(c*1.7+Ft*5)*.075+Math.pow(Math.abs(c)/2.65,5)*(.22+Math.sin(Ft*4)*.08)+Math.pow(Math.abs(l)/1.85,4)*.08)}if(a.needsUpdate=!0,Kt.fabric.geometry.computeVertexNormals(),ud(Kt,N,Ft,n),Kt.shadow.position.set(t,.12+_n(Be==="menu"?Xs:N.distance)-t*t/(2*Ue),0),Kt.shadow.scale.setScalar(1+i*.035),Kt.shadow.material.opacity=lt(.23-i*.004,.06,.23),Fa+=e?n:0,e&&Fa>=1/35){Fa%=1/35;const o=N.railing?"#b1ffda":N.boost?"#a4e9e0":"#edbf78";zr(t+(Math.random()-.5)*2.7,i-.15,N.distance-2.3,o,N.boost?2:1)}}function T1(n,e,t){t&&(Na+=n,Na>=1/60&&(Na%=1/60,Ai.unshift({x:N.x,y:N.altitude,s:e-2.4}),Ai.length>32&&Ai.pop()));for(const i of Qc)if(i.visual.visible=Ai.length>2&&Be!=="menu",!!i.visual.visible){i.visual.material.opacity=N.boost?.72:.22;for(let s=0;s<32;s++){const r=Ai[Math.min(s,Ai.length-1)],a=1-s/31;Tt(ri,r.x+i.side*1.5,r.s,r.y,e);const o=(N.boost?.22:.1)*a;for(let l=0;l<2;l++){const c=s*6+l*3;i.positions[c]=ri.position.x+(l?o:-o),i.positions[c+1]=ri.position.y,i.positions[c+2]=ri.position.z,i.colors[c]=a*(N.boost?.6:1),i.colors[c+1]=a*.9,i.colors[c+2]=a*(N.boost?1:.5)}}i.visual.geometry.attributes.position.needsUpdate=!0,i.visual.geometry.attributes.color.needsUpdate=!0}}function A1(n){if(Be==="menu")vl.set(11+Math.sin(Ft*.08)*3,26,48),_l.set(-19,1,-35);else{const t=N.x*N.x/(2*Ue)-_n(N.distance),i=Qa(N.distance)?Math.min(28,7.5+N.altitude*.82):7.5+N.altitude*.82;vl.set(N.x*.96+1.2,i-t,N.boost?23:22),_l.set(N.x+N.vx*.12,1.5+N.altitude*.72-t,-45)}const e=Be==="menu"?4:10;Nt.position.lerp(vl,1-Math.exp(-n*e)),jf.lerp(_l,1-Math.exp(-n*e)),Nt.lookAt(jf),Be==="playing"&&(Nt.position.x+=Math.sin(Ft*77)*zt.shake*.35,Nt.position.y+=Math.cos(Ft*91)*zt.shake*.25),Nt.fov=Wt(Nt.fov,Be==="menu"?49:N.boost?78:60+lt((N.speed-40)*.2,0,10),1-Math.exp(-n*5)),Nt.updateProjectionMatrix()}function R1(n){if(uo(),k("weather").textContent=n,k("zone-name").textContent=Oe?`${Oe.course.name} · Ghost race`:wn[Fr(Be==="menu"?Xs:N.distance)].name,Be!=="playing")return;k("distance").textContent=Math.floor(N.distance).toLocaleString(),k("score").textContent=Math.floor(N.score).toLocaleString(),k("hearts").textContent=Array.from({length:3},(l,c)=>c<N.hp?"♥":"♡").join(" "),k("hearts").setAttribute("aria-label",`${N.hp} health`),k("combo").textContent=`×${Ws(N)}`,k("combo-label").textContent=N.chain?`${N.chain} MOMENTS OF MAGIC`:"FIND YOUR FLOW",k("combo-bar").style.width=`${N.chainTimer/5*100}%`,k("power-bar").style.width=`${N.power}%`,k("power-value").textContent=`${Math.floor(N.power)}%`,k("power-hint").textContent=N.boost?"Skyfire flowing · keep the chain alive":N.power>=25?"Hold SHIFT to ride the skyfire":"Skim low to gather power",k("speed-value").textContent=Math.round(N.speed*3.6*(Oe?1:id)),k("altitude").textContent=`${N.vy>1?"↑ ":N.vy<-1?"↓ ":""}${N.altitude.toFixed(1)} m above ground`,k("flight-mode").textContent=N.boost?"✦ SKYFIRE ASCENDANT":N.railing?"✦ CLIFF RIDER · +SPEED":N.altitude<3.5?"✦ GROUND EFFECT":N.roll?"✧ SILK SPIRAL":"RIDE THE WIND";const e=!Oe&&_c(N.distance),t=Fr(N.distance),i=e?(N.distance-e.start)/(e.end-e.start):N.distance%Li/Li;k("zone-progress").style.width=`${i*100}%`;const s=Yn(N.distance);k("journey-stage").textContent=e?iu[e.type]:s.respite>.6?"CATCH YOUR BREATH":s.stage,k("next-zone").textContent=e?`${Math.ceil(e.end-N.distance)} m to daylight · GAUNTLET`:`${Math.ceil(Li-N.distance%Li)} m to ${wn[(t+1)%wn.length].name}`,N.trayMagnet!==N.spells.magnet&&(N.trayMagnet=N.spells.magnet,jc()),k("combat-buffs").textContent=[...N.spells.magnet?[`MAGNET ${Math.ceil(N.magnetTime)}s · ${xd(N.spells.magnet)}m`]:[],...Object.entries(N.buffs).filter(([,l])=>l>0).map(([l,c])=>In[l].name.toUpperCase()+" "+Math.ceil(c)+"s")].join("  ·  "),k("active-spell").textContent=In[N.weapon].name.toUpperCase()+" · LV "+N.spells[N.weapon]+" · 1 / 2 / 3 OR Q";const r=lo(N.distance+140),a=Math.floor((N.distance+140)/2560),o=Qa(N.distance+200);o&&o.type!=="gauntlet"&&!zt.boss&&N.passageNotified!==o.start&&(N.passageNotified=o.start,cn("CLIFF PASSAGE AHEAD · CENTER UP · BELOW 27m",4,4)),r&&!Oe&&!zt.boss&&N.railNotified!==a&&(N.railNotified=a,cn(`CLIFF RAIL AHEAD · ${r.side>0?"RIGHT":"LEFT"} EDGE · SKIM AT 6–46m`,4,2)),k("roll-ready").textContent=N.roll?"✧ ROLLING":N.rollCooldown>0?`ROLL · ${N.rollCooldown.toFixed(1)}s`:N.altitude<4?"ROLL · CLIMB TO 4m":"SPACE · ROLL READY",document.body.classList.toggle("boosting",N.boost),k("crosshair").classList.toggle("locked",!!zt.lock(N,ho,Nt))}eh(Xs,N.seed);Nt.position.set(11,26,48);Nt.lookAt(-19,1,-35);let nu=!0;function Ad(n){var f,u;const e=Math.min((n-Jf)/1e3,.09);Jf=n;const t=Be==="paused"||!k("help-screen").hidden,i=Be==="playing"&&!t&&(!Oe||!Oe.countdown)?iM(N,e):1,s=(Oe||Be==="menu"||Be==="race-setup"?1:id)*i;document.body.classList.toggle("bending-time",i<1),N.parryFlash=Math.max(0,(N.parryFlash||0)-(t?0:e)),document.body.classList.toggle("parry-flash",N.parryFlash>0);const r=t?0:e*s;Ft+=r,Tr=Math.max(0,Tr-r);const a=1-Tr/1.8;k("boss-veil").style.opacity=String(.62*Math.max(0,Math.min(1,a/.12,(1-a)/.55))),k("boss-veil").style.setProperty("--veil-drift",`${(a-.5)*16}%`);const o=Be==="playing";if(o){const h=(Jt.has("KeyD")||Jt.has("ArrowRight")?1:0)-(Jt.has("KeyA")||Jt.has("ArrowLeft")?1:0),d=(Jt.has("KeyW")||Jt.has("ArrowUp")?1:0)-(Jt.has("KeyS")||Jt.has("ArrowDown")?1:0),m={steer:h,lift:d,controlRate:1/s,clockRate:1/i,boost:Jt.has("ShiftLeft")||Jt.has("ShiftRight"),roll:Jt.has("Space"),arena:!!zt.boss||!!((f=xn.get(Math.floor(N.distance/gt)))!=null&&f.combatClear)};for(ts=Math.min(ts+e*s,Ki*8);ts>=Ki&&!N.ended&&Be==="playing";){const g=N.distance;if(Oe)y1(m),Oe.countdown===0&&Be==="playing"&&(Un&&eu(),zt.update(Ki,N,g,!0));else{const p={x:N.x,altitude:N.altitude,distance:N.distance};rd(N,m,Ki),_r.update(N,!0,!0);const M=[...xn.values()].flatMap(md).concat(_r.solids);(RM(N,p,M)||_r.hits(p,N))&&Td(),Un&&eu(),tu(Ki,N.distance,!0,g)}ts-=Ki}for(;N.events.length;){const g=N.events.pop();cn(g==="rail"?"CLIFF RIDER · +45 · +SKYFIRE":`Silk spiral · +${90*Ws(N)} · +11 skyfire`,1.2),g!=="rail"&&ut.trick()}const _=Fr(N.distance);!Oe&&_!==Ua&&(Ua=_,!zt.boss&&!fi(N.distance,360)&&x1(Ua))}const l=Be==="menu"?Xs:N.distance;if(o&&!t&&!Oe){const h=$i.observe(N);h&&ut.milestone(h.tier),h&&(k("milestone-banner").textContent=`✦ ${h.meters.toLocaleString()} m · ${h.tier===3?"GRAND SKY FESTIVAL!":h.tier===2?"FESTIVAL OF FLIGHT!":"A THOUSAND MORE WONDERS!"} ✦`)}$i.update(o&&!t?r:0,N),document.body.classList.toggle("milestone-glow",!!$i.active),document.body.classList.toggle("milestone-grand",((u=$i.active)==null?void 0:u.tier)===3),k("milestone-banner").hidden=!$i.active||$i.active.age>5||!o,eh(l,N.seed),_r.update(N,!Oe&&Be!=="menu",!1),tu(0,l,!1),S1(r,l),w1(r,o),T1(r,l,o),A1(t?0:e),co.update(Oe),wd(),g1.update(zt.targets(),N,Nt,o&&!Oe,Ft),k("focus-bar").style.width=N.focus+"%",k("focus-meter").setAttribute("aria-valuenow",Math.round(N.focus)),k("focus-value").textContent=(N.focus*.08).toFixed(1)+"s",k("focus-state").textContent=N.slow?"TIME BENDING · RIGHT CLICK TO RELEASE":N.ambushTime>0?"AMBUSH SENSE":"RIGHT CLICK · BEND TIME";const c=E1(r,l);Ja.update(r,l),zt.render(r,l,Ft),js.update(r,Ft,l,N,Jc,vc,o),ut.update(e,{...vc,running:o,paused:t||document.hidden||!Gr,keepAmbience:!document.hidden&&(!!Oe||Be==="race-setup")}),ss>0&&(ss-=r,ss<=0&&k("toast").classList.remove("show")),is>0&&(is-=r,is<=0&&k("zone-banner").classList.remove("show")),zs>0&&(zs-=e,zs<=0&&(k("damage-flash").style.opacity="0")),wr>0&&(wr-=r,wr<=0&&k("crosshair").classList.remove("hit")),xl+=e,xl>=.1&&(R1(c),xl=0),Kc.render(pt,Nt),nu&&(nu=!1,k("loading").style.opacity="0",setTimeout(()=>k("loading").hidden=!0,650)),o&&!Oe&&N.ended&&(Be="dying",wa=.85,Un=!1,k("crosshair").hidden=!0,ut.death(),Ja.burst(N.x,N.altitude+1,N.distance,46)),Be==="dying"&&(wa-=r,Kt.body.rotation.z+=(1-wa/.85)*.6,wa<=0&&_1()),requestAnimationFrame(Ad)}requestAnimationFrame(Ad);
