/**
 * Main Entry Point
 * Portfolio Game Initialization
 */

import gameState from './game-state.js';
import Navigation from './navigation.js';
import DialogueSystem from './dialogue.js';
import EasterEggs from './easter-eggs.js';
import ProjectsManager from './projects.js';

/**
 * Portfolio Game Application
 */
class PortfolioGame {
  constructor() {
    this.state = gameState;
    this.navigation = new Navigation(gameState);
    this.dialogue = new DialogueSystem();
    this.easterEggs = new EasterEggs(gameState);
    this.projects = new ProjectsManager(gameState);

    // Make state accessible globally for console easter egg
    window.game = {
      state: this.state,
      triggerKonami: () => this.easterEggs.triggerKonami()
    };
  }

  /**
   * Initialize the application
   */
  init() {
    // Remove no-js class
    document.body.classList.remove('no-js');

    // Load saved state
    this.state.load();

    // Initialize all systems
    this.navigation.init();
    this.dialogue.init();
    this.easterEggs.init();
    this.projects.init();

    // Update UI with loaded state
    this.state.updateUI();
    this.state.updateAchievementCount();

    // Setup additional features
    this.setupSettings();
    this.setupContactForm();
    this.setupSocialLinks();
    this.setupTimeBasedTheme();

    // Start intro animation
    this.startIntro();

    console.log('Portfolio Game initialized!');
  }

  /**
   * Start the intro sequence
   */
  startIntro() {
    // Add initial animations
    document.querySelectorAll('.scroll-animate').forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('in-view');
      }, 500 + index * 100);
    });

    // First section is automatically visited
    setTimeout(() => {
      this.state.visitSection('about');
    }, 1000);
  }

  /**
   * Setup settings panel
   */
  setupSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const soundToggle = document.getElementById('sound-toggle');
    const motionToggle = document.getElementById('motion-toggle');
    const companionToggle = document.getElementById('companion-toggle');

    // Toggle settings panel
    if (settingsBtn && settingsPanel) {
      settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('open');
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
          settingsPanel.classList.remove('open');
        }
      });
    }

    // Sound toggle
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        soundToggle.classList.toggle('active');
        const enabled = soundToggle.classList.contains('active');
        soundToggle.setAttribute('aria-checked', enabled);
        localStorage.setItem('portfolio_sound', enabled);
      });

      // Load saved preference
      if (localStorage.getItem('portfolio_sound') === 'true') {
        soundToggle.classList.add('active');
        soundToggle.setAttribute('aria-checked', 'true');
      }
    }

    // Motion toggle
    if (motionToggle) {
      motionToggle.addEventListener('click', () => {
        motionToggle.classList.toggle('active');
        const reduced = motionToggle.classList.contains('active');
        motionToggle.setAttribute('aria-checked', reduced);

        if (reduced) {
          document.body.classList.add('reduce-motion');
        } else {
          document.body.classList.remove('reduce-motion');
        }

        localStorage.setItem('portfolio_reduce_motion', reduced);
      });

      // Load saved preference or check system preference
      const savedMotion = localStorage.getItem('portfolio_reduce_motion');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (savedMotion === 'true' || (savedMotion === null && prefersReduced)) {
        motionToggle.classList.add('active');
        motionToggle.setAttribute('aria-checked', 'true');
        document.body.classList.add('reduce-motion');
      }
    }

    // Companion toggle
    if (companionToggle) {
      companionToggle.addEventListener('click', () => {
        companionToggle.classList.toggle('active');
        const shown = companionToggle.classList.contains('active');
        companionToggle.setAttribute('aria-checked', shown);

        const companion = document.querySelector('.sprite-companion');
        if (companion) {
          companion.style.display = shown ? 'block' : 'none';
        }

        localStorage.setItem('portfolio_companion', shown);
      });

      // Load saved preference
      const savedCompanion = localStorage.getItem('portfolio_companion');
      if (savedCompanion === 'false') {
        companionToggle.classList.remove('active');
        companionToggle.setAttribute('aria-checked', 'false');
        const companion = document.querySelector('.sprite-companion');
        if (companion) companion.style.display = 'none';
      }
    }

    // Achievements button
    const achievementsBtn = document.getElementById('achievements-btn');
    if (achievementsBtn) {
      achievementsBtn.addEventListener('click', () => {
        this.showAchievementsModal();
      });
    }
  }

  /**
   * Show achievements modal
   */
  showAchievementsModal() {
    const achievements = this.state.getAllAchievements();

    const modalBody = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: var(--space-2);">
        ${achievements.map(a => `
          <div style="
            text-align: center;
            padding: var(--space-2);
            background: ${a.unlocked ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)'};
            border: var(--border-pixel);
            opacity: ${a.unlocked ? '1' : '0.5'};
          ">
            <div style="font-size: 32px; margin-bottom: var(--space-1);">
              ${a.unlocked ? a.icon : '❓'}
            </div>
            <div style="font-family: var(--font-display); font-size: 6px; color: ${a.unlocked ? 'var(--color-gold)' : 'var(--color-text-muted)'};">
              ${a.unlocked ? a.name : '???'}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Use the project modal for achievements
    const modal = document.getElementById('project-modal');
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    const icon = document.getElementById('modal-icon');

    if (title) title.textContent = 'Achievements';
    if (subtitle) subtitle.textContent = `${this.state.achievements.size} / ${achievements.length} Unlocked`;
    if (icon) icon.innerHTML = '<span style="font-size: 48px;">🏆</span>';
    if (body) body.innerHTML = modalBody;
    if (footer) footer.innerHTML = `
      <p style="font-size: var(--text-sm); color: var(--color-text-muted);">
        Total XP: ${this.state.xp} | Level ${this.state.level}: ${this.state.getLevelName()}
      </p>
    `;

    modal?.classList.add('active');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Setup contact form
   */
  setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      // Award achievement for sending message
      if (!this.state.achievements.has('messenger')) {
        this.state.unlockAchievement('messenger');
      }

      // Let the form submit normally to Formspree
      // The achievement is awarded before redirect
    });
  }

  /**
   * Setup social link tracking
   */
  setupSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');

    socialLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Award achievement for clicking social link
        if (!this.state.achievements.has('socialButterfly')) {
          this.state.unlockAchievement('socialButterfly');
        }

        // Award XP for external links
        this.state.awardXP(100, 'Visited social link');
      });
    });
  }

  /**
   * Setup time-based theme (day/night)
   */
  setupTimeBasedTheme() {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour < 6;

    const villageSection = document.querySelector('.section-village');
    if (villageSection && isNight) {
      villageSection.classList.add('night');
    }

    // Update every hour
    setInterval(() => {
      const currentHour = new Date().getHours();
      const shouldBeNight = currentHour >= 20 || currentHour < 6;

      if (villageSection) {
        if (shouldBeNight) {
          villageSection.classList.add('night');
        } else {
          villageSection.classList.remove('night');
        }
      }
    }, 60 * 60 * 1000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new PortfolioGame();
  game.init();
});

// Export for debugging
export default PortfolioGame;
