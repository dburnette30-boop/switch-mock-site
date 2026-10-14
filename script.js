document.getElementById('booking-form').addEventListener('submit',function(event){
  event.preventDefault();
  const preview=document.getElementById('inquiry-preview');
  const data=new FormData(this);
  preview.textContent='Inquiry preview\n\nName: '+data.get('name')+'\nEmail: '+data.get('email')+'\n\n'+data.get('message')+'\n\nThis message has not been sent. Contact the band through its Facebook, Instagram, or original website.';
  preview.hidden=false;
});

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
