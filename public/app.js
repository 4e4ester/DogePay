// ===== 🎨 DOGEPAY — app.js (FULL EDITION) =====
// Инициализация, звуки, баланс, языки, UI-утилиты + Interstitial Ads

(function() {
    'use strict';

    // ===== 📦 ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
    const tg = window.Telegram?.WebApp;
    let user_id = null;
    let currentLang = 'ru';
    let audioEnabled = true;

    // ===== 🚀 ИНИЦИАЛИЗАЦИЯ TELEGRAM WEBAPP =====
    function initTelegram() {
        if (!tg) {
            console.warn('⚠️ Telegram WebApp не обнаружен (работаем в браузере)');
            return;
        }

        try {
            tg.expand();
            tg.ready();
            tg.enableClosingConfirmation?.();
            
            if (tg.colorScheme === 'dark') {
                document.documentElement.classList.add('tg-dark');
            }

            if (tg.initDataUnsafe?.user?.id) {
                user_id = tg.initDataUnsafe.user.id;
                console.log(`✅ Пользователь: ${user_id}`);
            }

            const tgLang = tg.initDataUnsafe?.user?.language_code;
            if (tgLang && ['ru', 'en'].includes(tgLang)) {
                currentLang = tgLang;
            }

        } catch (err) {
            console.error('❌ Ошибка инициализации Telegram:', err);
        }
    }

    // ===== 🔊 АУДИО МЕНЕДЖЕР =====
    const AudioMgr = {
        click: null,
        claim: null,

        init() {
            try {
                this.click = new Audio('click.mp3');
                this.click.volume = 0.4;
                this.click.preload = 'auto';
            } catch (e) {
                console.warn('⚠️ Не удалось загрузить click.mp3');
            }

            try {
                this.claim = new Audio('claim.mp3');
                this.claim.volume = 0.6;
                this.claim.preload = 'auto';
            } catch (e) {
                console.warn('⚠️ Не удалось загрузить claim.mp3');
            }

            document.addEventListener('click', () => {
                if (this.click) {
                    this.click.play().then(() => this.click.pause()).catch(() => {});
                }
                if (this.claim) {
                    this.claim.play().then(() => this.claim.pause()).catch(() => {});
                }
            }, { once: true });
        },

        playClick() {
            if (!audioEnabled) return;
            
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
            
            if (this.click) {
                this.click.currentTime = 0;
                this.click.play().catch(() => {
                    setTimeout(() => {
                        this.click?.play().catch(() => {});
                    }, 100);
                });
            }
        },

        playClaim() {
            if (!audioEnabled) return;
            
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }
            
            if (this.claim) {
                this.claim.currentTime = 0;
                this.claim.play().catch(() => {
                    setTimeout(() => {
                        this.claim?.play().catch(() => {});
                    }, 100);
                });
            }
        },

        playError() {
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
        },

        toggle(enabled) {
            audioEnabled = enabled;
            localStorage.setItem('dogepay_audio', enabled ? '1' : '0');
        }
    };

    // ===== 💰 МЕНЕДЖЕР БАЛАНСА =====
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
                console.error('❌ Ошибка обновления баланса:', err);
            }
            return null;
        },

        render(coins) {
            const balanceEl = document.getElementById('balance');
            if (balanceEl) {
                balanceEl.textContent = coins.toLocaleString('ru-RU');
                balanceEl.classList.add('pulse-once');
                setTimeout(() => balanceEl.classList.remove('pulse-once'), 300);
            }

            const dogeEl = document.getElementById('balance-doge');
            if (dogeEl) {
                const dogeValue = (coins / 1000).toFixed(4);
                dogeEl.textContent = dogeValue;
            }
        },

        add(coins) {
            const current = parseInt(document.getElementById('balance')?.textContent || '0');
            this.render(current + coins);
        }
    };

    // ===== 🌐 МЕНЕДЖЕР ЯЗЫКОВ =====
    const LangMgr = {
        init() {
            const saved = localStorage.getItem('dogepay_lang');
            if (saved && ['ru', 'en'].includes(saved)) {
                currentLang = saved;
            }
            this.apply();
        },

        apply() {
            if (typeof window.t !== 'function') return;

            document.querySelectorAll('[data-t]').forEach(el => {
                const key = el.getAttribute('data-t');
                if (key) {
                    const text = window.t(key);
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.placeholder = text;
                    } else {
                        el.textContent = text;
                    }
                }
            });

            document.querySelectorAll('[data-t-placeholder]').forEach(el => {
                const key = el.getAttribute('data-t-placeholder');
                if (key) {
                    el.placeholder = window.t(key);
                }
            });

            this.updateFlagButton();
        },

        updateFlagButton() {
            const btn = document.getElementById('langSwitch');
            if (btn) {
                btn.innerHTML = currentLang === 'ru' ? '🇷🇺 🇬🇧' : '🇬🇧 🇷🇺';
                btn.title = currentLang === 'ru' ? 'Switch to English' : 'Переключить на русский';
            }
        },

        toggle() {
            AudioMgr.playClick();
            currentLang = currentLang === 'ru' ? 'en' : 'ru';
            localStorage.setItem('dogepay_lang', currentLang);
            this.apply();
            document.body.style.opacity = '0.7';
            setTimeout(() => {
                location.reload();
            }, 150);
        }
    };

    // ===== 🎨 UI УТИЛИТЫ =====
    const UI = {
        showToast(message, type = 'info', duration = 3000) {
            document.querySelectorAll('.toast').forEach(t => t.remove());

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="toast-text">${message}</span>
            `;
            
            document.body.appendChild(toast);
            
            requestAnimationFrame(() => {
                toast.classList.add('toast-show');
            });

            setTimeout(() => {
                toast.classList.remove('toast-show');
                setTimeout(() => toast.remove(), 300);
            }, duration);

            return toast;
        },

        showLoader(element) {
            if (!element) return;
            element.dataset.originalText = element.textContent;
            element.textContent = '⏳';
            element.disabled = true;
            element.classList.add('loading');
        },

        hideLoader(element) {
            if (!element) return;
            element.textContent = element.dataset.originalText || '';
            element.disabled = false;
            element.classList.remove('loading');
            delete element.dataset.originalText;
        },

        animateNumber(element, start, end, duration = 500) {
            if (!element) return;
            
            const range = end - start;
            const startTime = performance.now();
            
            function step(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(start + range * ease);
                element.textContent = current.toLocaleString('ru-RU');
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }
            requestAnimationFrame(step);
        }
    };

    // ===== 🔗 ОБРАБОТЧИКИ СОБЫТИЙ =====
    function attachEventListeners() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            const isInteractive = target.closest('button, .btn, a, [role="button"]');
            const isLangSwitch = target.closest('#langSwitch, .lang-switch, .lang-btn');
            
            if (isInteractive && !isLangSwitch) {
                AudioMgr.playClick();
            }
        }, true);

        const langBtn = document.getElementById('langSwitch');
        if (langBtn) {
            langBtn.addEventListener('click', (e) => {
                e.preventDefault();
                LangMgr.toggle();
            });
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.dataset.lang;
                if (lang && lang !== currentLang) {
                    localStorage.setItem('dogepay_lang', lang);
                    currentLang = lang;
                    LangMgr.apply();
                    setTimeout(() => location.reload(), 100);
                }
            });
        });

        const audioToggle = document.getElementById('audioToggle');
        if (audioToggle) {
            const saved = localStorage.getItem('dogepay_audio');
            if (saved === '0') {
                audioEnabled = false;
                audioToggle.checked = false;
            }
            audioToggle.addEventListener('change', () => {
                AudioMgr.toggle(audioToggle.checked);
                UI.showToast(audioToggle.checked ? '🔊 Звук включён' : '🔇 Звук выключен', 'info', 2000);
            });
        }
    }

    // ===== 🚀 ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ =====
    function initApp() {
        console.log('🎮 DogePay app.js инициализация...');

        initTelegram();
        AudioMgr.init();
        LangMgr.init();
        BalanceMgr.update();
        attachEventListeners();

        console.log('✅ DogePay готов к работе');
        
        document.dispatchEvent(new CustomEvent('dogepay:ready', { detail: { user_id, currentLang } }));
    }

    // ===== 🌐 ЭКСПОРТ В GLOBAL SCOPE =====
    window.playClick = () => AudioMgr.playClick();
    window.playClaim = () => AudioMgr.playClaim();
    window.playError = () => AudioMgr.playError();
    window.updateBalance = () => BalanceMgr.update();
    window.addBalance = (coins) => BalanceMgr.add(coins);
    window.toggleLanguage = () => LangMgr.toggle();
    window.getUserId = () => user_id;
    window.getLang = () => currentLang;
    window.showToast = (msg, type, dur) => UI.showToast(msg, type, dur);
    window.initApp = initApp;

    // ===== 🏁 ЗАПУСК =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        setTimeout(initApp, 50);
    }

})();

// ===== 📢 INTERSTITIAL ADS (AdsGram) =====
// Показывать РЕДКО! (при переходе между страницами)

let interstitialAdsgram = null;
let lastInterstitialShow = 0;
const INTERSTITIAL_COOLDOWN = 10 * 60 * 1000; // 10 минут между показами

// Инициализация Interstitial
function initInterstitial() {
    if (typeof AdsGram !== 'undefined') {
        try {
            interstitialAdsgram = new AdsGram('int-26296');
            console.log('✅ Interstitial AdsGram инициализирован');
        } catch (err) {
            console.warn('⚠️ Interstitial не доступен:', err);
        }
    }
}

// Показать Interstitial рекламу
async function showInterstitial() {
    const now = Date.now();
    
    // Проверка кулдауна
    if (now - lastInterstitialShow < INTERSTITIAL_COOLDOWN) {
        console.log('⏳ Interstitial cooldown active');
        return;
    }
    
    if (!interstitialAdsgram) {
        console.warn('⚠️ Interstitial не инициализирован');
        return;
    }
    
    try {
        const ready = await interstitialAdsgram.isAdReady();
        if (ready) {
            console.log('📢 Showing Interstitial...');
            await interstitialAdsgram.showAd();
            lastInterstitialShow = now;
            console.log('✅ Interstitial shown');
        } else {
            console.log('⚠️ Interstitial not ready');
        }
    } catch (err) {
        console.warn('❌ Interstitial error:', err);
    }
}

// Вызываем инициализацию при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInterstitial);
} else {
    setTimeout(initInterstitial, 100);
}

// Экспорт для использования в других файлах
window.showInterstitial = showInterstitial;
window.initInterstitial = initInterstitial;
