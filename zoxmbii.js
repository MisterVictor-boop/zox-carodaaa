(function(){
function init(){
var gate = document.getElementById('zox-gate');
var enterBtn = document.getElementById('zox-enter-btn');
var page = document.getElementById('zox-page');
if (!gate || !enterBtn) return;
enterBtn.addEventListener('click', function(){
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
var ytPlayer = null, ytReady = false, ytFailed = false, ytStopTimer = null, ytPlaying = false;
window.onYouTubeIframeAPIReady = function(){
try{
ytPlayer = new YT.Player('zox-yt-player', {
height: '2', width: '2',
videoId: 'Q_9VMaX61nI',
playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1, rel: 0, fs: 0, playsinline: 1 },
events: {
onReady: function(){ ytReady = true; },
onError: function(){ ytFailed = true; },
onStateChange: function(e){ ytPlaying = (e.data === YT.PlayerState.PLAYING); }
}
});
}catch(e){ ytFailed = true; }
};
function playYtToot(cb){
if (ytFailed || !ytReady || !ytPlayer) { cb(false); return; }
try{
ytPlaying = false;
ytPlayer.seekTo(0, true);
ytPlayer.playVideo();
clearTimeout(ytStopTimer);
ytStopTimer = setTimeout(function(){ try{ ytPlayer.pauseVideo(); }catch(e){} }, 6000);
setTimeout(function(){ cb(ytPlaying); }, 250);
}catch(e){ cb(false); }
}
function tootAt(photo, wrap){
photo.classList.remove('zox-shaking');
void photo.offsetWidth;
photo.classList.add('zox-shaking');
unlockAudio();
playYtToot(function(worked){ if (!worked) playToot(); });
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
window.open(target, '_blank', 'noopener');
});
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('DOMContentLoaded', initToot);
document.addEventListener('DOMContentLoaded', initVipGate);
} else {
init();
initToot();
initVipGate();
}
window.zoxEnterSite = function(){
var gate = document.getElementById('zox-gate');
if (gate) { gate.setAttribute('hidden', ''); gate.style.display = 'none'; }
};
})();
