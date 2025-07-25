(function(){
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();
  window.ctx = ctx;

  // Warm detuned pad → memory‑driven
  const pad1 = ctx.createOscillator(), pad2 = ctx.createOscillator();
  pad1.type = pad2.type = 'sawtooth';
  pad1.detune.value = -7; pad2.detune.value = 7;
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass'; padFilter.frequency.value = 300;
  const padGain = ctx.createGain(); padGain.gain.value = 0.02;
  pad1.connect(padFilter); pad2.connect(padFilter);
  padFilter.connect(padGain).connect(ctx.destination);
  pad1.start(); pad2.start();

  // Band‑pass bass → CPU‑driven
  const bassOsc = ctx.createOscillator();
  bassOsc.type = 'triangle';
  const bassFilter = ctx.createBiquadFilter();
  bassFilter.type = 'bandpass'; bassFilter.Q.value = 8; bassFilter.frequency.value = 200;
  const bassGain = ctx.createGain(); bassGain.gain.value = 0.15;
  bassOsc.connect(bassFilter).connect(bassGain).connect(ctx.destination);
  bassOsc.start();

  // Kick + chord progression
  const chordRoots = [220,261.63,196], playChord = () => {
    const root = chordRoots.shift();
    chordRoots.push(root);
    [0,1.25,1.5].forEach(i=> {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type='triangle'; o.frequency.setValueAtTime(root * i, ctx.currentTime);
      g.gain.setValueAtTime(0.05, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.5);
      o.connect(g).connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime+0.5);
    });
  };
  function playKick(){
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(150, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(60, ctx.currentTime+0.25);
    g.gain.setValueAtTime(1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.25);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime+0.25);
  }

  // Typing‑driven tempo
  let keyTimes = [], windowSec = Number(document.getElementById('typingWindow').value);
  document.getElementById('typingWindow').addEventListener('change', e=>windowSec=+e.target.value);
  window.addEventListener('keydown', e=>{ if(e.key.length===1) keyTimes.push(performance.now()); });

  let beatInt = null;
  function scheduleTempo(bpm){
    if(beatInt) clearInterval(beatInt);
    const ms = 60000/bpm;
    beatInt = setInterval(()=>{
      playKick(); playChord();
      window.dispatchEvent(new CustomEvent('audio-beat'));
    }, ms);
    document.getElementById('bpmDisplay').textContent = bpm.toFixed(0);
  }
  setInterval(()=>{
    const now=performance.now();
    keyTimes = keyTimes.filter(t=>now-t <= windowSec*1000);
    const speed = keyTimes.length/windowSec;
    document.getElementById('typingSpeed').textContent = speed.toFixed(1);
    const bpm = Math.max(30,30 + speed*30);
    scheduleTempo(bpm);
  }, 500);

  // React to CPU/memory/temp
  window.addEventListener('syn-event', e=>{
    const d=e.detail;
    if(d.type==='metric'){
      const cpu=d.cpu_percent, mem=d.memory_percent, temp=d.temperature;
      // CPU→bass
      const minF=+document.getElementById('cpuMinFreq').value;
      const maxF=+document.getElementById('cpuMaxFreq').value;
      const freq = minF + (cpu/100)*(maxF-minF);
      bassFilter.frequency.setValueAtTime(freq, ctx.currentTime);
      // Mem→pad cutoff
      padFilter.frequency.setValueAtTime(200 + mem*5, ctx.currentTime);
    }
  });

  // Resume on first click
  document.body.addEventListener('click', ()=>{ if(ctx.state==='suspended') ctx.resume(); },{once:true});
})();
