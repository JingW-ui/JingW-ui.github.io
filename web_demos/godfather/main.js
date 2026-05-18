// The Godfather Trilogy Website - Main JavaScript
// Vintage film effects and interactive functionality

class GodfatherWebsite {
    constructor() {
        this.quotes = [
            "I'm going to make him an offer he can't refuse.",
            "It's not personal, Sonny. It's strictly business.",
            "Keep your friends close, but your enemies closer.",
            "I spent my entire life trying not to be careless.",
            "Do you renounce Satan? I do renounce him.",
            "Never hate your enemies. It affects your judgment.",
            "The Godfather never asks a second favor when he's been refused the first."
        ];
        
        this.currentQuoteIndex = 0;
        this.init();
    }

    init() {
        this.setupLoading();
        this.setupNavigation();
        this.setupHeroCarousel();
        this.setupQuoteAnimation();
        this.setupScrollAnimations();
        this.setupFilmEffects();
    }

    setupLoading() {
        // Hide loading overlay after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                const overlay = document.getElementById('loadingOverlay');
                if (overlay) {
                    anime({
                        targets: overlay,
                        opacity: 0,
                        duration: 1000,
                        easing: 'easeOutQuad',
                        complete: () => {
                            overlay.style.display = 'none';
                        }
                    });
                }
            }, 1500);
        });
    }

    setupNavigation() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('-translate-x-full');
            });

            // Close mobile menu when clicking on links
            const mobileLinks = mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('-translate-x-full');
                });
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupHeroCarousel() {
        // Initialize Splide carousel
        const heroCarousel = document.querySelector('.hero-carousel');
        if (heroCarousel) {
            new Splide(heroCarousel, {
                type: 'loop',
                autoplay: true,
                interval: 5000,
                pauseOnHover: true,
                arrows: true,
                pagination: true,
                speed: 1000,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                breakpoints: {
                    768: {
                        arrows: false,
                    }
                }
            }).mount();
        }
    }

    setupQuoteAnimation() {
        const quoteElement = document.getElementById('heroQuote');
        if (quoteElement) {
            // Initialize Typed.js for quote animation
            const typed = new Typed('#heroQuote', {
                strings: this.quotes,
                typeSpeed: 50,
                backSpeed: 30,
                backDelay: 3000,
                loop: true,
                showCursor: true,
                cursorChar: '|',
                autoInsertCss: true,
                preStringTyped: (arrayIndex, self) => {
                    // Add film flicker effect before typing
                    this.addFilmFlicker(quoteElement);
                }
            });
        }
    }

    setupScrollAnimations() {
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });

        // Animate statistics on scroll
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStatistics();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const statsSection = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-4');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }

    setupFilmEffects() {
        // Add film grain effect to body
        document.body.classList.add('film-grain');

        // Create floating film particles
        this.createFilmParticles();

        // Add vintage paper texture to content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('vintage-paper');
        });
    }

    animateElement(element) {
        const animationType = element.dataset.animate;
        
        switch (animationType) {
            case 'fadeInUp':
                anime({
                    targets: element,
                    translateY: [50, 0],
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeOutQuad'
                });
                break;
            case 'fadeInLeft':
                anime({
                    targets: element,
                    translateX: [-50, 0],
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeOutQuad'
                });
                break;
            case 'fadeInRight':
                anime({
                    targets: element,
                    translateX: [50, 0],
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeOutQuad'
                });
                break;
            case 'scaleIn':
                anime({
                    targets: element,
                    scale: [0.8, 1],
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeOutBack'
                });
                break;
            default:
                anime({
                    targets: element,
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeOutQuad'
                });
        }
    }

    animateStatistics() {
        const stats = document.querySelectorAll('.text-4xl');
        stats.forEach((stat, index) => {
            const finalValue = stat.textContent;
            let currentValue = 0;
            
            // Extract numeric value
            const numericValue = parseInt(finalValue.replace(/[^\d]/g, '')) || 0;
            
            anime({
                targets: { value: 0 },
                value: numericValue,
                duration: 2000,
                delay: index * 200,
                easing: 'easeOutQuad',
                update: function(anim) {
                    const animatedValue = Math.round(anim.animatables[0].target.value);
                    if (finalValue.includes('M')) {
                        stat.textContent = '$' + animatedValue + 'M';
                    } else if (finalValue.includes('Years')) {
                        stat.textContent = animatedValue + '+';
                    } else if (finalValue.includes('Greatest')) {
                        stat.textContent = animatedValue === 1 ? '#1' : '#' + animatedValue;
                    } else {
                        stat.textContent = animatedValue;
                    }
                }
            });
        });
    }

    addFilmFlicker(element) {
        // Add vintage film flicker effect
        anime({
            targets: element,
            opacity: [1, 0.3, 1, 0.7, 1],
            duration: 200,
            easing: 'easeInOutQuad'
        });
    }

    createFilmParticles() {
        // Create subtle floating particles for vintage film effect
        const particleContainer = document.createElement('div');
        particleContainer.className = 'fixed inset-0 pointer-events-none z-0';
        document.body.appendChild(particleContainer);

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-1 h-1 bg-warm-amber opacity-20 rounded-full';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particleContainer.appendChild(particle);

            // Animate particles
            anime({
                targets: particle,
                translateY: [0, -100],
                opacity: [0.2, 0],
                duration: Math.random() * 3000 + 2000,
                loop: true,
                easing: 'linear',
                delay: Math.random() * 5000
            });
        }
    }

    // Utility function for smooth scrolling
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Quote Quiz Component
class QuoteQuiz {
    constructor() {
        this.questions = [
            {
                quote: "I'm going to make him an offer he can't refuse.",
                options: ["Don Vito Corleone", "Michael Corleone", "Sonny Corleone", "Tom Hagen"],
                correct: 0,
                context: "Don Vito Corleone says this to his godson Johnny Fontane about getting a movie role."
            },
            {
                quote: "It's not personal, Sonny. It's strictly business.",
                options: ["Michael Corleone", "Don Vito Corleone", "Tom Hagen", "Hyman Roth"],
                correct: 0,
                context: "Michael says this before ordering the assassination of Sollozzo and McCluskey."
            },
            {
                quote: "Keep your friends close, but your enemies closer.",
                options: ["Don Vito Corleone", "Michael Corleone", "Hyman Roth", "Al Neri"],
                correct: 2,
                context: "Hyman Roth gives this advice to Michael about dealing with enemies."
            },
            {
                quote: "I spent my entire life trying not to be careless.",
                options: ["Michael Corleone", "Don Vito Corleone", "Fredo Corleone", "Tom Hagen"],
                correct: 1,
                context: "Don Vito reflects on his life and the importance of being careful in the mafia world."
            },
            {
                quote: "Do you renounce Satan? I do renounce him.",
                options: ["Michael Corleone", "Don Vito Corleone", "Connie Corleone", "Kay Adams"],
                correct: 0,
                context: "Michael says this during the baptism scene while ordering the assassination of his enemies."
            }
        ];
        
        this.currentQuestion = 0;
        this.score = 0;
        this.quizStarted = false;
        this.quizCompleted = false;
    }

    startQuiz() {
        this.quizStarted = true;
        this.currentQuestion = 0;
        this.score = 0;
        this.renderQuestion();
    }

    renderQuestion() {
        const question = this.questions[this.currentQuestion];
        const quizContainer = document.getElementById('quizContainer');
        
        if (!quizContainer) return;

        quizContainer.innerHTML = `
            <div class="bg-sepia-brown bg-opacity-80 p-8 rounded-lg border border-aged-brass">
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-warm-amber font-body">Question ${this.currentQuestion + 1} of ${this.questions.length}</span>
                        <span class="text-cream-white font-body">Score: ${this.score}/${this.questions.length}</span>
                    </div>
                    <div class="w-full bg-charcoal-gray rounded-full h-2">
                        <div class="bg-vintage-gold h-2 rounded-full transition-all duration-300" style="width: ${((this.currentQuestion + 1) / this.questions.length) * 100}%"></div>
                    </div>
                </div>
                
                <blockquote class="font-accent text-2xl text-cream-white italic mb-8 text-center">
                    "${question.quote}"
                </blockquote>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    ${question.options.map((option, index) => `
                        <button class="quiz-option vintage-btn p-4 rounded-lg text-left transition-all duration-300" 
                                onclick="quoteQuiz.selectAnswer(${index})">
                            ${option}
                        </button>
                    `).join('')}
                </div>
                
                <div id="feedback" class="hidden text-center"></div>
            </div>
        `;
    }

    selectAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestion];
        const isCorrect = selectedIndex === question.correct;
        const feedback = document.getElementById('feedback');
        
        if (isCorrect) {
            this.score++;
        }

        // Disable all options
        document.querySelectorAll('.quiz-option').forEach((option, index) => {
            option.disabled = true;
            if (index === question.correct) {
                option.classList.add('bg-muted-olive', 'text-cream-white');
            } else if (index === selectedIndex && !isCorrect) {
                option.classList.add('bg-rich-burgundy', 'text-cream-white');
            }
        });

        // Show feedback
        if (feedback) {
            feedback.innerHTML = `
                <div class="mt-6 p-4 rounded-lg ${isCorrect ? 'bg-muted-olive' : 'bg-rich-burgundy'} bg-opacity-20">
                    <p class="text-cream-white font-body mb-2">
                        ${isCorrect ? 'Correct!' : 'Incorrect. The answer was: ' + question.options[question.correct]}
                    </p>
                    <p class="text-warm-amber font-body text-sm">${question.context}</p>
                    <button class="vintage-btn mt-4 px-6 py-2 rounded-lg" onclick="quoteQuiz.nextQuestion()">
                        ${this.currentQuestion < this.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                </div>
            `;
            feedback.classList.remove('hidden');
        }
    }

    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion < this.questions.length) {
            this.renderQuestion();
        } else {
            this.completeQuiz();
        }
    }

    completeQuiz() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        let rank = '';
        let rankColor = '';
        
        if (percentage >= 90) {
            rank = 'Don Corleone';
            rankColor = 'text-vintage-gold';
        } else if (percentage >= 70) {
            rank = 'Consigliere';
            rankColor = 'text-warm-amber';
        } else if (percentage >= 50) {
            rank = 'Caporegime';
            rankColor = 'text-muted-olive';
        } else {
            rank = 'Soldier';
            rankColor = 'text-cream-white';
        }

        const quizContainer = document.getElementById('quizContainer');
        if (quizContainer) {
            quizContainer.innerHTML = `
                <div class="bg-sepia-brown bg-opacity-80 p-8 rounded-lg border border-aged-brass text-center">
                    <h2 class="font-display text-4xl font-bold text-warm-amber mb-6">Quiz Complete!</h2>
                    <div class="mb-8">
                        <div class="text-6xl font-display font-bold text-vintage-gold mb-4">${percentage}%</div>
                        <div class="text-2xl font-body ${rankColor} mb-2">${rank}</div>
                        <div class="text-cream-white">Your Score: ${this.score}/${this.questions.length}</div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button class="vintage-btn px-6 py-3 rounded-lg" onclick="quoteQuiz.startQuiz()">
                            Take Quiz Again
                        </button>
                        <button class="vintage-btn px-6 py-3 rounded-lg" onclick="window.location.href='index.html'">
                            Back to Home
                        </button>
                    </div>
                </div>
            `;
        }
        
        this.quizCompleted = true;
    }
}

// Character Data for other pages
const characterData = {
    vito: {
        name: "Don Vito Corleone",
        actor: "Marlon Brando",
        description: "The patriarch of the Corleone crime family, known for his wisdom and ruthless efficiency.",
        timeline: [
            { year: 1901, event: "Arrives in America from Sicily" },
            { year: 1920, event: "Establishes the Corleone family business" },
            { year: 1945, event: "Daughter Connie's wedding" },
            { year: 1955, event: "Retires and passes leadership to Michael" }
        ]
    },
    michael: {
        name: "Michael Corleone",
        actor: "Al Pacino",
        description: "Vito's youngest son who reluctantly takes over the family business.",
        timeline: [
            { year: 1945, event: "Returns from WWII as a decorated hero" },
            { year: 1946, event: "Assassinates Sollozzo and McCluskey" },
            { year: 1958, event: "Becomes the new Don" },
            { year: 1980, event: "Dies alone, having lost everything" }
        ]
    },
    sonny: {
        name: "Sonny Corleone",
        actor: "James Caan",
        description: "Vito's eldest son, known for his hot temper and impulsive nature.",
        timeline: [
            { year: 1945, event: "Acts as underboss during Vito's illness" },
            { year: 1946, event: "Killed in a toll booth ambush" }
        ]
    },
    tom: {
        name: "Tom Hagen",
        actor: "Robert Duvall",
        description: "The Corleone family consigliere and adopted son.",
        timeline: [
            { year: 1945, event: "Serves as family lawyer" },
            { year: 1958, event: "Becomes acting Don when Michael is in Cuba" }
        ]
    },
    connie: {
        name: "Connie Corleone",
        actor: "Talia Shire",
        description: "Vito's only daughter, whose journey from victim to power player.",
        timeline: [
            { year: 1945, event: "Marries Carlo Rizzi" },
            { year: 1958, event: "Becomes involved in family business" },
            { year: 1980, event: "Helps run the family during Michael's illness" }
        ]
    },
    fredo: {
        name: "Fredo Corleone",
        actor: "John Cazale",
        description: "The middle son, considered weak and unsuitable for leadership.",
        timeline: [
            { year: 1945, event: "Works in Las Vegas casinos" },
            { year: 1959, event: "Betrayed Michael and was killed" }
        ]
    }
};

// Scene Data
const sceneData = [
    {
        title: "The Wedding",
        film: "The Godfather (1972)",
        description: "Connie Corleone's wedding day, where Don Vito grants favors according to Sicilian tradition.",
        significance: "Establishes the family business structure and Vito's power.",
        cinematography: "Warm lighting contrasts the dark office interior with the bright outdoor celebration."
    },
    {
        title: "The Hospital",
        film: "The Godfather (1972)",
        description: "Michael saves his father's life from a second assassination attempt.",
        significance: "Michael's first step into the family business.",
        cinematography: "Dark, tense atmosphere with dramatic lighting."
    },
    {
        title: "The Restaurant",
        film: "The Godfather (1972)",
        description: "Michael assassinates Sollozzo and McCluskey in a Bronx restaurant.",
        significance: "Michael's transformation from civilian to killer.",
        cinematography: "Tight framing builds tension; the train sound heightens anxiety."
    },
    {
        title: "The Baptism",
        film: "The Godfather (1972)",
        description: "Michael becomes godfather to his nephew while ordering the assassination of his enemies.",
        significance: "Michael's complete transformation into the Don.",
        cinematography: "Cross-cutting between sacred ritual and violent murder."
    },
    {
        title: "Vito's Flashback",
        film: "The Godfather Part II (1974)",
        description: "Young Vito establishes his reputation in 1920s New York.",
        significance: "Shows Vito's rise and parallel's Michael's journey.",
        cinematography: "Golden hour lighting creates nostalgic atmosphere."
    },
    {
        title: "The Senate Hearing",
        film: "The Godfather Part II (1974)",
        description: "Michael testifies before Congress about organized crime.",
        significance: "Michael's attempt to legitimize the family business.",
        cinematography: "Cold, institutional lighting contrasts with warm family scenes."
    }
];

// Initialize the website
let godfatherWebsite;
let quoteQuiz;

document.addEventListener('DOMContentLoaded', () => {
    godfatherWebsite = new GodfatherWebsite();
    quoteQuiz = new QuoteQuiz();
    
    // Initialize text splitting for animations
    if (typeof Splitting !== 'undefined') {
        Splitting();
    }
});

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Export for use in other pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GodfatherWebsite, QuoteQuiz, characterData, sceneData };
}