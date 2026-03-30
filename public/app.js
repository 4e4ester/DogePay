// ===== 🎨 DOGEPAY — app.js =====
// Инициализация, звуки, баланс, языки, UI-утилиты

(function() {
    'use strict';

    // ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
    const tg = window.Telegram?.WebApp;
    let user_id = null;
    let currentLang = 'ru';
    let audioEnabled = true;

    // ===== ИНИЦИАЛИЗАЦИЯ TELEGRAM WEBAPP =====
    function initTelegram() {
        if (!tg) {
            console.warn('⚠️ Telegram WebApp не обнаружен');
            return;
        }

        try {
            tg.expand();
            tg.ready();
            
            if (tg.initDataUnsafe?.user?.id) {
                user_id = tg.initDataUnsafe.user.id;
                console.log('✅ Пользователь:', user_id);
            }

            const tgLang = tg.initDataUnsafe?.user?.language_code;
            if (tgLang && ['ru', 'en'].includes(tgLang)) {
                currentLang = tgLang;
            }

        } catch (err) {
            console.error('❌ Ошибка Telegram:', err);
        }
    }

    // ===== АУДИО МЕНЕДЖЕР =====
    const AudioMgr = {
        click: null,
        claim: null,

        init() {
            try {
                this.click = new Audio('click.mp3');
                this.click.volume = 0.4;
                this.click.preload = 'auto';
            } catch (e) {
                console.warn('⚠️ click.mp3 не загружен');
            }

            try {
                this.claim = new Audio('claim.mp3');
                this.claim.volume = 0.6;
                this.claim.preload = 'auto';
            } catch (e) {
                console.warn('⚠️ claim.mp3 не загружен');
            }
        },

        playClick() {
            if (!audioEnabled) return;
            
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
            
            if (this.click) {
                this.click.currentTime = 0;
                this.click.play().catch(() => {});
            }
        },

        playClaim() {
            if (!audioEnabled) return;
            
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }
            
            if (this.claim) {
                this.claim.currentTime = 0;
                this.claim.play().catch(() => {});
            }
        },

        playError() {
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
        }
    };

    // ===== МЕНЕДЖЕР БАЛАНСА =====
    const BalanceMgr = {
        async update() {
            if (!user_id) return;

            try {
                const res = await fetch(`/api/balance?user_id=${user_id}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    cache: 'no-store'
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                
                const data = await res.json();
                
                if (data.success && typeof data.balance === 'number') {
                    this.render(data.balance);
                    return data.balance;
                }
            } catch (err) {
                console.error('❌ Ошибка баланса:', err);
            }
            return null;
        },

        render(coins) {
            const balanceEl = document.getElementById('balance');
            if (balanceEl) {
                balanceEl.textContent = coins.toLocaleString('ru-RU');
            }

            const dogeEl = document.getElementById('balance-doge');
            if (dogeEl) {
                dogeEl.textContent = (coins / 1000).toFixed(4);
            }
        }
    };

    // ===== МЕНЕДЖЕР ЯЗЫКОВ =====
    const LangMgr = {
        init() {
            const saved = localStorage.getItem('dogepay_lang');
            if (saved && ['ru', 'en'].includes(saved)) {
                currentLang = saved;
            }
        },

        toggle() {
            AudioMgr.playClick();
            currentLang = currentLang === 'ru' ? 'en' : 'ru';
            localStorage.setItem('dogepay_lang', currentLang);
            setTimeout(() => location.reload(), 120);
        }
    };

    // ===== UI УТИЛИТЫ =====
    const UI = {
        showToast(message, type = 'info', duration = 3000) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `<span>${message}</span>`;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
    };

    // ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
    function attachEventListeners() {
        const langBtn = document.getElementById('langSwitch');
        if (langBtn) {
            langBtn.addEventListener('click', (e) => {
                e.preventDefault();
                LangMgr.toggle();
            });
        }
    }

    // ===== ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ =====
    function initApp() {
        console.log('🎮 DogePay инициализация...');

        initTelegram();
        AudioMgr.init();
        LangMgr.init();
        BalanceMgr.update();
        attachEventListeners();

        console.log('✅ DogePay готов');
    }

    // ===== ЭКСПОРТ =====
    window.playClick = () => AudioMgr.playClick();
    window.playClaim = () => AudioMgr.playClaim();
    window.playError = () => AudioMgr.playError();
    window.updateBalance = () => BalanceMgr.update();
    window.toggleLanguage = () => LangMgr.toggle();
    window.getUserId = () => user_id;
    window.showToast = (msg, type, dur) => UI.showToast(msg, type, dur);
    window.initApp = initApp;

    // ===== ЗАПУСК =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        setTimeout(initApp, 50);
    }

})();
