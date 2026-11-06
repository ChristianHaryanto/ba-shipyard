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
  let page=0,timer=null,hover=false,navCount=0;
  const delay=Math.max(1200,Number(root.dataset.delay)||4000),duration=reduce.matches?0:Math.max(0,Number(root.dataset.duration)||500);
  const visible=()=>Math.max(1,Math.floor((mask.clientWidth+1)/(slides[0].getBoundingClientRect().width||mask.clientWidth)));
  const pages=()=>Math.ceil(slides.length/visible());
  const stop=()=>{if(timer)clearInterval(timer);timer=null};
  const render=(n,instant=false)=>{
   const total=pages(),loop=root.dataset.infinite!=='false';page=loop?(n<0?total-1:n>=total?0:n):Math.max(0,Math.min(total-1,n));
   const first=page*visible(),offset=(slides[first]?.offsetLeft||0)-(slides[0]?.offsetLeft||0);
   slides.forEach((slide,i)=>{slide.style.display='inline-block';slide.style.transition=instant||reduce.matches?'none':'transform '+duration+'ms '+(root.dataset.easing||'ease');slide.style.transform='translate3d('+(-offset)+'px,0,0)';slide.setAttribute('aria-hidden',String(i<first||i>=first+visible()))});
   if(dots){if(navCount!==total){dots.replaceChildren();for(let i=0;i<total;i++){const dot=document.createElement('div');dot.className='w-slider-dot';dot.setAttribute('role','button');dot.setAttribute('tabindex','0');dot.setAttribute('aria-label','Go to slide group '+(i+1));dot.addEventListener('click',()=>{render(i);start()});keyboard(dot,()=>dot.click());dots.append(dot)}navCount=total}
    $$('.w-slider-dot',dots).forEach((dot,i)=>{dot.classList.toggle('w-active',i===page);dot.setAttribute('aria-current',String(i===page))})}
  };
  const start=()=>{stop();if(root.dataset.autoplay==='true'&&!reduce.matches&&!hover&&pages()>1)timer=setInterval(()=>render(page+1),delay)};
  left?.addEventListener('click',()=>{render(page-1);start()});right?.addEventListener('click',()=>{render(page+1);start()});
  [left,right].forEach((arrow,i)=>{if(!arrow)return;arrow.setAttribute('role','button');arrow.setAttribute('tabindex','0');keyboard(arrow,()=>arrow.click())});
  root.addEventListener('mouseenter',()=>{hover=true;stop()});root.addEventListener('mouseleave',()=>{hover=false;start()});
  root.addEventListener('focusin',stop);root.addEventListener('focusout',start);
  let x=null;mask.addEventListener('touchstart',e=>{x=e.touches[0]?.clientX??null},{passive:true});mask.addEventListener('touchend',e=>{if(x===null||root.dataset.disableSwipe==='true')return;const delta=e.changedTouches[0].clientX-x;if(Math.abs(delta)>40){render(page+(delta<0?1:-1));start()}x=null},{passive:true});
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{render(Math.min(page,pages()-1),true);start()}).observe(mask);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());render(0,true);start();
 });
}
function accordions(){
 $('.accordion-item.w-dropdown').forEach(item=>{
  const toggle=$('.accordion-toggle',item),panel=$('.accordion-list',item),icon=$('.accordion-icon',item);
  if(!toggle||!panel)return;
  panel.style.height='0px';panel.style.overflow='hidden';panel.style.display='none';
  toggle.setAttribute('role','button');toggle.setAttribute('tabindex','0');toggle.setAttribute('aria-expanded','false');
  const set=open=>{
   item.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));
   if(open){panel.style.display='block';panel.classList.add('w--open');panel.style.transition=reduce.matches?'none':'height 350ms ease';panel.style.height='0px';requestAnimationFrame(()=>{panel.style.height=panel.scrollHeight+'px'})}
   else {panel.style.height=panel.scrollHeight+'px';requestAnimationFrame(()=>{panel.style.height='0px'});setTimeout(()=>{if(!item.classList.contains('is-open')){panel.classList.remove('w--open');panel.style.display='none'}},reduce.matches?0:370)}
   if(icon)icon.style.transform=open?'rotate(180deg)':'rotate(0deg)';
  };
  panel.addEventListener('transitionend',()=>{if(item.classList.contains('is-open'))panel.style.height='auto'});
  toggle.addEventListener('click',e=>{e.preventDefault();set(!item.classList.contains('is-open'))});keyboard(toggle,()=>toggle.click());
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
function init(){navigation();sliders();accordions();tabs();lightboxes();forms();$$('.promotion-label-close').forEach(b=>b.addEventListener('click',()=>b.closest('.promotion-label-left')?.remove()))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();