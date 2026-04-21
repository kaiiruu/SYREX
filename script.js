/* ─────────────────────────────────────────
   SYREX — main.js
───────────────────────────────────────── */

// ─── CUSTOM CURSOR (desktop only) ───
const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (!isTouchDevice()) {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    ring.style.left   = e.clientX + 'px';
    ring.style.top    = e.clientY + 'px';
  });

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '20px';
      cursor.style.height = '20px';
      ring.style.width    = '52px';
      ring.style.height   = '52px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '12px';
      cursor.style.height = '12px';
      ring.style.width    = '36px';
      ring.style.height   = '36px';
    });
  });
}

// ─── SCROLL REVEAL ───
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => revealObserver.observe(el));

// ─── COUNTER ANIMATION ───
function animateCount(el, target, suffix) {
  let current = 0;
  const step = () => {
    current += Math.ceil(target / 60);
    if (current >= target) {
      el.innerHTML = `<span>${target}</span>${suffix}`;
      return;
    }
    el.innerHTML = `<span>${current}</span>${suffix}`;
    requestAnimationFrame(step);
  };
  step();
}

const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-num').forEach(el => {
          const raw = el.textContent;
          if (raw.includes('600')) animateCount(el, 600, '+');
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  statsObserver.observe(statsBar);
}

// ─── CANVAS PARTICLE FX ───
(function() {
  const canvas = document.getElementById('fxCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = 55;
  const particles = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = rand(0, canvas.width);
      this.y  = init ? rand(0, canvas.height) : canvas.height + 10;
      this.r  = rand(0.6, 2.2);
      this.vy = rand(-0.4, -1.1);
      this.vx = rand(-0.25, 0.25);
      this.alpha = rand(0.3, 0.85);
      this.fade  = rand(0.002, 0.006);
      // color: red spectrum + rare white-hot
      const roll = Math.random();
      if (roll < 0.65) {
        this.color = `rgba(224,${Math.floor(rand(10,40))},${Math.floor(rand(10,30))},`;
      } else if (roll < 0.88) {
        this.color = `rgba(255,${Math.floor(rand(40,80))},${Math.floor(rand(20,50))},`;
      } else {
        this.color = `rgba(255,${Math.floor(rand(180,230))},${Math.floor(rand(160,200))},`;
      }
    }
    update() {
      this.y     += this.vy;
      this.x     += this.vx;
      this.alpha -= this.fade;
      if (this.alpha <= 0 || this.y < -10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha.toFixed(2) + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // Horizontal scan line that drifts
  let scanY = 0;

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Drift scan glow
    scanY += 0.4;
    if (scanY > canvas.height) scanY = 0;
    const grad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
    grad.addColorStop(0,   'rgba(224,17,17,0)');
    grad.addColorStop(0.5, 'rgba(224,17,17,0.06)');
    grad.addColorStop(1,   'rgba(224,17,17,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 40, canvas.width, 80);

    // Particles
    particles.forEach(p => { p.update(); p.draw(); });

    requestAnimationFrame(loop);
  }
  loop();
})();

// ─── GLITCH BAR EFFECT ───
(function() {
  const bar = document.getElementById('glitchBar');
  function glitch() {
    const delay = rand(1800, 6000);
    setTimeout(() => {
      const top = rand(5, 95);
      bar.style.top    = top + 'vh';
      bar.style.opacity = '1';
      bar.style.height = rand(1, 3) + 'px';
      bar.style.left   = rand(0, 20) + 'px';
      bar.style.right  = rand(0, 20) + 'px';
      setTimeout(() => { bar.style.opacity = '0'; glitch(); }, rand(60, 220));
    }, delay);
  }
  function rand(a, b) { return a + Math.random() * (b - a); }
  glitch();
})();


// ─── RED LIGHTNING ───
(function() {
  const canvas = document.getElementById('lightningCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function rand(a, b) { return a + Math.random() * (b - a); }

  // Recursive lightning bolt
  function drawBolt(x1, y1, x2, y2, depth, alpha) {
    if (depth === 0) return;
    const mx = (x1 + x2) / 2 + rand(-80, 80) / depth;
    const my = (y1 + y2) / 2 + rand(-80, 80) / depth;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(mx, my);
    ctx.lineTo(x2, y2);

    // outer glow
    ctx.shadowColor = 'rgba(255,30,0,0.9)';
    ctx.shadowBlur  = 18 / depth;
    ctx.strokeStyle = `rgba(255,${Math.floor(rand(20, 80))},20,${alpha})`;
    ctx.lineWidth   = Math.max(0.5, 2.5 / depth);
    ctx.stroke();

    // core bright line
    ctx.shadowBlur  = 6;
    ctx.strokeStyle = `rgba(255,200,180,${alpha * 0.7})`;
    ctx.lineWidth   = Math.max(0.2, 1 / depth);
    ctx.stroke();

    drawBolt(x1, y1, mx, my, depth - 1, alpha * 0.85);
    drawBolt(mx, my, x2, y2, depth - 1, alpha * 0.85);

    // random branch
    if (Math.random() < 0.45) {
      const bx = mx + rand(-120, 120);
      const by = my + rand(40, 160);
      drawBolt(mx, my, bx, by, depth - 1, alpha * 0.5);
    }
  }

  let strikes = [];

  function spawnStrike() {
    const startX = rand(canvas.width * 0.1, canvas.width * 0.9);
    const startY = 0;
    const endX   = startX + rand(-200, 200);
    const endY   = rand(canvas.height * 0.3, canvas.height * 0.75);
    strikes.push({ x1: startX, y1: startY, x2: endX, y2: endY, life: rand(4, 9), maxLife: 9 });
  }

  // Schedule random lightning
  function scheduleLightning() {
    const delay = rand(1200, 5000);
    setTimeout(() => {
      const count = Math.random() < 0.3 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        setTimeout(() => spawnStrike(), i * rand(40, 120));
      }
      scheduleLightning();
    }, delay);
  }
  scheduleLightning();

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    strikes = strikes.filter(s => s.life > 0);
    strikes.forEach(s => {
      const alpha = (s.life / s.maxLife) * 0.9;
      drawBolt(s.x1, s.y1, s.x2, s.y2, 5, alpha);
      s.life -= 1;
    });

    ctx.restore();
    requestAnimationFrame(loop);
  }
  loop();
})();

// ─── EXTRA SPARK + EMBER PARTICLES ───
(function() {
  const canvas = document.getElementById('fxCanvas');
  // Piggyback on existing canvas — add a secondary overlay canvas for sparks
  const sparkCanvas = document.createElement('canvas');
  sparkCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:991;mix-blend-mode:screen;';
  document.body.appendChild(sparkCanvas);
  const ctx = sparkCanvas.getContext('2d');

  function resize() {
    sparkCanvas.width  = window.innerWidth;
    sparkCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function rand(a, b) { return a + Math.random() * (b - a); }

  // ── Spark class (fast, short-lived streaks) ──
  class Spark {
    constructor() { this.reset(); }
    reset() {
      // spawn from random edge or bottom
      const edge = Math.random();
      if (edge < 0.6) {
        this.x = rand(0, sparkCanvas.width);
        this.y = sparkCanvas.height + 5;
        this.vx = rand(-1.5, 1.5);
        this.vy = rand(-3.5, -6.5);
      } else if (edge < 0.8) {
        this.x = 0;
        this.y = rand(sparkCanvas.height * 0.3, sparkCanvas.height);
        this.vx = rand(1, 4);
        this.vy = rand(-4, -1);
      } else {
        this.x = sparkCanvas.width;
        this.y = rand(sparkCanvas.height * 0.3, sparkCanvas.height);
        this.vx = rand(-4, -1);
        this.vy = rand(-4, -1);
      }
      this.life    = rand(0.6, 1);
      this.decay   = rand(0.012, 0.028);
      this.len     = rand(6, 22);
      // colour: vivid red-orange to white-hot
      const t = Math.random();
      if (t < 0.5) this.hue = `255,${Math.floor(rand(30,90))},10`;
      else if (t < 0.8) this.hue = `255,${Math.floor(rand(100,160))},40`;
      else this.hue = `255,240,220`;
      this.width   = rand(0.5, 1.5);
    }
    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.vy   += 0.06; // slight gravity
      this.life -= this.decay;
      if (this.life <= 0) this.reset();
    }
    draw() {
      const a = Math.max(0, this.life);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * (this.len / 4), this.y - this.vy * (this.len / 4));
      ctx.strokeStyle = `rgba(${this.hue},${a.toFixed(2)})`;
      ctx.lineWidth   = this.width;
      ctx.shadowColor = `rgba(${this.hue},0.8)`;
      ctx.shadowBlur  = 4;
      ctx.stroke();
    }
  }

  // ── Ember class (slow, glowing dots) ──
  class Ember {
    constructor() { this.reset(true); }
    reset(init) {
      this.x     = rand(0, sparkCanvas.width);
      this.y     = init ? rand(0, sparkCanvas.height) : sparkCanvas.height + 10;
      this.r     = rand(1.2, 3.5);
      this.vy    = rand(-0.3, -0.9);
      this.vx    = rand(-0.4, 0.4);
      this.life  = rand(0.5, 1);
      this.decay = rand(0.003, 0.008);
      // hot orange-red core
      this.hue   = `255,${Math.floor(rand(50,120))},${Math.floor(rand(10,40))}`;
    }
    update() {
      this.x    += this.vx + Math.sin(Date.now() * 0.001 + this.y) * 0.3;
      this.y    += this.vy;
      this.life -= this.decay;
      if (this.life <= 0 || this.y < -10) this.reset(false);
    }
    draw() {
      const a = Math.max(0, this.life);
      // glow halo
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3.5);
      grd.addColorStop(0,   `rgba(${this.hue},${a.toFixed(2)})`);
      grd.addColorStop(0.4, `rgba(${this.hue},${(a * 0.4).toFixed(2)})`);
      grd.addColorStop(1,   `rgba(${this.hue},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      // bright core
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,240,220,${(a * 0.9).toFixed(2)})`;
      ctx.fill();
    }
  }

  const SPARKS  = 60;
  const EMBERS  = 35;
  const sparks  = Array.from({ length: SPARKS }, () => new Spark());
  const embers  = Array.from({ length: EMBERS  }, () => new Ember());

  function loop() {
    ctx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
    ctx.save();
    sparks.forEach(s => { s.update(); s.draw(); });
    embers.forEach(e => { e.update(); e.draw(); });
    ctx.restore();
    requestAnimationFrame(loop);
  }
  loop();
})();

(function() {
  const audio  = document.getElementById('bgMusic');
  const btn    = document.getElementById('musicBtn');
  const icon   = document.getElementById('musicIcon');
  const bars   = document.getElementById('musicBars');
  let playing  = false;

  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      icon.textContent = '▶\uFE0E';
      bars.classList.remove('active');
      btn.classList.remove('playing');
    } else {
      audio.play().catch(() => {});
      icon.textContent = '■\uFE0E';
      bars.classList.add('active');
      btn.classList.add('playing');
    }
    playing = !playing;
  });

  audio.addEventListener('ended', () => {
    icon.textContent = '▶\uFE0E';
    bars.classList.remove('active');
    btn.classList.remove('playing');
    playing = false;
  });
})();
