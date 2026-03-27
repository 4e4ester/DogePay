const translations = {
    ru: {
        subtitle: 'Зарабатывай DOGE играя',
        balance_label: 'Твой баланс',
        balance_doge: '🐕 ~',
        balance_doge_suffix: 'DOGE',
        faucet_title: 'Кран',
        faucet_subtitle: 'Забери бесплатные монеты',
        faucet_claim: 'ЗАБРАТЬ (10-50 🪙)',
        faucet_processing: 'Обработка...',
        faucet_wait: 'Жди',
        faucet_next: 'Следующий сбор через 3ч',
        faucet_available: 'Можно забирать!',
        faucet_checking: 'Проверка...',
        faucet_timer: 'Доступно каждые 3 часа',
        withdraw_title: 'Вывод DOGE',
        withdraw_subtitle: 'Выведи на кошелёк',
        withdraw_wallet_label: 'Твой DOGE кошелёк',
        withdraw_wallet_placeholder: 'Адрес кошелька',
        withdraw_amount_label: 'Сумма в 🪙',
        withdraw_amount_placeholder: 'Минимум 10000 🪙 (10 DOGE)',
        withdraw_btn: 'Запросить вывод',
        withdraw_info: 'Мин. вывод: 10000 🪙\nОбработка: до 24 часов',
        withdraw_balance: 'Твой баланс:',
        withdraw_warning: 'Проверяй адрес! Транзакции необратимы.',
        nav_home: 'Главная',
        nav_faucet: 'Кран',
        nav_withdraw: 'Вывод',
        error_user: 'Пользователь не найден',
        error_network: 'Ошибка сети. Попробуй позже.',
        footer: 'Безопасно • Быстро • Глобально',
        timer_started: 'Таймер запущен',
        msg_wait: 'Подожди ещё',
        msg_hours: 'ч.'
    },
    en: {
        subtitle: 'Earn DOGE by playing',
        balance_label: 'Your balance',
        balance_doge: '🐕 ~',
        balance_doge_suffix: 'DOGE',
        faucet_title: 'Faucet',
        faucet_subtitle: 'Claim free coins',
        faucet_claim: 'CLAIM (10-50 🪙)',
        faucet_processing: 'Processing...',
        faucet_wait: 'Wait',
        faucet_next: 'Next claim in 3h',
        faucet_available: 'Ready to claim!',
        faucet_checking: 'Checking...',
        faucet_timer: 'Available every 3 hours',
        withdraw_title: 'Withdraw DOGE',
        withdraw_subtitle: 'Withdraw to wallet',
        withdraw_wallet_label: 'Your DOGE wallet',
        withdraw_wallet_placeholder: 'Wallet address',
        withdraw_amount_label: 'Amount in 🪙',
        withdraw_amount_placeholder: 'Minimum 10000 🪙 (10 DOGE)',
        withdraw_btn: 'Request withdrawal',
        withdraw_info: 'Min. withdrawal: 10000 🪙\nProcessing: up to 24 hours',
        withdraw_balance: 'Your balance:',
        withdraw_warning: 'Check address! Transactions are irreversible.',
        nav_home: 'Home',
        nav_faucet: 'Faucet',
        nav_withdraw: 'Withdraw',
        error_user: 'User not found',
        error_network: 'Network error. Try again later.',
        footer: 'Secure • Fast • Global',
        timer_started: 'Timer started',
        msg_wait: 'Wait',
        msg_hours: 'h'
    }
};

let currentLang = 'ru';

function t(key) {
    return translations[currentLang][key] || key;
}

function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        localStorage.setItem('dogepay_lang', lang);
        updatePageLanguage();
    }
}

function updatePageLanguage() {
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = t(key);
        } else {
            el.innerText = t(key);
        }
    });
}

function loadSavedLanguage() {
    const saved = localStorage.getItem('dogepay_lang');
    if (saved && translations[saved]) {
        currentLang = saved;
    }
}

loadSavedLanguage();
