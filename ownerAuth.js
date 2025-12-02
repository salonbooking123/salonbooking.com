// ownerAuth.js
document.addEventListener('DOMContentLoaded', () => {
const signupForm = document.getElementById('ownerSignupForm');
if(signupForm){
signupForm.onsubmit = (e)=>{
e.preventDefault();
const name = document.getElementById('ou_name').value.trim();
const email = document.getElementById('ou_email').value.trim();
const pass = document.getElementById('ou_pass').value.trim();
let owners = JSON.parse(localStorage.getItem('owners')||'[]');
if(owners.some(o=>o.email===email)){ alert('Email already registered'); return; }
const id = Date.now().toString();
owners.push({id,name,email,pass});
localStorage.setItem('owners', JSON.stringify(owners));
alert('Account created. Please sign in.'); location.href='signin.html';
};
}


const signinForm = document.getElementById('ownerSigninForm');
if(signinForm){
signinForm.onsubmit = (e)=>{
e.preventDefault();
const email = document.getElementById('oi_email').value.trim();
const pass = document.getElementById('oi_pass').value.trim();
let owners = JSON.parse(localStorage.getItem('owners')||'[]');
const owner = owners.find(o=>o.email===email && o.pass===pass);
if(!owner){ document.getElementById('ownerSigninNote').innerText='Invalid credentials'; return; }
localStorage.setItem('loggedOwner', owner.id);
// create salon profile if not exists
let salons = JSON.parse(localStorage.getItem('bs_salons_v1')||'[]');
if(!salons.some(s=>s.ownerId==owner.id)){
salons.push({ id:'salon_'+Date.now(), ownerId: owner.id, name: owner.name + "'s Salon", tag:'Your tag', images:[] });
localStorage.setItem('bs_salons_v1', JSON.stringify(salons));
}
location.href = 'owner-profile.html';
};
}
});