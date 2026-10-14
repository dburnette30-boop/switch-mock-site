const bookingForm=document.getElementById('booking-form');
if(bookingForm) bookingForm.addEventListener('submit',function(event){
  event.preventDefault();
  const preview=document.getElementById('inquiry-preview');
  const data=new FormData(this);
  const body='Booking inquiry for SWITCH featuring Ana\r\n\r\nName: '+data.get('name')+'\r\nEmail: '+data.get('email')+'\r\n\r\nEvent details:\r\n'+data.get('message');
  const mailto='mailto:Ananfriends@aol.com?subject='+encodeURIComponent('SWITCH featuring Ana — Booking inquiry')+'&body='+encodeURIComponent(body);
  preview.replaceChildren();
  const note=document.createElement('p');
  note.textContent='Review your inquiry and press Send in your email app. If it does not open, use the email link below.';
  const link=document.createElement('a');
  link.href=mailto;
  link.textContent='Email Ananfriends@aol.com';
  preview.append(note,link);
  preview.hidden=false;
  window.location.href=mailto;
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
