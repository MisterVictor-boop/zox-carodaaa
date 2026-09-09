(function(){
function zoxAgeOk(){
try{ return localStorage.getItem('zox_age_ok') === '1'; }catch(e){ return false; }
}
function zoxSetAgeOk(){
try{ localStorage.setItem('zox_age_ok', '1'); }catch(e){}
}
function init(){
var gate = document.getElementById('zox-gate');
var enterBtn = document.getElementById('zox-enter-btn');
var page = document.getElementById('zox-page');
if (!gate || !enterBtn) return;
if (zoxAgeOk()){
gate.setAttribute('hidden', '');
gate.style.display = 'none';
}
enterBtn.addEventListener('click', function(){
zoxSetAgeOk();
gate.setAttribute('hidden', '');
gate.style.display = 'none';
if (page && page.focus) page.focus();
});
}
var audioCtx = null;
function unlockAudio(){
try{
audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
if (audioCtx.state === 'suspended') audioCtx.resume();
}catch(e){}
}
function playToot(){
try{
unlockAudio();
if (!audioCtx) return;
var dur = 0.55;
var now = audioCtx.currentTime;
var osc = audioCtx.createOscillator();
osc.type = 'sawtooth';
osc.frequency.setValueAtTime(150, now);
osc.frequency.exponentialRampToValueAtTime(55, now + dur);
var wobble = audioCtx.createOscillator();
wobble.type = 'sine';
wobble.frequency.setValueAtTime(28, now);
var wobbleGain = audioCtx.createGain();
wobbleGain.gain.value = 40;
wobble.connect(wobbleGain);
wobbleGain.connect(osc.frequency);
var lowpass = audioCtx.createBiquadFilter();
lowpass.type = 'lowpass';
lowpass.frequency.value = 500;
var gain = audioCtx.createGain();
gain.gain.setValueAtTime(0.0001, now);
gain.gain.exponentialRampToValueAtTime(0.22, now + 0.04);
gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
osc.connect(lowpass);
lowpass.connect(gain);
gain.connect(audioCtx.destination);
osc.start(now);
wobble.start(now);
osc.stop(now + dur + 0.05);
wobble.stop(now + dur + 0.05);
}catch(e){ /* Web Audio unavailable — visual gag still plays */ }
}
function zoxMusicMuted(){
try{ return localStorage.getItem('zox_music_muted') === '1'; }catch(e){ return false; }
}
function zoxSetMusicMuted(v){
try{ localStorage.setItem('zox_music_muted', v ? '1' : '0'); }catch(e){}
}
var bgMusic = new Audio('https://cdn.jsdelivr.net/gh/MisterVictor-boop/zox-carodaaa@main/Romantic%20-%20Mannequin%20Pussy.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.35;
bgMusic.muted = zoxMusicMuted();
var musicStarted = false;
function startMusic(){
if (musicStarted) return;
musicStarted = true;
bgMusic.play().catch(function(){ musicStarted = false; });
}
function initMusic(){
var btn = document.getElementById('zox-mute-btn');
function tryStart(){
startMusic();
document.removeEventListener('click', tryStart);
document.removeEventListener('keydown', tryStart);
document.removeEventListener('touchend', tryStart);
}
document.addEventListener('click', tryStart);
document.addEventListener('keydown', tryStart);
document.addEventListener('touchend', tryStart);
if (!btn) return;
function render(){
btn.textContent = bgMusic.muted ? '🔇' : '🔊';
btn.setAttribute('aria-pressed', String(bgMusic.muted));
btn.setAttribute('aria-label', bgMusic.muted ? 'Unmute background music' : 'Mute background music');
}
render();
btn.addEventListener('click', function(){
bgMusic.muted = !bgMusic.muted;
zoxSetMusicMuted(bgMusic.muted);
render();
startMusic();
});
}
var fartAudio = new Audio('https://cdn.jsdelivr.net/gh/MisterVictor-boop/zox-carodaaa@main/fart.mp3');
fartAudio.preload = 'auto';
function playFart(){
try{
fartAudio.currentTime = 0;
var p = fartAudio.play();
if (p && p.catch) { p.catch(function(){ playToot(); }); }
}catch(e){ playToot(); }
}
function tootAt(photo, wrap){
photo.classList.remove('zox-shaking');
void photo.offsetWidth;
photo.classList.add('zox-shaking');
unlockAudio();
playFart();
var puff = document.createElement('span');
puff.className = 'zox-toot';
puff.textContent = '💨';
puff.setAttribute('aria-hidden', 'true');
wrap.appendChild(puff);
setTimeout(function(){ puff.remove(); }, 1200);
setTimeout(function(){ photo.classList.remove('zox-shaking'); }, 550);
}
function initToot(){
var photo = document.getElementById('zox-id-photo');
var wrap = document.getElementById('zox-photo-wrap');
if (!photo || !wrap) return;
photo.addEventListener('click', function(){ tootAt(photo, wrap); });
photo.addEventListener('keydown', function(e){
if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
e.preventDefault();
tootAt(photo, wrap);
}
});
}
function initVipGate(){
var link = document.getElementById('zox-vip-link');
var gate = document.getElementById('zox-vip-gate');
var form = document.getElementById('zox-vip-form');
var dob = document.getElementById('zox-vip-dob');
var cancel = document.getElementById('zox-vip-cancel');
var error = document.getElementById('zox-vip-error');
if (!link || !gate || !form || !dob || !cancel || !error) return;
var target = link.getAttribute('href');
link.addEventListener('click', function(e){
e.preventDefault();
if (zoxAgeOk()){
window.open(target, '_blank', 'noopener');
return;
}
error.setAttribute('hidden', '');
dob.value = '';
gate.removeAttribute('hidden');
dob.focus();
});
cancel.addEventListener('click', function(){
gate.setAttribute('hidden', '');
});
form.addEventListener('submit', function(e){
e.preventDefault();
if (!dob.value){
error.textContent = 'Please enter your date of birth.';
error.removeAttribute('hidden');
return;
}
var birth = new Date(dob.value);
var today = new Date();
var age = today.getFullYear() - birth.getFullYear();
var m = today.getMonth() - birth.getMonth();
if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
if (age < 18 || isNaN(age)){
error.textContent = 'You must be 18 or older to continue.';
error.removeAttribute('hidden');
window.close();
setTimeout(function(){ window.location.href = 'https://www.google.com'; }, 150);
return;
}
gate.setAttribute('hidden', '');
zoxSetAgeOk();
window.open(target, '_blank', 'noopener');
});
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('DOMContentLoaded', initToot);
document.addEventListener('DOMContentLoaded', initVipGate);
document.addEventListener('DOMContentLoaded', initMusic);
} else {
init();
initToot();
initVipGate();
initMusic();
}
window.zoxEnterSite = function(){
zoxSetAgeOk();
var gate = document.getElementById('zox-gate');
if (gate) { gate.setAttribute('hidden', ''); gate.style.display = 'none'; }
};
})();
