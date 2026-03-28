const translations = {
    ru: {
        subtitle: 'Зарабатывай DOGE играя',
        balance_label: 'Твой баланс',
        footer: '🔐 Безопасно • ⚡ Быстро • 🌍 Глобально',
        faucet_title: 'Кран',
        faucet_subtitle: 'Забери бесплатные монеты',
        faucet_claim: 'ЗАБРАТЬ (10-50 🪙)',
        faucet_processing: 'Обработка...',
        faucet_wait: 'Жди',
        faucet_next: 'Следующий сбор через 3ч',
        faucet_available: 'Можно забирать!',
        faucet_timer: '⏰ Доступно каждые 3 часа',
        faucet_info: '💎 Каждая награда: 10-50 🪙\n🔄 Следующий сбор: через 3 часа',
        ads_title: 'Реклама',
        ads_subtitle: 'Смотри рекламу и получай монеты',
        ads_watch: 'Смотреть рекламу',
        ads_reward: 'Награда: 5-20 🪙',
        ads_info: '📺 Просмотри рекламу и получи монеты\n⏱ Лимит: каждые 1 час',
        withdraw_title: 'Вывод DOGE',
        withdraw_subtitle: 'Выведи на свой кошелёк',
        withdraw_wallet_label: 'Твой DOGE кошелёк',
        withdraw_wallet_placeholder: 'Адрес кошелька',
        withdraw_amount_label: 'Сумма в 🪙',
        withdraw_amount_placeholder: 'Минимум 10000 🪙 (10 DOGE)',
        withdraw_btn: 'Запросить вывод',
        withdraw_info: '💡 Мин. вывод: 10000 🪙\n⏱ Обработка: до 24 часов',
        withdraw_balance: 'Твой баланс:',
        withdraw_warning: '⚠️ Проверяй адрес! Транзакции необратимы.',
        btn_back: '← На главную'
    },
    en: {
        subtitle: 'Earn DOGE by playing',
        balance_label: 'Your balance',
        footer: '🔐 Secure • ⚡ Fast • 🌍 Global',
        faucet_title: 'Faucet',
        faucet_subtitle: 'Claim free coins',
        faucet_claim: 'CLAIM (10-50 🪙)',
        faucet_processing: 'Processing...',
        faucet_wait: 'Wait',
        faucet_next: 'Next claim in 3h',
        faucet_available: 'Ready to claim!',
        faucet_timer: '⏰ Available every 3 hours',
        faucet_info: '💎 Each reward: 10-50 🪙\n🔄 Next claim: in 3 hours',
        ads_title: 'Ads',
        ads_subtitle: 'Watch ads and earn coins',
        ads_watch: 'Watch Ad',
        ads_reward: 'Reward: 5-20 🪙',
        ads_info: '📺 Watch ad and get coins\n⏱ Limit: every 1 hour',
        withdraw_title: 'Withdraw DOGE',
        withdraw_subtitle: 'Withdraw to your wallet',
        withdraw_wallet_label: 'Your DOGE wallet',
        withdraw_wallet_placeholder: 'Wallet address',
        withdraw_amount_label: 'Amount in 🪙',
        withdraw_amount_placeholder: 'Minimum 10000 🪙 (10 DOGE)',
        withdraw_btn: 'Request withdrawal',
        withdraw_info: '💡 Min. withdrawal: 10000 🪙\n⏱ Processing: up to 24 hours',
        withdraw_balance: 'Your balance:',
        withdraw_warning: '⚠️ Check address! Transactions are irreversible.',
        btn_back: '← Back to Home'
    }
};

let currentLang = localStorage.getItem('dogepay_lang') || 'ru';

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
