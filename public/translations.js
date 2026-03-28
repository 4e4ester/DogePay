// ===== 🌐 DOGEPAY — translations.js (ULTRA EDITION) =====
// Мультиязычность: RU ↔ EN с авто-определением и плавным переключением

(function() {
    'use strict';

    // ===== 📚 СЛОВАРЬ ПЕРЕВОДОВ =====
    const translations = {
        ru: {
            // === ОБЩИЕ ===
            app_name: 'DogePay',
            loading: 'Загрузка...',
            subtitle: 'Зарабатывай DOGE играя',
            balance_label: 'Твой баланс',
            balance_doge: '🐕 ~{value} DOGE',
            balance_doge_suffix: 'DOGE',
            footer: '🔐 Безопасно • ⚡ Быстро • 🌍 Глобально',
            back_home: 'На главную',
            back: 'Назад',
            error: '❌ Ошибка',
            success: '✅ Успешно',
            wait: '⏳ Подожди {seconds} сек',

            // === ГЛАВНАЯ ===
            btn_faucet: '🚰 Кран',
            btn_ads: '📢 Реклама',
            btn_withdraw: '💸 Вывод',

            // === КРАН ===
            faucet_title: 'Кран',
            faucet_subtitle: 'Забери бесплатные монеты',
            claim_btn: 'ЗАБРАТЬ (10-30 🪙)',
            claim_processing: '⏳ Обработка...',
            next_claim: 'До следующего сбора:',
            claim_ready: '✅ Можно забирать!',
            claim_waiting: '⏳ Жди...',
            faucet_info_1: '💎 Награда: <strong>10-30 🪙</strong>',
            faucet_info_2: '⏰ Интервал: <strong>60 секунд</strong>',
            faucet_info_3: '🔐 CAPTCHA: защита от ботов',
            captcha_title: '🔐 Проверка',
            captcha_question: 'Решите пример:',
            captcha_answer: 'Ваш ответ',
            captcha_verify: 'Проверить',
            captcha_error: '❌ Неверно! Попробуй ещё раз.',
            captcha_success: '✅ Верно!',
            reward_text: '+{amount} 🪙',
            reward_claimed: '🎉 Ты получил {amount} 🪙',

            // === РЕКЛАМА ===
            ads_title: 'Реклама',
            ads_subtitle: 'Смотри и получай монеты',
            ads_watch: '📺 Смотреть рекламу',
            ads_reward: '🪙 Награда: 5-20 монет',
            ads_info: '📺 Просмотри рекламу и получи монеты\n⏱ Лимит: каждые 1 час',
            ads_coming_soon: '🚧 Раздел в разработке...\nСкоро здесь будет реклама!',
            ads_available: '✅ Реклама доступна!',
            ads_wait: '⏳ Следующая через {hours} ч.',

            // === ВЫВОД ===
            withdraw_title: 'Вывод DOGE',
            withdraw_subtitle: 'Выведи на свой кошелёк',
            wallet_label: 'Твой DOGE кошелёк',
            wallet_placeholder: 'Адрес кошелька',
            amount_label: 'Сумма в 🪙',
            amount_placeholder: 'Минимум 10000 🪙 (10 DOGE)',
            min_withdraw: '💡 Мин. вывод: 10000 🪙',
            withdraw_btn: 'Запросить вывод',
            withdraw_processing: '⏳ Отправка...',
            wallet_warning: '⚠️ Проверяй адрес! Транзакции необратимы.',
            withdraw_info: '⏱ Обработка: до 24 часов',
            withdraw_success: '✅ Заявка создана!',
            withdraw_error_balance: '❌ Недостаточно средств',
            withdraw_error_min: '❌ Минимум 10000 🪙',
            withdraw_error_wallet: '❌ Введи корректный адрес',
            your_balance: 'Твой баланс: {balance} 🪙',

            // === АДМИН ===
            admin_title: '🔐 Админ панель',
            admin_login: 'Вход администратора',
            password_placeholder: 'Пароль',
            login_btn: '🔓 Войти',
            logout_btn: '🚪 Выйти',
            requests_title: '📋 Заявки на вывод',
            no_requests: '✅ Нет активных заявок',
            request_id: 'ID',
            request_user: 'Пользователь',
            request_amount: 'Сумма',
            request_wallet: 'Кошелек',
            request_date: 'Дата',
            approve_btn: '✅ Одобрить',
            reject_btn: '❌ Отклонить',
            approve_confirm: 'Одобрить вывод {amount} 🪙?',
            reject_confirm: 'Отклонить заявку? Монеты вернутся пользователю.',
            approved: '✅ Одобрено!',
            rejected: '❌ Отклонено!',
            error_auth: '❌ Неверный пароль',
            error_network: '🌐 Ошибка сети',

            // === УВЕДОМЛЕНИЯ ===
            notif_success: '✅ {message}',
            notif_error: '❌ {message}',
            notif_info: 'ℹ️ {message}',
            notif_warning: '⚠️ {message}',

            // === КНОПКИ ===
            btn_confirm: 'Подтвердить',
            btn_cancel: 'Отмена',
            btn_close: 'Закрыть',
            btn_retry: 'Повторить'
        },

        en: {
            // === COMMON ===
            app_name: 'DogePay',
            loading: 'Loading...',
            subtitle: 'Earn DOGE while playing',
            balance_label: 'Your balance',
            balance_doge: '🐕 ~{value} DOGE',
            balance_doge_suffix: 'DOGE',
            footer: '🔐 Secure • ⚡ Fast • 🌍 Global',
            back_home: 'Home',
            back: 'Back',
            error: '❌ Error',
            success: '✅ Success',
            wait: '⏳ Wait {seconds} sec',

            // === HOME ===
            btn_faucet: '🚰 Faucet',
            btn_ads: '📢 Ads',
            btn_withdraw: '💸 Withdraw',

            // === FAUCET ===
            faucet_title: 'Faucet',
            faucet_subtitle: 'Claim free coins',
            claim_btn: 'CLAIM (10-30 🪙)',
            claim_processing: '⏳ Processing...',
            next_claim: 'Next claim in:',
            claim_ready: '✅ Ready to claim!',
            claim_waiting: '⏳ Wait...',
            faucet_info_1: '💎 Reward: <strong>10-30 🪙</strong>',
            faucet_info_2: '⏰ Interval: <strong>60 seconds</strong>',
            faucet_info_3: '🔐 CAPTCHA: bot protection',
            captcha_title: '🔐 Verification',
            captcha_question: 'Solve:',
            captcha_answer: 'Your answer',
            captcha_verify: 'Verify',
            captcha_error: '❌ Wrong! Try again.',
            captcha_success: '✅ Correct!',
            reward_text: '+{amount} 🪙',
            reward_claimed: '🎉 You got {amount} 🪙',

            // === ADS ===
            ads_title: 'Ads',
            ads_subtitle: 'Watch and earn coins',
            ads_watch: '📺 Watch Ad',
            ads_reward: '🪙 Reward: 5-20 coins',
            ads_info: '📺 Watch ad and get coins\n⏱ Limit: every 1 hour',
            ads_coming_soon: '🚧 Coming soon...\nAds will be available shortly!',
            ads_available: '✅ Ad available!',
            ads_wait: '⏳ Next in {hours}h',

            // === WITHDRAW ===
            withdraw_title: 'Withdraw DOGE',
            withdraw_subtitle: 'Withdraw to your wallet',
            wallet_label: 'Your DOGE wallet',
            wallet_placeholder: 'Wallet address',
            amount_label: 'Amount in 🪙',
            amount_placeholder: 'Minimum 10000 🪙 (10 DOGE)',
            min_withdraw: '💡 Min. withdrawal: 10000 🪙',
            withdraw_btn: 'Request withdrawal',
            withdraw_processing: '⏳ Sending...',
            wallet_warning: '⚠️ Check address! Transactions are irreversible.',
            withdraw_info: '⏱ Processing: up to 24 hours',
            withdraw_success: '✅ Request created!',
            withdraw_error_balance: '❌ Insufficient balance',
            withdraw_error_min: '❌ Minimum 10000 🪙',
            withdraw_error_wallet: '❌ Enter valid address',
            your_balance: 'Your balance: {balance} 🪙',

            // === ADMIN ===
            admin_title: '🔐 Admin Panel',
            admin_login: 'Admin Login',
            password_placeholder: 'Password',
            login_btn: '🔓 Login',
            logout_btn: '🚪 Logout',
            requests_title: '📋 Withdrawal Requests',
            no_requests: '✅ No active requests',
            request_id: 'ID',
            request_user: 'User',
            request_amount: 'Amount',
            request_wallet: 'Wallet',
            request_date: 'Date',
            approve_btn: '✅ Approve',
            reject_btn: '❌ Reject',
            approve_confirm: 'Approve withdrawal of {amount} 🪙?',
            reject_confirm: 'Reject request? Coins will be returned to user.',
            approved: '✅ Approved!',
            rejected: '❌ Rejected!',
            error_auth: '❌ Invalid password',
            error_network: '🌐 Network error',

            // === NOTIFICATIONS ===
            notif_success: '✅ {message}',
            notif_error: '❌ {message}',
            notif_info: 'ℹ️ {message}',
            notif_warning: '⚠️ {message}',

            // === BUTTONS ===
            btn_confirm: 'Confirm',
            btn_cancel: 'Cancel',
            btn_close: 'Close',
            btn_retry: 'Retry'
        }
    };

    // ===== ⚙️ МЕНЕДЖЕР ЯЗЫКОВ =====
    const LangMgr = {
        current: 'ru',
        fallback: 'en',

        // Инициализация
        init() {
            // 1. Пробуем загрузить из localStorage
            const saved = localStorage.getItem('dogepay_lang');
            if (saved && translations[saved]) {
                this.current = saved;
                return;
            }

            // 2. Пробуем определить из Telegram
            const tg = window.Telegram?.WebApp;
            const tgLang = tg?.initDataUnsafe?.user?.language_code;
            if (tgLang && translations[tgLang]) {
                this.current = tgLang;
                localStorage.setItem('dogepay_lang', tgLang);
                return;
            }

            // 3. Пробуем определить из браузера
            const browserLang = navigator.language?.split('-')[0];
            if (browserLang && translations[browserLang]) {
                this.current = browserLang;
                localStorage.setItem('dogepay_lang', browserLang);
                return;
            }

            // 4. Дефолт: русский
            this.current = 'ru';
            localStorage.setItem('dogepay_lang', 'ru');
        },

        // Получить перевод
        t(key, params = {}) {
            let text = translations[this.current]?.[key];
            
            // Fallback на английский
            if (!text && this.current !== this.fallback) {
                text = translations[this.fallback]?.[key];
            }
            
            // Если всё ещё нет — возвращаем ключ
            if (!text) {
                console.warn(`⚠️ Missing translation: "${key}"`);
                return key;
            }

            // Замена параметров {param}
            for (const [param, value] of Object.entries(params)) {
                text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), value);
            }

            return text;
        },

        // Переключить язык
        toggle(newLang) {
            if (!translations[newLang]) {
                console.warn(`⚠️ Language "${newLang}" not supported`);
                return false;
            }
            
            this.current = newLang;
            localStorage.setItem('dogepay_lang', newLang);
            return true;
        },

        // Обновить все элементы на странице
        updatePage() {
            // Тексты с data-t
            document.querySelectorAll('[data-t]').forEach(el => {
                const key = el.getAttribute('data-t');
                if (!key) return;

                const params = {};
                // Собираем параметры из data-t-* атрибутов
                for (const attr of el.attributes) {
                    if (attr.name.startsWith('data-t-') && attr.name !== 'data-t') {
                        const param = attr.name.replace('data-t-', '');
                        params[param] = attr.value;
                    }
                }

                const text = this.t(key, params);
                
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = text;
                } else if (el.tagName === 'IMG') {
                    el.alt = text;
                } else {
                    // Сохраняем HTML если есть
                    if (el.innerHTML.includes('<')) {
                        el.innerHTML = text;
                    } else {
                        el.textContent = text;
                    }
                }
            });

            // Плейсхолдеры с data-t-placeholder
            document.querySelectorAll('[data-t-placeholder]').forEach(el => {
                const key = el.getAttribute('data-t-placeholder');
                if (key) {
                    el.placeholder = this.t(key);
                }
            });

            // Обновляем кнопку флагов (ВАЖНО: не переводим, только меняем порядок)
            const flagBtn = document.getElementById('langSwitch');
            if (flagBtn) {
                flagBtn.innerHTML = this.current === 'ru' ? '🇷🇺 🇬🇧' : '🇬🇧 🇷🇺';
                flagBtn.title = this.current === 'ru' ? 'Switch to English' : 'Переключить на русский';
            }

            // Обновляем активную кнопку языка (если есть .lang-btn)
            document.querySelectorAll('.lang-btn').forEach(btn => {
                const lang = btn.dataset.lang;
                btn.classList.toggle('active', lang === this.current);
            });
        },

        // Получить текущий язык
        get() {
            return this.current;
        },

        // Получить список доступных языков
        getAvailable() {
            return Object.keys(translations);
        }
    };

    // ===== 🚀 ЭКСПОРТ В GLOBAL SCOPE =====
    // Функция перевода (короткое имя)
    window.t = (key, params) => LangMgr.t(key, params);
    
    // Менеджер (полный доступ)
    window.LangMgr = LangMgr;
    
    // Алиасы для совместимости
    window.currentLang = LangMgr.current;
    window.setLanguage = (lang) => LangMgr.toggle(lang);
    window.updatePageLanguage = () => LangMgr.updatePage();
    window.loadSavedLanguage = () => LangMgr.init();
    window.getAvailableLanguages = () => LangMgr.getAvailable();

    // ===== 🏁 АВТО-ИНИЦИАЛИЗАЦИЯ =====
    function autoInit() {
        LangMgr.init();
        
        // Если translations загружен после DOM — обновляем сразу
        if (document.readyState !== 'loading') {
            LangMgr.updatePage();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        // Небольшая задержка для гарантии загрузки
        setTimeout(autoInit, 10);
    }

    // Событие для других скриптов
    document.addEventListener('dogepay:ready', () => {
        LangMgr.updatePage();
    });

})();
