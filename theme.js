(function(){var d=document.documentElement,cur=d.getAttribute('data-theme')==='light'?'light':'dark',b=document.createElement('button');
b.id='thm';b.setAttribute('aria-label','Light / dark mode');b.style.cssText='position:fixed;inset-inline-start:14px;bottom:14px;z-index:45;width:42px;height:42px;border-radius:50%;border:1px solid var(--bd);background:var(--cd,var(--card2,#080b1c));color:var(--tx);font-size:19px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35);display:grid;place-items:center;padding:0';
function ui(){b.textContent=cur==='light'?'🌙':'☀️'}
b.onclick=function(){cur=cur==='light'?'dark':'light';d.setAttribute('data-theme',cur);try{localStorage.setItem('theme',cur)}catch(e){}ui();var m=document.querySelector('meta[name=theme-color]');if(m)m.content=cur==='light'?'#f2f5fb':'#02030a'};
ui();document.body.appendChild(b)})();
