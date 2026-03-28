// ==================== app.js ====================

// Telegram WebApp
const tg = window.Telegram?.WebApp || {};
if (tg.expand) tg.expand();
if (tg.ready) tg.ready();

// 🔊 ЗВУКИ
let clickSound = null;
let claimSound = null;

function initSounds() {
    try {
        clickSound = new Audio('click.mp3');
        clickSound.volume = 0.6;
    } catch (e) {
        console.warn('click.mp3 не удалось загрузить');
    }

    try {
        claimSound = new Audio('claim.mp3');
        claimSound.volume = 0.8;
    } catch (e) {
        console.warn('claim.mp3 не удалось загрузить');
    }
}

function playClick() {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    }
}

function playClaim() {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
    if (claimSound) {
        claimSound.currentTime = 0;
        claimSound.play().catch(() => {});
    }
}

// Глобальные функции
window.playClick = playClick;
window.playClaim = playClaim;

// ==================== БАЛАНС ====================
let currentBalance = parseFloat(localStorage.getItem('dogeBalance')) || 0.00000000;

function updateBalance() {
    const balanceEl = document.getElementById('balance');
    const dogeEl = document.getElementById('balanceDoge');

    if (balanceEl) {
        balanceEl.textContent = currentBalance.toFixed(8);
    }
    if (dogeEl) {
        dogeEl.textContent = currentBalance.toFixed(4);
    }
}

// ==================== ЯЗЫК ====================
let currentLang = localStorage.getItem('lang') || 'ru';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
}

window.toggleLanguage = function() {
    playClick();
    
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);

    // Меняем флаги на кнопке
    const langBtn = document.getElementById('langSwitch');
    if (langBtn) {
        langBtn.innerHTML = newLang === 'ru' ? '🇷🇺 🇬🇧' : '🇬🇧 🇷🇺';
    }

    // Применяем переводы
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }

    // Не делаем полный reload — лучше обновить только тексты
    // setTimeout(() => window.location.reload(), 100); // убрал полный релоад
};

// ==================== ПЕРЕВОДЫ ====================
function applyTranslations() {
    const t = window.translations ? window.translations[currentLang] : {};

    // Главная страница
    if (document.getElementById('title')) 
        document.getElementById('title').textContent = t.title || 'DogePay';

    if (document.getElementById('subtitle')) 
        document.getElementById('subtitle').textContent = t.subtitle || 'Зарабатывай DOGE играя';

    if (document.getElementById('balanceLabel')) 
        document.getElementById('balanceLabel').textContent = t.balanceLabel || 'Твой баланс';

    if (document.getElementById('balanceDogeLabel')) 
        document.getElementById('balanceDogeLabel').innerHTML = 
            `~<span id="balanceDoge">${currentBalance.toFixed(4)}</span> DOGE`;

    if (document.getElementById('btnFaucet')) 
        document.getElementById('btnFaucet').textContent = t.faucet || 'Кран';

    if (document.getElementById('btnAds')) 
        document.getElementById('btnAds').textContent = t.ads || 'Реклама';

    if (document.getElementById('btnWithdraw')) 
        document.getElementById('btnWithdraw').textContent = t.withdraw || 'Вывод';

    if (document.getElementById('footerText')) 
        document.getElementById('footerText').textContent = t.footer || '🔐 Безопасно • ⚡ Быстро • 🌍 Глобально';

    if (document.getElementById('loadingText')) 
        document.getElementById('loadingText').textContent = t.loading || 'Загрузка DogePay...';
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
function initApp() {
    initSounds();

    // Загружаем язык
    currentLang = localStorage.getItem('lang') || 'ru';

    // Устанавливаем правильные флаги
    const langBtn = document.getElementById('langSwitch');
    if (langBtn) {
        langBtn.innerHTML = currentLang === 'ru' ? '🇷🇺 🇬🇧' : '🇬🇧 🇷🇺';
    }

    // Применяем переводы
    applyTranslations();

    // Обновляем баланс
    updateBalance();

    // Прячем экран загрузки
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContent = document.getElementById('mainContent');

        if (loadingScreen) loadingScreen.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
    }, 1200);
}

// Запуск приложения
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Глобальные функции для других страниц
window.updateBalance = updateBalance;
window.applyTranslations = applyTranslations;
window.setLanguage = setLanguage;
