/**
 * Projects Manager
 * Handles project cards and modal display
 */

// Project data
const PROJECTS = {
  bannerlord: {
    id: 'bannerlord',
    name: "The Modder's Arsenal",
    subtitle: 'Mount & Blade II: Bannerlord & Worldbox Mods',
    icon: 'sword',
    description: `
      <p>These five legendary mods were forged by reverse-engineering the ancient code of Bannerlord
      using the sacred tool dnSpy. Each mod grants players abilities the original creators never intended.</p>

      <h3>Achievements</h3>
      <ul>
        <li>Developed and shipped 5 C# gameplay mods</li>
        <li>Achieved 20,000+ total downloads on Steam/Nexus</li>
        <li>Reverse-engineered closed-source game systems</li>
        <li>Designed modular, data-driven architectures</li>
        <li>Debugged race conditions and memory leaks</li>
      </ul>

      <h3>Technical Highlights</h3>
      <ul>
        <li>Identified unmet player needs through community research</li>
        <li>Implemented extensible mechanics that integrate seamlessly</li>
        <li>Built data-driven configs for rapid iteration</li>
        <li>Maintained compatibility across multiple game versions</li>
      </ul>
    `,
    tags: ['C#', 'dnSpy', 'Steam', 'Nexus', 'Reverse Engineering'],
    stats: {
      downloads: '20,000+',
      mods: '5',
      platforms: 'Steam & Nexus'
    },
    links: [
      { label: 'View on Steam', url: '#', icon: 'steam' },
      { label: 'View on Nexus', url: '#', icon: 'nexus' }
    ]
  },

  'gpt-rpg': {
    id: 'gpt-rpg',
    name: "The Oracle's Experiment",
    subtitle: 'GPT-RPG: AI Dungeon Master',
    icon: 'orb',
    description: `
      <p>A Unity-based RPG where GPT-3 acts as a dynamic Dungeon Master, generating narrative,
      dialogue, and quest outcomes at runtime. The AI creates a unique story for every player.</p>

      <h3>Key Features</h3>
      <ul>
        <li>Dynamic narrative generation using GPT-3</li>
        <li>Real-time dialogue and quest creation</li>
        <li>Contextual story adaptation</li>
        <li>Optimized API usage for smooth gameplay</li>
      </ul>

      <h3>Technical Achievements</h3>
      <ul>
        <li>Integrated OpenAI's GPT-3 API with Unity game loop</li>
        <li>Optimized request frequency and token usage</li>
        <li>Reduced perceived latency by ~60%</li>
        <li>Maintained gameplay coherence across sessions</li>
      </ul>

      <h3>Senior Project</h3>
      <p>Developed as a capstone project at CSUF, demonstrating the intersection of
      game development and artificial intelligence.</p>
    `,
    tags: ['Unity', 'C#', 'GPT-3', 'OpenAI', 'AI Integration'],
    stats: {
      engine: 'Unity',
      ai: 'GPT-3',
      latency: '-60%'
    },
    links: [
      { label: 'View Project', url: '#', icon: 'github' },
      { label: 'Documentation', url: '#', icon: 'doc' }
    ]
  },

  'fire-furious': {
    id: 'fire-furious',
    name: 'The Blazing Gauntlet',
    subtitle: 'Fire and Furious',
    icon: 'flame',
    description: `
      <p>A collaborative Unity game featuring procedural level generation and
      intelligent enemy AI. Each playthrough offers a unique challenge.</p>

      <h3>My Contributions</h3>
      <ul>
        <li>Implemented procedural level generation using seeded randomness</li>
        <li>Built finite-state-machine enemy AI across 5+ enemy classes</li>
        <li>Optimized rendering with object pooling for stable FPS</li>
        <li>Designed weighted spawning systems for balanced difficulty</li>
      </ul>

      <h3>Technical Systems</h3>
      <ul>
        <li><strong>Procedural Generation:</strong> Seeded random algorithms ensure
        replayable yet unique levels</li>
        <li><strong>Enemy AI:</strong> FSM-based behavior trees for reactive,
        challenging enemies</li>
        <li><strong>Performance:</strong> Object pooling and lifecycle management
        maintain smooth gameplay</li>
      </ul>
    `,
    tags: ['Unity', 'C#', 'Procedural Generation', 'FSM AI', 'Object Pooling'],
    stats: {
      enemies: '5+ Classes',
      generation: 'Procedural',
      performance: 'Optimized'
    },
    links: [
      { label: 'View on GitHub', url: '#', icon: 'github' }
    ]
  },

  portfolio: {
    id: 'portfolio',
    name: 'The Meta Artifact',
    subtitle: 'This Very Portfolio',
    icon: 'scroll',
    description: `
      <p>You're looking at it! A pixel art RPG-themed portfolio website that turns
      the job search into an adventure.</p>

      <h3>Features</h3>
      <ul>
        <li>Vanilla HTML, CSS, and JavaScript (no frameworks)</li>
        <li>XP and achievement system with localStorage persistence</li>
        <li>Multiple hidden Easter eggs to discover</li>
        <li>Fully accessible with keyboard navigation</li>
        <li>Responsive design for all devices</li>
      </ul>

      <h3>Easter Eggs Found</h3>
      <ul>
        <li>🎮 Konami Code</li>
        <li>💻 DevTools detection</li>
        <li>🖱️ Click Andy 10 times</li>
        <li>🇪🇸 Type "hola" for Spanish mode</li>
        <li>...and more secrets to discover!</li>
      </ul>

      <h3>Technical Stack</h3>
      <ul>
        <li>Pure HTML5, CSS3, ES6+ JavaScript</li>
        <li>CSS custom properties for theming</li>
        <li>IntersectionObserver for scroll effects</li>
        <li>Formspree for contact form</li>
      </ul>
    `,
    tags: ['HTML', 'CSS', 'JavaScript', 'Pixel Art', 'Game Design'],
    stats: {
      framework: 'None!',
      hosting: 'GitHub Pages',
      vibe: 'Legendary'
    },
    links: [
      { label: 'View Source', url: 'https://github.com/andygarciapc/andygarciapc.github.io', icon: 'github' }
    ]
  }
};

class ProjectsManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.modal = null;
    this.overlay = null;
  }

  /**
   * Initialize projects
   */
  init() {
    this.modal = document.getElementById('project-modal');
    this.overlay = document.getElementById('modal-overlay');

    this.setupExamineButtons();
    this.setupModalClose();
  }

  /**
   * Setup examine button click handlers
   */
  setupExamineButtons() {
    const examineButtons = document.querySelectorAll('[data-action="examine"]');

    examineButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const card = e.target.closest('.artifact-card');
        const projectId = card?.dataset.project;

        if (projectId) {
          this.openProject(projectId);
        }
      });
    });
  }

  /**
   * Setup modal close handlers
   */
  setupModalClose() {
    const closeBtn = document.getElementById('modal-close');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeModal());
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  /**
   * Open a project modal
   */
  openProject(projectId) {
    const project = PROJECTS[projectId];
    if (!project) return;

    // Award XP for examining
    if (this.gameState) {
      this.gameState.examineProject(projectId);
    }

    // Populate modal
    this.populateModal(project);

    // Show modal
    this.modal?.classList.add('active');
    this.overlay?.classList.add('active');

    // Focus management for accessibility
    this.modal?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Populate modal with project data
   */
  populateModal(project) {
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    const icon = document.getElementById('modal-icon');

    if (title) title.textContent = project.name;
    if (subtitle) subtitle.textContent = project.subtitle;

    // Set icon based on project
    if (icon) {
      icon.innerHTML = this.getProjectIcon(project.icon);
    }

    // Build body content
    if (body) {
      let statsHtml = '';
      if (project.stats) {
        statsHtml = `
          <div class="modal-stats" style="display: flex; gap: var(--space-4); margin-bottom: var(--space-4);">
            ${Object.entries(project.stats).map(([key, value]) => `
              <div class="stat" style="text-align: center;">
                <span class="stat-value">${value}</span>
                <span class="stat-label">${key}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      let tagsHtml = '';
      if (project.tags) {
        tagsHtml = `
          <div class="modal-tags" style="margin-bottom: var(--space-4);">
            ${project.tags.map(tag => `<span class="tag tag-tech">${tag}</span>`).join(' ')}
          </div>
        `;
      }

      body.innerHTML = `
        ${statsHtml}
        ${tagsHtml}
        <div class="modal-description">
          ${project.description}
        </div>
      `;
    }

    // Build footer with links
    if (footer) {
      footer.innerHTML = project.links.map(link => `
        <a href="${link.url}"
           target="_blank"
           rel="noopener noreferrer"
           class="btn btn-secondary"
           onclick="if(window.gameState) gameState.awardXP(100, 'Explored project link')">
          ${link.label}
        </a>
      `).join('');
    }
  }

  /**
   * Get SVG icon for project type
   */
  getProjectIcon(iconType) {
    const icons = {
      sword: `
        <svg viewBox="0 0 64 64" width="80" height="80" style="image-rendering: pixelated;">
          <rect fill="#94b0c2" x="28" y="4" width="8" height="48"/>
          <polygon fill="#566c86" points="16,8 48,8 32,24"/>
          <rect fill="#5d275d" x="20" y="52" width="24" height="8"/>
          <rect fill="#ffcd75" x="26" y="54" width="12" height="4"/>
        </svg>
      `,
      orb: `
        <svg viewBox="0 0 64 64" width="80" height="80" style="image-rendering: pixelated;">
          <circle fill="#3b5dc9" cx="32" cy="32" r="24"/>
          <circle fill="#73eff7" cx="32" cy="32" r="16"/>
          <circle fill="#f4f4f4" cx="32" cy="32" r="8"/>
          <rect fill="#ffcd75" x="30" y="28" width="4" height="8"/>
          <rect fill="#ffcd75" x="28" y="30" width="8" height="4"/>
        </svg>
      `,
      flame: `
        <svg viewBox="0 0 64 64" width="80" height="80" style="image-rendering: pixelated;">
          <rect fill="#566c86" x="8" y="32" width="48" height="24"/>
          <rect fill="#94b0c2" x="16" y="36" width="32" height="16"/>
          <polygon fill="#ef7d57" points="32,4 16,32 48,32"/>
          <polygon fill="#ffcd75" points="32,12 24,32 40,32"/>
          <polygon fill="#f4f4f4" points="32,20 28,32 36,32"/>
        </svg>
      `,
      scroll: `
        <svg viewBox="0 0 64 64" width="80" height="80" style="image-rendering: pixelated;">
          <rect fill="#5d275d" x="12" y="8" width="40" height="48"/>
          <rect fill="#f4f4f4" x="16" y="12" width="32" height="40"/>
          <rect fill="#1a1c2c" x="20" y="18" width="24" height="4"/>
          <rect fill="#1a1c2c" x="20" y="26" width="20" height="2"/>
          <rect fill="#1a1c2c" x="20" y="32" width="24" height="2"/>
          <rect fill="#1a1c2c" x="20" y="38" width="16" height="2"/>
          <rect fill="#ffcd75" x="36" y="44" width="8" height="4"/>
        </svg>
      `
    };

    return icons[iconType] || icons.scroll;
  }

  /**
   * Close the modal
   */
  closeModal() {
    this.modal?.classList.remove('active');
    this.overlay?.classList.remove('active');

    // Restore body scroll
    document.body.style.overflow = '';
  }

  /**
   * Get project data
   */
  getProject(projectId) {
    return PROJECTS[projectId];
  }

  /**
   * Get all projects
   */
  getAllProjects() {
    return Object.values(PROJECTS);
  }
}

export default ProjectsManager;
export { PROJECTS };
