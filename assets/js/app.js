const progressBar=document.getElementById('progressBar');
const menuToggle=document.getElementById('menuToggle');
const rail=document.getElementById('rail');
const navLinks=[...document.querySelectorAll('.rail nav a')];
const scenes=[...document.querySelectorAll('.scene')];
const reveals=[...document.querySelectorAll('.reveal')];

const updateProgress=()=>{
  const max=document.documentElement.scrollHeight-innerHeight;
  const progress=max>0?scrollY/max:0;
  progressBar.style.width=`${Math.min(100,Math.max(0,progress*100))}%`;
};
addEventListener('scroll',updateProgress,{passive:true});
addEventListener('resize',updateProgress,{passive:true});
updateProgress();

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reducedMotion){
  reveals.forEach(el=>el.classList.add('visible'));
}else{
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }),{threshold:.1,rootMargin:'0px 0px -5% 0px'});
  reveals.forEach(el=>revealObserver.observe(el));
}

const setActiveSection=id=>{
  navLinks.forEach(link=>{
    const active=link.dataset.section===id;
    link.classList.toggle('active',active);
    if(active) link.setAttribute('aria-current','true');
    else link.removeAttribute('aria-current');
  });
};
const sectionObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      setActiveSection(entry.target.id);
      document.body.dataset.theme=entry.target.dataset.theme||'dark';
    }
  });
},{rootMargin:'-42% 0px -48% 0px',threshold:0});
scenes.forEach(scene=>sectionObserver.observe(scene));

const setMenu=open=>{
  rail.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open);
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.setAttribute('aria-label',open?'Close presentation navigation':'Open presentation navigation');
};
menuToggle.addEventListener('click',()=>setMenu(!rail.classList.contains('open')));
navLinks.forEach(link=>link.addEventListener('click',()=>setMenu(false)));
addEventListener('resize',()=>{if(innerWidth>900)setMenu(false)},{passive:true});

addEventListener('keydown',event=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
  if(event.key==='Escape'){
    setMenu(false);
    menuToggle.focus({preventScroll:true});
    return;
  }
  const index=scenes.findIndex(scene=>{
    const rect=scene.getBoundingClientRect();
    return rect.top<=innerHeight*.5&&rect.bottom>=innerHeight*.5;
  });
  if((event.key==='ArrowDown'||event.key==='PageDown')&&index>=0&&index<scenes.length-1){
    event.preventDefault();
    scenes[index+1].scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
  }
  if((event.key==='ArrowUp'||event.key==='PageUp')&&index>0){
    event.preventDefault();
    scenes[index-1].scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
  }
});
