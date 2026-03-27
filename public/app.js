// ============================================
// DOGEPAY - CLIENT LOGIC (with Language)
// ============================================

const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

const userId = tg.initDataUnsafe?.user?.id;

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

// Переключение языка (глобальная функция)
window.toggleLanguage = function() {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    // Перезагрузить страницу для применения переводов
    setTimeout(() => window.location.reload(), 100);
};

// Глобальные функции
window.updateBalance = updateBalance;
window.showMessage = showMessage;

// Загрузить баланс и язык при старте
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
