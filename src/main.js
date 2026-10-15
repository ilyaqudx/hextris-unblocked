// Main UI Controller & SEO Interactivity
import { HextrisGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const scoreVal = document.getElementById('scoreVal');
  const highScoreVal = document.getElementById('highScoreVal');
  const comboVal = document.getElementById('comboVal');

  const startOverlay = document.getElementById('startOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const pauseOverlay = document.getElementById('pauseOverlay');

  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const soundBtn = document.getElementById('soundBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  const finalScoreEl = document.getElementById('finalScore');
  const finalBestEl = document.getElementById('finalBest');
  const shareBtn = document.getElementById('shareBtn');

  const classicModeBtn = document.getElementById('classicModeBtn');
  const dailyModeBtn = document.getElementById('dailyModeBtn');

  const touchLeftBtn = document.getElementById('touchLeft');
  const touchRightBtn = document.getElementById('touchRight');

  // Initialize Game Instance
  const game = new HextrisGame(canvas, {
    onScoreUpdate: (score, best) => {
      scoreVal.textContent = score.toLocaleString();
      highScoreVal.textContent = best.toLocaleString();
    },
    onComboUpdate: (combo, ratio) => {
      if (combo > 1) {
        comboVal.textContent = `x${combo} COMBO`;
        comboVal.classList.add('active-combo');
      } else {
        comboVal.textContent = 'x1';
        comboVal.classList.remove('active-combo');
      }
    },
    onStateChange: (state) => {
      if (state === 'playing') {
        startOverlay.classList.add('hidden');
        gameOverOverlay.classList.add('hidden');
        pauseOverlay.classList.add('hidden');
        pauseBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      } else if (state === 'paused') {
        pauseOverlay.classList.remove('hidden');
        pauseBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>';
      } else if (state === 'idle') {
        startOverlay.classList.remove('hidden');
        gameOverOverlay.classList.add('hidden');
        pauseOverlay.classList.add('hidden');
      }
    },
    onGameOver: (score, best) => {
      finalScoreEl.textContent = score.toLocaleString();
      finalBestEl.textContent = best.toLocaleString();
      gameOverOverlay.classList.remove('hidden');
    },
  });

  // Display initial high score
  highScoreVal.textContent = game.getRelevantHighScore().toLocaleString();

  // Control Buttons
  startBtn.addEventListener('click', () => game.start());
  restartBtn.addEventListener('click', () => game.start());
  resumeBtn.addEventListener('click', () => game.togglePause());
  pauseBtn.addEventListener('click', () => game.togglePause());

  // Sound Toggle
  let isMuted = false;
  soundBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    game.soundEnabled = !isMuted;
    if (isMuted) {
      soundBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
      soundBtn.title = "Unmute Sound";
    } else {
      soundBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
      soundBtn.title = "Mute Sound";
    }
  });

  // Fullscreen Toggle
  fullscreenBtn.addEventListener('click', () => {
    const target = document.querySelector('.game-viewport');
    if (!document.fullscreenElement) {
      if (target.requestFullscreen) target.requestFullscreen();
      else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  });

  const startOverlayTitle = document.getElementById('startOverlayTitle');
  const startOverlaySubtitle = document.getElementById('startOverlaySubtitle');
  const startBtnText = document.getElementById('startBtnText');

  function updateModeUI(mode) {
    if (mode === 'daily') {
      dailyModeBtn.classList.add('active');
      classicModeBtn.classList.remove('active');
      if (startOverlayTitle) startOverlayTitle.textContent = 'DAILY CHALLENGE';
      if (startOverlaySubtitle) startOverlaySubtitle.textContent = `Today's synchronized puzzle seed: #${game.dailySeed}. Everyone gets the exact same block sequence today!`;
      if (startBtnText) startBtnText.textContent = 'PLAY DAILY CHALLENGE';
    } else {
      classicModeBtn.classList.add('active');
      dailyModeBtn.classList.remove('active');
      if (startOverlayTitle) startOverlayTitle.textContent = 'HEXTRIS UNBLOCKED';
      if (startOverlaySubtitle) startOverlaySubtitle.textContent = 'Rotate the hexagon to align falling blocks. Match 3+ colors to eliminate them and score big combos!';
      if (startBtnText) startBtnText.textContent = 'PLAY NOW';
    }
  }

  // Mode Selection: Classic vs Daily Challenge (哥飞's Retention Strategy)
  classicModeBtn.addEventListener('click', () => {
    game.setMode('classic');
    updateModeUI('classic');
    game.resetToIdle();
    highScoreVal.textContent = game.getRelevantHighScore().toLocaleString();
  });

  dailyModeBtn.addEventListener('click', () => {
    game.setMode('daily');
    updateModeUI('daily');
    game.resetToIdle();
    highScoreVal.textContent = game.getRelevantHighScore().toLocaleString();
  });

  // Mobile Touch Controls
  if (touchLeftBtn && touchRightBtn) {
    touchLeftBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      game.rotateLeft();
    }, { passive: false });
    touchRightBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      game.rotateRight();
    }, { passive: false });

    // Also support mouse click on mobile controls
    touchLeftBtn.addEventListener('click', () => game.rotateLeft());
    touchRightBtn.addEventListener('click', () => game.rotateRight());
  }

  // Social Share / Copy Score to Clipboard
  shareBtn.addEventListener('click', () => {
    const text = `🎮 I just scored ${game.score} points on Hextris Unblocked! Can you beat my high score? Play free at https://seo-game-website.vercel.app`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        const originalText = shareBtn.textContent;
        shareBtn.textContent = '✓ Copied to Clipboard!';
        setTimeout(() => {
          shareBtn.textContent = originalText;
        }, 2200);
      });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
  });

  // FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close other accordions
      faqItems.forEach(other => other.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
});
