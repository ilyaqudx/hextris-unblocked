// Hextris Unblocked Game Engine (Pure Canvas + Web Audio API)
// Mathematically aligned hexagonal geometry, responsive touch & keyboard controls.

export class HextrisGame {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = Object.assign({
      onScoreUpdate: () => {},
      onGameOver: () => {},
      onComboUpdate: () => {},
      onStateChange: () => {},
    }, options);

    // Audio context (lazy init on user interaction)
    this.audioCtx = null;
    this.soundEnabled = true;

    // Palette: Vibrant classic Hextris colors
    this.colors = [
      '#e74c3c', // Red
      '#3498db', // Blue
      '#f1c40f', // Yellow
      '#2ecc71', // Green
    ];

    this.sides = 6;
    this.hexRadius = 65;
    this.blockHeight = 22;
    this.dangerRingRadius = 230;

    // Mode: 'classic' or 'daily'
    this.gameMode = 'classic';
    this.dailySeed = this.getTodaySeed();
    this.prngState = this.dailySeed;

    // Game state: 'idle' | 'playing' | 'paused' | 'gameover'
    this.state = 'idle';

    this.score = 0;
    this.highScore = this.loadHighScore();
    this.dailyHighScore = this.loadDailyHighScore();

    this.rotation = 0; // Current hex visual angle in radians
    this.targetRotation = 0; // Target angle for smooth snap
    this.rotIndex = 0; // Discrete lane rotation (0 to 5)

    // Six lanes of settled blocks
    this.lanes = [[], [], [], [], [], []];

    // Incoming falling blocks
    this.fallingBlocks = [];

    // Visual particles and floating texts
    this.particles = [];
    this.floatingTexts = [];

    // Combo and difficulty system
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.comboMaxTime = 180; // ~3 seconds at 60fps
    this.difficulty = 1;
    this.spawnTimer = 0;
    this.spawnInterval = 130;

    // Animation frame handle
    this.animId = null;
    this.lastTime = performance.now();

    this.setupDisplay();
    this.bindEvents();
    this.draw(); // Initial render for idle screen
  }

  getTodaySeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  // Pseudo-random generator for Daily Challenge deterministic sequence
  prng() {
    if (this.gameMode === 'classic') {
      return Math.random();
    }
    // Mulberry32 PRNG
    let t = (this.prngState += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  loadHighScore() {
    try {
      return parseInt(localStorage.getItem('hextris_highscore') || '0', 10);
    } catch {
      return 0;
    }
  }

  saveHighScore(score) {
    try {
      if (score > this.highScore) {
        this.highScore = score;
        localStorage.setItem('hextris_highscore', String(score));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  loadDailyHighScore() {
    try {
      const saved = localStorage.getItem(`hextris_daily_${this.dailySeed}`);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  }

  saveDailyHighScore(score) {
    try {
      if (score > this.dailyHighScore) {
        this.dailyHighScore = score;
        localStorage.setItem(`hextris_daily_${this.dailySeed}`, String(score));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio not permitted or interrupted
    }
  }

  playRotateSound() {
    this.playTone(340, 'triangle', 0.05, 0.07);
  }

  playLandSound() {
    this.playTone(190, 'sine', 0.07, 0.10);
  }

  playMatchSound(combo) {
    const chords = [
      [523.25, 659.25], // C5, E5
      [659.25, 783.99], // E5, G5
      [783.99, 1046.50], // G5, C6
      [1046.50, 1318.51], // C6, E6
      [1318.51, 1567.98], // E6, G6
    ];
    const notes = chords[Math.min(combo - 1, chords.length - 1)];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 'sine', 0.2, 0.14), idx * 45);
    });
  }

  playGameOverSound() {
    const freqs = [350, 290, 220, 160];
    freqs.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sawtooth', 0.22, 0.16), i * 100);
    });
  }

  setupDisplay() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = Math.min(rect.width, 680);

    this.width = size;
    this.height = size;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    // Scale game metrics based on canvas dimensions
    const scale = size / 600;
    this.hexRadius = 60 * scale;
    this.blockHeight = 22 * scale;
    this.dangerRingRadius = (this.hexRadius + 6 * this.blockHeight);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.setupDisplay();
      this.draw();
    });

    // Keyboard bindings (Arrow keys + A/D)
    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'Space', 'KeyA', 'KeyD', 'KeyP'].includes(e.code)) {
        if (this.state === 'playing') e.preventDefault();
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.rotateLeft();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.rotateRight();
      } else if (e.code === 'KeyP') {
        this.togglePause();
      } else if (e.code === 'Space') {
        if (this.state === 'idle' || this.state === 'gameover') {
          this.start();
        }
      }
    });

    // Touch Controls
    let touchStartX = 0;
    let touchStartTime = 0;

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartTime = performance.now();
        this.initAudio();
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (this.state !== 'playing') {
        this.start();
        return;
      }
      if (e.changedTouches.length > 0) {
        const touchEndX = e.changedTouches[0].clientX;
        const dx = touchEndX - touchStartX;
        const dt = performance.now() - touchStartTime;

        if (Math.abs(dx) > 30 && dt < 400) {
          if (dx > 0) {
            this.rotateRight();
          } else {
            this.rotateLeft();
          }
        } else {
          const rect = this.canvas.getBoundingClientRect();
          const clickX = touchEndX - rect.left;
          if (clickX < rect.width / 2) {
            this.rotateLeft();
          } else {
            this.rotateRight();
          }
        }
      }
    }, { passive: true });
  }

  setMode(mode) {
    this.gameMode = mode;
    if (mode === 'daily') {
      this.prngState = this.dailySeed;
    }
  }

  start() {
    this.initAudio();
    this.score = 0;
    this.lanes = [[], [], [], [], [], []];
    this.fallingBlocks = [];
    this.particles = [];
    this.floatingTexts = [];
    this.rotation = 0;
    this.targetRotation = 0;
    this.rotIndex = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.difficulty = 1;
    this.spawnTimer = 0;
    this.spawnInterval = 120;

    if (this.gameMode === 'daily') {
      this.prngState = this.dailySeed;
    }

    this.state = 'playing';
    this.options.onStateChange(this.state);
    this.options.onScoreUpdate(this.score, this.getRelevantHighScore());
    this.options.onComboUpdate(1, 0);

    if (!this.animId) {
      this.lastTime = performance.now();
      this.loop = this.loop.bind(this);
      this.animId = requestAnimationFrame(this.loop);
    }
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.options.onStateChange(this.state);
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.options.onStateChange(this.state);
      this.lastTime = performance.now();
      this.animId = requestAnimationFrame(this.loop);
    }
  }

  getRelevantHighScore() {
    return this.gameMode === 'daily' ? this.dailyHighScore : this.highScore;
  }

  // Rotate Left (Counter-Clockwise)
  rotateLeft() {
    if (this.state !== 'playing') return;
    this.rotIndex = (this.rotIndex - 1 + this.sides) % this.sides;
    this.targetRotation -= (Math.PI * 2) / this.sides;
    this.playRotateSound();
  }

  // Rotate Right (Clockwise)
  rotateRight() {
    if (this.state !== 'playing') return;
    this.rotIndex = (this.rotIndex + 1) % this.sides;
    this.targetRotation += (Math.PI * 2) / this.sides;
    this.playRotateSound();
  }

  spawnWave() {
    const p = this.prng();
    const speed = 1.6 + (this.difficulty / 15) * 2.6;

    if (p < 0.55) {
      // Single block
      const lane = Math.floor(this.prng() * this.sides);
      const color = this.colors[Math.floor(this.prng() * this.colors.length)];
      this.fallingBlocks.push(this.createBlock(lane, color, speed));
    } else if (p < 0.8) {
      // Adjacent double blocks
      const lane1 = Math.floor(this.prng() * this.sides);
      const lane2 = (lane1 + 1) % this.sides;
      const c1 = this.colors[Math.floor(this.prng() * this.colors.length)];
      const c2 = this.colors[Math.floor(this.prng() * this.colors.length)];
      this.fallingBlocks.push(this.createBlock(lane1, c1, speed));
      this.fallingBlocks.push(this.createBlock(lane2, c2, speed));
    } else if (p < 0.93) {
      // Opposite blocks
      const lane1 = Math.floor(this.prng() * this.sides);
      const lane2 = (lane1 + 3) % this.sides;
      const c = this.colors[Math.floor(this.prng() * this.colors.length)];
      this.fallingBlocks.push(this.createBlock(lane1, c, speed));
      this.fallingBlocks.push(this.createBlock(lane2, c, speed));
    } else {
      // Ring wave with one gap
      const gapLane = Math.floor(this.prng() * this.sides);
      const color = this.colors[Math.floor(this.prng() * this.colors.length)];
      for (let i = 0; i < this.sides; i++) {
        if (i !== gapLane) {
          this.fallingBlocks.push(this.createBlock(i, color, speed * 0.85));
        }
      }
    }
  }

  createBlock(spawnLane, color, speed) {
    const spawnDist = Math.max(this.width, this.height) * 0.65;
    return {
      spawnLane,
      color,
      dist: spawnDist,
      speed,
      height: this.blockHeight,
    };
  }

  update() {
    if (this.state !== 'playing') return;

    // Smooth snappy rotation lerp
    this.rotation += (this.targetRotation - this.rotation) * 0.45;
    if (Math.abs(this.targetRotation - this.rotation) < 0.001) {
      this.rotation = this.targetRotation;
    }

    // Difficulty and spawning progression
    this.difficulty = Math.min(30, 1 + this.score / 1400);
    this.spawnInterval = Math.max(50, 130 - this.difficulty * 2.7);

    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnWave();
    }

    // Combo timer decrement
    if (this.comboTimer > 0) {
      this.comboTimer--;
      this.options.onComboUpdate(this.comboMultiplier, this.comboTimer / this.comboMaxTime);
      if (this.comboTimer === 0) {
        this.comboMultiplier = 1;
        this.options.onComboUpdate(1, 0);
      }
    }

    // Update falling blocks
    for (let i = this.fallingBlocks.length - 1; i >= 0; i--) {
      const b = this.fallingBlocks[i];
      b.dist -= b.speed;

      // Perfectly aligned target lane on the center hexagon:
      // When rotIndex increases (clockwise), the lane on the hex aligned with world spawnLane S is:
      // targetLane = (spawnLane - rotIndex + sides * 100) % sides
      const targetLane = (b.spawnLane - this.rotIndex + this.sides * 100) % this.sides;
      const stack = this.lanes[targetLane];
      const stackTopDist = this.hexRadius + stack.length * this.blockHeight;

      if (b.dist <= stackTopDist) {
        // Block docks seamlessly!
        this.fallingBlocks.splice(i, 1);
        this.settleBlock(targetLane, b);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.size = Math.max(0, p.size - 0.08);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y -= 1.2;
      t.life -= 0.02;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  settleBlock(lane, block) {
    const stack = this.lanes[lane];
    stack.push({
      color: block.color,
    });

    this.playLandSound();

    // Check match3 using flood-fill
    this.checkMatches(lane, stack.length - 1);

    // Check game over
    this.checkGameOver();
  }

  checkMatches(startLane, startIndex) {
    const visited = new Set();
    const toDelete = [];
    const targetColor = this.lanes[startLane][startIndex]?.color;
    if (!targetColor) return;

    const key = (l, idx) => `${l},${idx}`;

    const flood = (l, idx) => {
      const k = key(l, idx);
      if (visited.has(k)) return;
      visited.add(k);

      if (!this.lanes[l] || !this.lanes[l][idx]) return;
      if (this.lanes[l][idx].color !== targetColor) return;

      toDelete.push({ lane: l, index: idx });

      // Vertical neighbors (same lane, idx+1 and idx-1)
      if (idx + 1 < this.lanes[l].length) flood(l, idx + 1);
      if (idx - 1 >= 0) flood(l, idx - 1);

      // Horizontal neighbors (adjacent lanes at same height)
      const leftLane = (l - 1 + this.sides) % this.sides;
      const rightLane = (l + 1) % this.sides;

      if (idx < this.lanes[leftLane].length) flood(leftLane, idx);
      if (idx < this.lanes[rightLane].length) flood(rightLane, idx);
    };

    flood(startLane, startIndex);

    if (toDelete.length >= 3) {
      // Match 3+ confirmed!
      this.comboTimer = this.comboMaxTime;
      this.comboMultiplier = Math.min(10, this.comboMultiplier + 1);
      this.playMatchSound(this.comboMultiplier);

      const points = toDelete.length * toDelete.length * 10 * this.comboMultiplier;
      this.score += points;

      if (this.gameMode === 'daily') {
        this.saveDailyHighScore(this.score);
      } else {
        this.saveHighScore(this.score);
      }

      this.options.onScoreUpdate(this.score, this.getRelevantHighScore());
      this.options.onComboUpdate(this.comboMultiplier, 1.0);

      // Floating score banner
      this.floatingTexts.push({
        text: `+${points}`,
        sub: this.comboMultiplier > 1 ? `x${this.comboMultiplier} COMBO!` : '',
        x: this.width / 2,
        y: this.height / 2 - 35,
        color: targetColor,
        life: 1.0,
      });

      // Spawn particle bursts
      toDelete.forEach(({ lane, index }) => {
        this.spawnBlockParticles(lane, index, targetColor);
      });

      // Group by lane and remove blocks
      const byLane = {};
      toDelete.forEach(({ lane, index }) => {
        if (!byLane[lane]) byLane[lane] = [];
        byLane[lane].push(index);
      });

      Object.entries(byLane).forEach(([lStr, indices]) => {
        const l = parseInt(lStr, 10);
        indices.sort((a, b) => b - a);
        indices.forEach((idx) => {
          this.lanes[l].splice(idx, 1);
        });
      });
    }
  }

  spawnBlockParticles(lane, index, color) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    // Lane center angle
    const angle = (lane * 60) * (Math.PI / 180) + this.rotation;
    const dist = this.hexRadius + index * this.blockHeight + this.blockHeight / 2;

    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;

    for (let i = 0; i < 14; i++) {
      const speed = 1.5 + Math.random() * 3.5;
      const pAngle = Math.random() * Math.PI * 2;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(pAngle) * speed,
        vy: Math.sin(pAngle) * speed,
        size: 3 + Math.random() * 4,
        color: color,
        life: 1.0,
        decay: 0.025 + Math.random() * 0.02,
      });
    }
  }

  checkGameOver() {
    let over = false;
    for (let l = 0; l < this.sides; l++) {
      const stackDist = this.hexRadius + this.lanes[l].length * this.blockHeight;
      if (stackDist > this.dangerRingRadius) {
        over = true;
        break;
      }
    }

    if (over) {
      this.state = 'gameover';
      this.playGameOverSound();
      this.options.onStateChange(this.state);
      this.options.onGameOver(this.score, this.getRelevantHighScore());
    }
  }

  draw() {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;

    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Outer Hexagonal Danger Boundary (Aligned with current rotation)
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < this.sides; i++) {
      const a = (i * 60 - 30) * (Math.PI / 180) + this.rotation;
      const x = cx + Math.cos(a) * (this.dangerRingRadius + 4);
      const y = cy + Math.sin(a) * (this.dangerRingRadius + 4);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.restore();

    // 2. Draw Lane Radial Dividers (from hexagon vertices outwards)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < this.sides; i++) {
      // Vertex angle: i * 60 - 30 deg
      const angle = (i * 60 - 30) * (Math.PI / 180) + this.rotation;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * this.hexRadius, cy + Math.sin(angle) * this.hexRadius);
      ctx.lineTo(cx + Math.cos(angle) * (this.dangerRingRadius + 30), cy + Math.sin(angle) * (this.dangerRingRadius + 30));
      ctx.stroke();
    }
    ctx.restore();

    // 3. Draw Settled Blocks on the Central Hexagon
    for (let lane = 0; lane < this.sides; lane++) {
      const stack = this.lanes[lane];
      for (let idx = 0; idx < stack.length; idx++) {
        const blk = stack[idx];
        const innerR = this.hexRadius + idx * this.blockHeight;
        const outerR = innerR + this.blockHeight;

        this.drawTrapezoid(cx, cy, lane, innerR, outerR, blk.color, this.rotation);
      }
    }

    // 4. Draw Center Hexagon Core (Vertices at i * 60 - 30 deg)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    ctx.beginPath();
    for (let i = 0; i < this.sides; i++) {
      const a = (i * 60 - 30) * (Math.PI / 180);
      const x = Math.cos(a) * this.hexRadius;
      const y = Math.sin(a) * this.hexRadius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Radial gradient fill
    const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, this.hexRadius);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Center badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HEX', 0, 0);

    ctx.restore();

    // 5. Draw Incoming Falling Blocks (World orientation baseRotation = 0)
    for (let i = 0; i < this.fallingBlocks.length; i++) {
      const b = this.fallingBlocks[i];
      const innerR = b.dist;
      const outerR = b.dist + b.height;
      this.drawTrapezoid(cx, cy, b.spawnLane, innerR, outerR, b.color, 0);
    }

    // 6. Draw Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Draw Floating Text Popups
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const t = this.floatingTexts[i];
      ctx.save();
      ctx.globalAlpha = t.life;
      ctx.textAlign = 'center';
      ctx.fillStyle = t.color || '#fff';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText(t.text, t.x, t.y);

      if (t.sub) {
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(t.sub, t.x, t.y + 24);
      }
      ctx.restore();
    }
  }

  // Draw geometrically exact trapezoidal block matching regular hexagon edges
  drawTrapezoid(cx, cy, laneIndex, r1, r2, color, baseRotation = 0) {
    const ctx = this.ctx;
    // Crisp angular gap (0.8 degree) and radial gap (1.2px) for crisp arcade tile appearance
    const padAngle = 0.015;
    const a1 = (laneIndex * 60 - 30) * (Math.PI / 180) + baseRotation + padAngle;
    const a2 = (laneIndex * 60 + 30) * (Math.PI / 180) + baseRotation - padAngle;

    const padR = 1.0;
    const innerR = r1 + padR;
    const outerR = r2 - padR;

    // Corner 1: Inner Left
    const p1x = cx + Math.cos(a1) * innerR;
    const p1y = cy + Math.sin(a1) * innerR;
    // Corner 2: Inner Right
    const p2x = cx + Math.cos(a2) * innerR;
    const p2y = cy + Math.sin(a2) * innerR;
    // Corner 3: Outer Right
    const p3x = cx + Math.cos(a2) * outerR;
    const p3y = cy + Math.sin(a2) * outerR;
    // Corner 4: Outer Left
    const p4x = cx + Math.cos(a1) * outerR;
    const p4y = cy + Math.sin(a1) * outerR;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    ctx.lineTo(p4x, p4y);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    // Subtle edge highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  loop(now) {
    const delta = now - this.lastTime;
    this.lastTime = now;

    if (this.state === 'playing') {
      this.update();
    }

    this.draw();

    if (this.state === 'playing' || this.state === 'paused' || this.particles.length > 0) {
      this.animId = requestAnimationFrame(this.loop);
    } else {
      this.animId = null;
    }
  }
}
