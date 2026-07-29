const progressBar=document.getElementById('progressBar');
const menuToggle=document.getElementById('menuToggle');
const rail=document.getElementById('rail');
const navLinks=[...document.querySelectorAll('.rail nav a')];
const scenes=[...document.querySelectorAll('.scene')];
const reveals=[...document.querySelectorAll('.reveal')];

const updateProgress=()=>{const max=document.documentElement.scrollHeight-innerHeight;const p=max>0?scrollY/max:0;progressBar.style.width=`${p*100}%`};
addEventListener('scroll',updateProgress,{passive:true});updateProgress();

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible')}),{threshold:.12});
reveals.forEach(el=>revealObserver.observe(el));

const sectionObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.dataset.section===entry.target.id));document.body.dataset.theme=entry.target.dataset.theme||'dark'}})},{rootMargin:'-42% 0px -48% 0px',threshold:0});
scenes.forEach(s=>sectionObserver.observe(s));

menuToggle.addEventListener('click',()=>{const open=rail.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open))});
navLinks.forEach(link=>link.addEventListener('click',()=>{rail.classList.remove('open');menuToggle.setAttribute('aria-expanded','false')}));
addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;const index=scenes.findIndex(s=>{const r=s.getBoundingClientRect();return r.top<=innerHeight*.5&&r.bottom>=innerHeight*.5});if((e.key==='ArrowDown'||e.key==='PageDown')&&index<scenes.length-1){e.preventDefault();scenes[index+1].scrollIntoView({behavior:'smooth'})}if((e.key==='ArrowUp'||e.key==='PageUp')&&index>0){e.preventDefault();scenes[index-1].scrollIntoView({behavior:'smooth'})}if(e.key==='Escape'){rail.classList.remove('open');menuToggle.setAttribute('aria-expanded','false')}});
