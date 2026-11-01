/* MONSTER TRADER™signal engine: 9-factor weighted confluence. Every value at bar i uses data up to bar i only (no look-ahead). */
var EN=(function(){
var ema=function(a,n){var k=2/(n+1),o=[a[0]];for(var i=1;i<a.length;i++)o.push(a[i]*k+o[i-1]*(1-k));return o};
function rsi(a,n){n=n||14;var o=Array(a.length).fill(50),u=0,d=0,al=1/n;for(var i=1;i<a.length;i++){var ch=a[i]-a[i-1],up=Math.max(ch,0),dn=Math.max(-ch,0);u=i===1?up:u*(1-al)+up*al;d=i===1?dn:d*(1-al)+dn*al;o[i]=d===0?100:100-100/(1+u/d)}return o}
function boll(a,n){n=n||20;var lo=[],hi=[];for(var i=0;i<a.length;i++){if(i<n-1){lo.push(a[i]);hi.push(a[i]);continue}var s=a.slice(i-n+1,i+1),m=s.reduce(function(x,y){return x+y})/n,sd=Math.sqrt(s.reduce(function(x,y){return x+(y-m)*(y-m)},0)/n);lo.push(m-2*sd);hi.push(m+2*sd)}return{lo:lo,hi:hi}}
function stoch(h,l,c,n){n=n||14;var r=c.map(function(v,i){if(i<n-1)return 50;var hh=Math.max.apply(null,h.slice(i-n+1,i+1)),ll=Math.min.apply(null,l.slice(i-n+1,i+1));return hh===ll?50:(v-ll)/(hh-ll)*100});return r.map(function(_,i){return i<2?r[i]:(r[i]+r[i-1]+r[i-2])/3})}
function cci(h,l,c,n){n=n||20;var tp=c.map(function(v,i){return(h[i]+l[i]+v)/3});return tp.map(function(v,i){if(i<n-1)return 0;var s=tp.slice(i-n+1,i+1),m=s.reduce(function(a,b){return a+b})/n,md=s.reduce(function(a,b){return a+Math.abs(b-m)},0)/n;return md?(v-m)/(.015*md):0})}
function adxAtr(h,l,c,n){n=n||14;var L=c.length,a=Array(L).fill(0),tra=[0],dx=[],tr=0,pd=0,md=0,ad=0;
for(var i=1;i<L;i++){var u=h[i]-h[i-1],d=l[i-1]-l[i],pm=u>d&&u>0?u:0,mm=d>u&&d>0?d:0,t=Math.max(h[i]-l[i],Math.abs(h[i]-c[i-1]),Math.abs(l[i]-c[i-1]));tra.push(t);
if(i<=n){tr+=t;pd+=pm;md+=mm}else{tr=tr-tr/n+t;pd=pd-pd/n+pm;md=md-md/n+mm}
if(i>=n){var pi=100*pd/(tr||1),mi=100*md/(tr||1),v=100*Math.abs(pi-mi)/((pi+mi)||1);if(i<2*n-1){dx.push(v);if(i===2*n-2){ad=dx.reduce(function(p,q){return p+q})/dx.length;a[i]=ad}}else{ad=(ad*(n-1)+v)/n;a[i]=ad}}}
return{adx:a,atr:ema(tra,n)}}
function calc(cs){var c=cs.map(function(v){return v.c}),o=cs.map(function(v){return v.o}),h=cs.map(function(v){return v.h}),l=cs.map(function(v){return v.l}),b=boll(c),e12=ema(c,12),e26=ema(c,26),m=e12.map(function(v,i){return v-e26[i]}),g=ema(m,9),aa=adxAtr(h,l,c);
return{c:c,o:o,h:h,l:l,e20:ema(c,20),e50:ema(c,50),e60:ema(c,60),e150:ema(c,150),r:rsi(c),lo:b.lo,hi:b.hi,mh:m.map(function(v,i){return v-g[i]}),k:stoch(h,l,c),cci:cci(h,l,c),adx:aa.adx,atr:aa.atr}}
function pat(x,i){var o=x.o[i],c=x.c[i],h=x.h[i],l=x.l[i],po=x.o[i-1],pc=x.c[i-1],b=Math.abs(c-o),rg=h-l;if(!rg)return{d:0,n:''};
var lw=Math.min(o,c)-l,uw=h-Math.max(o,c),pb=Math.abs(pc-po);
if(c>o&&pc<po&&c>=po&&o<=pc)return{d:1,n:'Bullish Engulfing'};if(c<o&&pc>po&&c<=po&&o>=pc)return{d:-1,n:'Bearish Engulfing'};
if(lw>=2*b&&lw>=.6*rg&&uw<=.15*rg)return{d:1,n:'Hammer / Bullish Pin Bar'};if(uw>=2*b&&uw>=.6*rg&&lw<=.15*rg)return{d:-1,n:'Shooting Star / Bearish Pin Bar'};
if(i>=2){var o2=x.o[i-2],c2=x.c[i-2],b2=Math.abs(c2-o2);
if(c2<o2&&pb<.4*b2&&c>o&&c>(o2+c2)/2)return{d:1,n:'Morning Star'};if(c2>o2&&pb<.4*b2&&c<o&&c<(o2+c2)/2)return{d:-1,n:'Evening Star'};
if(c>o&&pc>po&&c2>o2&&c>pc&&pc>c2)return{d:1,n:'Three White Soldiers'};if(c<o&&pc<po&&c2<o2&&c<pc&&pc<c2)return{d:-1,n:'Three Black Crows'}}
return{d:0,n:''}}
var sg=Math.sign,BW=[1.5,1.5,1,1,1,1,1,1.2,1];
function votes(x,i){var c=x.c[i],V=[],r=x.r[i],k=x.k[i],kp=x.k[i-1],q=x.cci[i],pb=x.hi[i]>x.lo[i]?(c-x.lo[i])/(x.hi[i]-x.lo[i]):.5,P=pat(x,i),ll=Math.min.apply(null,x.l.slice(i-20,i)),hh=Math.max.apply(null,x.h.slice(i-20,i)),at=x.atr[i]||1e-9;
V.push({n:'Short trend (EMA 20/50)',w:1.5,d:sg(x.e20[i]-x.e50[i]),v:'EMA20 '+(x.e20[i]>x.e50[i]?'above':'below')+' EMA50'});
V.push({n:'Major trend (EMA 60/150)',w:1.5,d:sg(x.e60[i]-x.e150[i]),v:'EMA60 '+(x.e60[i]>x.e150[i]?'above':'below')+' EMA150'});
V.push({n:'RSI 14',w:1,d:r<40?1:r>60?-1:0,v:r.toFixed(1)});
V.push({n:'Bollinger Bands (%B)',w:1,d:pb<.2?1:pb>.8?-1:0,v:(pb*100).toFixed(0)+'%'});
V.push({n:'Stochastic 14',w:1,d:k<30&&k>kp?1:k>70&&k<kp?-1:0,v:k.toFixed(1)});
V.push({n:'MACD histogram',w:1,d:sg(x.mh[i]-x.mh[i-1]),v:x.mh[i]>x.mh[i-1]?'Rising':'Falling'});
V.push({n:'CCI 20',w:1,d:q<-100?1:q>100?-1:0,v:q.toFixed(0)});
V.push({n:'Candle pattern',w:1.2,d:P.d,v:P.n||'None'});
V.push({n:'Support / Resistance (20 bars)',w:1,d:c-ll<.5*at?1:hh-c<.5*at?-1:0,v:c-ll<.5*at?'At support':hh-c<.5*at?'At resistance':'Mid-range'});
return V}

function scoreW(V,W,x,i){var best=null,tot=0;W.forEach(function(w){tot+=w});
[1,-1].forEach(function(d){var ag=0,cf=0,an=0,op=0;V.forEach(function(v,k){if(v.d===d){ag+=W[k];cf++}else if(v.d===-d){an+=W[k];op++}});var net=ag-.6*an;if(!best||net>best.net||(net===best.net&&sg(x.e20[i]-x.e50[i])===d))best={s:d,net:net,conf:cf,opp:op}});
best.str=Math.max(0,Math.min(99,Math.round(best.net/tot*110)));best.V=V;best.major=V[1].d===best.s;return best}
var MODES={fast:{c:3,s:35,a:0,m:0,h:0,v:0,vx:99,pen:0},relaxed:{c:4,s:48,a:16,m:0,h:0,v:.7,vx:99,pen:8},premium:{c:6,s:62,a:22,m:1,h:1,v:.8,vx:2.5,pen:0},ultra:{c:7,s:72,a:25,m:1,h:1,v:.85,vx:2,pen:0,o:1}};
function win(x,j){var b=x.c[j]-x.o[j];return b===0?0:b>0?1:-1}
function wil(w,n){if(!n)return null;var z=1.96,p=w/n,d=1+z*z/n,c=p+z*z/(2*n),m=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n));return Math.round(100*(c-m)/d)}
function learn(VS,x,a,b){var W=BW.slice(),acc=[];for(var k=0;k<9;k++){var h=0,c=0;for(var j=a;j<b;j++){var d=VS[j][k].d;if(!d)continue;var o=win(x,j+1);if(!o)continue;c++;if(o===d)h++}
var r=c?h/c:.5,f=1+Math.max(-.7,Math.min(.8,(r-.5)*8))*(c/(c+30));W[k]=BW[k]*f;acc.push({r:r,n:c})}return{W:W,acc:acc}}
/* higher-timeframe trend (x5) using only COMPLETED higher bars, so no look-ahead */
function htf(cs,sec){var B=sec*5,ids=[],cl=[],bi=[];for(var i=0;i<cs.length;i++){var b=Math.floor(cs[i].t/B);if(!ids.length||ids[ids.length-1]!==b){ids.push(b);cl.push(cs[i].c)}else cl[cl.length-1]=cs[i].c;bi.push(ids.length-1)}
var e1=ema(cl,20),e2=ema(cl,50);return bi.map(function(q){var p=q-1;return p>=50?sg(e1[p]-e2[p]):0})}
function analyze(cs,mode,sec){var x=calc(cs),n=cs.length,M=MODES[mode]||MODES.relaxed;if(n<200)return null;sec=sec||60;
var H=htf(cs,sec),VS=[],PA=[0],VR=[];for(var j=0;j<n;j++){VS.push(j>=20?votes(x,j):null);PA.push(PA[j]+x.atr[j])}
for(j=0;j<n;j++){VR.push(j>=100?x.atr[j]/(((PA[j]-PA[j-100])/100)||1e-9):1)}
var cut=Math.floor(170+(n-1-170)*.65),Lt=learn(VS,x,170,cut),La=learn(VS,x,170,n-1);
function sc(j,W){var r=scoreW(VS[j],W,x,j);if(H[j]&&H[j]!==r.s&&M.pen)r.str=Math.max(0,r.str-M.pen);return r}
function ok(r,j){return r.conf>=M.c&&r.str>=M.s&&x.adx[j]>=M.a&&(!M.m||r.major)&&(!M.h||H[j]===r.s)&&VR[j]>=M.v&&VR[j]<=M.vx&&(M.o==null||r.opp<=M.o)}
var tr={w:0,n:0},te={w:0,n:0},T=[];
for(j=170;j<n-1;j++){var a=sc(j,Lt.W);if(ok(a,j)){var o=win(x,j+1);if(o){var z=j<cut?tr:te;z.n++;if(o===a.s)z.w++;T.push({t:cs[j+1].t,ok:o===a.s,s:a.s,oos:j>=cut})}}}
var Hh=[];for(var k=n-20;k<n;k++){var a2=sc(k-1,Lt.W),o2=win(x,k);Hh.push({s:a2.s,ok:o2===a2.s,q:ok(a2,k-1),t:cs[k].t})}
var i=n-1,r=sc(i,La.W),q=ok(r,i),ad=x.adx[i],ag=H[i]===r.s,
risk=ad>=25&&r.str>=65&&ag?'Low':r.str>=50&&ad>=16?'Medium':'High',
oo=te.n>=10,ww=oo?te.w:tr.w+te.w,nn=oo?te.n:tr.n+te.n,sl=n-40;
return{s:r.s,str:r.str,conf:r.conf,V:r.V,q:q,risk:risk,adx:ad,w:ww,n:nn,oos:oo,tr:tr,te:te,wl:wil(ww,nn),H:Hh,T:T,M:M,last:x.c[i],prev:x.c[i-1],htf:H[i],vr:VR[i],acc:La.acc,
cand:cs.slice(sl).map(function(v){return{o:v.o,h:v.h,l:v.l,c:v.c}}),e20:x.e20.slice(sl)}}
return{analyze:analyze,MODES:MODES}})();
