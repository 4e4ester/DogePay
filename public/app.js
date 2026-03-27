// 🔊 ЗВУКИ (ЛОКАЛЬНЫЕ ФАЙЛЫ)
const clickSound = new Audio('click.mp3');
const claimSound = new Audio('claim.mp3');

clickSound.volume = 0.5;
claimSound.volume = 0.7;

// Воспроизвести звук клика
function playClick() {
    try {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {
            console.log('Звук клика не воспроизвёлся');
        });
    } catch (e) {
        console.log('Ошибка звука клика:', e);
    }
}

// Воспроизвести звук победы
function playClaim() {
    try {
        claimSound.currentTime = 0;
        claimSound.play().catch(() => {
            console.log('Звук победы не воспроизвёлся');
        });
    } catch (e) {
        console.log('Ошибка звука победы:', e);
    }
}

// Глобальные функции
window.playClick = playClick;
window.playClaim = playClaim;

// Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

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
window.updateLanguageButton = updateLanguageButton;

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
