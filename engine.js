/* MRK TRADER™ signal engine: 9-factor weighted confluence. Every value at bar i uses data up to bar i only (no look-ahead). */
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
var sg=Math.sign;
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
function score(x,i){var V=votes(x,i),best=null;
[1,-1].forEach(function(d){var ag=0,cf=0,an=0;V.forEach(function(v){if(v.d===d){ag+=v.w;cf++}else if(v.d===-d)an+=v.w});var net=ag-.6*an;if(!best||net>best.net||(net===best.net&&sg(x.e20[i]-x.e50[i])===d))best={s:d,net:net,conf:cf}});
best.str=Math.max(0,Math.min(99,Math.round(best.net/10.2*110)));best.V=V;best.major=V[1].d===best.s;return best}
var MODES={fast:{c:3,s:35,a:0,m:0},relaxed:{c:4,s:48,a:16,m:0},premium:{c:6,s:62,a:22,m:1}};
function qual(r,x,i,M){return r.conf>=M.c&&r.str>=M.s&&x.adx[i]>=M.a&&(!M.m||r.major)}
function win(x,j){var b=x.c[j]-x.o[j];return b===0?0:b>0?1:-1}
function analyze(cs,mode){var x=calc(cs),n=cs.length,M=MODES[mode]||MODES.relaxed;if(n<200)return null;
var i=n-1,r=score(x,i),w=0,t=0,H=[],T=[];
for(var j=170;j<n-1;j++){var a=score(x,j);if(qual(a,x,j,M)){var o=win(x,j+1);if(o){t++;if(o===a.s)w++;T.push({t:cs[j+1].t,ok:o===a.s,s:a.s})}}}
for(var k=n-20;k<n;k++){var a2=score(x,k-1),o2=win(x,k);H.push({s:a2.s,ok:o2===a2.s,q:qual(a2,x,k-1,M),t:cs[k].t})}
var ad=x.adx[i],risk=ad>=25&&r.str>=65?'Low':r.str>=50&&ad>=16?'Medium':'High';
return{s:r.s,str:r.str,conf:r.conf,V:r.V,q:qual(r,x,i,M),risk:risk,adx:ad,w:w,n:t,H:H,T:T,M:M,last:x.c[i],prev:x.c[i-1]}}
return{analyze:analyze,MODES:MODES}})();
