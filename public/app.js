// ============================================
// DOGEPAY - CLIENT LOGIC (PREMIUM)
// ============================================

const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

const userId = tg.initDataUnsafe?.user?.id;

// 🔊 ЗВУКИ (CDN - не нужно загружать файлы)
const clickSound = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
const claimSound = new Audio('https://www.soundjay.com/misc/sounds/magic-chime-01.mp3');
const successSound = new Audio('https://www.soundjay.com/misc/sounds/success-01.mp3');

clickSound.volume = 0.4;
claimSound.volume = 0.6;
successSound.volume = 0.5;

// Воспроизвести звук клика
function playClick() {
    try {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    } catch (e) {}
}

// Воспроизвести звук победы
function playClaim() {
    try {
        claimSound.currentTime = 0;
        claimSound.play().catch(() => {});
    } catch (e) {}
}

// Воспроизвести звук успеха
function playSuccess() {
    try {
        successSound.currentTime = 0;
        successSound.play().catch(() => {});
    } catch (e) {}
}

// Добавить звук на все кнопки
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button, .btn, a, .wallet-address').forEach(el => {
        el.addEventListener('click', playClick);
    });
});

// Обновление баланса с анимацией
async function updateBalance() {
    if (!userId) return;
    
    try {
        const response = await fetch(`/api/balance?user_id=${userId}`);
        const data = await response.json();
        
        if (data.balance !== undefined) {
            animateValue('balance', data.balance);
            document.getElementById('balance-doge').innerText = (data.balance / 1000).toFixed(4);
        }
    } catch (err) {
        console.error('Ошибка загрузки баланса:', err);
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
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const current = Math.floor(start + (end - start) * easeOutQuart);
        element.innerText = current.toLocaleString('ru-RU');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
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
    updateLanguageButton();
    setTimeout(() => window.location.reload(), 100);
};

// Обновление кнопки языка
function updateLanguageButton() {
    const langBtn = document.getElementById('langSwitch');
    if (langBtn) {
        langBtn.innerHTML = currentLang === 'ru' ? '🇷🇺 🇬🇧' : '🇬🇧 🇷🇺';
    }
}

// Глобальные функции
window.updateBalance = updateBalance;
window.showMessage = showMessage;
window.playClick = playClick;
window.playClaim = playClaim;
window.playSuccess = playSuccess;
window.updateLanguageButton = updateLanguageButton;

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadSavedLanguage();
        updatePageLanguage();
        updateLanguageButton();
        updateBalance();
    });
} else {
    loadSavedLanguage();
    updatePageLanguage();
    updateLanguageButton();
    updateBalance();
}
