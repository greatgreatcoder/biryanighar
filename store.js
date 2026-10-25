/* Biryani Ghar data store, shared by the public pages and admin.html.
   If the admin has published changes, this rewrites the menu, chef's special, recommendations and
   homepage dishes before the page's own scripts run. With no saved changes, the pages stay as written. */
(function(w,d){
'use strict';
var KEY='bg_data_v1',IMG='https://www.qissa.co.uk/wp-content/uploads/2026/08/mp-slide-0',
CATS=[{id:'biryani',t:'Dum Biryani'},{id:'kebabs',t:'Kebabs & Tikkas'},{id:'curries',t:'Curries'},{id:'sides',t:'Breads & Sides'},{id:'desserts',t:'Desserts'},{id:'drinks',t:'Drinks'}],
M={
biryani:'Chicken Dum Biryani|349;Mutton Dum Biryani|449;Veg Dum Biryani|299|v;Egg Biryani|279;Prawn Biryani|499;Paneer Tikka Biryani|329|v;Hyderabadi Special Biryani|429',
kebabs:'Seekh Kebab|299;Chicken Tikka|329;Malai Tikka|349;Hara Bhara Kebab|249|v;Paneer Tikka|279|v;Mutton Galouti|399;Tandoori Platter|649',
curries:'Butter Chicken|379;Mutton Rogan Josh|459;Dal Makhani|269|v;Paneer Butter Masala|329|v;Chicken Korma|359;Kadhai Paneer|319|v',
sides:'Butter Naan|59|v;Garlic Naan|79|v;Tandoori Roti|39|v;Boondi Raita|89|v;Mirchi ka Salan|99|v;Onion Salad|49|v',
desserts:'Gulab Jamun|149|v;Phirni|129|v;Shahi Tukda|169|v;Double ka Meetha|159|v;Kulfi Falooda|179|v',
drinks:'Masala Chaas|69|v;Sweet Lassi|89|v;Rose Sharbat|79|v;Fresh Lime Soda|79|v;Masala Chai|49|v;Soft Drinks|60|v'},
H='Chicken Dum Biryani|349|35|biryani;Mutton Dum Biryani|449|45|biryani;Veg Dum Biryani|299|30|biryani;Seekh Kebab|299|20|kebabs;Chicken Tikka|329|25|kebabs;Butter Chicken|379|25|curries;Paneer Butter Masala|329|20|curries;Gulab Jamun|149|10|desserts;Phirni|129|10|desserts';

function pr(p){p=String(p==null?'':p).trim();return p.charAt(0)==='₹'?p:'₹'+p}
function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

function defaults(){
 var m={};
 CATS.forEach(function(c){m[c.id]=M[c.id].split(';').map(function(s){var a=s.split('|');return{n:a[0],p:'₹'+a[1],v:a[2]==='v'}})});
 return{
  special:{on:true,label:"Chef's special of the month",name:'Zafrani Handi Biryani',badge:'NEW',desc:'Saffron-laced basmati layered with slow-braised mutton, caramelised onions and whole spices, sealed and cooked dum.',price:'₹549'},
  menu:m,
  home:H.split(';').map(function(s,i){var a=s.split('|');return{n:a[0],p:'₹'+a[1],t:a[2],c:a[3],img:IMG+(i+1)+'-768x768.webp'}}),
  recs:[
   {n:'Family Handi Combo',d:'Perfect for four, with raita, salan and kebabs.',r:'4.8',p:'₹1,499',img:IMG+'2-768x768.webp'},
   {n:'Kebab Platter',d:'Seekh, tikka and malai, fresh off the grill.',r:'4.7',p:'₹799',img:IMG+'5-768x768.webp'}]};
}

function load(){
 var x=defaults(),s=null;
 try{s=JSON.parse(localStorage.getItem(KEY))}catch(_){}
 if(!s||typeof s!=='object')return x;
 for(var k in x)if(s[k]==null)s[k]=x[k];
 CATS.forEach(function(c){if(!s.menu[c.id])s.menu[c.id]=[]});
 return s;
}
function save(D){try{localStorage.setItem(KEY,JSON.stringify(D));return true}catch(_){return false}}
function reset(){try{localStorage.removeItem(KEY)}catch(_){}}

function hydrate(){
 var raw=null;try{raw=localStorage.getItem(KEY)}catch(_){}
 if(!raw)return;
 var D=load(),s=D.special,q=function(sel,r){return(r||d).querySelector(sel)};

 /* chef's special (menu page) */
 var sp=d.getElementById('spc');
 if(sp){
  if(s.on===false)sp.style.display='none';
  else{sp.style.display='';sp.innerHTML='<em>'+e(s.label)+'</em><h2>'+e(s.name)+'</h2>'+(s.badge?'<b>'+e(s.badge)+'</b>':'')+'<p>'+e(s.desc)+'</p><span class="p2">'+e(pr(s.price))+'</span>'}
 }

 /* menu dishes, one list per category */
 CATS.forEach(function(c){
  var sec=q('.sec[data-cat="'+c.id+'"]');if(!sec)return;
  var it=D.menu[c.id]||[];
  q('.list',sec).innerHTML=it.map(function(o){return'<div class="r"><span class="n">'+e(o.n)+(o.v?'<span class="vg">VEG</span>':'')+'</span><i></i><span class="p">'+e(pr(o.p))+'</span></div>'}).join('');
  sec.style.display=it.length?'':'none';
 });

 /* homepage: Explore Our Cuisine */
 var t=d.getElementById('trk');
 if(t)t.innerHTML=D.home.map(function(o){return'<article class="dc" data-c="'+e(o.c)+'"><div class="tl"><img src="'+e(o.img)+'" alt="'+e(o.n)+'" loading="lazy" decoding="async" draggable="false"></div><div class="nm"><span>'+e(o.n)+'</span><span>'+e(pr(o.p))+'</span></div><div class="tm"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'+e(o.t)+' Mins</div></article>'}).join('');

 /* homepage: recommendation cards (two slots) */
 [].slice.call(d.querySelectorAll('.mini')).forEach(function(m,i){
  var r=D.recs[i];if(!r)return;
  q('b',m).textContent=r.n;q('small',m).textContent=r.d;q('em',m).textContent='★ '+r.r;q('.pr',m).textContent=pr(r.p);
  if(r.img)q('img',m).src=r.img;
 });
}

w.BG={KEY:KEY,CATS:CATS,load:load,save:save,reset:reset,defaults:defaults,pr:pr,e:e};
hydrate();
})(window,document);
