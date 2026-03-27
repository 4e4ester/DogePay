// ============================================
// DOGEPAY - CLIENT LOGIC
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
            document.getElementById('balance')?.innerText = data.balance.toLocaleString('ru-RU');
            document.getElementById('balance-doge')?.innerText = (data.balance / 1000).toFixed(4);
        }
    } catch (err) {
        console.error('Ошибка загрузки баланса:', err);
    }
}

// Показать сообщение
function showMessage(text, type = 'info') {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.innerText = text;
    
    const container = document.querySelector('.container');
    container?.insertBefore(msg, container.firstChild);
    
    setTimeout(() => msg.remove(), 4000);
}

// Глобальные функции
window.updateBalance = updateBalance;
window.showMessage = showMessage;

// Загрузить баланс при старте
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateBalance);
} else {
    updateBalance();
}