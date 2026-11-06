/* Native interaction layer for the static Chari pages. No external runtime required. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 991px)');
const keyboard=(el,fn)=>el?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}});
function navigation(){
 $$('.w-nav').forEach(nav=>{
  const menu=$('.w-nav-menu',nav),buttons=$$('.w-nav-button',nav),drops=$$('.w-dropdown',nav);
  const closeDrops=except=>drops.forEach(d=>{if(d!==except){d.classList.remove('is-open');$('.w-dropdown-toggle',d)?.setAttribute('aria-expanded','false');$('.w-dropdown-list',d)?.classList.remove('w--open')}});
  const setMenu=open=>{if(!menu)return;menu.classList.toggle('is-open',open);menu.classList.toggle('w--nav-menu-open',open);buttons.forEach(b=>b.setAttribute('aria-expanded',String(open)));nav.classList.toggle('is-open',open);if(!open)closeDrops()};
  buttons.forEach(b=>{b.setAttribute('role','button');b.setAttribute('tabindex','0');b.setAttribute('aria-expanded','false');b.addEventListener('click',()=>setMenu(!menu?.classList.contains('is-open')));keyboard(b,()=>b.click())});
  drops.forEach(d=>{const t=$('.w-dropdown-toggle',d),list=$('.w-dropdown-list',d);if(!t||!list)return;
   const set=open=>{if(open)closeDrops(d);d.classList.toggle('is-open',open);list.classList.toggle('w--open',open);t.setAttribute('aria-expanded',String(open))};
   t.setAttribute('aria-expanded','false');t.setAttribute('tabindex','0');t.addEventListener('click',e=>{e.preventDefault();set(!d.classList.contains('is-open'))});keyboard(t,()=>t.click());
   d.addEventListener('mouseenter',()=>{if(!mobile.matches)set(true)});d.addEventListener('mouseleave',()=>{if(!mobile.matches)set(false)});
  });
  document.addEventListener('click',e=>{if(!nav.contains(e.target)){setMenu(false);closeDrops()}else if(!e.target.closest('.w-dropdown'))closeDrops()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);closeDrops()}});
  mobile.addEventListener?.('change',()=>setMenu(false));
 });
}
function sliders(){
 $$('.w-slider').forEach(root=>{
  const mask=$('.w-slider-mask',root),slides=$$('.w-slide',root),left=$('.w-slider-arrow-left',root),right=$('.w-slider-arrow-right',root),dots=$('.w-slider-nav',root);
  if(!mask||!slides.length)return;
  let index=0,timer=null,hover=false;const delay=Math.max(1200,Number(root.dataset.delay)||4000),duration=reduce.matches?0:Math.max(0,Number(root.dataset.duration)||500);
  const visible=()=>Math.max(1,Math.round(mask.clientWidth/(slides[0].getBoundingClientRect().width||mask.clientWidth)));
  const max=()=>Math.max(0,slides.length-visible());
  const render=(n,instant=false)=>{
   const last=max(),loop=root.dataset.infinite!=='false';index=loop?(n<0?last:n>last?0:n):Math.max(0,Math.min(last,n));
   const shift=(slides[index]?.offsetLeft||0)-(slides[0]?.offsetLeft||0);
   slides.forEach((s,i)=>{s.style.display='inline-block';s.style.transition=instant||reduce.matches?'none':'transform '+duration+'ms '+(root.dataset.easing||'ease');s.style.transform='translate3d('+(-shift)+'px,0,0)';s.setAttribute('aria-hidden',String(i<index||i>=index+visible()))});
   if(dots){const nodes=$$('.w-slider-dot',dots);nodes.forEach((d,i)=>{d.classList.toggle('w-active',i===index);d.setAttribute('aria-current',String(i===index))})}
  };
  const stop=()=>{if(timer)clearInterval(timer);timer=null};
  const start=()=>{stop();if(root.dataset.autoplay==='true'&&!reduce.matches&&!hover&&slides.length>visible())timer=setInterval(()=>render(index+1),delay)};
  left?.addEventListener('click',()=>{render(index-1);start()});right?.addEventListener('click',()=>{render(index+1);start()});
  root.addEventListener('mouseenter',()=>{hover=true;stop()});root.addEventListener('mouseleave',()=>{hover=false;start()});
  root.addEventListener('focusin',stop);root.addEventListener('focusout',start);
  let x=null;mask.addEventListener('touchstart',e=>{x=e.touches[0]?.clientX??null},{passive:true});mask.addEventListener('touchend',e=>{if(x===null||root.dataset.disableSwipe==='true')return;const delta=e.changedTouches[0].clientX-x;if(Math.abs(delta)>40){render(index+(delta<0?1:-1));start()}x=null},{passive:true});
  if(dots){dots.setAttribute('role','tablist');$$('.w-slider-dot',dots).forEach((d,i)=>{d.setAttribute('tabindex','0');d.addEventListener('click',()=>{render(i);start()});keyboard(d,()=>d.click())})}
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>render(Math.min(index,max()),true)).observe(mask);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());render(0,true);start();
 });
}
function tabs(){
 $$('.w-tabs').forEach(root=>{const links=$$('.w-tab-link',root),panes=$$('.w-tab-pane',root);
  const activate=i=>{links.forEach((l,j)=>{l.classList.toggle('w--current',j===i);l.setAttribute('aria-selected',String(j===i));l.setAttribute('tabindex',j===i?'0':'-1')});panes.forEach((p,j)=>{p.classList.toggle('w--tab-active',j===i);p.hidden=j!==i})};
  links.forEach((link,i)=>{link.setAttribute('role','tab');link.addEventListener('click',e=>{e.preventDefault();activate(i)});link.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const j=(i+(e.key==='ArrowRight'?1:-1)+links.length)%links.length;activate(j);links[j].focus()}})});
  activate(Math.max(0,links.findIndex(l=>l.classList.contains('w--current'))));
 });
}
function lightboxes(){
 $$('.w-lightbox').forEach(link=>link.addEventListener('click',e=>{
  const image=$('img',link),src=link.getAttribute('href')||image?.currentSrc||image?.src;if(!src||src==='#')return;
  e.preventDefault();const dialog=document.createElement('dialog');dialog.className='native-lightbox';dialog.innerHTML='<button type="button" aria-label="Close image" class="native-lightbox-close">×</button><img alt="">';
  const img=$('img',dialog);img.src=src;img.alt=image?.alt||'';document.body.append(dialog);
  dialog.addEventListener('click',ev=>{if(ev.target===dialog||ev.target.closest('button'))dialog.close()});dialog.addEventListener('close',()=>dialog.remove());
  if(dialog.showModal)dialog.showModal();else{dialog.setAttribute('open','');dialog.style.position='fixed';dialog.style.inset='0'}
 }));
}
function forms(){
 $$('form').forEach(form=>form.addEventListener('submit',e=>{
  if(!form.checkValidity())return;
  const action=form.getAttribute('action')||'';
  if(!action||/website-files\.com|legacy\.com/i.test(action)){
   e.preventDefault();let note=$('.native-form-notice',form);if(!note){note=document.createElement('p');note.className='native-form-notice';note.setAttribute('role','alert');form.append(note)}
   note.textContent='This form needs a configured submission endpoint. Your data has not been sent.';
  }
 }));
}
function motion(){
 if(reduce.matches||!('IntersectionObserver'in window))return;
 const targets=$$('[data-w-id]').filter(el=>!el.closest('.w-nav,.w-slider,.w-tabs')&&el.getBoundingClientRect().height>0);
 const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target;io.unobserve(el);
  if(el.animate){el.animate([{opacity:.82,transform:'translate3d(0,12px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'})}
 }),{threshold:.08,rootMargin:'0px 0px 30px 0px'});
 targets.forEach(el=>io.observe(el));
}
function init(){navigation();sliders();tabs();lightboxes();forms();motion();$$('.promotion-label-close').forEach(b=>b.addEventListener('click',()=>b.closest('.promotion-label-left')?.remove()))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();