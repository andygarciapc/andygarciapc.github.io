/**
 * Easter Eggs Manager
 * Hidden secrets and fun surprises
 */

class EasterEggs {
  constructor(gameState) {
    this.gameState = gameState;
    this.konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    this.currentKonamiIndex = 0;
    this.andyClickCount = 0;
    this.typedChars = [];
    this.devToolsOpen = false;
  }

  /**
   * Initialize all easter eggs
   */
  init() {
    this.setupKonamiCode();
    this.setupDevToolsDetection();
    this.setupAndyClicker();
    this.setupSecretTyping();
    this.setupConsoleMessage();
  }

  /**
   * Setup Konami Code listener
   */
  setupKonamiCode() {
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      const expected = this.konamiSequence[this.currentKonamiIndex].toLowerCase();

      if (key === expected) {
        this.currentKonamiIndex++;

        if (this.currentKonamiIndex === this.konamiSequence.length) {
          this.triggerKonami();
          this.currentKonamiIndex = 0;
        }
      } else {
        this.currentKonamiIndex = 0;
      }
    });
  }

  /**
   * Trigger Konami code effect
   */
  triggerKonami() {
    if (this.gameState.achievements.has('konamiMaster')) {
      // Already unlocked, just show the effect
      this.showKonamiEffect();
      return;
    }

    // Unlock achievement
    this.gameState.unlockAchievement('konamiMaster');
    this.showKonamiEffect();
  }

  /**
   * Show Konami visual effect
   */
  showKonamiEffect() {
    // Flash screen gold
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #ffcd75;
      z-index: 10000;
      animation: konami-flash 1s ease-out forwards;
    `;
    document.body.appendChild(flash);

    // Add golden glow to Andy sprite
    const andySprite = document.getElementById('andy-sprite');
    if (andySprite) {
      andySprite.classList.add('super-mode');
      andySprite.style.filter = 'drop-shadow(0 0 20px #ffcd75)';

      // Add particle burst
      this.createParticleBurst(andySprite);
    }

    // Show secret message
    setTimeout(() => {
      flash.remove();
      this.showSecretMessage('You know the ancient ways!');
    }, 500);

    // Play sound if enabled
    this.playSound('powerup');
  }

  /**
   * Setup DevTools detection
   */
  setupDevToolsDetection() {
    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if ((widthThreshold || heightThreshold) && !this.devToolsOpen) {
        this.devToolsOpen = true;
        this.onDevToolsOpen();
      }
    };

    // Check periodically
    setInterval(checkDevTools, 1000);

    // Also check on resize
    window.addEventListener('resize', checkDevTools);
  }

  /**
   * Handle DevTools opening
   */
  onDevToolsOpen() {
    if (!this.gameState.achievements.has('codeWhisperer')) {
      this.gameState.unlockAchievement('codeWhisperer');
    }
  }

  /**
   * Setup console message for developers
   */
  setupConsoleMessage() {
    const styles = [
      'color: #ffcd75',
      'font-size: 14px',
      'font-family: monospace',
      'background: #1a1c2c',
      'padding: 10px'
    ].join(';');

    console.log(`%c
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎮 Welcome, fellow developer! 🎮                    ║
║                                                       ║
║   You found the secret console area.                  ║
║   Achievement unlocked: "Code Whisperer"              ║
║                                                       ║
║   Curious about the code? Check out:                  ║
║   github.com/andygarciapc                             ║
║                                                       ║
║   Fun commands to try:                                ║
║   - game.state.reset() - Reset all progress           ║
║   - game.state.awardXP(1000, 'Hacker bonus')         ║
║   - game.triggerKonami() - Trigger Konami effect      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `, styles);
  }

  /**
   * Setup clicking Andy multiple times
   */
  setupAndyClicker() {
    const andySprite = document.getElementById('andy-sprite');
    if (!andySprite) return;

    andySprite.style.cursor = 'pointer';

    andySprite.addEventListener('click', () => {
      this.andyClickCount++;

      if (this.andyClickCount <= 5) {
        // Andy waves
        andySprite.classList.add('anim-shake');
        setTimeout(() => andySprite.classList.remove('anim-shake'), 300);
      } else if (this.andyClickCount <= 9) {
        // Andy looks confused
        this.showSpeechBubble('...?', andySprite);
      } else if (this.andyClickCount === 10) {
        // Andy does a flip!
        this.triggerAndyFlip(andySprite);
      } else if (this.andyClickCount > 10) {
        // Random reactions
        const reactions = ['Stop that!', 'Okay okay!', "I'm dizzy...", 'Wheee!', ':)'];
        const reaction = reactions[Math.floor(Math.random() * reactions.length)];
        this.showSpeechBubble(reaction, andySprite);
      }
    });
  }

  /**
   * Trigger Andy flip animation
   */
  triggerAndyFlip(element) {
    element.style.transition = 'transform 0.5s ease-in-out';
    element.style.transform = 'rotateY(360deg)';

    setTimeout(() => {
      element.style.transform = '';
    }, 500);

    // Unlock achievement
    if (!this.gameState.achievements.has('secretHunter')) {
      this.gameState.unlockAchievement('secretHunter');
    }

    this.showSpeechBubble('You found my secret move!', element);
  }

  /**
   * Setup secret word typing
   */
  setupSecretTyping() {
    document.addEventListener('keypress', (e) => {
      // Don't track in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      this.typedChars.push(e.key.toLowerCase());

      // Keep only last 10 characters
      if (this.typedChars.length > 10) {
        this.typedChars.shift();
      }

      const typed = this.typedChars.join('');

      // Check for "hola" - Spanish mode
      if (typed.endsWith('hola')) {
        this.toggleSpanishMode(true);
      }

      // Check for "hello" - English mode
      if (typed.endsWith('hello')) {
        this.toggleSpanishMode(false);
      }

      // Check for "xyzzy" - Classic adventure game reference
      if (typed.endsWith('xyzzy')) {
        this.showSecretMessage('Nothing happens... or does it?');
        this.gameState.awardXP(50, 'Classic gamer');
      }
    });
  }

  /**
   * Toggle Spanish mode
   */
  toggleSpanishMode(enabled) {
    if (enabled) {
      document.body.classList.add('spanish-mode');
      this.showSecretMessage('¡Hola! Ahora estás en modo español.');

      // Update some text
      const dialogue = document.getElementById('intro-dialogue');
      if (dialogue && !dialogue.dataset.originalText) {
        dialogue.dataset.originalText = dialogue.innerHTML;
        dialogue.innerHTML = `
          ¡Saludos, viajero! Soy <span class="text-gold">Andy García</span>,
          un Desarrollador de Software que crea mundos digitales.
          He forjado mods con <span class="text-cyan">más de 20,000 descargas</span>
          y le enseñé a la IA a ser un Dungeon Master.
          ¿Quieres explorar mi reino?
        `;
      }

      if (!this.gameState.achievements.has('secretHunter')) {
        this.gameState.unlockAchievement('secretHunter');
      }
    } else {
      document.body.classList.remove('spanish-mode');
      this.showSecretMessage('Hello! Back to English.');

      // Restore text
      const dialogue = document.getElementById('intro-dialogue');
      if (dialogue && dialogue.dataset.originalText) {
        dialogue.innerHTML = dialogue.dataset.originalText;
      }
    }
  }

  /**
   * Show a floating secret message
   */
  showSecretMessage(message) {
    const msg = document.createElement('div');
    msg.className = 'secret-message';
    msg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #1a1c2c;
      border: 4px solid #ffcd75;
      padding: 24px 48px;
      font-family: 'Press Start 2P', monospace;
      font-size: 16px;
      color: #ffcd75;
      z-index: 10000;
      text-align: center;
      animation: pop 0.3s ease-out;
    `;
    msg.textContent = message;

    document.body.appendChild(msg);

    setTimeout(() => {
      msg.style.opacity = '0';
      msg.style.transition = 'opacity 0.3s';
      setTimeout(() => msg.remove(), 300);
    }, 2000);
  }

  /**
   * Show a speech bubble near an element
   */
  showSpeechBubble(text, element) {
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: #f4f4f4;
      color: #1a1c2c;
      padding: 8px 16px;
      font-family: 'VT323', monospace;
      font-size: 20px;
      border: 2px solid #1a1c2c;
      white-space: nowrap;
      z-index: 100;
    `;
    bubble.textContent = text;

    element.style.position = 'relative';
    element.appendChild(bubble);

    setTimeout(() => bubble.remove(), 1500);
  }

  /**
   * Create particle burst effect
   */
  createParticleBurst(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      const angle = (Math.PI * 2 * i) / 20;
      const distance = 100 + Math.random() * 50;

      particle.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: ${['#ffcd75', '#ef7d57', '#f4f4f4'][Math.floor(Math.random() * 3)]};
        left: ${centerX}px;
        top: ${centerY}px;
        pointer-events: none;
        z-index: 10000;
      `;

      particle.style.setProperty('--particle-x', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--particle-y', `${Math.sin(angle) * distance}px`);
      particle.classList.add('particle');

      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 1000);
    }
  }

  /**
   * Play a sound effect (if sound is enabled)
   */
  playSound(soundName) {
    // Sound implementation would go here
    // For now, just log it
    console.log(`[Sound] ${soundName}`);
  }
}

export default EasterEggs;
