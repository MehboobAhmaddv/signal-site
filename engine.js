/* MRK TRADER signals engine: multi-indicator confluence. All values use only data up to bar i (no look-ahead). */
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
function cci(h,l,c,n=20){const tp=c.map((v,i)=>(h[i]+l[i]+v)/3),o=Array(c.length).fill(0);
 for(let i=n-1;i<c.length;i++){const s=tp.slice(i-n+1,i+1),m=s.reduce((p,q)=>p+q)/n,md=s.reduce((p,q)=>p+Math.abs(q-m),0)/n;o[i]=md?(tp[i]-m)/(0.015*md):0}return o}
function psar(h,l,st=0.02,mx=0.2){const L=h.length,dir=Array(L).fill(1);if(L<3)return dir;
 let up=h[1]>h[0],af=st,ep=up?h[1]:l[1],s=up?l[0]:h[0];dir[0]=dir[1]=up?1:-1;
 for(let i=2;i<L;i++){s=s+af*(ep-s);
  if(up){s=Math.min(s,l[i-1],l[i-2]);if(l[i]<s){up=false;s=ep;ep=l[i];af=st}else if(h[i]>ep){ep=h[i];af=Math.min(af+st,mx)}}
  else{s=Math.max(s,h[i-1],h[i-2]);if(h[i]>s){up=true;s=ep;ep=h[i];af=st}else if(l[i]<ep){ep=l[i];af=Math.min(af+st,mx)}}
  dir[i]=up?1:-1}return dir}
function calc(cs){const c=cs.map(v=>v.c),o=cs.map(v=>v.o),h=cs.map(v=>v.h),l=cs.map(v=>v.l),b=boll(c);
 return{t:cs.map(v=>v.t),c,o,h,l,e20:ema(c,20),e50:ema(c,50),e60:ema(c,60),e150:ema(c,150),r:rsi(c),lo:b.lo,hi:b.hi,w:b.w,mh:macdHist(c),k:stoch(h,l,c),adx:adx(h,l,c),cci:cci(h,l,c),sar:psar(h,l)}}
function candle(x,i,d){const o=x.o[i],c=x.c[i],h=x.h[i],l=x.l[i],po=x.o[i-1],pc=x.c[i-1],b=Math.abs(c-o),rg=h-l;if(!rg)return'';
 const lw=Math.min(o,c)-l,uw=h-Math.max(o,c);
 if(d===1){if(c>o&&pc<po&&c>=po&&o<=pc)return'Bullish engulfing candle';if(lw>=2*b&&lw>=.6*rg)return'Hammer candle (rejection of lows)'}
 else{if(c<o&&pc>po&&c<=po&&o>=pc)return'Bearish engulfing candle';if(uw>=2*b&&uw>=.6*rg)return'Shooting-star candle (rejection of highs)'}
 return''}
/* ---- scoring: every indicator adds to one score that adds up to 7.0 at most ----
   EMA20/50 1.2 + EMA60/150 1.2 + RSI 1.0 + Bollinger 1.0 + Stochastic 0.4 + MACD 0.4 + candle 0.5 + CCI 0.5 + Parabolic SAR 0.5 + ADX 0.3 */
function dirScore(x,i,d){const why=[];let sc=0;
 if(d*(x.e20[i]-x.e50[i])>0){sc+=1.2;why.push('Short-term trend '+(d===1?'up':'down'))}
 if(d*(x.e60[i]-x.e150[i])>0){sc+=1.2;why.push('Major trend '+(d===1?'up':'down'))}
 const r=d===1?(50-x.r[i])/20:(x.r[i]-50)/20;if(r>0){const v=Math.min(1,r);sc+=v;if(v>=0.5)why.push('RSI '+x.r[i].toFixed(0)+(d===1?' (low)':' (high)'))}
 if(x.hi[i]!=null&&x.hi[i]>x.lo[i]){const pb=(x.c[i]-x.lo[i])/(x.hi[i]-x.lo[i]),b=d===1?(0.3-pb)/0.3:(pb-0.7)/0.3;
  if(b>0){const v=Math.min(1,b);sc+=v;if(v>=0.5)why.push('Price near '+(d===1?'lower':'upper')+' Bollinger Band')}}
 const k=x.k[i],kp=x.k[i-1],sv=d===1?(30-k)/30:(k-70)/30;
 if(sv>0&&(d===1?k>kp:k<kp)){sc+=0.4*Math.min(1,sv);why.push('Stochastic turning '+(d===1?'up':'down'))}
 if(d*(x.mh[i]-x.mh[i-1])>0){sc+=0.4;why.push('MACD momentum '+(d===1?'up':'down'))}
 const cd=candle(x,i,d);if(cd){sc+=0.5;why.push(cd)}
 const cv=d===1?(-x.cci[i]-50)/100:(x.cci[i]-50)/100;
 if(cv>0&&d*(x.cci[i]-x.cci[i-1])>0){sc+=0.5*Math.min(1,cv);why.push('CCI '+x.cci[i].toFixed(0)+(d===1?' (oversold, turning up)':' (overbought, turning down)'))}
 if(x.sar[i]===d){sc+=0.5;why.push('Parabolic SAR '+(d===1?'below':'above')+' price')}
 if(x.adx[i]>=20&&d*(x.e20[i]-x.e50[i])>0){sc+=0.3;why.push('Trend strength ADX '+x.adx[i].toFixed(0))}
 return{sc,why}}
function bestAt(x,i){const u=dirScore(x,i,1),w=dirScore(x,i,-1);
 const up=u.sc===w.sc?x.e20[i]>=x.e50[i]:u.sc>w.sc;return up?{s:1,...u}:{s:-1,...w}}
const strength=sc=>Math.min(7,Math.max(1,Math.round(sc)));
/* P = {min: lowest setup strength out of 7 needed to give a signal (0 = every candle)}. Returns {s:+1|-1|0, sc, why[], block} */
function evalAt(x,i,P){
 if(i<220)return{s:0,sc:0,why:[],block:'Not enough history'};
 const b=bestAt(x,i),st=strength(b.sc),need=(P&&P.min)||0;
 if(need&&st<need)return{s:0,sc:b.sc,why:[],block:'Setup strength '+st+'/7 is below the '+need+'/7 needed'};
 return{s:b.s,sc:b.sc,why:b.why.length?b.why:['No strong confirmation (low-confidence signal)'],block:''}}
function wilson(w,n,z=1.96){if(!n)return[0,0];const p=w/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return[c-h,c+h]}
function backtest(x,ex,P,payout=0.85){let w=0,l=0,pnl=0,i=220;
 while(i<x.c.length-ex){const r=evalAt(x,i,P);
  if(r.s&&P.step&&x.t&&x.t[i+ex]-x.t[i]>ex*P.step*1.6){i++;continue}
  if(r.s){const d=(x.c[i+ex]-x.c[i])*r.s;if(d>0){w++;pnl+=payout}else if(d<0){l++;pnl-=1}}
  i++}
 return{w,n:w+l,pnl}}
if(typeof module!=='undefined')module.exports={calc,evalAt,backtest,wilson,strength};
