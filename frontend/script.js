
(function initCustomAlertSystem() {
    const styles = `
        .custom-alert-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            direction: rtl;
            font-family: 'Cairo', sans-serif;
            padding: 1rem;
        }
        .custom-alert-overlay.show {
            opacity: 1;
            pointer-events: auto;
        }
        .custom-alert-card {
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 2rem;
            width: 100%;
            max-width: 420px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            transform: scale(0.92);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
        }
        .custom-alert-overlay.show .custom-alert-card {
            transform: scale(1);
        }
        .custom-alert-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(124, 111, 234, 0.1) 0%, transparent 60%);
            pointer-events: none;
            z-index: 0;
        }
        .custom-alert-icon {
            width: 56px;
            height: 56px;
            background: rgba(124, 111, 234, 0.15);
            border: 1px solid rgba(124, 111, 234, 0.25);
            color: #a78bfa;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin: 0 auto 1.5rem auto;
            position: relative;
            z-index: 1;
        }
        .custom-alert-icon.confirm-type {
            background: rgba(245, 158, 11, 0.15);
            border-color: rgba(245, 158, 11, 0.25);
            color: #fbbf24;
        }
        .custom-alert-content {
            font-size: 0.95rem;
            color: #cbd5e1;
            line-height: 1.7;
            margin-bottom: 2rem;
            font-weight: 700;
            position: relative;
            z-index: 1;
        }
        .custom-alert-buttons {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            position: relative;
            z-index: 1;
        }
        .custom-alert-btn {
            padding: 0.75rem 1.75rem;
            border-radius: 14px;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            outline: none;
            border: none;
        }
        .custom-alert-btn-primary {
            background: linear-gradient(135deg, #7c6fea, #a78bfa);
            color: #fff;
            box-shadow: 0 4px 12px rgba(124, 111, 234, 0.25);
        }
        .custom-alert-btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        .custom-alert-btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #94a3b8;
        }
        .custom-alert-btn-secondary:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = styles;
    document.head.appendChild(styleEl);

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.id = 'customAlertOverlay';
    overlay.innerHTML = `
        <div class="custom-alert-card" onclick="event.stopPropagation()">
            <div class="custom-alert-icon" id="customAlertIcon"><i class="fi fi-rr-bell flex items-center"></i></div>
            <div class="custom-alert-content" id="customAlertText">-</div>
            <div class="custom-alert-buttons" id="customAlertButtons">
                <button class="custom-alert-btn custom-alert-btn-primary" id="customAlertOkBtn">حسناً</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const alertText = document.getElementById('customAlertText');
    const alertIcon = document.getElementById('customAlertIcon');
    const alertButtons = document.getElementById('customAlertButtons');

    window.alert = function(message) {
        alertIcon.className = 'custom-alert-icon';
        alertIcon.innerHTML = '<i class="fi fi-rr-bell flex items-center"></i>';
        alertText.textContent = message;
        alertButtons.innerHTML = '';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'custom-alert-btn custom-alert-btn-primary px-8';
        closeBtn.textContent = 'حسناً';
        closeBtn.onclick = () => {
            overlay.classList.remove('show');
        };
        alertButtons.appendChild(closeBtn);
        overlay.classList.add('show');
        
        if (window.AudioSFX) window.AudioSFX.playClick();
    };

    window.customConfirm = function(message) {
        return new Promise((resolve) => {
            alertIcon.className = 'custom-alert-icon confirm-type';
            alertIcon.innerHTML = '<i class="fi fi-rr-interrogation flex items-center"></i>';
            alertText.textContent = message;
            alertButtons.innerHTML = '';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'custom-alert-btn custom-alert-btn-secondary';
            cancelBtn.textContent = 'إلغاء';
            cancelBtn.onclick = () => {
                overlay.classList.remove('show');
                resolve(false);
            };

            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'custom-alert-btn custom-alert-btn-primary';
            confirmBtn.textContent = 'تأكيد';
            confirmBtn.onclick = () => {
                overlay.classList.remove('show');
                resolve(true);
            };

            alertButtons.appendChild(confirmBtn);
            alertButtons.appendChild(cancelBtn);
            overlay.classList.add('show');
            
            if (window.AudioSFX) window.AudioSFX.playClick();
        });
    };
})();




const SecureStorage = {
    KEY: "RoSellersSecureSalt123!",
    encrypt(text) {
        return btoa(text.split('').map((char, index) => 
            String.fromCharCode(char.charCodeAt(0) ^ this.KEY.charCodeAt(index % this.KEY.length))
        ).join(''));
    },
    decrypt(encoded) {
        try {
            const decoded = atob(encoded);
            return decoded.split('').map((char, index) => 
                String.fromCharCode(char.charCodeAt(0) ^ this.KEY.charCodeAt(index % this.KEY.length))
            ).join('');
        } catch (e) {
            return null;
        }
    },
    getItem(key) {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const decrypted = this.decrypt(raw);
        return decrypted ? JSON.parse(decrypted) : null;
    },
    setItem(key, value) {
        const encrypted = this.encrypt(JSON.stringify(value));
        localStorage.setItem(key, encrypted);
    },
    removeItem(key) {
        localStorage.removeItem(key);
    }
};






const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.remove('active'));
    });
}


const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
    if (progressBar) {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = Math.min(scrolled, 100) + '%';
    }
    
    const nav = document.getElementById('mainNav');
    if (nav) {
        if (window.scrollY > 60) {
            nav.style.background = 'rgba(3,5,9,0.95)';
            nav.style.boxShadow = '0 1px 24px rgba(0,0,0,0.4)';
        } else {
            nav.style.background = 'rgba(3,5,9,0.75)';
            nav.style.boxShadow = 'none';
        }
    }
}, { passive: true });


const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('section, .reveal, .reveal-left, .reveal-right, .stagger').forEach(el => {
    revealObserver.observe(el);
});


function initTilt() {
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotX = ((y - cy) / cy) * -6;
            const rotY = ((x - cx) / cx) * 6;
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}
initTilt();


document.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.glass-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });
});


document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
        btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
    });
});





function animateCounter(element, target, duration = 2200) {
    if (!element) return;
    let start = 0;
    const increment = target / (duration / 16);
    const suffix = target < 10 ? '+' : '+';
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + suffix;
        }
    }, 16);
}


const counterEls = ['counter1','counter2','counter3','counter4'];
const counterTargets = [50, 200, 150, 3];
const statsEl = document.querySelector('.stagger');
if (statsEl) {
    const counterObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            counterEls.forEach((id, i) => animateCounter(document.getElementById(id), counterTargets[i]));
            counterObserver.disconnect();
        }
    }, { threshold: 0.3 });
    counterObserver.observe(statsEl);
} else {
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            counterEls.forEach((id, i) => animateCounter(document.getElementById(id), counterTargets[i]));
        }, 800);
    });
}


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});


const productCards = document.querySelectorAll('#products .group');
productCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});


const gifFeatures = document.querySelectorAll('.gif-feature');
gifFeatures.forEach(gif => {
    gif.addEventListener('mouseenter', () => {
        gif.style.transform = 'scale(1.15) rotate(8deg)';
    });
    gif.addEventListener('mouseleave', () => {
        gif.style.transform = 'scale(1) rotate(0deg)';
    });
});

const gifPricing = document.querySelectorAll('.gif-pricing');
gifPricing.forEach(gif => {
    gif.addEventListener('mouseenter', () => {
        gif.style.transform = 'scale(1.2) rotate(-8deg)';
    });
    gif.addEventListener('mouseleave', () => {
        gif.style.transform = 'scale(1) rotate(0deg)';
    });
});


const heroGifs = document.querySelectorAll('.gif-hero');
heroGifs.forEach((gif, index) => {
    gif.addEventListener('mouseenter', () => {
        gif.style.animationPlayState = 'paused';
        gif.style.transform = 'scale(1.1)';
    });
    gif.addEventListener('mouseleave', () => {
        gif.style.animationPlayState = 'running';
        gif.style.transform = 'scale(1)';
    });
});


function toggleFaq(btn) {
    const content = btn.nextElementSibling;
    const icon = btn.querySelector('.faq-icon');
    const isOpen = content.classList.contains('open');
    
    
    document.querySelectorAll('.faq-content.open').forEach(c => {
        c.classList.remove('open');
        const prevIcon = c.previousElementSibling.querySelector('.faq-icon');
        if (prevIcon) prevIcon.style.transform = 'rotate(0deg)';
    });
    
    
    if (!isOpen) {
        content.classList.add('open');
        if (icon) icon.style.transform = 'rotate(180deg)';
    }
}


document.querySelectorAll('.faq-toggle').forEach(btn => {
    const oldContent = btn.nextElementSibling;
    if (oldContent && oldContent.classList.contains('hidden') && !oldContent.classList.contains('faq-content')) {
        
        oldContent.classList.remove('hidden');
        oldContent.classList.add('faq-content');
    }
});


const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('✅ تم إرسال رسالتك! سنرد عليك قريباً.', 'success');
        contactForm.reset();
    });
}


function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.borderColor = type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.12)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}


const canvas = document.getElementById('particles');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 55;

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.8 + 0.3,
            dx: (Math.random() - 0.5) * 0.35,
            dy: (Math.random() - 0.5) * 0.35,
            opacity: Math.random() * 0.5 + 0.1,
        });
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(124, 111, 234, ${p.opacity})`;
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            if (p.x < -5) p.x = canvas.width + 5;
            if (p.x > canvas.width + 5) p.x = -5;
            if (p.y < -5) p.y = canvas.height + 5;
            if (p.y > canvas.height + 5) p.y = -5;
        });

        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 110) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(124, 111, 234, ${0.12 * (1 - dist / 110)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(drawParticles);
    }
    drawParticles();
}


const yearSpan = document.querySelector('footer p');
if (yearSpan) {
    const currentYear = new Date().getFullYear();
    yearSpan.textContent = `© ${currentYear} RoSellers. جميع الحقوق محفوظة.`;
}


const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
    button.addEventListener('click', function() {
        if (this.type === 'submit') return;
        if (this.textContent.includes('شراء') || this.textContent.includes('اشترك')) {
            const originalText = this.textContent;
            this.textContent = 'جاري المعالجة...';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
            }, 2000);
        }
    });
});


window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('#home');
    if (hero) {
        hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
    }
});


document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        mobileMenu.classList.remove('active');
    }
});


if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}




async function loadConfig() {
    try {
        
        const testimonialsResponse = await fetch('/api/testimonials');
        if (testimonialsResponse.ok) {
            const testimonialsData = await testimonialsResponse.json();
            updateTestimonials(testimonialsData.testimonials);
        } else {
            throw new Error('Failed to load testimonials');
        }
        
        
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            updateProducts(productsData.products);
        } else {
            throw new Error('Failed to load products');
        }
        
        
        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            updateSettings(settingsData);
        } else {
            throw new Error('Failed to load settings');
        }
        
    } catch (error) {
        console.error('Error loading config:', error);
        console.log('Using default data...');
        
        loadDefaultData();
    }
}


function loadDefaultData() {
    const defaultTestimonials = [
        {
            id: 1,
            name: "أحمد",
            role: "مطور روبلوكس",
            rating: 5,
            comment: "أفضل أنظمة روبلوكس استخدمتها! الدعم الفني ممتاز والمنتجات عالية الجودة. أنصح الجميع بتجربتهم.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
            gradient: "from-primary to-secondary"
        },
        {
            id: 2,
            name: "علي",
            role: "صاحبة متجر روبلوكس",
            rating: 5,
            comment: "النظام المتجر الإلكتروني غطى كل احتياجاتي. سهل التثبيت والاستخدام، والواجهة رائعة!",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
            gradient: "from-secondary to-pink-500"
        },
        {
            id: 3,
            name: "خالد حسن",
            role: "مطور ألعاب",
            rating: 5,
            comment: "نظام الدردشة رائع! سهل التخصيص ويعمل بشكل ممتاز. فريق RoSellers محترف جداً.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Khaled",
            gradient: "from-pink-500 to-red-500"
        }
    ];
    
    const defaultProducts = [
        {
            id: 1,
            name: "ببلبل العربب",
            price: 123,
            gamePassId: 1232131231231,
            description: "سيشيشسيشسشي",
            video: "https://www.youtube.com/watch?v=aIagkwAZyB0"
        }
    ];
    
    const defaultSettings = {
        site: {
            name: "RoSellers",
            description: "منصة بيع أنظمة روبلوكس المتبرمجة والمصممة",
            url: "https://rosellers.com"
        },
        contact: {
            email: "support@rosellers.com",
            discord: "discord.gg/rosellers",
            twitter: "@rosellers",
            youtube: "RoSellers"
        },
        social: {
            discord: "https://discord.gg/rosellers",
            twitter: "https://twitter.com/rosellers",
            youtube: "https://youtube.com/@rosellers",
            instagram: "https://instagram.com/rosellers"
        },
        features: {
            particles: true,
            glassmorphism: true,
            gradientText: true,
            scrollProgress: true,
            darkMode: true
        },
        colors: {
            primary: "#6366f1",
            secondary: "#8b5cf6",
            dark: "#0f172a",
            darker: "#020617"
        }
    };
    
    updateTestimonials(defaultTestimonials);
    updateProducts(defaultProducts);
    updateSettings(defaultSettings);
}


function updateTestimonials(testimonials) {
    const testimonialsContainer = document.getElementById('testimonials-container');
    if (!testimonialsContainer) return;
    
    
    const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
    const selectedTestimonials = shuffled.slice(0, 3);
    
    testimonialsContainer.innerHTML = selectedTestimonials.map(testimonial => `
        <div class="glass-card rounded-2xl p-8 card-lift">
            <div class="flex items-center gap-1 mb-4">
                ${Array(testimonial.rating).fill('<svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>').join('')}
            </div>
            <p class="text-gray-300 mb-6">"${testimonial.comment}"</p>
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center">
                    <span class="text-xl font-bold">${testimonial.name.charAt(0)}</span>
                </div>
                <div>
                    <h4 class="font-bold">${testimonial.name}</h4>
                    <p class="text-gray-400 text-sm">${testimonial.role}</p>
                </div>
            </div>
        </div>
    `).join('');
}




function updateSettings(settings) {
    
    const siteNameElements = document.querySelectorAll('.site-name');
    siteNameElements.forEach(el => {
        el.textContent = settings.site.name;
    });
    
    
    const contactEmail = document.querySelector('.contact-email');
    if (contactEmail) {
        contactEmail.textContent = settings.contact.email;
    }
}


const AudioSFX = {
    ctx: null,
    
    init() {
        if (this.ctx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            this.ctx = new AudioContextClass();
        }
    },
    
    playHover() {
        this.init();
        if (!this.ctx || this.ctx.state === 'suspended') return;
        
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.04);
        
        gain.gain.setValueAtTime(0.012, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    },
    
    playClick() {
        this.init();
        if (!this.ctx) return;
        
        
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.06);
        
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
    }
};


window.addEventListener('click', () => AudioSFX.init(), { once: true });
window.addEventListener('touchstart', () => AudioSFX.init(), { once: true });


const appleCursor = document.getElementById('appleCursor');
if (appleCursor) {
    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let activeGlassCard = null;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        
        if (activeGlassCard) {
            const rect = activeGlassCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            activeGlassCard.style.setProperty('--mouse-x', `${x}px`);
            activeGlassCard.style.setProperty('--mouse-y', `${y}px`);
        }
    });

    
    function tick() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        
        cursorX += dx * 0.25;
        cursorY += dy * 0.25;
        
        appleCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        requestAnimationFrame(tick);
    }
    tick();

    
    const interactiveSelectors = 'a, button, input, textarea, select, [role="button"], .faq-toggle, .glass-card, .liquid-glass, #userNavbarProfile';
    
    function addCursorHoverListeners() {
        document.querySelectorAll(interactiveSelectors).forEach(el => {
            if (el.dataset.hasCursorListeners) return;
            el.dataset.hasCursorListeners = 'true';
            
            
            el.addEventListener('mouseenter', () => {
                appleCursor.classList.add('hovering');
                if (el.classList.contains('glass-card') || el.classList.contains('liquid-glass')) {
                    activeGlassCard = el;
                }
                
                if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.classList.contains('faq-toggle') || el.getAttribute('role') === 'button') {
                    AudioSFX.playHover();
                }
            });
            
            
            el.addEventListener('mouseleave', () => {
                appleCursor.classList.remove('hovering');
                if (activeGlassCard === el) {
                    activeGlassCard = null;
                }
            });

            
            el.addEventListener('click', () => {
                if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.classList.contains('faq-toggle') || el.getAttribute('role') === 'button' || el.type === 'submit') {
                    AudioSFX.playClick();
                }
            });
        });
    }

    addCursorHoverListeners();
    
    
    const observer = new MutationObserver(() => {
        addCursorHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    
    window.addEventListener('mousedown', () => {
        appleCursor.classList.add('clicking');
    });
    window.addEventListener('mouseup', () => {
        appleCursor.classList.remove('clicking');
    });
}


function updateProducts(products) {
    window.loadedProductsCache = products;
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    
    const currentUserObj = SecureStorage.getItem('currentUser');
    const purchasedIds = currentUserObj ? (currentUserObj.purchasedProducts || []) : [];
    
    productsContainer.innerHTML = products.map(product => {
        const isPurchased = purchasedIds.includes(product.id);
        
        return `
        <div class="glass-card rounded-2xl overflow-hidden transition-all group">
            <div class="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                <div class="w-20 h-20 bg-primary/30 rounded-2xl flex items-center justify-center">
                    <svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">${product.name}</h3>
                <p class="text-gray-400 mb-4">${product.description}</p>
                <div class="flex items-center justify-between mb-4">
                    <span class="text-2xl font-bold text-primary">${product.price} R$</span>
                    <span class="text-sm text-gray-400">GamePass ID: ${product.gamePassId}</span>
                </div>
                ${product.video ? `
                    <a href="${product.video}" target="_blank" class="block w-full py-2 bg-secondary/20 hover:bg-secondary/30 rounded-lg text-center text-secondary transition-colors mb-4 font-bold">
                        مشاهدة فيديو الشرح
                    </a>
                ` : ''}
                
                ${isPurchased ? `
                    <div class="space-y-2 mt-4">
                        <span class="block text-center text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 py-1.5 rounded-lg">ممتلك بنجاح ✅</span>
                        <a href="product-details.html?productId=${product.id}" class="block w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 rounded-xl text-center text-white font-bold transition-all shadow-lg shadow-green-500/20 btn-click-effect">
                            تفاصيل الفاتورة والتركيب 📄
                        </a>
                    </div>
                ` : `
                    <button onclick="simulatePurchase(${product.id})" class="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold hover:opacity-90 transition-colors btn-click-effect mt-4">شراء الآن</button>
                `}
            </div>
        </div>
        `;
    }).join('');
}





let currentPendingProduct = null;
let checkoutTimerInterval = null;
let verificationInterval = null;


window.openAuthModal = function(tab = 'signup') {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('modal-active');
        toggleAuthTab(tab);
    }
};


window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('modal-active');
    }
};


window.toggleAuthTab = function(tab) {
    const btnSignup = document.getElementById('tabBtnSignup');
    const btnLogin = document.getElementById('tabBtnLogin');
    const formSignup = document.getElementById('signupForm');
    const formLogin = document.getElementById('loginFormClient');
    
    if (tab === 'signup') {
        btnSignup.className = "px-6 py-2 font-bold text-lg text-white border-b-2 border-primary transition-all";
        btnLogin.className = "px-6 py-2 font-bold text-lg text-gray-400 hover:text-white transition-all";
        formSignup.classList.remove('hidden');
        formLogin.classList.add('hidden');
    } else {
        btnLogin.className = "px-6 py-2 font-bold text-lg text-white border-b-2 border-primary transition-all";
        btnSignup.className = "px-6 py-2 font-bold text-lg text-gray-400 hover:text-white transition-all";
        formSignup.classList.add('hidden');
        formLogin.classList.remove('hidden');
    }
};


setTimeout(() => {
    const authPasswordInput = document.getElementById('authPassword');
    if (authPasswordInput) {
        authPasswordInput.addEventListener('input', function() {
            const password = this.value;
            let score = 0;
            
            if (password.length >= 8) score++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
            if (/\d/.test(password)) score++;
            if (/[^A-Za-z0-9]/.test(password)) score++;
            
            const bar = document.getElementById('passwordStrengthBar');
            const text = document.getElementById('passwordStrengthText');
            
            if (!bar || !text) return;
            
            if (password.length === 0) {
                bar.className = "h-full w-0 transition-all duration-300 bg-red-500";
                text.textContent = "ضعيفة";
                text.className = "font-bold text-red-500";
            } else if (score <= 1) {
                bar.className = "h-full w-1/4 transition-all duration-300 bg-red-500";
                text.textContent = "ضعيفة ❌";
                text.className = "font-bold text-red-500";
            } else if (score <= 3) {
                bar.className = "h-full w-2/3 transition-all duration-300 bg-yellow-500";
                text.textContent = "متوسطة ⚠️";
                text.className = "font-bold text-yellow-500";
            } else {
                bar.className = "h-full w-full transition-all duration-300 bg-green-500";
                text.textContent = "قوية جداً! 🔥";
                text.className = "font-bold text-green-500";
            }
        });
    }
}, 500);


const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const robloxUser = document.getElementById('authRobloxUser').value.trim();
        const realName = document.getElementById('authRealName').value.trim();
        const email = document.getElementById('authEmail').value.trim().toLowerCase();
        const password = document.getElementById('authPassword').value;
        
        if (!robloxUser || !realName || !email || !password) {
            alert('يرجى ملء جميع الحقول المطلوبة بشكل صحيح.');
            return;
        }
        
        if (password.length < 8) {
            alert('كلمة المرور يجب أن تكون 8 رموز أو أكثر.');
            return;
        }
        
        
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'جاري التحقق وإنشاء الحساب...';
        submitBtn.disabled = true;
        
        try {
            
            const checkRes = await fetch(`/api/roblox/user-check?username=${encodeURIComponent(robloxUser)}`);
            if (!checkRes.ok) throw new Error('Roblox API Error');
            const checkData = await checkRes.json();
            
            if (!checkData.data || checkData.data.length === 0) {
                alert('اسم حساب روبلوكس هذا غير موجود باللعبة! يرجى إدخال حساب حقيقي وصحيح.');
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                return;
            }
            
            const robloxId = checkData.data[0].id || null;
            const robloxAvatar = checkData.data[0].avatarUrl || null;
            
            
            const response = await fetch('/api/users/register-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ robloxUser, robloxId, realName, email, password, robloxAvatar })
            });
            
            const resData = await response.json();
            
            if (!response.ok) {
                alert(resData.message || 'فشل إرسال رمز التحقق.');
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                return;
            }
            
            
            window.pendingRegData = { robloxUser, robloxId, realName, email, password, robloxAvatar };
            
            
            signupForm.classList.add('hidden');
            const otpForm = document.getElementById('otpForm');
            if (otpForm) otpForm.classList.remove('hidden');
            
            
            const tabBtnSignup = document.getElementById('tabBtnSignup');
            const tabBtnLogin = document.getElementById('tabBtnLogin');
            if (tabBtnSignup) tabBtnSignup.style.display = 'none';
            if (tabBtnLogin) tabBtnLogin.style.display = 'none';
            
            alert('تم إرسال رمز التحقق المكون من 4 أرقام لبريدك الإلكتروني! 📨');
            
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        } catch (error) {
            console.error('Signup error:', error);
            alert('حدث خطأ أثناء التحقق وإنشاء الحساب. يرجى المحاولة مجدداً.');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}


window.cancelOtpVerification = function() {
    const signupForm = document.getElementById('signupForm');
    const otpForm = document.getElementById('otpForm');
    const tabBtnSignup = document.getElementById('tabBtnSignup');
    const tabBtnLogin = document.getElementById('tabBtnLogin');
    
    if (signupForm && otpForm) {
        otpForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        if (tabBtnSignup) tabBtnSignup.style.display = 'block';
        if (tabBtnLogin) tabBtnLogin.style.display = 'block';
    }
};


const otpForm = document.getElementById('otpForm');
if (otpForm) {
    otpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const otpInput = document.getElementById('otpInput').value.trim();
        if (otpInput.length !== 4) {
            alert('يرجى إدخال رمز التحقق المكون من 4 أرقام.');
            return;
        }
        
        const submitBtn = otpForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'جاري تأكيد الرمز...';
        submitBtn.disabled = true;
        
        try {
            const tempReg = window.pendingRegData;
            if (!tempReg) {
                alert('حدث خطأ في جلسة التسجيل، يرجى المحاولة مجدداً.');
                location.reload();
                return;
            }
            
            const response = await fetch('/api/users/register-verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: tempReg.email,
                    code: otpInput,
                    robloxUser: tempReg.robloxUser,
                    robloxId: tempReg.robloxId,
                    realName: tempReg.realName,
                    password: tempReg.password,
                    robloxAvatar: tempReg.robloxAvatar
                })
            });
            
            const resData = await response.json();
            
            if (!response.ok) {
                alert(resData.message || 'رمز التحقق غير صحيح ❌');
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                return;
            }
            
            
            SecureStorage.setItem('currentUser', resData.user);
            
            alert('تم التحقق وتفعيل الحساب بنجاح! مرحباً بك 🎉');
            closeAuthModal();
            updateNavProfile();
            
            
            otpForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            const tabBtnSignup = document.getElementById('tabBtnSignup');
            const tabBtnLogin = document.getElementById('tabBtnLogin');
            if (tabBtnSignup) tabBtnSignup.style.display = 'block';
            if (tabBtnLogin) tabBtnLogin.style.display = 'block';
            
            
            if (currentPendingProduct) {
                openCheckoutModal(currentPendingProduct);
                currentPendingProduct = null;
            } else {
                location.reload();
            }
        } catch (err) {
            console.error('OTP verify error:', err);
            alert('حدث خطأ في السيرفر أثناء التحقق.');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}


const loginFormClient = document.getElementById('loginFormClient');
if (loginFormClient) {
    loginFormClient.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const resData = await response.json();
            
            if (!response.ok) {
                alert(resData.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
                return;
            }
            
            SecureStorage.setItem('currentUser', resData.user);
            alert('تم تسجيل الدخول بنجاح!');
            closeAuthModal();
            updateNavProfile();
            
            if (currentPendingProduct) {
                openCheckoutModal(currentPendingProduct);
                currentPendingProduct = null;
            } else {
                location.reload();
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('حدث خطأ في الاتصال بالخادم.');
        }
    });
}


function updateNavProfile() {
    const user = SecureStorage.getItem('currentUser');
    const loginBtn = document.getElementById('loginNavBtn');
    const userNameNav = document.getElementById('userNameNav');
    const userNavbarProfile = document.getElementById('userNavbarProfile');
    const userNavAvatar = document.getElementById('userNavAvatar');
    const logoutNavBtn = document.getElementById('logoutNavBtn');
    
    const mobileLoginBtn = document.getElementById('mobileLoginNavBtn');
    const mobileUserNameNav = document.getElementById('mobileUserNameNav');
    const mobileUserNavbarProfile = document.getElementById('mobileUserNavbarProfile');
    const mobileUserNavAvatar = document.getElementById('mobileUserNavAvatar');
    const mobileLogoutNavBtn = document.getElementById('mobileLogoutNavBtn');
    
    if (user) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userNavbarProfile) {
            userNavbarProfile.classList.remove('hidden');
            userNavbarProfile.classList.add('flex');
        }
        if (userNameNav) {
            userNameNav.textContent = user.robloxUser;
        }
        if (userNavAvatar) {
            let avatarSrc = user.robloxAvatar;
            
            
            if (avatarSrc && avatarSrc.includes('tr.rbxcdn.com')) {
                const proxyId = user.robloxId || '';
                avatarSrc = `/api/roblox/avatar-proxy?userId=${proxyId}&t=${Date.now()}`;
            } else if (!avatarSrc && user.robloxId) {
                avatarSrc = `/api/roblox/avatar-proxy?userId=${user.robloxId}`;
            } else if (!avatarSrc) {
                avatarSrc = `https://api.dicebear.com/7.x/initials/svg?seed=${user.robloxUser}`;
            }
            
            userNavAvatar.src = avatarSrc;
            userNavAvatar.style.display = 'block';
            userNavAvatar.style.width = '28px';
            userNavAvatar.style.height = '28px';
            userNavAvatar.style.borderRadius = '50%';
            userNavAvatar.style.objectFit = 'cover';
        }
        if (logoutNavBtn) logoutNavBtn.classList.remove('hidden');
        
        
        if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden');
        if (mobileUserNavbarProfile) {
            mobileUserNavbarProfile.classList.remove('hidden');
            mobileUserNavbarProfile.classList.add('flex');
        }
        if (mobileUserNameNav) {
            mobileUserNameNav.textContent = user.robloxUser;
        }
        if (mobileUserNavAvatar) {
            let avatarSrc = user.robloxAvatar;
            if (avatarSrc && avatarSrc.includes('tr.rbxcdn.com')) {
                const proxyId = user.robloxId || '';
                avatarSrc = `/api/roblox/avatar-proxy?userId=${proxyId}&t=${Date.now()}`;
            } else if (!avatarSrc && user.robloxId) {
                avatarSrc = `/api/roblox/avatar-proxy?userId=${user.robloxId}`;
            } else if (!avatarSrc) {
                avatarSrc = `https://api.dicebear.com/7.x/initials/svg?seed=${user.robloxUser}`;
            }
            mobileUserNavAvatar.src = avatarSrc;
        }
        if (mobileLogoutNavBtn) mobileLogoutNavBtn.classList.remove('hidden');
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (userNavbarProfile) {
            userNavbarProfile.classList.remove('flex');
            userNavbarProfile.classList.add('hidden');
        }
        if (logoutNavBtn) logoutNavBtn.classList.add('hidden');
        
        
        if (mobileLoginBtn) mobileLoginBtn.classList.remove('hidden');
        if (mobileUserNavbarProfile) {
            mobileUserNavbarProfile.classList.remove('flex');
            mobileUserNavbarProfile.classList.add('hidden');
        }
        if (mobileLogoutNavBtn) mobileLogoutNavBtn.classList.add('hidden');
    }
}


window.logoutUser = async function() {
    if (await customConfirm('هل ترغب في تسجيل الخروج؟')) {
        SecureStorage.removeItem('currentUser');
        updateNavProfile();
        location.reload();
    }
};


window.simulatePurchase = function(productId) {
    let matchedProduct = null;
    if (window.loadedProductsCache) {
        matchedProduct = window.loadedProductsCache.find(p => p.id === productId);
    }
    
    if (!matchedProduct) {
        matchedProduct = {
            id: productId,
            name: "منتج روبلوكس",
            price: 123,
            gamePassId: 1234567,
            downloadUrl: "#"
        };
    }
    
    const user = SecureStorage.getItem('currentUser');
    if (!user) {
        currentPendingProduct = matchedProduct;
        alert('يرجى إنشاء حساب أو تسجيل الدخول أولاً لإتمام الشراء الآمن.');
        openAuthModal('signup');
        return;
    }
    
    openCheckoutModal(matchedProduct);
};


window.openCheckoutModal = function(product) {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    
    
    clearInterval(checkoutTimerInterval);
    clearInterval(verificationInterval);
    
    
    window.activeAppliedPromoCode = null;
    const promoInput = document.getElementById('checkoutPromoInput');
    if (promoInput) promoInput.value = '';
    const promoMsg = document.getElementById('promoStatusMsg');
    if (promoMsg) {
        promoMsg.classList.add('hidden');
        promoMsg.textContent = '';
    }
    
    const user = SecureStorage.getItem('currentUser');
    
    document.getElementById('checkoutProductName').textContent = product.name;
    document.getElementById('checkoutProductPrice').textContent = `${product.price} R$`;
    document.getElementById('checkoutRobloxName').textContent = user.robloxUser;
    
    const gpBtn = document.getElementById('checkoutGamePassBtn');
    if (gpBtn) {
        gpBtn.href = `https://www.roblox.com/game-pass/${product.gamePassId}`;
    }
    
    
    modal.classList.add('modal-active');
    
    
    let timeLeft = 600;
    const timerText = document.getElementById('checkoutTimer');
    
    checkoutTimerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(checkoutTimerInterval);
            clearInterval(verificationInterval);
            timerText.textContent = "00:00";
            document.getElementById('checkoutStatusText').textContent = "انتهت مهلة الدفع! يرجى المحاولة مجدداً.";
            alert('انتهت مهلة الـ 10 دقائق المحددة للدفع.');
            closeCheckoutModal();
        } else {
            const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const seconds = (timeLeft % 60).toString().padStart(2, '0');
            timerText.textContent = `${minutes}:${seconds}`;
        }
    }, 1000);
    
    
    let checkCount = 0;
    const statusText = document.getElementById('checkoutStatusText');
    
    verificationInterval = setInterval(async () => {
        checkCount++;
        statusText.textContent = `جاري فحص امتلاك الجيم باس في حساب (${user.robloxUser}). المحاولة ${checkCount}...`;
        
        try {
            const checkRes = await fetch(`/api/roblox/check-ownership?username=${encodeURIComponent(user.robloxUser)}&gamePassId=${product.gamePassId}`);
            
            if (!checkRes.ok) {
                
                statusText.textContent = `فشل الفحص في المحاولة ${checkCount}. سنحاول مجدداً... (تأكد من شراء الجيم باس)`;
                return;
            }
            
            const checkData = await checkRes.json();
            
            if (checkData.owned === true) {
                clearInterval(checkoutTimerInterval);
                clearInterval(verificationInterval);
                
                
                try {
                    const response = await fetch('/api/users/sync-purchases', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: user.email, productId: product.id })
                    });
                    
                    if (response.ok) {
                        const resData = await response.json();
                        
                        SecureStorage.setItem('currentUser', resData.user);
                    }
                    
                    
                    if (window.activeAppliedPromoCode) {
                        await fetch('/api/promocodes/use', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code: window.activeAppliedPromoCode })
                        });
                        window.activeAppliedPromoCode = null;
                    }
                } catch (err) {
                    console.error('Error syncing purchase to server db:', err);
                }
                
                
                AudioSFX.playClick();
                statusText.textContent = "تم التحقق من الدفع وامتلاك الجيم باس بنجاح! 🎉";
                alert(`تم التحقق! حساب روبلوكس (${user.robloxUser}) يمتلك الجيم باس الآن. جاري تحويلك لصفحة الفاتورة والتركيب...`);
                closeCheckoutModal();
                window.location.href = `product-details.html?productId=${product.id}`;
            }
        } catch (err) {
            console.error('Error checking GamePass ownership:', err);
            statusText.textContent = `خطأ في الاتصال بالخادم. المحاولة التالية قريباً...`;
        }
    }, 4000);
};


window.closeCheckoutModal = function() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('modal-active');
    }
    clearInterval(checkoutTimerInterval);
    clearInterval(verificationInterval);
};


function debounce(func, delay = 500) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}


document.addEventListener('DOMContentLoaded', async () => {
    
    updateNavProfile();
    
    
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    
    const localUser = SecureStorage.getItem('currentUser');
    if (localUser && localUser.email) {
        try {
            const res = await fetch(`/api/users/sync-session?email=${encodeURIComponent(localUser.email)}`);
            if (res.ok) {
                const data = await res.json();
                
                SecureStorage.setItem('currentUser', data.user);
                
                updateNavProfile();
            }
        } catch (err) {
            console.error('Error syncing user session:', err);
        }
    }
    
    
    await loadConfig();
    
    
    const robloxInput = document.getElementById('authRobloxUser');
    if (robloxInput) {
        const previewContainer = document.getElementById('robloxProfilePreview');
        const avatarImg = document.getElementById('robloxAvatarImg');
        const dispName = document.getElementById('robloxDispName');
        const userText = document.getElementById('robloxUserText');
        const errorText = document.getElementById('robloxErrorText');

        const lookupUsername = debounce(async (username) => {
            if (!username || username.trim().length === 0) {
                previewContainer.classList.add('hidden');
                errorText.classList.add('hidden');
                return;
            }
            
            try {
                
                const searchRes = await fetch(`/api/roblox/user-check?username=${encodeURIComponent(username)}`);
                if (!searchRes.ok) throw new Error('API Error');
                
                const searchData = await searchRes.json();
                if (!searchData.data || searchData.data.length === 0) {
                    previewContainer.classList.add('hidden');
                    errorText.classList.remove('hidden');
                    return;
                }
                
                const robloxUser = searchData.data[0];
                const userId = robloxUser.id;
                
                
                const avatarUrl = robloxUser.avatarUrl;
                
                
                dispName.textContent = robloxUser.displayName || robloxUser.name;
                userText.textContent = `@${robloxUser.name}`;
                avatarImg.src = avatarUrl;
                
                errorText.classList.add('hidden');
                previewContainer.classList.remove('hidden');
                
            } catch (err) {
                console.error('Roblox lookup error:', err);
                previewContainer.classList.add('hidden');
                errorText.textContent = "عذراً، فشل الاتصال بخدمة التحقق من الحساب! ⚠️";
                errorText.classList.remove('hidden');
            }
        }, 500);

        robloxInput.addEventListener('input', (e) => {
            lookupUsername(e.target.value);
        });
    }
});


window.applyPromoCode = async function() {
    const codeInput = document.getElementById('checkoutPromoInput');
    const statusMsg = document.getElementById('promoStatusMsg');
    if (!codeInput || !statusMsg) return;
    
    const code = codeInput.value.trim();
    if (!code) {
        statusMsg.textContent = "الرجاء إدخال كود الخصم أولاً! ⚠️";
        statusMsg.className = "text-xs font-semibold mb-4 text-yellow-500 block";
        statusMsg.classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch(`/api/promocodes/validate?code=${encodeURIComponent(code)}`);
        const data = await response.json();
        
        if (response.ok) {
            window.activeAppliedPromoCode = code;
            statusMsg.textContent = `تم تطبيق الخصم بنجاح! خصم بقيمة ${data.discountPercent}% 🎉`;
            statusMsg.className = "text-xs font-semibold mb-4 text-green-400 block";
            statusMsg.classList.remove('hidden');
            
            
            const priceEl = document.getElementById('checkoutProductPrice');
            const originalPriceText = priceEl.textContent;
            const originalPrice = parseFloat(originalPriceText);
            if (!isNaN(originalPrice)) {
                const discountedPrice = Math.round(originalPrice * (1 - data.discountPercent / 100));
                priceEl.textContent = `${discountedPrice} R$ (بعد الخصم)`;
            }
        } else {
            statusMsg.textContent = data.message || "كود الخصم غير صحيح ❌";
            statusMsg.className = "text-xs font-semibold mb-4 text-red-400 block";
            statusMsg.classList.remove('hidden');
        }
    } catch (err) {
        console.error('Error applying promocode:', err);
        statusMsg.textContent = "حدث خطأ أثناء فحص الكود ❌";
        statusMsg.className = "text-xs font-semibold mb-4 text-red-400 block";
        statusMsg.classList.remove('hidden');
    }
};


console.log('%c🎮 Welcome to RoSellers!', 'color: #6366f1; font-size: 20px; font-weight: bold;');
console.log('%cPremium Roblox Systems & Products', 'color: #8b5cf6; font-size: 14px;');


window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none';
            setTimeout(() => {
                preloader.remove();
            }, 700);
        }, 350);
    }
});


function initConnectionMonitor() {
    const badge = document.getElementById('serverStatusBadge');
    const dot = document.getElementById('serverStatusDot');
    const text = document.getElementById('serverStatusText');
    
    const dbBadge = document.getElementById('dbStatusBadge');
    const dbDot = document.getElementById('dbStatusDot');
    const dbText = document.getElementById('dbStatusText');
    
    if (!badge || !dot || !text) return;
    
    async function checkHealth() {
        try {
            const res = await fetch('/api/ping', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                
                
                badge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-500 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
                dot.className = "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]";
                text.textContent = "متصل بالسيرفر";
                
                if (dbBadge && dbDot && dbText) {
                    if (data.dbConnected) {
                        dbBadge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-500 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
                        dbDot.className = "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]";
                        dbText.textContent = "قاعدة البيانات: متصلة";
                    } else {
                        dbBadge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-500 bg-red-500/10 border border-red-500/20 text-red-400";
                        dbDot.className = "w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_#f87171]";
                        dbText.textContent = "قاعدة البيانات: غير متصلة ⚠️";
                    }
                }
            } else {
                throw new Error('Not OK');
            }
        } catch (e) {
            
            badge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-500 bg-red-500/10 border border-red-500/20 text-red-400";
            dot.className = "w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_#f87171]";
            text.textContent = "انقطع الاتصال ⚠️";
            
            if (dbBadge && dbDot && dbText) {
                dbBadge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-500 bg-red-500/10 border border-red-500/20 text-red-400";
                dbDot.className = "w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_#f87171]";
                dbText.textContent = "قاعدة البيانات: غير متصلة ⚠️";
            }
        }
    }
    
    
    checkHealth();
    setInterval(checkHealth, 8000);
}
document.addEventListener('DOMContentLoaded', initConnectionMonitor);

