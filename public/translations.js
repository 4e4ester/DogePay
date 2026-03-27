// ============================================
// DOGEPAY - TRANSLATIONS (RU/EN)
// ============================================

const translations = {
    ru: {
        // Header
        app_name: '🐕 DogePay',
        subtitle: 'Зарабатывай DOGE играя',
        
        // Balance
        balance_label: 'Твой баланс',
        balance_coins: '🪙',
        balance_doge: '🐕 ~',
        balance_doge_suffix: 'DOGE',
        
        // Buttons
        btn_faucet: '🚰 Кран',
        btn_deposit: '💰 Ввод средств',
        btn_withdraw: '💸 Вывод DOGE',
        
        // Faucet
        faucet_title: '🚰 Кран',
        faucet_subtitle: 'Забери бесплатные монеты',
        faucet_claim: '🎁 ЗАБРАТЬ (10-50 🪙)',
        faucet_processing: '⏳ Обработка...',
        faucet_wait: '⏳ Жди',
        faucet_next: '⏰ Следующий сбор через 3ч',
        faucet_available: '✅ Можно забирать!',
        faucet_checking: '⏳ Проверка...',
        faucet_info: '💎 Каждая награда: 10-50 🪙\n🔄 Следующий сбор: через 3 часа',
        faucet_timer: '⏰ Доступно каждые 3 часа',
        
        // Deposit
        deposit_title: '💰 Ввод средств',
        deposit_subtitle: 'Пополни баланс DOGE',
        deposit_label: 'Сумма в DOGE',
        deposit_placeholder: 'Минимум 10 DOGE',
        deposit_btn: '✅ Пополнить',
        deposit_info: '💡 Курс: 1 DOGE = 1000 🪙\n⚡ Зачисление моментальное',
        
        // Withdraw
        withdraw_title: '💸 Вывод DOGE',
        withdraw_subtitle: 'Выведи на свой кошелёк',
        withdraw_wallet_label: 'Твой DOGE кошелёк',
        withdraw_wallet_placeholder: 'Адрес кошелька',
        withdraw_amount_label: 'Сумма в 🪙',
        withdraw_amount_placeholder: 'Минимум 10000 🪙 (10 DOGE)',
        withdraw_btn: '✅ Запросить вывод',
        withdraw_info: '💡 Мин. вывод: 10000 🪙\n⏱ Обработка: до 24 часов',
        
        // Common
        btn_back: '← Назад',
        error_user: '❌ Ошибка: пользователь не найден',
        error_network: '❌ Ошибка сети. Попробуй позже.',
        success_claim: '🎉 +',
        coins: '🪙',
        footer: '🔐 Безопасно • ⚡ Быстро • 🌍 Глобально',
        lang_switch: '🌐 Язык',
        
        // Messages
        msg_success: '✅ Успешно!',
        msg_error: '❌ Ошибка',
        msg_wait: '⏰ Подожди ещё',
        msg_hours: 'ч.'
    },
    
    en: {
        // Header
        app_name: '🐕 DogePay',
        subtitle: 'Earn DOGE by playing',
        
        // Balance
        balance_label: 'Your balance',
        balance_coins: '🪙',
        balance_doge: '🐕 ~',
        balance_doge_suffix: 'DOGE',
        
        // Buttons
        btn_faucet: '🚰 Faucet',
        btn_deposit: '💰 Deposit',
        btn_withdraw: '💸 Withdraw DOGE',
        
        // Faucet
        faucet_title: '🚰 Faucet',
        faucet_subtitle: 'Claim free coins',
        faucet_claim: '🎁 CLAIM (10-50 🪙)',
        faucet_processing: '⏳ Processing...',
        faucet_wait: '⏳ Wait',
        faucet_next: '⏰ Next claim in 3h',
        faucet_available: '✅ Ready to claim!',
        faucet_checking: '⏳ Checking...',
        faucet_info: '💎 Each reward: 10-50 🪙\n🔄 Next claim: in 3 hours',
        faucet_timer: '⏰ Available every 3 hours',
        
        // Deposit
        deposit_title: '💰 Deposit',
        deposit_subtitle: 'Top up your balance with DOGE',
        deposit_label: 'Amount in DOGE',
        deposit_placeholder: 'Minimum 10 DOGE',
        deposit_btn: '✅ Deposit',
        deposit_info: '💡 Rate: 1 DOGE = 1000 🪙\n⚡ Instant credit',
        
        // Withdraw
        withdraw_title: '💸 Withdraw DOGE',
        withdraw_subtitle: 'Withdraw to your wallet',
        withdraw_wallet_label: 'Your DOGE wallet',
        withdraw_wallet_placeholder: 'Wallet address',
        withdraw_amount_label: 'Amount in 🪙',
        withdraw_amount_placeholder: 'Minimum 10000 🪙 (10 DOGE)',
        withdraw_btn: '✅ Request withdrawal',
        withdraw_info: '💡 Min. withdrawal: 10000 🪙\n⏱ Processing: up to 24 hours',
        
        // Common
        btn_back: '← Back',
        error_user: '❌ Error: user not found',
        error_network: '❌ Network error. Try again later.',
        success_claim: '🎉 +',
        coins: '🪙',
        footer: '🔐 Secure • ⚡ Fast • 🌍 Global',
        lang_switch: '🌐 Language',
        
        // Messages
        msg_success: '✅ Success!',
        msg_error: '❌ Error',
        msg_wait: '⏰ Wait',
        msg_hours: 'h'
    }
};

// Текущий язык (по умолчанию русский)
let currentLang = 'ru';

// Функция перевода
function t(key) {
    return translations[currentLang][key] || key;
}

// Переключение языка
function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        localStorage.setItem('dogepay_lang', lang);
        updatePageLanguage();
    }
}

// Обновление текста на странице
function updatePageLanguage() {
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = t(key);
        } else {
            el.innerText = t(key);
        }
    });
    
    // Обновить кнопку переключения языка
    const langBtn = document.getElementById('langSwitch');
    if (langBtn) {
        langBtn.innerText = currentLang === 'ru' ? '🇬🇧 EN' : '🇷🇺 RU';
    }
}

// Загрузка сохранённого языка
function loadSavedLanguage() {
    const saved = localStorage.getItem('dogepay_lang');
    if (saved && translations[saved]) {
        currentLang = saved;
    }
}

// Инициализация
loadSavedLanguage();

// Обновление кнопки языка с флагами
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

// Вызов после загрузки языка
updateLanguageButton();
