/**
 * Navigation Manager
 * Handles smooth scrolling, keyboard navigation, and section tracking
 */

class Navigation {
  constructor(gameState) {
    this.gameState = gameState;
    this.sections = ['about', 'projects', 'experience', 'contact'];
    this.currentSection = 'about';
    this.isScrolling = false;
    this.scrollTimeout = null;
  }

  /**
   * Initialize navigation
   */
  init() {
    this.setupNavLinks();
    this.setupScrollSpy();
    this.setupKeyboardNav();
    this.updateActiveNav(this.currentSection);
  }

  /**
   * Setup click handlers for nav links
   */
  setupNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        this.scrollToSection(sectionId);
      });
    });
  }

  /**
   * Setup scroll spy to track current section
   */
  setupScrollSpy() {
    // Use IntersectionObserver for better performance
    const options = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          this.onSectionEnter(sectionId);
        }
      });
    }, options);

    // Observe all sections
    this.sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        observer.observe(section);
      }
    });

    // Also track scroll for HP bar (page progress)
    window.addEventListener('scroll', () => {
      this.updateScrollProgress();
    }, { passive: true });
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      // Don't interfere with form inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          this.navigateToNextSection();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          this.navigateToPrevSection();
          break;
        case 'Home':
          e.preventDefault();
          this.scrollToSection('about');
          break;
        case 'End':
          e.preventDefault();
          this.scrollToSection('contact');
          break;
        case '1':
          this.scrollToSection('about');
          break;
        case '2':
          this.scrollToSection('projects');
          break;
        case '3':
          this.scrollToSection('experience');
          break;
        case '4':
          this.scrollToSection('contact');
          break;
      }
    });
  }

  /**
   * Scroll to a specific section
   */
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    this.isScrolling = true;

    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // Update URL hash without triggering scroll
    history.replaceState(null, null, `#${sectionId}`);

    // Clear scrolling flag after animation
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 1000);
  }

  /**
   * Navigate to next section
   */
  navigateToNextSection() {
    const currentIndex = this.sections.indexOf(this.currentSection);
    const nextIndex = Math.min(currentIndex + 1, this.sections.length - 1);
    this.scrollToSection(this.sections[nextIndex]);
  }

  /**
   * Navigate to previous section
   */
  navigateToPrevSection() {
    const currentIndex = this.sections.indexOf(this.currentSection);
    const prevIndex = Math.max(currentIndex - 1, 0);
    this.scrollToSection(this.sections[prevIndex]);
  }

  /**
   * Handle section enter
   */
  onSectionEnter(sectionId) {
    if (sectionId === this.currentSection) return;

    this.currentSection = sectionId;
    this.updateActiveNav(sectionId);

    // Award XP for visiting section
    if (this.gameState) {
      this.gameState.visitSection(sectionId);
    }

    // Trigger scroll animations for this section
    this.triggerScrollAnimations(sectionId);
  }

  /**
   * Update active state in navigation
   */
  updateActiveNav(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const linkSection = link.getAttribute('data-section');
      if (linkSection === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Update scroll progress (HP bar)
   */
  updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.round((scrollTop / docHeight) * 100);

    const hpBar = document.getElementById('hp-bar');
    if (hpBar) {
      hpBar.style.width = `${progress}%`;
    }
  }

  /**
   * Trigger scroll animations for elements in view
   */
  triggerScrollAnimations(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Animate elements with scroll-animate class
    const animatedElements = section.querySelectorAll('.scroll-animate');
    animatedElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('in-view');
      }, index * 100);
    });

    // Animate staggered containers
    const staggerContainers = section.querySelectorAll('.scroll-animate-stagger');
    staggerContainers.forEach(container => {
      container.classList.add('in-view');
    });
  }
}

export default Navigation;
