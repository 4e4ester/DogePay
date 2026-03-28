// ==================== app.js ====================

const tg = window.Telegram?.WebApp || {};
if (tg.expand) tg.expand();
if (tg.ready) tg.ready();

// Звуки
let clickSound, claimSound;

function initSounds() {
    clickSound = new Audio('click.mp3');
    claimSound = new Audio('claim.mp3');
    clickSound.volume = 0.6;
    claimSound.volume = 0.8;
}

function playClick() {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    if (clickSound) clickSound.play().catch(() => {});
}

function playClaim() {
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    if (claimSound) claimSound.play().catch(() => {});
}

// Баланс
let currentBalance = parseFloat(localStorage.getItem('dogeBalance')) || 0.00000000;

function updateBalance() {
    document.getElementById('balance').textContent = currentBalance.toFixed(8);
    document.getElementById('balanceDoge').textContent = currentBalance.toFixed(4);
}

// Язык
let currentLang = localStorage.getItem('dogepay_lang') || 'ru';

function toggleLanguage() {
    playClick();
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    localStorage.setItem('dogepay_lang', currentLang);
    
    const langBtn = document.getElementById('langSwitch');
    if (langBtn) langBtn.innerHTML = currentLang === 'ru' ? '🇷🇺 🇬🇧' : '🇬🇧 🇷🇺';

    applyTranslations();
}

// Применение переводов
function applyTranslations() {
    const t = window.translations ? window.translations[currentLang] : {};

    const map = {
        title: 'title',
        subtitle: 'subtitle',
        balanceLabel: 'balanceLabel',
        btnFaucet: 'faucet',
        btnAds: 'ads',
        btnWithdraw: 'withdraw',
        footerText: 'footer',
        loadingText: 'loading'
    };

    Object.keys(map).forEach(id => {
        const el = document.getElementById(id);
        if (el && t[map[id]]) {
            el.textContent = t[map[id]];
        }
    });
}

// Главная функция инициализации
function initApp() {
    initSounds();
    applyTranslations();
    updateBalance();

    // Прячем загрузку и показываем контент
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
    }, 800);
}

// Запуск
document.addEventListener('DOMContentLoaded', initApp);

// Делаем функции доступными глобально
window.toggleLanguage = toggleLanguage;
window.playClick = playClick;
window.playClaim = playClaim;
window.updateBalance = updateBalance;
