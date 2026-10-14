/* Account for wrapped navigation, and return Home to the very top. */
if(document.body.classList.contains('cinematic-home')){
  const header=document.querySelector('.header');
  const sizeOpeningScene=()=>{
    document.documentElement.style.setProperty('--home-header-height',header.getBoundingClientRect().height+'px');
  };
  sizeOpeningScene();
  if('ResizeObserver' in window) new ResizeObserver(sizeOpeningScene).observe(header);
  window.addEventListener('resize',sizeOpeningScene);
  if('scrollRestoration' in history) history.scrollRestoration='manual';
  const showHomeTop=()=>{
    if(!location.hash || location.hash==='#top') window.scrollTo({top:0,left:0,behavior:'instant'});
  };
  window.addEventListener('pageshow',showHomeTop);
  showHomeTop();
}
