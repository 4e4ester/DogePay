// 🔊 ЗВУКИ (ЛОКАЛЬНЫЕ ФАЙЛЫ)
const clickSound = new Audio('click.mp3');
const claimSound = new Audio('claim.mp3');

clickSound.volume = 0.5;
claimSound.volume = 0.7;

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

window.playClick = playClick;
window.playClaim = playClaim;

// Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

const userId = tg.initDataUnsafe?.user?.id;

// Обновление баланса
async function updateBalance() {
    if (!userId) return;
    try {
        const response = await fetch(`/api/balance?user_id=${userId}`);
        const data = await response.json();
        if (data.balance !== undefined) {
            const balanceEl = document.getElementById('balance');
            const dogeEl = document.getElementById('balance-doge');
            if (balanceEl) balanceEl.innerText = data.balance.toLocaleString('ru-RU');
            if (dogeEl) dogeEl.innerText = (data.balance / 1000).toFixed(4);
        }
    } catch (err) {
        console.error('Ошибка баланса:', err);
    }
}

// Анимация счётчика
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

// Показать сообщение
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

// Переключение языка
window.toggleLanguage = function() {
    playClick();
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    setTimeout(() => window.location.reload(), 100);
};

// Глобальные функции
window.updateBalance = updateBalance;
window.showMessage = showMessage;
window.animateValue = animateValue;

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadSavedLanguage();
        updatePageLanguage();
        updateLanguageButton();
        updateBalance();
        
        // Звуки на все кнопки
        document.querySelectorAll('button, .btn, a').forEach(el => {
            el.addEventListener('click', playClick);
        });
    });
} else {
    loadSavedLanguage();
    updatePageLanguage();
    updateLanguageButton();
    updateBalance();
    
    document.querySelectorAll('button, .btn, a').forEach(el => {
        el.addEventListener('click', playClick);
    });
}
