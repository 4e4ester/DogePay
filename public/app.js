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

// Переключение языка (БЕЗ ПЕРЕВОДА КНОПКИ!)
window.toggleLanguage = function() {
    playClick();
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    // Обновить текст кнопки вручную
    const langBtn = document.getElementById('langSwitch');
    if (langBtn) {
        langBtn.innerHTML = newLang === 'ru' ? '🇷🇺 🇬🇧' : '🇬🇧 🇷🇺';
    }
    setTimeout(() => window.location.reload(), 100);
};

// Глобальные функции
window.updateBalance = updateBalance;

// 🔊 ЗВУКИ НА ВСЕ ЭЛЕМЕНТЫ (включая вложенные)
document.addEventListener('click', function(e) {
    // Проверяем сам элемент и его родителей
    let target = e.target;
    while (target && target !== document) {
        if (target.tagName === 'BUTTON' || 
            target.tagName === 'A' || 
            target.classList.contains('btn') ||
            target.classList.contains('btn-icon') ||
            target.classList.contains('lang-switch')) {
            playClick();
            break;
        }
        target = target.parentElement;
    }
}, true); // useCapture = true для перехвата на всех уровнях

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof loadSavedLanguage === 'function') loadSavedLanguage();
        if (typeof updatePageLanguage === 'function') updatePageLanguage();
        updateBalance();
    });
} else {
    if (typeof loadSavedLanguage === 'function') loadSavedLanguage();
    if (typeof updatePageLanguage === 'function') updatePageLanguage();
    updateBalance();
}
