(function(){
  'use strict';

  /* ── Custom cursor (gold glow follows mouse) ── */
  var curEl = document.getElementById('cur');
  if (curEl) {
    function moveCur(e) {
      curEl.style.left = e.clientX + 'px';
      curEl.style.top = e.clientY + 'px';
    }
    document.addEventListener('mousemove', moveCur);
    document.addEventListener('mouseenter', moveCur);
  }

  /* ── Canvas wave animation ── */
  var cv = document.getElementById('cv');
  if (cv) {
    var ctx = cv.getContext('2d');
    function rsz() { cv.width = innerWidth; cv.height = innerHeight; }
    rsz();
    window.addEventListener('resize', rsz);

    var tick = 0;
    var wv = [
      { r: .50, a: 34, f: .012, s: .018, op: .09 },
      { r: .43, a: 18, f: .018, s: .024, op: .06 },
      { r: .57, a: 22, f: .015, s: .020, op: .06 },
      { r: .33, a: 11, f: .022, s: .030, op: .035 },
      { r: .67, a: 13, f: .010, s: .014, op: .035 }
    ];

    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      var g = ctx.createRadialGradient(cv.width / 2, cv.height * .45, 0, cv.width / 2, cv.height * .45, cv.width * .65);
      g.addColorStop(0, 'rgba(42,26,5,.35)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cv.width, cv.height);
      wv.forEach(function(w) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(201,148,58,' + w.op + ')';
        ctx.lineWidth = 1.2;
        var by = cv.height * w.r;
        for (var x = 0; x <= cv.width; x += 3) {
          var y = by + Math.sin(x * w.f + tick * w.s) * w.a + Math.sin(x * w.f * 2.4 - tick * w.s * 1.7) * (w.a * .25);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      tick++;
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Background audio + sound toggle ── */
  var audio = new Audio('745373__audiocoffee__ambient-future-tech-loop-ver.wav');
  audio.loop = true;
  audio.volume = 0.3;
  var audioPlaying = false;
  var soundBtn = document.getElementById('soundBtn');
  var wasMuted = localStorage.getItem('seismic_muted') === 'true';

  function playAudio() {
    audio.play().then(function() {
      audioPlaying = true;
      if (soundBtn) { soundBtn.textContent = '\uD83D\uDD0A'; soundBtn.classList.add('playing'); }
      localStorage.setItem('seismic_muted', 'false');
    }).catch(function() {});
  }

  function pauseAudio() {
    audio.pause();
    audioPlaying = false;
    if (soundBtn) { soundBtn.textContent = '\uD83D\uDD07'; soundBtn.classList.remove('playing'); }
    localStorage.setItem('seismic_muted', 'true');
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (audioPlaying) { pauseAudio(); } else { playAudio(); }
    });
  }

  /* Auto-play on first user interaction if not previously muted */
  if (!wasMuted) {
    function autoPlay() {
      playAudio();
      document.removeEventListener('click', autoPlay);
      document.removeEventListener('touchstart', autoPlay);
    }
    document.addEventListener('click', autoPlay);
    document.addEventListener('touchstart', autoPlay);
  }

  /* ── SFX (synthesized) ── */
  var sfxCtx = null;
  function ensureSfx() {
    if (sfxCtx) return;
    try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  }

  function sfxTransition() {
    if (!sfxCtx) return;
    try {
      var now = sfxCtx.currentTime;
      var o = sfxCtx.createOscillator(), g = sfxCtx.createGain();
      o.connect(g); g.connect(sfxCtx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(40, now);
      o.frequency.exponentialRampToValueAtTime(130, now + .25);
      o.frequency.exponentialRampToValueAtTime(28, now + .7);
      g.gain.setValueAtTime(.07, now);
      g.gain.exponentialRampToValueAtTime(.0001, now + .7);
      o.start(); o.stop(now + .7);
    } catch (e) {}
  }

  function sfxClick() {
    if (!sfxCtx) return;
    try {
      var now = sfxCtx.currentTime;
      var o = sfxCtx.createOscillator(), g = sfxCtx.createGain();
      o.connect(g); g.connect(sfxCtx.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(600, now);
      o.frequency.exponentialRampToValueAtTime(900, now + .08);
      g.gain.setValueAtTime(.045, now);
      g.gain.exponentialRampToValueAtTime(.0001, now + .12);
      o.start(); o.stop(now + .12);
    } catch (e) {}
  }

  function sfxEnter() {
    if (!sfxCtx) return;
    try {
      var now = sfxCtx.currentTime;
      var o1 = sfxCtx.createOscillator(), g1 = sfxCtx.createGain();
      o1.connect(g1); g1.connect(sfxCtx.destination);
      o1.type = 'sine';
      o1.frequency.setValueAtTime(180, now);
      o1.frequency.exponentialRampToValueAtTime(520, now + .35);
      o1.frequency.exponentialRampToValueAtTime(80, now + .85);
      g1.gain.setValueAtTime(.06, now);
      g1.gain.exponentialRampToValueAtTime(.0001, now + .9);
      o1.start(); o1.stop(now + .9);
      var o2 = sfxCtx.createOscillator(), g2 = sfxCtx.createGain();
      o2.connect(g2); g2.connect(sfxCtx.destination);
      o2.type = 'sine';
      o2.frequency.setValueAtTime(270, now + .05);
      o2.frequency.exponentialRampToValueAtTime(780, now + .4);
      o2.frequency.exponentialRampToValueAtTime(120, now + .9);
      g2.gain.setValueAtTime(.03, now + .05);
      o2.start(now + .05); o2.stop(now + .9);
    } catch (e) {}
  }

  /* ── Scene engine ── */
  var scenes = [0, 1, 2, 3].map(function(i) { return document.getElementById('s' + i); });
  var dots = [0, 1, 2, 3].map(function(i) { return document.getElementById('d' + i); });
  var durations = [3200, 4000, 4400, 999999];
  var cur_s = 0;
  var autoTimer = null;
  var ov = document.getElementById('ov');

  function flash() {
    if (!ov) return;
    ov.style.opacity = '.4';
    setTimeout(function() { ov.style.opacity = '0'; }, 150);
  }

  function updateNav() {
    var prev = document.getElementById('prevBtn');
    if (prev) prev.disabled = (cur_s === 0);
  }

  function show(n) {
    if (!scenes[cur_s] || !scenes[n]) return;
    scenes[cur_s].classList.remove('on');
    if (dots[cur_s]) dots[cur_s].classList.remove('on');
    flash();
    ensureSfx();
    sfxTransition();
    cur_s = n;
    /* force reflow so CSS animations replay on revisited scenes */
    void scenes[cur_s].offsetWidth;
    scenes[cur_s].classList.add('on');
    if (dots[cur_s]) dots[cur_s].classList.add('on');
    updateNav();
    if (n === 0) {
      var r = document.getElementById('rl');
      if (r) { r.style.width = '0'; setTimeout(function() { r.style.width = '280px'; }, 80); }
    }
  }

  function advance() {
    if (cur_s < scenes.length - 1) {
      show(cur_s + 1);
      clearTimeout(autoTimer);
      if (cur_s < scenes.length - 1) {
        autoTimer = setTimeout(advance, durations[cur_s]);
      }
    }
  }

  function goBack() {
    if (cur_s > 0) {
      clearTimeout(autoTimer);
      show(cur_s - 1);
      autoTimer = setTimeout(advance, durations[cur_s]);
    }
  }

  /* Force scene 0 animations to play on load */
  var s0 = document.getElementById('s0');
  if (s0) {
    s0.classList.remove('on');
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        s0.classList.add('on');
      });
    });
  }

  /* Start auto-advance */
  autoTimer = setTimeout(advance, durations[0]);

  /* ── Navigation buttons ── */
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      ensureSfx(); sfxClick();
      goBack();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      ensureSfx(); sfxClick();
      if (cur_s < scenes.length - 1) {
        clearTimeout(autoTimer);
        advance();
      } else {
        goReg();
      }
    });
  }

  /* Click anywhere to advance */
  var wrap = document.getElementById('wrap');
  if (wrap) {
    wrap.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
      ensureSfx();
      if (cur_s < scenes.length - 1) {
        clearTimeout(autoTimer);
        advance();
      }
    });
  }

  /* ── Go to register ── */
  function goReg() {
    ensureSfx();
    sfxEnter();
    if (ov) ov.style.opacity = '1';
    setTimeout(function() { window.location.href = 'register.html'; }, 580);
  }

  var enterBtn = document.getElementById('enterBtn');
  if (enterBtn) {
    enterBtn.addEventListener('click', function(e) {
      e.preventDefault();
      goReg();
    });
  }

  /* Skip button (the <a> tag handles navigation natively, but add SFX) */
  var skipBtn = document.getElementById('skipBtn');
  if (skipBtn) {
    skipBtn.addEventListener('click', function(e) {
      e.preventDefault();
      ensureSfx();
      sfxEnter();
      if (ov) ov.style.opacity = '1';
      setTimeout(function() { window.location.href = 'register.html'; }, 580);
    });
  }
})();
