// ===== 🌐 DOGEPAY — translations.js (ULTRA EDITION v2) =====
// Мультиязычность: RU ↔ EN с авто-определением и плавным переключением
// ✅ ОБНОВЛЕНО: Кран 30 мин, Реклама 5-10 🪙 / 10 мин

(function() {
    'use strict';

    // ===== 📚 СЛОВАРЬ ПЕРЕВОДОВ =====
    const translations = {
        ru: {
            // === ОБЩИЕ ===
            app_name: 'DogePay',
            loading: 'Загрузка...',
            subtitle: '✨ Зарабатывай DOGE у нас 🪙🚀',
            balance_label: '💰 Твой баланс',
            balance_doge: '🐕 ~{value} DOGE',
            balance_doge_suffix: 'DOGE',
            footer: '🔐 Безопасно • ⚡ Быстро • 💎 Удобно',
            footer_doge: '🐕 Зарабатывай DOGE у нас! 🪙',
            back_home: 'На главную',
            back: 'Назад',
            error: '❌ Ошибка',
            success: '✅ Успешно',
            wait: '⏳ Подожди {seconds} сек',

            // === ГЛАВНАЯ ===
            btn_faucet: '🚰 Кран',
            btn_ads: '📢 Реклама',
            btn_withdraw: '💸 Вывод',

            // === КРАН — 🔥 30 МИНУТ КУЛДАУН 🔥 ===
            faucet_title: '🚰 Кран',
            faucet_subtitle: 'Забери бесплатные монеты',
            claim_btn: 'ЗАБРАТЬ (10-30 🪙)',
            claim_processing: '⏳ Обработка...',
            next_claim: 'До следующего сбора:',
            claim_ready: '✅ Можно забирать!',
            claim_waiting: '⏳ Жди...',
            faucet_info_1: '💎 Награда: <strong>10-30 🪙</strong>',
            faucet_info_2: '⏰ Интервал: <strong>30 минут</strong>',  // 🔥 ОБНОВЛЕНО
            faucet_info_3: '🔐 CAPTCHA: защита от ботов',
            captcha_title: '🔐 Проверка',
            captcha_question: 'Решите пример:',
            captcha_answer: 'Ваш ответ',
            captcha_verify: 'Проверить',
            captcha_error: '❌ Неверно! Попробуй ещё раз.',
            captcha_success: '✅ Верно!',
            reward_text: '+{amount} 🪙',
            reward_claimed: '🎉 Ты получил {amount} 🪙',

            // === РЕКЛАМА — 🔥 5-10 🪙 / 10 МИН 🔥 ===
            ads_title: '📢 Реклама',
            ads_subtitle: 'Получай 🪙 за просмотр',
            ads_watch: '🎬 Смотреть за 5-10 🪙',  // 🔥 ОБНОВЛЕНО
            ads_reward: '🪙 Награда: <strong>5-10 🪙</strong>',  // 🔥 ОБНОВЛЕНО
            ads_info: '📺 Просмотри предложение и получи монеты\n⏱ Лимит: <strong>каждые 10 минут</strong>',  // 🔥 ОБНОВЛЕНО
            ads_coming_soon: '🚧 Раздел в разработке...\nСкоро здесь будет реклама!',
            ads_available: '✅ Нажми чтобы получить награду!',
            ads_wait: '⏳ Следующая через {minutes} мин.',  // 🔥 ОБНОВЛЕНО
            ads_safe: '🔐 Безопасно: Никаких личных данных',
            ads_btn_ready: '✅ Нажми чтобы получить награду!',
            ads_btn_waiting: '⏳ Подожди перед следующей наградой',

            // === ВЫВОД ===
            withdraw_title: '💸 Вывод DOGE',
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
            subtitle: '✨ Earn DOGE with us 🪙🚀',
            balance_label: '💰 Your balance',
            balance_doge: '🐕 ~{value} DOGE',
            balance_doge_suffix: 'DOGE',
            footer: '🔐 Secure • ⚡ Fast • 💎 Convenient',
            footer_doge: '🐕 Earn DOGE with us! 🪙',
            back_home: 'Home',
            back: 'Back',
            error: '❌ Error',
            success: '✅ Success',
            wait: '⏳ Wait {seconds} sec',

            // === HOME ===
            btn_faucet: '🚰 Faucet',
            btn_ads: '📢 Ads',
            btn_withdraw: '💸 Withdraw',

            // === FAUCET — 🔥 30 MIN COOLDOWN 🔥 ===
            faucet_title: '🚰 Faucet',
            faucet_subtitle: 'Claim free coins',
            claim_btn: 'CLAIM (10-30 🪙)',
            claim_processing: '⏳ Processing...',
            next_claim: 'Next claim in:',
            claim_ready: '✅ Ready to claim!',
            claim_waiting: '⏳ Wait...',
            faucet_info_1: '💎 Reward: <strong>10-30 🪙</strong>',
            faucet_info_2: '⏰ Interval: <strong>30 minutes</strong>',  // 🔥 UPDATED
            faucet_info_3: '🔐 CAPTCHA: bot protection',
            captcha_title: '🔐 Verification',
            captcha_question: 'Solve:',
            captcha_answer: 'Your answer',
            captcha_verify: 'Verify',
            captcha_error: '❌ Wrong! Try again.',
            captcha_success: '✅ Correct!',
            reward_text: '+{amount} 🪙',
            reward_claimed: '🎉 You got {amount} 🪙',

            // === ADS — 🔥 5-10 🪙 / 10 MIN 🔥 ===
            ads_title: '📢 Ads',
            ads_subtitle: 'Earn 🪙 for viewing',
            ads_watch: '🎬 Watch for 5-10 🪙',  // 🔥 UPDATED
            ads_reward: '🪙 Reward: <strong>5-10 🪙</strong>',  // 🔥 UPDATED
            ads_info: '📺 Watch offer and get coins\n⏱ Limit: <strong>every 10 minutes</strong>',  // 🔥 UPDATED
            ads_coming_soon: '🚧 Coming soon...\nAds will be available shortly!',
            ads_available: '✅ Click to get reward!',
            ads_wait: '⏳ Next in {minutes}m',  // 🔥 UPDATED
            ads_safe: '🔐 Safe: No personal data',
            ads_btn_ready: '✅ Click to get reward!',
            ads_btn_waiting: '⏳ Wait before next reward',

            // === WITHDRAW ===
            withdraw_title: '💸 Withdraw DOGE',
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
            try {
                // 1. Пробуем загрузить из localStorage
                const saved = localStorage.getItem('dogepay_lang');
                if (saved && translations[saved]) {
                    this.current = saved;
                    return;
                }
            } catch (e) {
                console.warn('⚠️ localStorage not available');
            }

            // 2. Пробуем определить из Telegram
            const tg = window.Telegram?.WebApp;
            const tgLang = tg?.initDataUnsafe?.user?.language_code;
            if (tgLang && translations[tgLang]) {
                this.current = tgLang;
                try { localStorage.setItem('dogepay_lang', tgLang); } catch(e) {}
                return;
            }

            // 3. Пробуем определить из браузера
            const browserLang = navigator.language?.split('-')[0];
            if (browserLang && translations[browserLang]) {
                this.current = browserLang;
                try { localStorage.setItem('dogepay_lang', browserLang); } catch(e) {}
                return;
            }

            // 4. Дефолт: русский
            this.current = 'ru';
            try { localStorage.setItem('dogepay_lang', 'ru'); } catch(e) {}
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

            // 🔥 БЕЗОПАСНАЯ замена параметров {param} 🔥
            for (const [param, value] of Object.entries(params)) {
                if (value === null || value === undefined) continue;
                const safeParam = param.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\{${safeParam}\\}`, 'g');
                text = text.replace(regex, String(value));
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
            try { localStorage.setItem('dogepay_lang', newLang); } catch(e) {}
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

            // Обновляем кнопку флагов
            const flagBtn = document.getElementById('langSwitch');
            if (flagBtn) {
                flagBtn.innerHTML = this.current === 'ru' ? '🇷🇺 🇬🇧' : '🇬🇧 🇷🇺';
                flagBtn.title = this.current === 'ru' ? 'Switch to English' : 'Переключить на русский';
            }

            // Обновляем активную кнопку языка
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
    window.t = (key, params) => LangMgr.t(key, params);
    window.LangMgr = LangMgr;
    window.currentLang = LangMgr.current;
    window.setLanguage = (lang) => LangMgr.toggle(lang);
    window.updatePageLanguage = () => LangMgr.updatePage();
    window.loadSavedLanguage = () => LangMgr.init();
    window.getAvailableLanguages = () => LangMgr.getAvailable();
    window.toggleLanguage = () => {
        const newLang = LangMgr.current === 'ru' ? 'en' : 'ru';
        LangMgr.toggle(newLang);
        LangMgr.updatePage();
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    };

    // ===== 🏁 АВТО-ИНИЦИАЛИЗАЦИЯ =====
    function autoInit() {
        LangMgr.init();
        
        if (document.readyState !== 'loading') {
            LangMgr.updatePage();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        setTimeout(autoInit, 10);
    }

    document.addEventListener('dogepay:ready', () => {
        LangMgr.updatePage();
    });

})();
