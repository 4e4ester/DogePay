// ============================================
// DOGEPAY - CLIENT LOGIC (SOUND + FLAGS)
// ============================================

const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

const userId = tg.initDataUnsafe?.user?.id;

// 🔊 ЗВУКОВЫЕ ЭФФЕКТЫ
const clickSound = new Audio('click.mp3');
const claimSound = new Audio('claim.mp3');

clickSound.volume = 0.5;
claimSound.volume = 0.7;

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

// Добавить звук на все кнопки
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button, .btn, a').forEach(el => {
        el.addEventListener('click', playClick);
    });
});

// Глобальные функции
window.playClick = playClick;
window.playClaim = playClaim;

// Обновление баланса на странице
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
        console.error('Ошибка загрузки баланса:', err);
    }
}

// Показать сообщение
function showMessage(text, type = 'info', duration = 4000) {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.innerText = text;
    msg.style.cssText = 'padding:15px 20px;border-radius:14px;margin:15px 0;font-size:14px;animation:slideIn 0.3s ease;';
    
    if (type === 'success') {
        msg.style.background = 'rgba(0, 214, 143, 0.15)';
        msg.style.border = '1px solid #00d68f';
        msg.style.color = '#00d68f';
    } else if (type === 'error') {
        msg.style.background = 'rgba(255, 92, 92, 0.15)';
        msg.style.border = '1px solid #ff5c5c';
        msg.style.color = '#ff5c5c';
    }
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(msg, container.firstChild);
        setTimeout(() => msg.remove(), duration);
    }
}

// Переключение языка (с флагами)
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
        if (currentLang === 'ru') {
            langBtn.innerHTML = '🇷🇺 | 🇬🇧';
        } else {
            langBtn.innerHTML = '🇬🇧 | 🇷🇺';
        }
    }
}

// Глобальные функции
window.updateBalance = updateBalance;
window.showMessage = showMessage;
window.updateLanguageButton = updateLanguageButton;

// Загрузить баланс и язык при старте
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadSavedLanguage();
        updatePageLanguage();
        updateLanguageButton();
        updateBalance();
        
        // Добавить звук на все кнопки
        document.querySelectorAll('button, .btn, a').forEach(el => {
            el.addEventListener('click', playClick);
        });
    });
} else {
    loadSavedLanguage();
    updatePageLanguage();
    updateLanguageButton();
    updateBalance();
}
