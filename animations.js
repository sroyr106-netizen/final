// ============================================
// ANIMATIONS CONTROLLER
// 3D Effects & Micro-interactions
// ============================================

class AnimationController {
    constructor() {
        this.init();
    }

    init() {
        this.initScrollAnimations();
        this.init3DEffects();
        this.initMicroInteractions();
        this.initFaceScanAnimation();
    }

    // Scroll-triggered animations
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll(
            '.feature-card, .module-card, .stat-card, .attendance-card'
        );
        animatedElements.forEach(el => observer.observe(el));
    }

    // 3D card tilt effects
    init3DEffects() {
        const cards = document.querySelectorAll('.card-3d, .login-card, .module-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }

    // Button and element micro-interactions
    initMicroInteractions() {
        // Add ripple effect to buttons
        const buttons = document.querySelectorAll('.btn, .action-btn, .control-btn');

        buttons.forEach(button => {
            button.addEventListener('click', function (e) {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect');

                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';

                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple effect styles dynamically
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        }
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
            document.head.appendChild(style);
        }

        // Hover effects for table rows
        const tableRows = document.querySelectorAll('tbody tr');
        tableRows.forEach(row => {
            row.addEventListener('mouseenter', function () {
                this.style.transform = 'scale(1.02)';
                this.style.transition = 'transform 0.3s ease';
            });

            row.addEventListener('mouseleave', function () {
                this.style.transform = 'scale(1)';
            });
        });
    }

    // 3D Face Scan Animation
    initFaceScanAnimation() {
        const faceScanContainer = document.querySelector('.face-scan-container');
        if (!faceScanContainer) return;

        // Create CSS-based 3D face scan if image generation failed
        this.createCSSFaceScan(faceScanContainer);
    }

    createCSSFaceScan(container) {
        const scanImage = container.querySelector('.face-scan-image');
        if (scanImage && scanImage.src && !scanImage.src.includes('placeholder')) {
            // Image loaded successfully, no need for CSS version
            return;
        }

        // Create CSS-based face scan
        const cssFace = document.createElement('div');
        cssFace.className = 'css-face-scan';
        cssFace.innerHTML = `
      <div class="face-outline">
        <div class="face-grid"></div>
        <div class="scan-beam"></div>
      </div>
    `;

        // Add styles for CSS face scan
        const style = document.createElement('style');
        style.textContent = `
      .css-face-scan {
        width: 250px;
        height: 250px;
        position: relative;
        animation: rotate3D 20s linear infinite, floating 3s ease-in-out infinite;
      }
      
      .face-outline {
        width: 100%;
        height: 100%;
        position: relative;
        border: 3px solid rgba(79, 172, 254, 0.6);
        border-radius: 50% 50% 45% 45%;
        box-shadow: 0 0 40px rgba(79, 172, 254, 0.4), inset 0 0 30px rgba(79, 172, 254, 0.2);
      }
      
      .face-outline::before {
        content: '';
        position: absolute;
        top: 30%;
        left: 25%;
        width: 15%;
        height: 15%;
        background: radial-gradient(circle, rgba(102, 126, 234, 0.8), transparent);
        border-radius: 50%;
        box-shadow: 120px 0 0 rgba(102, 126, 234, 0.8);
      }
      
      .face-outline::after {
        content: '';
        position: absolute;
        bottom: 25%;
        left: 30%;
        width: 40%;
        height: 15%;
        background: linear-gradient(90deg, transparent, rgba(118, 75, 162, 0.6), transparent);
        border-radius: 0 0 50% 50%;
      }
      
      .face-grid {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(0deg, transparent 24%, rgba(79, 172, 254, 0.3) 25%, rgba(79, 172, 254, 0.3) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, 0.3) 75%, rgba(79, 172, 254, 0.3) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(79, 172, 254, 0.3) 25%, rgba(79, 172, 254, 0.3) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, 0.3) 75%, rgba(79, 172, 254, 0.3) 76%, transparent 77%, transparent);
        background-size: 50px 50px;
        opacity: 0.5;
        border-radius: 50% 50% 45% 45%;
        animation: gridPulse 2s ease-in-out infinite;
      }
      
      .scan-beam {
        position: absolute;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, transparent, rgba(0, 242, 254, 0.9), transparent);
        box-shadow: 0 0 20px rgba(0, 242, 254, 0.8);
        animation: scan 2s ease-in-out infinite;
      }
      
      @keyframes gridPulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.7; }
      }
    `;

        if (!document.getElementById('css-face-scan-styles')) {
            style.id = 'css-face-scan-styles';
            document.head.appendChild(style);
        }

        // Replace image with CSS version
        if (scanImage) {
            scanImage.replaceWith(cssFace);
        } else {
            const innerContainer = container.querySelector('.face-scan-inner');
            if (innerContainer) {
                innerContainer.appendChild(cssFace);
            }
        }
    }

    // Loading animation
    showLoading(container) {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `
      <div class="spinner"></div>
      <p class="loading-text">Processing...</p>
    `;
        container.style.position = 'relative';
        container.appendChild(loader);

        const style = document.createElement('style');
        style.textContent = `
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        border-radius: inherit;
      }
      .loading-text {
        color: white;
        margin-top: var(--spacing-lg);
        font-size: var(--text-lg);
      }
    `;
        if (!document.getElementById('loading-styles')) {
            style.id = 'loading-styles';
            document.head.appendChild(style);
        }
    }

    hideLoading(container) {
        const loader = container.querySelector('.loading-overlay');
        if (loader) {
            loader.remove();
        }
    }

    // Success/Error notifications
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;

        document.body.appendChild(notification);

        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
        .notification {
          position: fixed;
          top: 100px;
          right: 20px;
          padding: var(--spacing-lg) var(--spacing-xl);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          color: white;
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          z-index: 10000;
          animation: slideIn 0.3s ease-out, slideOut 0.3s ease-out 2.7s;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        .notification-success {
          background: linear-gradient(135deg, rgba(67, 233, 123, 0.9), rgba(56, 249, 215, 0.9));
        }
        .notification-error {
          background: linear-gradient(135deg, rgba(245, 87, 108, 0.9), rgba(240, 147, 251, 0.9));
        }
        .notification i {
          font-size: var(--text-xl);
        }
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
            document.head.appendChild(style);
        }

        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize animation controller
const animationController = new AnimationController();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}
