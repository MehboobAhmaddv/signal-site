/* Shared client helpers: session token, API calls, current user. */
function curUser(){try{return JSON.parse(localStorage.getItem('ms_user')||'null')}catch(e){return null}}
function setUser(u){try{localStorage.setItem('ms_user',JSON.stringify(u))}catch(e){}}
function logout(go){try{localStorage.removeItem('ms_tok');localStorage.removeItem('ms_user')}catch(e){}if(go!==false)location.href='login.html'}
async function apiFetch(url,opts){opts=opts||{};const tok=localStorage.getItem('ms_tok');
 opts.headers=Object.assign({},opts.headers,tok?{Authorization:'Bearer '+tok}:{});
 const r=await fetch(url,opts);if(r.status===401)logout();return r}
async function post(fn,body){let r,d={};try{r=await apiFetch('/.netlify/functions/'+fn,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});d=await r.json()}catch(e){return{ok:false,status:0,data:{error:'Cannot reach the server. Check your internet.'}}}
 if(!r.ok&&!d.error)d.error='Error '+r.status;return{ok:r.ok,status:r.status,data:d}}
async function refreshMe(){const r=await post('auth',{action:'me'});if(r.ok){setUser(r.data.user);return r.data.user}return null}
function h(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function fmtDate(ms){return ms?new Date(ms).toLocaleDateString([],{year:'numeric',month:'short',day:'numeric'}):'–'}
function daysLeft(ms){return Math.max(0,Math.ceil((ms-Date.now())/864e5))}
