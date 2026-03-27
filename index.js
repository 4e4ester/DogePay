// ============================================
// DOGEPAY - TELEGRAM MINI APP SERVER
// ============================================

const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 🔷 ПОДКЛЮЧЕНИЕ К БАЗЕ (ТОЛЬКО IPv4!)
// ============================================
const pool = new Pool({
    host: 'db.xppivwbjpganbkdangmm.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    family: 4,              // ⚠️ ПРИНУДИТЕЛЬНО IPv4
    max: 10,                // Лимит подключений
    idleTimeoutMillis: 30000
});

// ============================================
// СОЗДАНИЕ ТАБЛИЦЫ
// ============================================
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id BIGINT PRIMARY KEY,
                username TEXT,
                balance BIGINT DEFAULT 0,
                last_claim TIMESTAMP DEFAULT NOW(),
                wallet_address TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ База данных готова');
        return true;
    } catch (error) {
        console.error('❌ Ошибка базы данных:', error.message);
        return false;
    }
}

// ============================================
// НАСТРОЙКА EXPRESS
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================
// TELEGRAM BOT
// ============================================
let bot;

function startBot() {
    // Защита: не запускать бота дважды
    if (bot) {
        console.log('⚠️ Бот уже запущен');
        return;
    }

    bot = new Telegraf(process.env.BOT_TOKEN);

    bot.start(async (ctx) => {
        try {
            const userId = ctx.from.id;
            const username = ctx.from.username || 'User';

            await pool.query(
                `INSERT INTO users (user_id, username, balance, last_claim) 
                 VALUES ($1, $2, 0, NOW() - INTERVAL '3 hours') 
                 ON CONFLICT (user_id) DO NOTHING`,
                [userId, username]
            );

            ctx.reply(
                `🐕 *DogePay*\n\n` +
                `🪙 Баланс: 0 коинов\n` +
                `💱 1000 🪙 = 1 DOGE\n\n` +
                `Нажми кнопку 👇`,
                { parse_mode: 'Markdown' },
                Markup.keyboard([
                    [Markup.button.webApp('🚀 Открыть DogePay', process.env.WEB_APP_URL)]
                ]).resize()
            );
        } catch (error) {
            console.error('Ошибка /start:', error);
            ctx.reply('❌ Ошибка. Попробуйте позже.');
        }
    });

    bot.command('balance', async (ctx) => {
        try {
            const userId = ctx.from.id;
            const result = await pool.query(
                'SELECT balance FROM users WHERE user_id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                ctx.reply('❌ Сначала нажмите /start');
                return;
            }

            const balance = result.rows[0].balance;
            ctx.reply(`🪙 Баланс: ${balance} коинов\n🐕 ~${(balance/1000).toFixed(4)} DOGE`);
        } catch (error) {
            console.error('Ошибка /balance:', error);
            ctx.reply('❌ Ошибка.');
        }
    });

    // Запуск с обработкой ошибок
    bot.launch()
        .then(() => console.log('🤖 Бот запущен'))
        .catch((error) => {
            if (error.description?.includes('terminated by other getUpdates')) {
                console.log('⚠️ Бот уже запущен в другом месте — этот экземпляр остановлен');
            } else {
                console.error('❌ Ошибка запуска бота:', error.message);
            }
        });

    // Корректная остановка
    process.once('SIGINT', () => bot?.stop('SIGINT'));
    process.once('SIGTERM', () => bot?.stop('SIGTERM'));
}

// ============================================
// API: ПОЛУЧИТЬ БАЛАНС
// ============================================
app.get('/api/balance', async (req, res) => {
    try {
        const userId = req.query.user_id;
        if (!userId) return res.json({ error: 'Нет user_id' });

        const result = await pool.query(
            'SELECT balance FROM users WHERE user_id = $1',
            [userId]
        );
        res.json({ balance: result.rows[0]?.balance || 0 });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// ============================================
// API: СБОР КРАНА (10-50 🪙, 3 часа)
// ============================================
app.post('/api/claim', async (req, res) => {
    try {
        const userId = req.body.user_id;
        if (!userId) return res.json({ error: 'Нет user_id' });

        const result = await pool.query(
            'SELECT * FROM users WHERE user_id = $1',
            [userId]
        );
        if (result.rows.length === 0) {
            return res.json({ error: 'Пользователь не найден' });
        }

        const user = result.rows[0];
        const now = new Date();
        const lastClaim = new Date(user.last_claim);
        const hoursPassed = (now - lastClaim) / 1000 / 60 / 60;

        if (hoursPassed < 3) {
            const remaining = Math.ceil(3 - hoursPassed);
            return res.json({
                success: false,
                message: `Подожди ещё ${remaining} ч.`,
                waitTime: remaining * 60 * 60 * 1000
            });
        }

        const reward = Math.floor(Math.random() * 41) + 10;
        await pool.query(
            'UPDATE users SET balance = balance + $1, last_claim = NOW() WHERE user_id = $2',
            [reward, userId]
        );

        res.json({ success: true, reward, message: `+${reward} 🪙 получено!` });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// ============================================
// API: ВЫВОД (мин. 10000 🪙 = 10 DOGE)
// ============================================
app.post('/api/withdraw', async (req, res) => {
    try {
        const { user_id, amount, wallet } = req.body;
        if (!user_id || !amount || !wallet) {
            return res.json({ error: 'Заполните все поля' });
        }
        if (amount < 10000) {
            return res.json({ error: 'Мин. вывод 10000 🪙 (10 DOGE)' });
        }

        const balanceResult = await pool.query(
            'SELECT balance FROM users WHERE user_id = $1',
            [user_id]
        );
        if (balanceResult.rows[0].balance < amount) {
            return res.json({ error: 'Недостаточно средств' });
        }

        await pool.query(
            'UPDATE users SET balance = balance - $1, wallet_address = $2 WHERE user_id = $3',
            [amount, wallet, user_id]
        );

        res.json({ success: true, message: '✅ Заявка создана!' });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// ============================================
// API: ВВОД (мин. 10 DOGE)
// ============================================
app.post('/api/deposit', async (req, res) => {
    try {
        const { user_id, amount } = req.body;
        if (!user_id || !amount) {
            return res.json({ error: 'Заполните все поля' });
        }
        if (amount < 10) {
            return res.json({ error: 'Мин. ввод 10 DOGE' });
        }

        const coins = amount * 1000;
        await pool.query(
            'UPDATE users SET balance = balance + $1 WHERE user_id = $2',
            [coins, user_id]
        );

        res.json({ success: true, coins, message: `+${coins} 🪙 зачислено!` });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
(async () => {
    const dbReady = await initDatabase();
    
    app.listen(PORT, () => {
        console.log(`🌐 Сервер запущен на порту ${PORT}`);
        console.log(`🔗 URL: ${process.env.WEB_APP_URL}`);
    });

    // Запускаем бота ТОЛЬКО если база подключилась
    if (dbReady) {
        startBot();
    } else {
        console.log('⚠️ Бот не запущен: ошибка базы данных');
    }
})();
