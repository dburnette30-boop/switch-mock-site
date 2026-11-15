document.getElementById('booking-form').addEventListener('submit',function(event){
  event.preventDefault();
  const preview=document.getElementById('inquiry-preview');
  const data=new FormData(this);
  preview.textContent='Inquiry preview\n\nName: '+data.get('name')+'\nEmail: '+data.get('email')+'\n\n'+data.get('message')+'\n\nThis message has not been sent. Contact the band through its Facebook, Instagram, or original website.';
  preview.hidden=false;
});
