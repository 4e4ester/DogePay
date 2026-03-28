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

window.playClick = playClick;
window.playClaim = playClaim;

function updateBalance() {
    const balance = parseInt(localStorage.getItem('balance') || '0');
    const balanceEl = document.getElementById('balance');
    const dogeEl = document.getElementById('balance-doge');
    if (balanceEl) balanceEl.innerText = balance.toLocaleString('ru-RU');
    if (dogeEl) dogeEl.innerText = (balance / 1000).toFixed(4);
}

// 🔷 ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА (ТОЛЬКО ФЛАГИ!)
window.toggleLanguage = function() {
    playClick();
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    
    // 🔥 ОБНОВИТЬ КНОПКУ ВРУЧНУЮ (ТОЛЬКО ФЛАГИ!)
    const langBtn = document.getElementById('langSwitch');
    if (langBtn) {
        if (newLang === 'ru') {
            langBtn.innerHTML = '🇷🇺 🇬🇧';
        } else {
            langBtn.innerHTML = '🇬🇧 🇷🇺';
        }
    }
    
    setTimeout(() => window.location.reload(), 100);
};

window.updateBalance = updateBalance;

// Звуки на все кнопки
document.addEventListener('click', function(e) {
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
}, true);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    if (typeof loadSavedLanguage === 'function') loadSavedLanguage();
    if (typeof updatePageLanguage === 'function') updatePageLanguage();
    updateBalance();
    
    // 🔥 УСТАНОВИТЬ ПРАВИЛЬНЫЕ ФЛАГИ ПРИ ЗАГРУЗКЕ
    const langBtn = document.getElementById('langSwitch');
    if (langBtn) {
        if (currentLang === 'ru') {
            langBtn.innerHTML = '🇷🇺 🇬🇧';
        } else {
            langBtn.innerHTML = '🇬🇧 🇷🇺';
        }
    }
    
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContent = document.getElementById('mainContent');
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (mainContent) mainContent.style.display = 'block';
    }, 1500);
}
