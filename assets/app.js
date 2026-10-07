const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const menu=$('.menu-button'),nav=$('.sidebar'),backdrop=$('.nav-backdrop');
function closeMenu(){nav.classList.remove('open');backdrop.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','주제 메뉴 열기');document.body.style.overflow='';}
menu.addEventListener('click',()=>{const open=!nav.classList.contains('open');if(!open){closeMenu();return;}nav.classList.add('open');backdrop.hidden=false;menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','주제 메뉴 닫기');document.body.style.overflow='hidden';$('.nav-home',nav).focus();});
backdrop.addEventListener('click',closeMenu);
nav.addEventListener('click',e=>{if(e.target.closest('a')&&window.innerWidth<=800)closeMenu();});
window.addEventListener('resize',()=>{if(window.innerWidth>800)closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}if(e.key==='Tab'&&nav.classList.contains('open')){const focusables=[menu,...$$('a',nav)],first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
const dialog=$('#search-dialog'),input=$('#search-input'),results=$('#search-results'),status=$('.search-status');
let indexPromise=null,searchGeneration=0;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function loadIndex(){if(!indexPromise)indexPromise=fetch(new URL('assets/search-index.json',document.baseURI)).then(r=>{if(!r.ok)throw Error('Index failed');return r.json();}).catch(e=>{indexPromise=null;throw e;});return indexPromise;}
async function search(){const gen=++searchGeneration;const query=input.value.normalize('NFC').trim().toLowerCase();let index;try{index=await loadIndex();}catch{status.textContent='자료를 불러오지 못했습니다. 연결을 확인하고 다시 검색해 주세요.';results.innerHTML='';return;}if(gen!==searchGeneration)return;
 const words=query.split(/\s+/).filter(Boolean);
 const matches=index.map(a=>{const title=a.title.toLowerCase(),tags=a.tags.join(' ').toLowerCase(),meta=(a.description+' '+a.category).toLowerCase(),text=a.text.toLowerCase();if(words.some(w=>![title,tags,meta,text].some(x=>x.includes(w))))return null;const score=words.reduce((sum,w)=>sum+(title.includes(w)?20:0)+(tags.includes(w)?12:0)+(meta.includes(w)?5:0)+(text.includes(w)?1:0),0);return {a,score};}).filter(Boolean).sort((a,b)=>b.score-a.score);
 const shown=query?matches.slice(0,15):index.slice(0,6).map(a=>({a}));
 status.textContent=query?`${matches.length}개 자료를 찾았습니다.${matches.length>15?' 관련도가 높은 15개를 표시합니다.':''}`:'추천 가이드 · 제목과 본문을 함께 검색합니다.';
 results.innerHTML=shown.length?shown.map(({a})=>`<a class="search-result" href="${escape(a.url)}"><span>${escape(a.category)}</span><h3>${escape(a.title)}</h3><p>${escape(a.description)}</p></a>`).join(''):'<p class="search-empty">일치하는 자료가 없습니다. 다른 용어나 도구 이름으로 검색해 보세요.</p>';
}
function openSearch(){closeMenu();dialog.showModal();input.focus();search();}
$('.search-trigger').addEventListener('click',openSearch);
$('.search-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dialog.close();}});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
input.addEventListener('input',search);
document.addEventListener('keydown',e=>{const tag=document.activeElement?.tagName;if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(tag)&&!document.activeElement?.isContentEditable&&!dialog.open){e.preventDefault();openSearch();}});
$$('.copy-code').forEach(button=>button.addEventListener('click',async()=>{const text=$('pre code',button.closest('.code-block')).textContent;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}else{const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();button.focus();if(!ok)throw Error('Copy failed');}button.textContent='복사됨';}catch{button.textContent='직접 선택해 복사';}setTimeout(()=>button.textContent='복사',2200);}));
const headings=$$('.prose>h2'),tocLinks=$$('.toc nav a');
if(headings.length&&tocLinks.length){const update=()=>{let current=headings[0];for(const h of headings){if(h.getBoundingClientRect().top<=140)current=h;else break;}tocLinks.forEach(a=>{const active=decodeURIComponent(a.hash.slice(1))===current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});};window.addEventListener('scroll',update,{passive:true});update();}
