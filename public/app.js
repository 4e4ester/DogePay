// Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// 🔊 ЗВУКИ
let clickSound = null;
let claimSound = null;

try {
    clickSound = new Audio('click.mp3');
    clickSound.volume = 0.5;
} catch(e) {
    console.log('Звук клика не загружен');
}

try {
    claimSound = new Audio('claim.mp3');
    claimSound.volume = 0.7;
} catch(e) {
    console.log('Звук победы не загружен');
}

// Воспроизвести звук клика
function playClick() {
    // Вибрация Telegram
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    // Звук
    if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    }
}

// Воспроизвести звук победы
function playClaim() {
    // Вибрация Telegram
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
    // Звук
    if (claimSound) {
        claimSound.currentTime = 0;
        claimSound.play().catch(() => {});
    }
}

window.playClick = playClick;
window.playClaim = playClaim;

// Обновление баланса
function updateBalance() {
    const balance = parseInt(localStorage.getItem('balance') || '0');
    const balanceEl = document.getElementById('balance');
    const dogeEl = document.getElementById('balance-doge');
    if (balanceEl) balanceEl.innerText = balance.toLocaleString('ru-RU');
    if (dogeEl) dogeEl.innerText = (balance / 1000).toFixed(4);
}

// Переключение языка
window.toggleLanguage = function() {
    playClick();
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
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
window.updateLanguageButton = updateLanguageButton;

// 🔊 ЗВУКИ НА ВСЕ КНОПКИ (ДЕЛЕГИРОВАНИЕ)
document.addEventListener('click', function(e) {
    const target = e.target;
    // Проверяем все возможные элементы
    if (target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.classList.contains('btn') ||
        target.classList.contains('btn-icon') ||
        target.closest('.btn') ||
        target.closest('button') ||
        target.closest('a')) {
        playClick();
    }
});

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof loadSavedLanguage === 'function') loadSavedLanguage();
        if (typeof updatePageLanguage === 'function') updatePageLanguage();
        updateLanguageButton();
        updateBalance();
    });
} else {
    if (typeof loadSavedLanguage === 'function') loadSavedLanguage();
    if (typeof updatePageLanguage === 'function') updatePageLanguage();
    updateLanguageButton();
    updateBalance();
}
