window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '0';
    setTimeout(() => { preloader.style.display = 'none'; }, 600);
});

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function playUiSound() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.05);
}

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Split Text Reveal анимация
    const splitTitles = document.querySelectorAll('.split-text');
    splitTitles.forEach(title => {
        const text = title.textContent;
        title.innerHTML = text.split(' ').map(word => 
            `<span class="word-wrap">${word.split('').map(char => `<span class="char">${char}</span>`).join('')}</span>`
        ).join('&nbsp;');
    });

    const observerOptions = { threshold: 0.2 };
    const textObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const chars = entry.target.querySelectorAll('.char');
                chars.forEach((char, index) => {
                    setTimeout(() => {
                        char.classList.add('visible');
                    }, index * 30);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    splitTitles.forEach(title => textObserver.observe(title));

    // 2. Динамическая смена цвета темы фона секций при скролле
    const colorSections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + window.innerHeight / 2;
        colorSections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                if (section.id === 'care' || section.id === 'reviews' || section.classList.contains('philosophy-section')) {
                    document.documentElement.style.setProperty('--color-bg', '#f5eee6');
                } else if (section.classList.contains('spotlight-section') || section.classList.contains('banner-separator')) {
                    document.documentElement.style.setProperty('--color-bg', '#1a1a1a');
                } else {
                    document.documentElement.style.setProperty('--color-bg', '#fdfaf8');
                }
            }
        });
    });

    // 3. SVG Draw анимация следов при скролле
    const drawPath = document.querySelector('.draw-path');
    if (drawPath) {
        const pathLength = drawPath.getTotalLength();
        drawPath.style.strokeDasharray = pathLength;
        drawPath.style.strokeDashoffset = pathLength;

        window.addEventListener('scroll', () => {
            const section = document.querySelector('.svg-draw-section');
            if (section) {
                const rect = section.getBoundingClientRect();
                const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
                drawPath.style.strokeDashoffset = pathLength - (pathLength * scrollProgress * 1.5);
            }
        });
    }

    // 4. Spotlight фонарик под курсором
    const spotlightBox = document.getElementById('spotlight-box');
    const hiddenLayer = document.querySelector('.spotlight-hidden-layer');
    if (spotlightBox && hiddenLayer) {
        spotlightBox.addEventListener('mousemove', (e) => {
            const rect = spotlightBox.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            hiddenLayer.style.clipPath = `circle(150px at ${x}px ${y}px)`;
        });
        spotlightBox.addEventListener('mouseleave', () => {
            hiddenLayer.style.clipPath = `circle(0px at 0px 0px)`;
        });
    }

    // 5. Apple-style Sticky Scroll логика
    const stickySteps = document.querySelectorAll('.sticky-step');
    const stickyImg = document.getElementById('sticky-img');
    if (stickySteps.length > 0 && stickyImg) {
        window.addEventListener('scroll', () => {
            stickySteps.forEach(step => {
                const rect = step.getBoundingClientRect();
                if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
                    const newImg = step.dataset.img;
                    if (stickyImg.src !== window.location.origin + newImg) {
                        stickyImg.style.opacity = 0;
                        setTimeout(() => {
                            stickyImg.src = newImg;
                            stickyImg.style.opacity = 1;
                        }, 250);
                    }
                }
            });
        });
    }

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.textContent = '☀️';
    }

    themeToggleBtn.addEventListener('click', () => {
        playUiSound();
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.textContent = '☀️';
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('.interactive-element')) {
            playUiSound();
        }
    });

    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        const interactables = document.querySelectorAll('a, button, .interactive-element, .tilt-card');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });
    }

    const contextMenu = document.getElementById('custom-context-menu');
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const { clientX: mouseX, clientY: mouseY } = e;
        contextMenu.style.left = `${mouseX}px`;
        contextMenu.style.top = `${mouseY}px`;
        contextMenu.classList.add('show');
    });
    
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.remove('show');
        }
    });

    document.getElementById('ctx-theme').addEventListener('click', () => {
        themeToggleBtn.click();
        contextMenu.classList.remove('show');
    });
    
    document.getElementById('ctx-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        contextMenu.classList.remove('show');
    });
    
    document.getElementById('ctx-top').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        contextMenu.classList.remove('show');
    });

    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            btn.style.transform = `translate(${x}px, ${y}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
        });
        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'none';
        });
    });

    const marquee = document.getElementById('marquee');
    let marqueeOffset = 0;
    let marqueeDirection = 1;
    let marqueeSpeed = 1;
    
    function animateMarquee() {
        marqueeOffset -= marqueeSpeed * marqueeDirection;
        if (marqueeOffset <= -50) marqueeOffset = 0;
        if (marqueeOffset > 0) marqueeOffset = -50;
        if (marquee) marquee.style.transform = `translateX(${marqueeOffset}%)`;
        
        marqueeSpeed = marqueeSpeed + (1 - marqueeSpeed) * 0.1;
        requestAnimationFrame(animateMarquee);
    }
    animateMarquee();
    
    window.addEventListener('wheel', (e) => {
        marqueeDirection = e.deltaY > 0 ? 1 : -1;
        marqueeSpeed = 3;
    });

    const canvas = document.getElementById('hero-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: -1000, y: -1000 };
        
        function initCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            particles = [];
            const numParticles = window.innerWidth < 768 ? 20 : 60;
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1
                });
            }
        }
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });
        
        window.addEventListener('resize', initCanvas);
        initCanvas();
        
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(212, 154, 154, 0.6)';
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    p.x -= dx * 0.05;
                    p.y -= dy * 0.05;
                }
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    const slider = document.getElementById('ba-slider');
    const overlay = document.getElementById('ba-overlay');
    const sliderBtn = document.getElementById('ba-slider-btn');
    if (slider) {
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            overlay.style.clipPath = `polygon(0 0, ${value}% 0, ${value}% 100%, 0 100%)`;
            sliderBtn.style.left = `${value}%`;
        });
    }

    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    const scrollLinks = document.querySelectorAll('a[href^="#"], [data-scroll-to]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            let targetId = link.hasAttribute('data-scroll-to') 
                ? link.getAttribute('data-scroll-to') 
                : link.getAttribute('href').substring(1);
            if (!link.hasAttribute('data-scroll-to')) e.preventDefault();
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    const quizModal = document.getElementById('quiz-modal');
    const openQuizBtns = document.querySelectorAll('[data-action="open-quiz"]');
    const closeQuizBtn = document.querySelector('[data-action="close-quiz"]');
    const questionEl = document.getElementById('quiz-question');
    const answersEl = document.getElementById('quiz-answers');
    const progressBar = document.getElementById('quiz-progress');
    
    let scores = { maltipoo: 0, pomeranian: 0 };
    let currentQuestionIndex = 0;
    
    const questions = [
        {
            question: "Как вы предпочитаете проводить выходные?",
            answers: [
                { text: "Спокойно дома с книгой или сериалом", breed: "maltipoo" },
                { text: "Активно на природе или в парке", breed: "pomeranian" }
            ]
        },
        {
            question: "Отношение к уходу за шерстью?",
            answers: [
                { text: "Готов(а) регулярно водить к грумеру на стрижку", breed: "maltipoo" },
                { text: "Люблю вычесывать пушистую шерсть сам(а)", breed: "pomeranian" }
            ]
        },
        {
            question: "Какая черта характера питомца для вас важнее?",
            answers: [
                { text: "Нежность, ласка и постоянный тактильный контакт", breed: "maltipoo" },
                { text: "Смелость, игривость и независимый характер", breed: "pomeranian" }
            ]
        }
    ];

    if (openQuizBtns.length > 0) {
        openQuizBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                quizModal.showModal();
                initQuiz();
            });
        });
    }

    if (closeQuizBtn) {
        closeQuizBtn.addEventListener('click', () => quizModal.close());
    }

    if (quizModal) {
        quizModal.addEventListener('click', (e) => {
            const rect = quizModal.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
                quizModal.close();
            }
        });
    }

    if (answersEl) {
        answersEl.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            if (btn.id === 'start-quiz-btn') {
                currentQuestionIndex = 0;
                renderQuestion();
            } else if (btn.classList.contains('btn-quiz-option')) {
                const breed = btn.dataset.breed;
                scores[breed]++;
                currentQuestionIndex++;
                renderQuestion();
            }
        });
    }

    function initQuiz() {
        scores = { maltipoo: 0, pomeranian: 0 };
        currentQuestionIndex = 0;
        if (progressBar) progressBar.style.width = '0%';
        questionEl.textContent = "Готовы узнать свою идеальную породу?";
        answersEl.innerHTML = '<button class="btn btn-primary interactive-element" id="start-quiz-btn" style="width: 100%;">Начать тест</button>';
        questionEl.classList.remove('quiz-fade');
        void questionEl.offsetWidth; 
        questionEl.classList.add('quiz-fade');
    }

    function renderQuestion() {
        answersEl.classList.remove('quiz-fade');
        questionEl.classList.remove('quiz-fade');
        void answersEl.offsetWidth;
        answersEl.classList.add('quiz-fade');
        questionEl.classList.add('quiz-fade');

        if (currentQuestionIndex >= questions.length) {
            showResult();
            return;
        }

        const progress = (currentQuestionIndex / questions.length) * 100;
        if (progressBar) progressBar.style.width = `${progress}%`;

        const q = questions[currentQuestionIndex];
        questionEl.textContent = q.question;
        answersEl.innerHTML = ''; 
        
        q.answers.forEach(ans => {
            const btn = document.createElement('button');
            btn.className = 'btn-quiz-option interactive-element';
            btn.textContent = ans.text;
            btn.dataset.breed = ans.breed;
            answersEl.appendChild(btn);
        });
    }

    function showResult() {
        if (progressBar) progressBar.style.width = '100%';
        const isMaltipoo = scores.maltipoo > scores.pomeranian;
        const resultBreed = isMaltipoo ? 'Мальтипу' : 'Шпиц';
        questionEl.textContent = `Ваш идеальный компаньон: ${resultBreed}!`;
        answersEl.innerHTML = `
            <p style="margin-bottom: 2rem; color: var(--color-text-muted); font-size: 1.1rem;">
                Мы учли ваши предпочтения. Эта порода идеально впишется в ваш образ жизни и подарит море радости.
            </p>
            <button class="btn btn-primary interactive-element" onclick="document.getElementById('quiz-modal').close()">Выбрать щенка</button>
        `;
    }

    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    reveals.forEach(reveal => revealObserver.observe(reveal));

    const footerLogo = document.getElementById('footer-logo');
    const vnOverlay = document.getElementById('vn-overlay');
    const vnTextEl = document.getElementById('vn-text-content');
    const vnNameEl = document.querySelector('.vn-character-name');
    
    let clickCount = 0;
    let dialogueIndex = 0;
    
    const dialogueNodes = [
        { name: "???", text: "Ого. Ты нашла секретный код?" },
        { name: "Неизвестный Пёс", text: "Я не Люцифер, как некоторые могли подумать... Меня зовут Мальбонте! 🐾" },
        { name: "Мальбонте", text: "Ладно, шутки в сторону. Надеюсь, тебе нравится архитектура этого проекта." },
        { name: "Мальбонте", text: "Отличного кодинга и чистого лога без багов. До встречи!" }
    ];

    if (footerLogo) {
        footerLogo.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 5) {
                startVisualNovel();
                clickCount = 0;
            }
        });
    }

    function startVisualNovel() {
        dialogueIndex = 0;
        if (vnOverlay) {
            vnOverlay.classList.remove('vn-hidden');
            renderDialogue();
        }
    }

    function renderDialogue() {
        if (dialogueIndex < dialogueNodes.length) {
            if (vnNameEl) vnNameEl.textContent = dialogueNodes[dialogueIndex].name;
            if (vnTextEl) vnTextEl.textContent = dialogueNodes[dialogueIndex].text;
        } else {
            if (vnOverlay) vnOverlay.classList.add('vn-hidden');
        }
    }

    if (vnOverlay) {
        vnOverlay.addEventListener('click', () => {
            dialogueIndex++;
            renderDialogue();
        });
    }
});