const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

const userId = tg.initDataUnsafe?.user?.id;

// 🔊 ЗВУКИ
const clickSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_736f5b6e6e.mp3');
const claimSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3');

clickSound.volume = 0.4;
claimSound.volume = 0.6;

function playClick() {
    try {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    } catch (e) {}
}

function playClaim() {
    try {
        claimSound.currentTime = 0;
        claimSound.play().catch(() => {});
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button, .btn, a, .nav-item, .copy-btn').forEach(el => {
        el.addEventListener('click', playClick);
    });
    updateNavActive();
});

async function updateBalance() {
    if (!userId) return;
    try {
        const response = await fetch(`/api/balance?user_id=${userId}`);
        const data = await response.json();
        if (data.balance !== undefined) {
            animateValue('balance', data.balance);
            const dogeEl = document.getElementById('balance-doge');
            if (dogeEl) dogeEl.innerText = (data.balance / 1000).toFixed(4);
        }
    } catch (err) {
        console.error('Ошибка баланса:', err);
    }
}

function animateValue(elementId, end) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const start = parseInt(element.innerText.replace(/,/g, '')) || 0;
    const duration = 1500;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        element.innerText = current.toLocaleString('ru-RU');
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function showMessage(text, type = 'info', duration = 4000) {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.innerText = text;
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(msg, container.firstChild);
        setTimeout(() => {
            msg.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => msg.remove(), 300);
        }, duration);
    }
}

window.toggleLanguage = function() {
    playClick();
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    setTimeout(() => window.location.reload(), 100);
};

function updateNavActive() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href && path.includes(href)) {
            item.classList.add('active');
        }
    });
}

window.updateBalance = updateBalance;
window.showMessage = showMessage;
window.playClick = playClick;
window.playClaim = playClaim;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadSavedLanguage();
        updatePageLanguage();
        updateBalance();
    });
} else {
    loadSavedLanguage();
    updatePageLanguage();
    updateBalance();
}
