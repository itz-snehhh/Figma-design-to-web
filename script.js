/**
 * Carousel Functionality
 * Implements a working slider with next/prev buttons, auto-slide, and dot indicators
 */
class Carousel {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;
        
        this.track = this.container.querySelector('#carouselTrack');
        this.slides = this.container.querySelectorAll('.carousel__slide');
        this.prevBtn = this.container.querySelector('.carousel__btn--prev');
        this.nextBtn = this.container.querySelector('.carousel__btn--next');
        this.dotsContainer = document.querySelector('#carouselDots');
        
        this.currentIndex = 0;
        this.slideCount = this.slides.length;
        this.autoSlideInterval = null;
        this.autoSlideDelay = 5000; // 5 seconds
        
        this.init();
    }
    
    init() {
        if (this.slideCount === 0) return;
        
        // Create dot indicators
        this.createDots();
        
        // Set initial state
        this.updateCarousel();
        
        // Event listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.container.contains(document.activeElement) || 
                document.activeElement === this.prevBtn || 
                document.activeElement === this.nextBtn) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prevSlide();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextSlide();
                }
            }
        });
        
        // Touch/swipe support
        this.initTouchEvents();
        
        // Start auto-slide
        this.startAutoSlide();
        
        // Pause auto-slide on hover
        this.container.addEventListener('mouseenter', () => this.stopAutoSlide());
        this.container.addEventListener('mouseleave', () => this.startAutoSlide());
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        
        for (let i = 0; i < this.slideCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel__dot';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
        
        this.dots = this.dotsContainer.querySelectorAll('.carousel__dot');
    }
    
    updateCarousel() {
        if (!this.track) return;
        
        // Calculate transform with cross-browser support
        const slideWidth = this.slides[0].offsetWidth;
        const gap = 25; // 25px gap between slides
        const translateX = -(this.currentIndex * (slideWidth + gap));
        
        // Apply transform with vendor prefixes for older browsers
        this.track.style.webkitTransform = `translateX(${translateX}px)`;
        this.track.style.msTransform = `translateX(${translateX}px)`;
        this.track.style.transform = `translateX(${translateX}px)`;
        
        // Update dots
        if (this.dots) {
            this.dots.forEach((dot, index) => {
                if (index === this.currentIndex) {
                    dot.classList.add('carousel__dot--active');
                    dot.setAttribute('aria-selected', 'true');
                } else {
                    dot.classList.remove('carousel__dot--active');
                    dot.setAttribute('aria-selected', 'false');
                }
            });
        }
        
        // Update button states
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentIndex === 0;
            this.prevBtn.setAttribute('aria-disabled', this.currentIndex === 0);
            // Visual feedback for disabled state
            if (this.currentIndex === 0) {
                this.prevBtn.style.opacity = '0.5';
                this.prevBtn.style.cursor = 'not-allowed';
            } else {
                this.prevBtn.style.opacity = '1';
                this.prevBtn.style.cursor = 'pointer';
            }
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentIndex === this.slideCount - 1;
            this.nextBtn.setAttribute('aria-disabled', this.currentIndex === this.slideCount - 1);
            // Visual feedback for disabled state
            if (this.currentIndex === this.slideCount - 1) {
                this.nextBtn.style.opacity = '0.5';
                this.nextBtn.style.cursor = 'not-allowed';
            } else {
                this.nextBtn.style.opacity = '1';
                this.nextBtn.style.cursor = 'pointer';
            }
        }
    }
    
    nextSlide() {
        if (this.currentIndex < this.slideCount - 1) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0; // Loop back to start
        }
        this.updateCarousel();
        this.resetAutoSlide();
    }
    
    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else {
            this.currentIndex = this.slideCount - 1; // Loop to end
        }
        this.updateCarousel();
        this.resetAutoSlide();
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.slideCount) {
            this.currentIndex = index;
            this.updateCarousel();
            this.resetAutoSlide();
        }
    }
    
    startAutoSlide() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoSlideDelay);
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
    
    resetAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }
    
    initTouchEvents() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.stopAutoSlide();
        }, { passive: true });
        
        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });
        
        this.track.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const diffX = startX - currentX;
            const threshold = 50; // Minimum swipe distance
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            isDragging = false;
            this.startAutoSlide();
        });
        
        // Mouse drag support
        let mouseStartX = 0;
        let mouseCurrentX = 0;
        let isMouseDragging = false;
        
        this.track.addEventListener('mousedown', (e) => {
            mouseStartX = e.clientX;
            isMouseDragging = true;
            this.stopAutoSlide();
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isMouseDragging) return;
            mouseCurrentX = e.clientX;
        });
        
        document.addEventListener('mouseup', () => {
            if (!isMouseDragging) return;
            
            const diffX = mouseStartX - mouseCurrentX;
            const threshold = 50;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            isMouseDragging = false;
            this.startAutoSlide();
        });
    }
}

/**
 * Modal Functionality
 * Implements modal with open/close, click outside, and ESC key support
 */
class Modal {
    constructor(modalSelector) {
        this.modal = document.querySelector(modalSelector);
        if (!this.modal) return;
        
        this.overlay = this.modal.querySelector('#modalOverlay');
        this.closeBtn = this.modal.querySelector('#modalClose');
        this.openButtons = document.querySelectorAll('[id="hireMeBtn"]');
        
        this.init();
    }
    
    init() {
        // Open modal buttons
        this.openButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        });
        
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        // Click outside to close
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
        
        // Prevent modal content clicks from closing
        const modalContent = this.modal.querySelector('.modal__content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }
    
    open() {
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const firstFocusable = this.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
    
    close() {
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    isOpen() {
        return this.modal.getAttribute('aria-hidden') === 'false';
    }
}

/**
 * Form Handling
 * Prevents default submission and does not store data
 */
class FormHandler {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        if (!this.form) return;
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);
            
            // Validate required fields
            if (!this.validateForm(data)) {
                return;
            }
            
            // Do not store data (as per requirements)
            // Just show a success message or reset form
            this.showSuccessMessage();
            this.form.reset();
        });
    }
    
    validateForm(data) {
        // Check required fields
        const requiredFields = ['fullName', 'email'];
        const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
        
        if (missingFields.length > 0) {
            alert('Please fill in all required fields.');
            return false;
        }
        
        // Basic email validation (cross-browser compatible)
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Please enter a valid email address.');
            return false;
        }
        
        return true;
    }
    
    showSuccessMessage() {
        // Create a temporary success message (cross-browser compatible)
        var message = document.createElement('div');
        message.className = 'form-success';
        message.textContent = 'Thank you! Your message has been received.';
        
        // Cross-browser style application
        message.style.position = 'fixed';
        message.style.top = '20px';
        message.style.right = '20px';
        message.style.background = '#4CAF50';
        message.style.color = 'white';
        message.style.padding = '16px 24px';
        message.style.borderRadius = '8px';
        message.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        message.style.zIndex = '2000';
        message.style.fontFamily = "'Open Sans', sans-serif";
        message.style.fontSize = '14px';
        
        document.body.appendChild(message);
        
        // Remove after 3 seconds (cross-browser compatible)
        setTimeout(function() {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
}

/**
 * Initialize everything when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize carousel
    const carousel = new Carousel('.carousel-container');
    
    // Initialize modal
    const modal = new Modal('#hireModal');
    
    // Initialize form handler
    const formHandler = new FormHandler('#contactForm');
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#contact') {
                // Handle contact link specially if needed
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Update carousel on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (carousel) {
                carousel.updateCarousel();
            }
        }, 250);
    });
});

