document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initCanvasParticles();
    initTypingEffect();
    initScrollProgress();
    initScrollReveal();
    initActiveNavLinks();
    initMobileMenu();
    initContactForm();
});

/* ==========================================================================
   Custom Glow Cursor
   ========================================================================== */
function initCursor() {
    const cursorDot = document.createElement('div');
    const cursorGlow = document.createElement('div');
    
    cursorDot.className = 'custom-cursor-dot';
    cursorGlow.className = 'custom-cursor-glow';
    
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorGlow);
    
    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;
    
    // Hide custom cursor on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
        cursorDot.style.display = 'none';
        cursorGlow.style.display = 'none';
        return;
    }
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        
        // Show cursor if hidden
        cursorDot.style.opacity = '1';
        cursorGlow.style.opacity = '1';
    });
    
    // Lerp smoothing for cursor glow trail
    function animateGlow() {
        const dx = mouseX - glowX;
        const dy = mouseY - glowY;
        
        glowX += dx * 0.15;
        glowY += dy * 0.15;
        
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
        requestAnimationFrame(animateGlow);
    }
    
    animateGlow();
    
    // Add hover states on interactive links
    const interactiveElements = document.querySelectorAll('a, button, input[type="submit"], .menu-btn, .project-card, .skill-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.classList.add('cursor-hover');
            cursorGlow.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('cursor-hover');
            cursorGlow.classList.remove('cursor-hover');
        });
    });
    
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorGlow.style.opacity = '0';
    });
}

/* ==========================================================================
   Canvas Particles Background (Holographic Starfield)
   ========================================================================== */
function initCanvasParticles() {
    const canvas = document.createElement('canvas');
    canvas.className = 'canvas-particles-bg';
    document.body.prepend(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    let mouse = { x: null, y: null, radius: 150 };
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    });
    
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.baseSize = this.size;
            this.speedX = (Math.random() * 0.4 - 0.2);
            this.speedY = (Math.random() * 0.4 - 0.2);
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = Math.random() > 0.5 ? 'rgba(127, 90, 240, ' : 'rgba(0, 242, 254, ';
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Screen wrap
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
            
            // Mouse push interact
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < mouse.radius) {
                    let force = (mouse.radius - dist) / mouse.radius;
                    // Move slightly away from mouse
                    this.x -= dx / dist * force * 1.5;
                    this.y -= dy / dist * force * 1.5;
                    this.size = this.baseSize * (1 + force * 2);
                } else {
                    if (this.size > this.baseSize) {
                        this.size -= 0.1;
                    }
                }
            }
        }
        
        draw() {
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function initParticles() {
        particles = [];
        // Scale particle density with screen resolution
        const count = Math.min(100, Math.floor((width * height) / 15000));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw connection lines
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    let alpha = (100 - dist) / 100 * 0.15;
                    ctx.strokeStyle = `rgba(108, 99, 255, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    initParticles();
    animate();
}

/* ==========================================================================
   Typing Roles Animation
   ========================================================================== */
function initTypingEffect() {
    const typingSpan = document.querySelector('.hero-typing-roles');
    if (!typingSpan) return;
    
    const roles = JSON.parse(typingSpan.getAttribute('data-roles') || '["Developer"]');
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            charIndex--;
            typingSpeed = 50; // Deleting speed
        } else {
            charIndex++;
            typingSpeed = 120; // Typing speed
        }
        
        typingSpan.textContent = currentRole.substring(0, charIndex);
        
        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause after typing completes
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500; // Pause before typing new role
        }
        
        setTimeout(type, typingSpeed);
    }
    
    setTimeout(type, 1000);
}

/* ==========================================================================
   Scroll Progress Tracker
   ========================================================================== */
function initScrollProgress() {
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'scroll-progress-indicator';
    document.body.appendChild(progressIndicator);
    
    window.addEventListener('scroll', () => {
        const windowScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (windowScroll / totalHeight) * 100;
        progressIndicator.style.width = scrollPercent + '%';
    });
}

/* ==========================================================================
   Scroll Reveal Animations
   ========================================================================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    reveals.forEach(element => {
        revealObserver.observe(element);
    });
}

/* ==========================================================================
   Active Navigation Link on Scroll
   ========================================================================== */
function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('header .navigation a');
    
    function updateActiveLink() {
        let current = '';
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        
        // Handle bottom of page edge cases where contact section might be too short to reach viewport top
        if ((window.innerHeight + scrollPosition) >= document.documentElement.scrollHeight - 60) {
            current = sections[sections.length - 1].getAttribute('id');
        } else {
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                // Highlight when section top is scrolled past header padding (approx 150px)
                if (scrollPosition >= (sectionTop - 160)) {
                    current = section.getAttribute('id');
                }
            });
        }
        
        if (current) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
            });
        }
    }
    
    window.addEventListener('scroll', updateActiveLink);
    // Trigger once on load to highlight correct section
    updateActiveLink();
}

/* ==========================================================================
   Mobile menu toggles
   ========================================================================== */
function initMobileMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const navigation = document.querySelector('.navigation');
    const navLinks = document.querySelectorAll('.navigation a');
    
    if (!menuBtn || !navigation) return;
    
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navigation.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navigation.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

/* ==========================================================================
   Interactive Contact Form
   ========================================================================== */
function initContactForm() {
    const form = document.querySelector('.contact-form form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameVal = document.getElementById('form-name').value;
        const emailVal = document.getElementById('form-email').value;
        const messageVal = document.getElementById('form-message').value;
        
        const submitBtn = form.querySelector('.send-btn');
        const originalVal = submitBtn.value;
        submitBtn.disabled = true;
        submitBtn.value = 'Opening Mail...';
        
        // Construct pre-filled mailto URL
        const subject = encodeURIComponent(`Portfolio Message from ${nameVal}`);
        const body = encodeURIComponent(`Hello Deepti,\n\n${messageVal}\n\nBest regards,\n${nameVal}\nEmail: ${emailVal}`);
        const mailtoUrl = `mailto:d838801@gmail.com?subject=${subject}&body=${body}`;
        
        // Launch mail client
        window.location.href = mailtoUrl;
        
        // Show confirmation status on button
        setTimeout(() => {
            submitBtn.value = 'Mail Client Opened! ✔';
            submitBtn.style.background = '#00f2fe';
            submitBtn.style.color = '#07050f';
            submitBtn.style.borderColor = '#00f2fe';
            
            form.reset();
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.value = originalVal;
                submitBtn.style.background = '';
                submitBtn.style.color = '';
                submitBtn.style.borderColor = '';
            }, 3000);
        }, 1000);
    });
}
