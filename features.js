/* Features: language, signal history + track record, alerts, risk tools, scanner, favourites, higher-timeframe check, install. */
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- language (English / Urdu) ---------- */
const UR={'LIVE MARKET SIGNALS':'لائیو مارکیٹ سگنلز','Sharper CALL / PUT signals for forex, metals, stocks and crypto':'فاریکس، دھاتوں، اسٹاکس اور کرپٹو کے لیے بہتر CALL / PUT سگنلز','Real candles, a live chart, a news filter and an honest backtest, all in one place.':'اصلی کینڈلز، لائیو چارٹ، نیوز فلٹر اور ایماندار بیک ٹیسٹ، سب ایک جگہ۔','Signals for Quotex traders':'Quotex ٹریڈرز کے لیے سگنلز',
'Market':'مارکیٹ','Symbol':'علامت','Candle':'کینڈل','Expiry (candles)':'ایکسپائری (کینڈلز)','Signal mode':'سگنل موڈ','Search any company':'کوئی بھی کمپنی تلاش کریں','Forex':'فاریکس','Metals':'دھاتیں','Crypto':'کرپٹو','Stocks':'اسٹاکس','★ Favorites':'★ پسندیدہ','1 minute':'1 منٹ','5 minutes':'5 منٹ','15 minutes':'15 منٹ',
'Fast Mode':'فاسٹ موڈ','Active Mode':'ایکٹو موڈ','Relaxed Mode':'ریلیکسڈ موڈ','Premium Mode':'پریمیم موڈ','Ultra Premium Mode':'الٹرا پریمیم موڈ','Every candle, no break':'ہر کینڈل، بغیر وقفہ','3+ signals per 15 min':'15 منٹ میں 3+ سگنل','3–4 signals per hour':'فی گھنٹہ 3–4 سگنل','5–10 signals per day':'روزانہ 5–10 سگنل','Rarest, strictest setups':'سب سے کم، سب سے سخت سیٹ اپ',
'Sound alerts':'آواز کے الرٹس','Notifications':'نوٹیفکیشن','Confirm with higher timeframe':'بڑے ٹائم فریم سے تصدیق',
'UP':'اوپر','DOWN':'نیچے','CALL':'کال','PUT':'پُٹ','WAIT FOR DIRECTION':'سمت کا انتظار کریں','NEWS WINDOW':'خبروں کا وقت','PAUSED':'رکا ہوا','SETUP STRENGTH':'سیٹ اپ کی طاقت','next candle':'اگلی کینڈل','Next candle at':'اگلی کینڈل','enter the trade when it opens':'کھلتے ہی ٹریڈ لیں',
'Trend':'رجحان','Bollinger':'بولنگر','News check':'خبروں کی جانچ','Backtest on recent history':'حالیہ ڈیٹا پر بیک ٹیسٹ','Trades':'ٹریڈز','Win rate (95% range)':'جیت کی شرح (95% حد)','Break-even win rate':'برابری کی جیت شرح','Avg result per $1':'فی $1 اوسط نتیجہ',
'Scanner':'سکینر','Scan now':'ابھی سکین کریں','Stop':'روکیں','Speed':'رفتار','Free plan (6/min)':'فری پلان (6/منٹ)','Paid plan (30/min)':'پیڈ پلان (30/منٹ)','Closed':'بند','error':'خرابی','Done':'مکمل',
'Track record':'ٹریک ریکارڈ','Signals tracked':'ٹریک شدہ سگنل','Settled':'نتیجہ آ چکا','Win rate':'جیت کی شرح','Export CSV':'CSV ڈاؤن لوڈ','Clear history':'ہسٹری صاف کریں','Recent signals':'حالیہ سگنل','Clear all tracked signals?':'تمام ٹریک شدہ سگنل مٹا دیں؟',
'Risk tools':'رسک ٹولز','Balance':'بیلنس','Risk per trade %':'فی ٹریڈ رسک %','Payout %':'پے آؤٹ %','Daily loss limit %':'روزانہ نقصان کی حد %','Max losses in a row':'مسلسل زیادہ سے زیادہ ہاریں','Suggested stake':'تجویز کردہ رقم','If you win':'جیتنے پر','If you lose':'ہارنے پر','Tracked today (if traded)':'آج کے سگنل (اگر ٹریڈ ہوتے)','Loss streak':'مسلسل ہاریں',
'Daily loss limit reached. Stop trading for today.':'روزانہ نقصان کی حد پوری ہو گئی۔ آج مزید ٹریڈ نہ کریں۔','Loss streak limit reached. Take a break before the next trade.':'مسلسل ہاروں کی حد پوری ہو گئی۔ اگلی ٹریڈ سے پہلے وقفہ لیں۔','Install app':'ایپ انسٹال کریں','Created By':'تخلیق کار','Telegram':'ٹیلیگرام','Email':'ای میل'};
const UR_DISC='<b>اہم۔</b> یہ ویب سائٹ صرف تعلیمی تکنیکی تجزیے کا آلہ ہے، مالی مشورہ نہیں۔ سگنلز کوئی ضمانت نہیں، اور مختصر ایکسپائری پر کوئی حکمتِ عملی مستقل جیت نہیں دیتی۔ زیادہ تر لوگ بائنری آپشنز میں پیسے ہار جاتے ہیں، اور کئی ممالک میں یہ محدود یا ممنوع ہیں۔ اپنے ملک کے قوانین دیکھیں اور وہ رقم کبھی نہ لگائیں جو آپ ہارنے کے متحمل نہیں۔ یہ سائٹ Quotex یا کسی بروکر سے منسلک نہیں۔ قیمتیں تیسرے فریق کے ڈیٹا سے آتی ہیں اور آپ کے بروکر سے مختلف ہو سکتی ہیں۔';
let LANG=LS.get('ms_lang','en');
const t=s=>(LANG==='ur'&&UR[s])||s;
function applyLang(){
 document.documentElement.lang=LANG==='ur'?'ur':'en';document.documentElement.dir=LANG==='ur'?'rtl':'ltr';
 document.querySelectorAll('[data-t]').forEach(el=>{if(!el.dataset.en)el.dataset.en=el.textContent;el.textContent=t(el.dataset.en)});
 document.querySelectorAll('[data-tp]').forEach(el=>{if(!el.dataset.en)el.dataset.en=el.placeholder;el.placeholder=t(el.dataset.en)});
 const d=$('discl');if(d){if(!d.dataset.en)d.dataset.en=d.innerHTML;d.innerHTML=LANG==='ur'?UR_DISC:d.dataset.en}
 $('lang').textContent=LANG==='ur'?'EN':'اردو'}

/* ---------- signal history + track record ---------- */
const HKEY='ms_hist';
const hist=()=>LS.get(HKEY,[]);
const saveHist=h=>LS.set(HKEY,h.slice(-500));
function recordSignal(o){const h=hist(),id=[o.sym,o.tf,o.mode,o.t].join('|');
 if(h.some(e=>e.id===id))return false;
 h.push({id,sym:o.sym,tf:o.tf,mode:o.mode,ex:o.ex,s:o.s,str:o.str,t:o.t,entry:o.entry,res:null});saveHist(h);renderTrack();return true}
function resolveHist(sym,tf,cs){const h=hist(),step=TF[tf]*1000;let ch=false;
 for(const e of h){if(e.res||e.sym!==sym||e.tf!==tf)continue;
  const target=e.t+e.ex*step,c=cs.find(v=>v.t===target);
  if(c){const d=(c.c-e.entry)*e.s;e.res=d>0?'W':d<0?'L':'T';e.exit=c.c;ch=true}
  else if(cs.length&&cs[cs.length-1].t>target+step*3){e.res='X';ch=true}}
 if(ch){saveHist(h);renderTrack();renderRisk()}}
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function renderTrack(){if(!$('tk1'))return;
 const h=hist(),done=h.filter(e=>e.res==='W'||e.res==='L'),W=done.filter(e=>e.res==='W').length,N=done.length,be=1/(1+riskCfg().pay/100),[lo]=wilson(W,N);
 $('tk1').textContent=h.length;$('tk2').textContent=N;$('tk3').textContent=N?(W/N*100).toFixed(1)+'%':'–';
 $('tkv').textContent=N<30?`Need at least 30 settled signals before judging (you have ${N}).`:lo>be?'Tracked wins are above break-even. Keep testing on a demo account before real money.':'No proven edge in the tracked signals yet.';
 const tb=$('tkm');tb.innerHTML='';
 MODES.forEach(([v,n])=>{const e2=done.filter(e=>e.mode===v),w=e2.filter(e=>e.res==='W').length,r=el('div','tr');
  r.appendChild(el('span','',t(n)));r.appendChild(el('span','',e2.length?`${w}/${e2.length} · ${(w/e2.length*100).toFixed(0)}%`:'–'));tb.appendChild(r)});
 const rc=$('tkr');rc.innerHTML='';
 h.slice(-10).reverse().forEach(e=>{const r=el('div','tr');
  r.appendChild(el('span','',new Date(e.t).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})+' · '+e.sym.split('@')[0]+' '+(e.s===1?'▲':'▼')));
  r.appendChild(el('span','bdg '+(e.res==='W'?'u':e.res==='L'?'d':'w'),e.res==='W'?'WIN':e.res==='L'?'LOSS':e.res==='T'?'TIE':e.res==='X'?'n/a':'…'));rc.appendChild(r)})}
function exportCsv(){const rows=[['time_utc','symbol','candle','mode','direction','strength','expiry_candles','entry','exit','result']];
 hist().forEach(e=>rows.push([new Date(e.t).toISOString(),e.sym,e.tf,e.mode,e.s===1?'UP':'DOWN',e.str,e.ex,e.entry,e.exit==null?'':e.exit,e.res||'pending']));
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}));a.download='tracked-signals.csv';document.body.appendChild(a);a.click();a.remove()}

/* ---------- risk tools ---------- */
const riskCfg=()=>Object.assign({bal:1000,risk:2,pay:85,lim:10,streak:3},LS.get('ms_risk',{}));
function renderRisk(){if(!$('rs1'))return;const c=riskCfg(),stake=c.bal*c.risk/100,win=stake*c.pay/100;
 $('rs1').textContent=stake.toFixed(2);$('rs2').textContent='+'+win.toFixed(2);$('rs3').textContent='-'+stake.toFixed(2);
 const d0=new Date();d0.setHours(0,0,0,0);
 const td=hist().filter(e=>(e.res==='W'||e.res==='L')&&e.t>=d0.getTime()).sort((a,b)=>a.t-b.t);
 const pnl=td.reduce((a,e)=>a+(e.res==='W'?win:-stake),0);let st=0;for(let i=td.length-1;i>=0&&td[i].res==='L';i--)st++;
 $('rs4').textContent=(pnl>=0?'+':'')+pnl.toFixed(2);$('rs5').textContent=st;
 const lim=pnl<=-c.bal*c.lim/100,sk=st>=c.streak,rk=$('rk');
 if(lim||sk){rk.style.display='block';rk.textContent=t(lim?'Daily loss limit reached. Stop trading for today.':'Loss streak limit reached. Take a break before the next trade.')}else rk.style.display='none'}

/* ---------- alerts ---------- */
let ACX;
function beep(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ACX=ACX||new C();if(ACX.state==='suspended')ACX.resume();
 [0,.22].forEach(d=>{const o=ACX.createOscillator(),g=ACX.createGain(),T=ACX.currentTime+d;o.connect(g);g.connect(ACX.destination);o.frequency.value=d?1175:880;
  g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(.3,T+.03);g.gain.exponentialRampToValueAtTime(.0001,T+.2);o.start(T);o.stop(T+.22)})}catch(e){}}
function alertSignal(s,sym,lab){const P=LS.get('ms_pref',{});
 if(P.snd){beep();try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}
 if(P.ntf&&window.Notification&&Notification.permission==='granted'){try{new Notification((s===1?'UP ▲ ':'DOWN ▼ ')+sym.split('@')[0],{body:lab})}catch(e){}}}

/* ---------- favourites + remembered selection ---------- */
const favs=()=>LS.get('ms_fav',[]);
function updFav(){const b=$('fav');if(b)b.textContent=favs().includes($('sym').value)?'★':'☆'}
function toggleFav(){const v=$('sym').value,f=favs(),i=f.indexOf(v);if(i>=0)f.splice(i,1);else f.push(v);LS.set('ms_fav',f);if($('mk').value==='fav'){fill();}updFav()}
function savePrefs(){LS.set('ms_sel',{mk:$('mk').value,sym:$('sym').value,tf:$('tf').value,ex:$('ex').value,st:$('st').value})}
function ensureOption(sym){const sel=$('sym');if(sym&&![...sel.options].some(o=>o.value===sym)){const o=document.createElement('option');o.value=sym;o.textContent=sym.split('@')[0];sel.appendChild(o)}}
function restorePrefs(){const p=LS.get('ms_sel',null);if(!p)return;
 if(p.mk&&LIST[p.mk]){$('mk').value=p.mk;fill()}
 if(p.sym){ensureOption(p.sym);$('sym').value=p.sym}
 if(p.tf)$('tf').value=p.tf;if(p.ex)$('ex').value=p.ex;if(p.st)$('st').value=p.st;drawModes();updFav()}

/* ---------- higher-timeframe confirmation ---------- */
const HT={'1min':'5min','5min':'15min','15min':'1h'},HTL={'1min':'5-minute','5min':'15-minute','15min':'1-hour'};
async function htfTrend(sym,tf){try{const r=await fetch(`/.netlify/functions/candles?symbol=${encodeURIComponent(sym)}&interval=${HT[tf]}`),d=await r.json();
 if(!r.ok||!Array.isArray(d)||d.length<80)return 0;const c=d.map(v=>+v.close);c.pop();const a=ema(c,20),b=ema(c,50),i=c.length-1;return a[i]>b[i]?1:-1}catch(e){return 0}}

/* ---------- multi-pair scanner ---------- */
let scanning=false,scanRows=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const VALID=/^[A-Z0-9.\-]{1,12}(\/[A-Z]{3,4}|@[A-Za-z0-9]{2,12})?$/;
async function scanOne(sym,tf,ex,mode){const P=modeParams(mode,tf),stp=TF[tf]*1000;
 const r=await fetch(`/.netlify/functions/candles?symbol=${encodeURIComponent(sym)}&interval=${tf}`),d=await r.json();if(!r.ok)throw new Error(d.error||'error');
 const cs=d.map(v=>({t:Date.parse(v.datetime.replace(' ','T')+'Z'),o:+v.open,h:+v.high,l:+v.low,c:+v.close})),lc=cs[cs.length-1];
 if(Date.now()-lc.t>stp*3)return{sym,s:0,sc:0,state:'closed'};
 const closed=lc.t+stp>Date.now()?cs.slice(0,-1):cs;resolveHist(sym,tf,closed);
 const x=calc(closed),i=x.c.length-1,res=evalAt(x,i,P),hot=evCache&&hotEvent(sym,evCache,ex*TF[tf]/60);let s=hot?0:res.s;
 const sc=Math.min(7,Math.max(1,Math.round(res.sc)));
 if(s)recordSignal({sym,tf,mode,ex,s,str:sc,t:closed[i].t,entry:closed[i].c});
 return{sym,s,sc,state:s?'sig':hot?'news':'wait'}}
function renderScan(){const box=$('sres');box.innerHTML='';
 scanRows.slice().sort((a,b)=>(b.s!==0)-(a.s!==0)||b.sc-a.sc).forEach(r=>{const d=el('div','sr'),b=el('span','bdg '+(r.s===1?'u':r.s===-1?'d':'w'));
  b.textContent=r.err?t('error'):r.state==='closed'?t('Closed'):r.s===1?t('UP')+' ▲ '+r.sc+'/7':r.s===-1?t('DOWN')+' ▼ '+r.sc+'/7':r.state==='news'?t('NEWS WINDOW'):t('WAIT FOR DIRECTION');
  d.appendChild(el('span','',r.sym.split('@')[0]));d.appendChild(b);d.onclick=()=>{ensureOption(r.sym);$('sym').value=r.sym;updFav();load();window.scrollTo({top:0,behavior:'smooth'})};box.appendChild(d)})}
async function scan(){if(scanning)return;scanning=true;scanRows=[];renderScan();$('sgo').disabled=true;
 const tf=$('tf').value,ex=+$('ex').value,mode=+$('st').value,list=[...$('sym').options].map(o=>o.value).filter(v=>VALID.test(v)),gap=60000/(+$('sspd').value);
 for(let i=0;i<list.length&&scanning;i++){$('sprog').textContent=(i+1)+' / '+list.length;$('spg').style.width=((i+1)/list.length*100)+'%';
  try{scanRows.push(await scanOne(list[i],tf,ex,mode))}catch(e){scanRows.push({sym:list[i],s:0,sc:0,err:1})}
  renderScan();if(i<list.length-1&&scanning)await sleep(gap)}
 scanning=false;$('sgo').disabled=false;$('sprog').textContent=t('Done')}

/* ---------- start-up ---------- */
let INST=null;
function initFeatures(){
 restorePrefs();
 const P=LS.get('ms_pref',{});
 ['snd','ntf','tfc'].forEach(k=>{$(k).checked=!!P[k];$(k).addEventListener('change',()=>{const p=LS.get('ms_pref',{});p[k]=$(k).checked;LS.set('ms_pref',p);
  if(k==='snd'&&$(k).checked)beep();
  if(k==='ntf'&&$(k).checked){if(!window.Notification){$(k).checked=false}else Notification.requestPermission().then(r=>{if(r!=='granted'){$(k).checked=false;const q=LS.get('ms_pref',{});q.ntf=false;LS.set('ms_pref',q)}})}
  if(k==='tfc')load()})});
 const c=riskCfg();
 [['rb','bal'],['rr','risk'],['rp','pay'],['rl','lim'],['rm','streak']].forEach(([id,key])=>{$(id).value=c[key];$(id).addEventListener('input',()=>{const v=parseFloat($(id).value);
  if(isFinite(v)&&v>=0){const cur=LS.get('ms_risk',{});cur[key]=v;LS.set('ms_risk',cur);renderRisk();renderTrack()}})});
 $('fav').onclick=toggleFav;$('sym').addEventListener('change',updFav);
 $('sgo').onclick=scan;$('sstop').onclick=()=>{scanning=false};
 $('lang').onclick=()=>{LANG=LANG==='ur'?'en':'ur';LS.set('ms_lang',LANG);applyLang();drawModes();renderTrack();renderRisk();load()};
 $('hex').onclick=exportCsv;$('hclr').onclick=()=>{if(confirm(t('Clear all tracked signals?'))){saveHist([]);renderTrack();renderRisk()}};
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();INST=e;$('inst').style.display='inline-flex'});
 $('inst').onclick=()=>{if(INST){INST.prompt();INST=null;$('inst').style.display='none'}};
 if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
 applyLang();renderTrack();renderRisk()}
