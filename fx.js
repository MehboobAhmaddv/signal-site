/* MONSTER TRADER win celebration: neon ring shockwave, electric bolts and sparks in the logo's cyan / blue / violet / magenta. */
(function(){
var COL=['#5ee7ff','#35b6ff','#2f6bff','#8b3dff','#b13cff','#e22bff','#ffffff'];
var busy=false,q=[];
function chime(){try{var a=new(window.AudioContext||window.webkitAudioContext)(),t=a.currentTime;[660,880,1320].forEach(function(f,i){var o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f;o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.0001,t+i*.11);g.gain.exponentialRampToValueAtTime(.16,t+i*.11+.03);g.gain.exponentialRampToValueAtTime(.001,t+i*.11+.45);o.start(t+i*.11);o.stop(t+i*.11+.5)})}catch(e){}}
function bolt(x,y,ang,len){var pts=[[x,y]],n=9,s=len/n;for(var i=1;i<=n;i++){ang+=(Math.random()-.5)*.9;x+=Math.cos(ang)*s;y+=Math.sin(ang)*s;pts.push([x,y])}return pts}
function run(list,sound){
 if(busy){q.push([list,sound]);return}
 busy=true;
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 var W=innerWidth,H=innerHeight,cx=W/2,cy=H*.42,dpr=Math.min(devicePixelRatio||1,2);
 var wrap=document.createElement('div');
 wrap.style.cssText='position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden';
 var cv=document.createElement('canvas');cv.width=W*dpr;cv.height=H*dpr;cv.style.cssText='position:absolute;inset:0;width:100%;height:100%';
 var fl=document.createElement('div');fl.style.cssText='position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,rgba(94,231,255,.35),rgba(177,60,255,.18) 40%,transparent 70%);opacity:0;animation:wfl 1.2s ease-out forwards';
 var box=document.createElement('div');box.style.cssText='position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);text-align:center;font-family:Inter,Segoe UI,system-ui,sans-serif;color:#fff;animation:wpop 2.7s cubic-bezier(.2,.9,.2,1) forwards';
 var img=document.createElement('img');img.src='images/logo.png';img.width=120;img.height=120;img.alt='';img.style.cssText='display:block;margin:0 auto 6px;border-radius:50%;box-shadow:0 0 30px #35b6ff,0 0 70px #b13cff;animation:wspin 2.7s ease-out both';
 var w=document.createElement('div');w.textContent='WIN';w.style.cssText='font-size:clamp(46px,16vw,84px);font-weight:900;letter-spacing:6px;line-height:1;background:linear-gradient(90deg,#5ee7ff,#8b3dff,#e22bff);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 14px rgba(53,182,255,.9)) drop-shadow(0 0 30px rgba(226,43,255,.6))';
 var d=list[0],txt=list.length>1?list.length+' trades':(d.p+' · '+(d.s>0?'CALL ↑':'PUT ↓'));
 var sub=document.createElement('div');sub.textContent=txt+' ✓';sub.style.cssText='white-space:nowrap;margin-top:8px;font-weight:700;letter-spacing:1.5px;font-size:15px;text-shadow:0 0 12px #35b6ff';
 box.appendChild(img);box.appendChild(w);box.appendChild(sub);
 if(!document.getElementById('wfxcss')){var st=document.createElement('style');st.id='wfxcss';st.textContent='@keyframes wfl{0%{opacity:0}15%{opacity:1}100%{opacity:0}}@keyframes wpop{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}14%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}24%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-58%) scale(1.05)}}@keyframes wspin{from{transform:rotate(-200deg)}to{transform:rotate(0)}}';document.head.appendChild(st)}
 wrap.appendChild(fl);if(!reduce)wrap.appendChild(cv);wrap.appendChild(box);document.body.appendChild(wrap);
 if(sound){chime();try{navigator.vibrate&&navigator.vibrate([80,40,80,40,160])}catch(e){}}
 var done=function(){wrap.remove();busy=false;if(q.length){var n=q.shift();run(n[0],n[1])}};
 if(reduce){setTimeout(done,2000);return}
 var ctx=cv.getContext('2d');ctx.scale(dpr,dpr);
 var P=[],B=[],t0=performance.now(),i;
 for(i=0;i<110;i++){var a=Math.random()*6.283,v=2+Math.random()*7;P.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:1+Math.random()*2.6,c:COL[i%COL.length],l:1,dl:.007+Math.random()*.012})}
 for(i=0;i<7;i++)B.push({pts:bolt(cx,cy,Math.random()*6.283,Math.max(W,H)*(.25+Math.random()*.2)),c:COL[i%5],born:Math.random()*220})
 function frame(now){
  var el=now-t0;if(el>2700){done();return}
  ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
  [0,160].forEach(function(dl,k){var p=(el-dl)/900;if(p>0&&p<1){var r=p*Math.max(W,H)*.55,g=ctx.createLinearGradient(cx-r,cy-r,cx+r,cy+r);g.addColorStop(0,'#5ee7ff');g.addColorStop(.55,'#8b3dff');g.addColorStop(1,'#e22bff');ctx.strokeStyle=g;ctx.globalAlpha=(1-p)*(k?.6:1);ctx.lineWidth=(k?4:8)*(1-p)+1;ctx.shadowColor='#35b6ff';ctx.shadowBlur=24;ctx.beginPath();ctx.arc(cx,cy,r,0,6.283);ctx.stroke()}});
  ctx.shadowBlur=14;
  B.forEach(function(b){var age=el-b.born;if(age<0||age>650)return;var k=Math.floor(age/70)%2;ctx.globalAlpha=Math.max(0,1-age/650)*(k?.55:1);ctx.strokeStyle=b.c;ctx.shadowColor=b.c;ctx.lineWidth=2.2;ctx.beginPath();b.pts.forEach(function(p,n){n?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.stroke()});
  P.forEach(function(p){if(p.l<=0)return;p.x+=p.vx;p.y+=p.vy;p.vx*=.975;p.vy=p.vy*.975+.06;p.l-=p.dl*1.6;ctx.globalAlpha=Math.max(0,p.l);ctx.fillStyle=p.c;ctx.shadowColor=p.c;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill()});
  ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';
  requestAnimationFrame(frame)}
 requestAnimationFrame(frame)}
window.winFx=function(list,sound){try{run(list,sound)}catch(e){busy=false}};
})();
