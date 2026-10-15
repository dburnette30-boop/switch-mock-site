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

/* iPad Safari can stop short when following the footer's body anchor. */
if(document.body.classList.contains('cinematic-home')){
  const tabletLayout=window.matchMedia('(min-width: 701px) and (max-width: 1366px) and (pointer: coarse)');
  const returnTabletHome=()=>{
    window.scrollTo({top:0,left:0,behavior:'instant'});
    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:'instant'});
    });
  };
  document.addEventListener('click',event=>{
    const link=event.target.closest('footer a[href="#top"]');
    if(!tabletLayout.matches || !link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.replaceState(history.state,'','#top');
    returnTabletHome();
  });
}
