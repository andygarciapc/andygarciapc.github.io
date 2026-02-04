/**
 * Dialogue System
 * Handles typewriter effect and NPC speech
 */

class DialogueSystem {
  constructor() {
    this.isTyping = false;
    this.currentText = '';
    this.currentIndex = 0;
    this.typingSpeed = 30; // ms per character
    this.dialogueQueue = [];
    this.onComplete = null;
  }

  /**
   * Initialize the dialogue system
   */
  init() {
    // Setup dialogue advance button
    const advanceBtn = document.getElementById('dialogue-next');
    if (advanceBtn) {
      advanceBtn.addEventListener('click', () => this.advance());
    }

    // Setup keyboard advance
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        // Only if not in a form
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          if (this.isTyping || this.dialogueQueue.length > 0) {
            e.preventDefault();
            this.advance();
          }
        }
      }
    });
  }

  /**
   * Start a dialogue sequence
   * @param {string} elementId - ID of the dialogue text element
   * @param {string[]} dialogues - Array of dialogue strings
   * @param {Function} callback - Called when all dialogues complete
   */
  start(elementId, dialogues, callback = null) {
    this.element = document.getElementById(elementId);
    if (!this.element) return;

    this.dialogueQueue = [...dialogues];
    this.onComplete = callback;

    // Start first dialogue
    this.showNext();
  }

  /**
   * Show the next dialogue in queue
   */
  showNext() {
    if (this.dialogueQueue.length === 0) {
      // All dialogues complete
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }

    const text = this.dialogueQueue.shift();
    this.typeText(text);
  }

  /**
   * Type text with typewriter effect
   */
  typeText(text) {
    if (!this.element) return;

    this.isTyping = true;
    this.currentText = text;
    this.currentIndex = 0;
    this.element.innerHTML = '';

    // Add cursor
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    this.element.appendChild(cursor);

    this.typeNextChar();
  }

  /**
   * Type the next character
   */
  typeNextChar() {
    if (this.currentIndex >= this.currentText.length) {
      this.isTyping = false;
      // Remove cursor after a delay
      const cursor = this.element.querySelector('.typing-cursor');
      if (cursor) {
        setTimeout(() => cursor.remove(), 1000);
      }
      return;
    }

    const char = this.currentText[this.currentIndex];
    const cursor = this.element.querySelector('.typing-cursor');

    // Handle HTML tags
    if (char === '<') {
      // Find the end of the tag
      const tagEnd = this.currentText.indexOf('>', this.currentIndex);
      if (tagEnd !== -1) {
        const tag = this.currentText.substring(this.currentIndex, tagEnd + 1);

        // If it's an opening tag, find its closing tag and insert both
        if (!tag.startsWith('</')) {
          const tagName = tag.match(/<(\w+)/)?.[1];
          if (tagName) {
            const closingTag = `</${tagName}>`;
            const closingIndex = this.currentText.indexOf(closingTag, tagEnd);
            if (closingIndex !== -1) {
              const content = this.currentText.substring(tagEnd + 1, closingIndex);
              const span = document.createElement('span');
              span.innerHTML = tag + closingTag;
              span.firstChild.textContent = '';

              if (cursor) {
                this.element.insertBefore(span.firstChild, cursor);
              }

              // Type the content inside the tag
              this.currentIndex = closingIndex + closingTag.length;
              this.typeContentInElement(this.element.lastElementChild, content, 0, cursor);
              return;
            }
          }
        }

        // Skip the tag
        this.currentIndex = tagEnd + 1;
        this.typeNextChar();
        return;
      }
    }

    // Insert character before cursor
    const textNode = document.createTextNode(char);
    if (cursor) {
      this.element.insertBefore(textNode, cursor);
    } else {
      this.element.appendChild(textNode);
    }

    this.currentIndex++;

    // Variable speed based on punctuation
    let delay = this.typingSpeed;
    if (char === '.' || char === '!' || char === '?') {
      delay = this.typingSpeed * 5;
    } else if (char === ',') {
      delay = this.typingSpeed * 2;
    }

    setTimeout(() => this.typeNextChar(), delay);
  }

  /**
   * Type content inside an element (for styled spans)
   */
  typeContentInElement(element, content, index, cursor) {
    if (index >= content.length) {
      // Continue with rest of text
      setTimeout(() => this.typeNextChar(), this.typingSpeed);
      return;
    }

    element.textContent += content[index];

    const char = content[index];
    let delay = this.typingSpeed;
    if (char === '.' || char === '!' || char === '?') {
      delay = this.typingSpeed * 5;
    } else if (char === ',') {
      delay = this.typingSpeed * 2;
    }

    setTimeout(() => this.typeContentInElement(element, content, index + 1, cursor), delay);
  }

  /**
   * Advance the dialogue (skip typing or show next)
   */
  advance() {
    if (this.isTyping) {
      // Skip to end of current text
      this.skipTyping();
    } else {
      // Show next dialogue
      this.showNext();
    }
  }

  /**
   * Skip the current typing animation
   */
  skipTyping() {
    if (!this.element || !this.currentText) return;

    this.isTyping = false;

    // Remove cursor
    const cursor = this.element.querySelector('.typing-cursor');
    if (cursor) cursor.remove();

    // Show full text
    this.element.innerHTML = this.currentText;
  }

  /**
   * Show a quick speech bubble (for NPCs)
   * @param {string} text - Text to show
   * @param {HTMLElement} anchorElement - Element to position near
   * @param {number} duration - How long to show (ms)
   */
  showSpeechBubble(text, anchorElement, duration = 3000) {
    // Create bubble
    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble anim-pop';
    bubble.innerHTML = `
      <p class="speech-text">${text}</p>
      <div class="speech-tail"></div>
    `;

    // Position near anchor
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      bubble.style.position = 'fixed';
      bubble.style.left = `${rect.left + rect.width / 2}px`;
      bubble.style.top = `${rect.top - 20}px`;
      bubble.style.transform = 'translate(-50%, -100%)';
    }

    document.body.appendChild(bubble);

    // Remove after duration
    setTimeout(() => {
      bubble.classList.add('anim-fade-out');
      setTimeout(() => bubble.remove(), 300);
    }, duration);

    return bubble;
  }
}

export default DialogueSystem;
