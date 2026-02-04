/**
 * Game State Manager
 * Handles XP, levels, achievements, and localStorage persistence
 */

const STORAGE_KEY = 'andygarcia_portfolio_state';

// Level thresholds
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000];
const LEVEL_NAMES = [
  'New Adventurer',
  'Curious Explorer',
  'Dedicated Seeker',
  'True Ally',
  'Legendary Friend'
];

// Achievement definitions
const ACHIEVEMENTS = {
  firstSteps: {
    id: 'firstSteps',
    name: 'First Steps',
    description: 'Visit the portfolio for the first time',
    icon: '👢',
    xp: 50
  },
  archaeologist: {
    id: 'archaeologist',
    name: 'Archaeologist',
    description: 'Examine all projects in the dungeon',
    icon: '⛏️',
    xp: 100
  },
  historian: {
    id: 'historian',
    name: 'Historian',
    description: 'Read through the experience timeline',
    icon: '📜',
    xp: 50
  },
  socialButterfly: {
    id: 'socialButterfly',
    name: 'Social Butterfly',
    description: 'Click any social link',
    icon: '🦋',
    xp: 50
  },
  completionist: {
    id: 'completionist',
    name: 'Completionist',
    description: 'Visit all sections of the portfolio',
    icon: '⭐',
    xp: 150
  },
  nightOwl: {
    id: 'nightOwl',
    name: 'Night Owl',
    description: 'Visit between 10 PM and 4 AM',
    icon: '🦉',
    xp: 75
  },
  earlyBird: {
    id: 'earlyBird',
    name: 'Early Bird',
    description: 'Visit between 5 AM and 8 AM',
    icon: '🌅',
    xp: 75
  },
  secretHunter: {
    id: 'secretHunter',
    name: 'Secret Hunter',
    description: 'Find a hidden Easter egg',
    icon: '🔍',
    xp: 200
  },
  konamiMaster: {
    id: 'konamiMaster',
    name: 'Konami Master',
    description: 'Enter the legendary code',
    icon: '🎮',
    xp: 200
  },
  codeWhisperer: {
    id: 'codeWhisperer',
    name: 'Code Whisperer',
    description: 'Open the developer tools',
    icon: '💻',
    xp: 100
  },
  returnVisitor: {
    id: 'returnVisitor',
    name: 'Return Visitor',
    description: 'Come back another day',
    icon: '🔄',
    xp: 150
  },
  messenger: {
    id: 'messenger',
    name: 'Messenger',
    description: 'Send a message through the contact form',
    icon: '✉️',
    xp: 100
  }
};

class GameState {
  constructor() {
    this.xp = 0;
    this.level = 1;
    this.achievements = new Set();
    this.visitedSections = new Set();
    this.examinedProjects = new Set();
    this.firstVisit = null;
    this.lastVisit = null;
    this.listeners = [];
  }

  /**
   * Load state from localStorage
   */
  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.xp = data.xp || 0;
        this.level = this.calculateLevel(this.xp);
        this.achievements = new Set(data.achievements || []);
        this.visitedSections = new Set(data.visitedSections || []);
        this.examinedProjects = new Set(data.examinedProjects || []);
        this.firstVisit = data.firstVisit;
        this.lastVisit = data.lastVisit;
      } else {
        // First time visitor
        this.firstVisit = Date.now();
        this.save();
      }
    } catch (e) {
      console.warn('Failed to load game state:', e);
    }

    // Check for return visitor
    if (this.isReturnVisitor() && !this.achievements.has('returnVisitor')) {
      this.unlockAchievement('returnVisitor');
    }

    // Check time-based achievements
    this.checkTimeBasedAchievements();

    // Update last visit
    this.lastVisit = Date.now();
    this.save();

    return this;
  }

  /**
   * Save state to localStorage
   */
  save() {
    try {
      const data = {
        xp: this.xp,
        achievements: [...this.achievements],
        visitedSections: [...this.visitedSections],
        examinedProjects: [...this.examinedProjects],
        firstVisit: this.firstVisit,
        lastVisit: this.lastVisit
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save game state:', e);
    }
  }

  /**
   * Calculate level from XP
   */
  calculateLevel(xp) {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Get XP progress to next level (0-100)
   */
  getLevelProgress() {
    const currentThreshold = LEVEL_THRESHOLDS[this.level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[this.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const progress = this.xp - currentThreshold;
    const needed = nextThreshold - currentThreshold;
    return Math.min(100, Math.round((progress / needed) * 100));
  }

  /**
   * Get level name
   */
  getLevelName() {
    return LEVEL_NAMES[this.level - 1] || LEVEL_NAMES[0];
  }

  /**
   * Award XP to the player
   */
  awardXP(amount, reason = '') {
    const previousLevel = this.level;
    this.xp += amount;
    this.level = this.calculateLevel(this.xp);

    // Show floating XP notification
    this.showXPGain(amount, reason);

    // Check for level up
    if (this.level > previousLevel) {
      this.onLevelUp(this.level);
    }

    // Update UI
    this.updateUI();
    this.save();
    this.emit('xpGained', { amount, reason, total: this.xp });
  }

  /**
   * Show floating +XP notification
   */
  showXPGain(amount, reason) {
    const notification = document.getElementById('xp-notification');
    if (!notification) return;

    notification.textContent = `+${amount} XP`;
    notification.style.left = '50%';
    notification.style.top = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.opacity = '1';
    notification.classList.add('anim-xp-gain');

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.classList.remove('anim-xp-gain');
    }, 1000);
  }

  /**
   * Handle level up
   */
  onLevelUp(newLevel) {
    // Flash screen
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);

    // Show toast
    this.showToast({
      title: 'LEVEL UP!',
      message: `You are now Level ${newLevel}: ${this.getLevelName()}`,
      icon: '⬆️'
    });

    this.emit('levelUp', { level: newLevel, name: this.getLevelName() });
  }

  /**
   * Unlock an achievement
   */
  unlockAchievement(achievementId) {
    if (this.achievements.has(achievementId)) {
      return false; // Already unlocked
    }

    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) {
      console.warn('Unknown achievement:', achievementId);
      return false;
    }

    this.achievements.add(achievementId);

    // Show achievement toast
    this.showToast({
      title: 'Achievement Unlocked!',
      message: achievement.name,
      icon: achievement.icon,
      type: 'achievement'
    });

    // Award XP
    if (achievement.xp) {
      this.awardXP(achievement.xp, achievement.name);
    }

    // Update achievement count
    this.updateAchievementCount();
    this.save();
    this.emit('achievementUnlocked', achievement);

    return true;
  }

  /**
   * Show toast notification
   */
  showToast({ title, message, icon, type = 'default' }) {
    const toast = document.getElementById('achievement-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast) return;

    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toastIcon.textContent = icon || '✨';

    if (type === 'achievement') {
      toast.classList.add('toast-achievement');
    } else {
      toast.classList.remove('toast-achievement');
    }

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  /**
   * Mark a section as visited
   */
  visitSection(sectionId) {
    if (this.visitedSections.has(sectionId)) {
      return;
    }

    this.visitedSections.add(sectionId);
    this.awardXP(50, `Visited ${sectionId}`);

    // Check for completionist achievement
    const allSections = ['about', 'projects', 'experience', 'contact'];
    if (allSections.every(s => this.visitedSections.has(s))) {
      this.unlockAchievement('completionist');
    }

    // Check for first steps
    if (!this.achievements.has('firstSteps')) {
      this.unlockAchievement('firstSteps');
    }

    // Check historian achievement
    if (sectionId === 'experience' && !this.achievements.has('historian')) {
      this.unlockAchievement('historian');
    }

    this.save();
  }

  /**
   * Mark a project as examined
   */
  examineProject(projectId) {
    if (this.examinedProjects.has(projectId)) {
      return;
    }

    this.examinedProjects.add(projectId);
    this.awardXP(25, 'Examined project');

    // Check for archaeologist achievement
    const allProjects = ['bannerlord', 'gpt-rpg', 'fire-furious', 'portfolio'];
    if (allProjects.every(p => this.examinedProjects.has(p))) {
      this.unlockAchievement('archaeologist');
    }

    this.save();
  }

  /**
   * Check if user is a return visitor (visited on a different day)
   */
  isReturnVisitor() {
    if (!this.lastVisit) return false;

    const lastDate = new Date(this.lastVisit).toDateString();
    const today = new Date().toDateString();

    return lastDate !== today;
  }

  /**
   * Check time-based achievements
   */
  checkTimeBasedAchievements() {
    const hour = new Date().getHours();

    // Night Owl: 10 PM - 4 AM (22-23 or 0-4)
    if ((hour >= 22 || hour < 4) && !this.achievements.has('nightOwl')) {
      this.unlockAchievement('nightOwl');
    }

    // Early Bird: 5 AM - 8 AM
    if (hour >= 5 && hour < 8 && !this.achievements.has('earlyBird')) {
      this.unlockAchievement('earlyBird');
    }
  }

  /**
   * Update the UI (HP/XP bars, level badge)
   */
  updateUI() {
    // Update XP bar
    const xpBar = document.getElementById('xp-bar');
    if (xpBar) {
      xpBar.style.width = `${this.getLevelProgress()}%`;
    }

    // Update level badge
    const levelBadge = document.getElementById('player-level');
    if (levelBadge) {
      levelBadge.textContent = this.level;
    }
  }

  /**
   * Update achievement count badge
   */
  updateAchievementCount() {
    const countBadge = document.getElementById('achievement-count');
    if (countBadge) {
      countBadge.textContent = this.achievements.size;
    }
  }

  /**
   * Get all achievements (unlocked and locked)
   */
  getAllAchievements() {
    return Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      unlocked: this.achievements.has(achievement.id)
    }));
  }

  /**
   * Event emitter methods
   */
  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  emit(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => l.callback(data));
  }

  /**
   * Reset all progress (for testing)
   */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.xp = 0;
    this.level = 1;
    this.achievements = new Set();
    this.visitedSections = new Set();
    this.examinedProjects = new Set();
    this.firstVisit = Date.now();
    this.lastVisit = null;
    this.save();
    this.updateUI();
    this.updateAchievementCount();
  }
}

// Export singleton instance
const gameState = new GameState();
export default gameState;
export { ACHIEVEMENTS, LEVEL_NAMES };
