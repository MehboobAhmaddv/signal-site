/* Markhor Signals engine: multi-indicator confluence. All values use only data up to bar i (no look-ahead). */
function ema(a,n){const k=2/(n+1),o=[a[0]];for(let i=1;i<a.length;i++)o.push(a[i]*k+o[i-1]*(1-k));return o}
function rsi(a,n=14){const o=Array(a.length).fill(50),al=1/n;let u=0,d=0;
 for(let i=1;i<a.length;i++){const ch=a[i]-a[i-1],up=Math.max(ch,0),dn=Math.max(-ch,0);
  u=i===1?up:u*(1-al)+up*al;d=i===1?dn:d*(1-al)+dn*al;o[i]=d===0?100:100-100/(1+u/d)}return o}
function boll(a,n=20,k=2){const lo=[],hi=[],w=[];
 for(let i=0;i<a.length;i++){if(i<n-1){lo.push(null);hi.push(null);w.push(null);continue}
  const s=a.slice(i-n+1,i+1),m=s.reduce((x,y)=>x+y)/n,sd=Math.sqrt(s.reduce((x,y)=>x+(y-m)**2,0)/(n-1));
  lo.push(m-k*sd);hi.push(m+k*sd);w.push(2*k*sd/m)}return{lo,hi,w}}
function macdHist(c){const f=ema(c,12),s=ema(c,26),m=f.map((v,i)=>v-s[i]),g=ema(m,9);return m.map((v,i)=>v-g[i])}
function stoch(h,l,c,n=14){const r=c.map((v,i)=>{if(i<n-1)return 50;const hh=Math.max(...h.slice(i-n+1,i+1)),ll=Math.min(...l.slice(i-n+1,i+1));return hh===ll?50:(v-ll)/(hh-ll)*100});
 return r.map((_,i)=>i<2?r[i]:(r[i]+r[i-1]+r[i-2])/3)}
function adx(h,l,c,n=14){const L=c.length,a=Array(L).fill(0),dx=[];let tr=0,pd=0,md=0,ad=0;
 for(let i=1;i<L;i++){const u=h[i]-h[i-1],d=l[i-1]-l[i],pm=u>d&&u>0?u:0,mm=d>u&&d>0?d:0,t=Math.max(h[i]-l[i],Math.abs(h[i]-c[i-1]),Math.abs(l[i]-c[i-1]));
  if(i<=n){tr+=t;pd+=pm;md+=mm}else{tr=tr-tr/n+t;pd=pd-pd/n+pm;md=md-md/n+mm}
  if(i>=n){const pi=100*pd/(tr||1),mi=100*md/(tr||1),v=100*Math.abs(pi-mi)/((pi+mi)||1);
   if(i<2*n-1){dx.push(v);if(i===2*n-2){ad=dx.reduce((p,q)=>p+q)/dx.length;a[i]=ad}}else{ad=(ad*(n-1)+v)/n;a[i]=ad}}}
 return a}
function calc(cs){const c=cs.map(v=>v.c),o=cs.map(v=>v.o),h=cs.map(v=>v.h),l=cs.map(v=>v.l),b=boll(c);
 return{t:cs.map(v=>v.t),c,o,h,l,e20:ema(c,20),e50:ema(c,50),e60:ema(c,60),e150:ema(c,150),r:rsi(c),lo:b.lo,hi:b.hi,w:b.w,mh:macdHist(c),k:stoch(h,l,c),adx:adx(h,l,c)}}
function candle(x,i,d){const o=x.o[i],c=x.c[i],h=x.h[i],l=x.l[i],po=x.o[i-1],pc=x.c[i-1],b=Math.abs(c-o),rg=h-l;if(!rg)return'';
 const lw=Math.min(o,c)-l,uw=h-Math.max(o,c);
 if(d===1){if(c>o&&pc<po&&c>=po&&o<=pc)return'Bullish engulfing candle';if(lw>=2*b&&lw>=.6*rg)return'Hammer candle (rejection of lows)'}
 else{if(c<o&&pc>po&&c<=po&&o>=pc)return'Bearish engulfing candle';if(uw>=2*b&&uw>=.6*rg)return'Shooting-star candle (rejection of highs)'}
 return''}
/* ---- rate-based modes: score every candle, signal when the score is high enough to hit a target rate ---- */
function dirScore(x,i,d){const why=[];let sc=0;
 if(d*(x.e20[i]-x.e50[i])>0){sc+=1.5;why.push('Short-term trend '+(d===1?'up':'down'))}
 if(d*(x.e60[i]-x.e150[i])>0){sc+=1.5;why.push('Major trend '+(d===1?'up':'down'))}
 const r=d===1?(50-x.r[i])/20:(x.r[i]-50)/20;if(r>0){const v=Math.min(1.5,r);sc+=v;if(v>=0.5)why.push('RSI '+x.r[i].toFixed(0)+(d===1?' (low)':' (high)'))}
 if(x.hi[i]!=null&&x.hi[i]>x.lo[i]){const pb=(x.c[i]-x.lo[i])/(x.hi[i]-x.lo[i]),b=d===1?(0.3-pb)/0.3:(pb-0.7)/0.3;
  if(b>0){const v=Math.min(1.5,b);sc+=v;if(v>=0.5)why.push('Price near '+(d===1?'lower':'upper')+' Bollinger Band')}}
 const k=x.k[i],kp=x.k[i-1],sv=d===1?(30-k)/30:(k-70)/30;
 if(sv>0&&(d===1?k>kp:k<kp)){sc+=0.5*Math.min(1,sv);why.push('Stochastic turning '+(d===1?'up':'down'))}
 if(d*(x.mh[i]-x.mh[i-1])>0){sc+=0.5;why.push('MACD momentum '+(d===1?'up':'down'))}
 const cd=candle(x,i,d);if(cd){sc+=0.7;why.push(cd)}
 return{sc,why}}
function bestAt(x,i){const u=dirScore(x,i,1),w=dirScore(x,i,-1);
 const up=u.sc===w.sc?x.e20[i]>=x.e50[i]:u.sc>w.sc;return up?{s:1,...u}:{s:-1,...w}}
function scoreOf(x,j){x._s=x._s||{};const v=x._s[j];return v!==undefined?v:(x._s[j]=bestAt(x,j).sc)}
function evalRank(x,i,P){
 if(i<220)return{s:0,sc:0,why:[],block:'Not enough history'};
 const b=bestAt(x,i);
 if(P.rate>=1)return{s:b.s,sc:b.sc,why:b.why.length?b.why:['No strong confirmation (low-confidence signal)'],block:''};
 const lo=Math.max(220,i-800);if(i-lo<150)return{s:0,sc:0,why:[],block:'Collecting history'};
 const a=[];for(let j=lo;j<i;j++)a.push(scoreOf(x,j));a.sort((p,q)=>p-q);
 const th=a[Math.min(a.length-1,Math.floor((1-P.rate)*a.length))];
 return b.sc>=th&&b.sc>0?{s:b.s,sc:b.sc,why:b.why,block:''}:{s:0,sc:b.sc,why:[],block:'Waiting for a stronger setup'}}
/* P = {rsi: 30|35|40, min: required score out of 7}. Returns {s:+1|-1|0, sc, why[], block} */
function evalAt(x,i,P){
 if(P.both){const a=evalAt(x,i,{rsi:P.rsi,min:P.min,adx:P.adx,rk:P.rk,major:P.major});
  if(!a.s)return a;const b=evalRank(x,i,{rate:P.rate});
  return b.s===a.s?{...a,sc:Math.max(a.sc,b.sc)}:{s:0,sc:a.sc,why:[],block:'Waiting for a stronger setup'}}
 if(P.rate!==undefined)return evalRank(x,i,P);
 if(i<220)return{s:0,sc:0,why:[],block:'Not enough history'};
 const win=x.w.slice(i-200,i+1),rk=win.filter(v=>v<=x.w[i]).length/win.length;
 if(rk<(P.rk||0.3))return{s:0,sc:0,why:[],block:'Market too quiet'};
 if(x.adx[i]<(P.adx||18))return{s:0,sc:0,why:[],block:'Trend too weak (ADX low)'};
 let best={s:0,sc:0,why:[],block:'Waiting for a high-quality setup'};
 for(const d of[1,-1]){
  const maj=P.major!==false;
  if(!(d*(x.e20[i]-x.e50[i])>0&&(!maj||d*(x.e60[i]-x.e150[i])>0)))continue;
  const why=[(maj?'Short and major trends agree ':'Short-term trend ')+(d===1?'(up)':'(down)')];let sc=maj?2:1;
  const ext=d===1?x.r[i]<P.rsi:x.r[i]>100-P.rsi,band=d===1?x.c[i]<=x.lo[i]:x.c[i]>=x.hi[i];
  if(!(ext||band))continue;
  if(ext){sc++;why.push('RSI '+x.r[i].toFixed(0)+(d===1?' (oversold)':' (overbought)'))}
  if(band){sc++;why.push('Price at '+(d===1?'lower':'upper')+' Bollinger Band')}
  if(d===1?(x.k[i]<25&&x.k[i]>x.k[i-1]):(x.k[i]>75&&x.k[i]<x.k[i-1])){sc++;why.push('Stochastic turning '+(d===1?'up':'down')+' from extreme')}
  if(d*(x.mh[i]-x.mh[i-1])>0){sc++;why.push('MACD momentum turning '+(d===1?'up':'down'))}
  const cd=candle(x,i,d);if(cd){sc++;why.push(cd)}
  if(sc>=P.min&&sc>best.sc)best={s:d,sc,why,block:''}}
 return best}
function wilson(w,n,z=1.96){if(!n)return[0,0];const p=w/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return[c-h,c+h]}
function backtest(x,ex,P,payout=0.85){let w=0,l=0,pnl=0,i=220;
 while(i<x.c.length-ex){const r=evalAt(x,i,P);
  if(r.s&&P.step&&x.t&&x.t[i+ex]-x.t[i]>ex*P.step*1.6){i++;continue}
  if(r.s){const d=(x.c[i+ex]-x.c[i])*r.s;if(d>0){w++;pnl+=payout}else if(d<0){l++;pnl-=1}i+=P.rate!==undefined?1:ex}else i++}
 return{w,n:w+l,pnl}}
if(typeof module!=='undefined')module.exports={calc,evalAt,backtest,wilson};
