// index.js — DogePay Telegram Mini App Server
// Node.js + Express + Telegraf + PostgreSQL (Neon)
// ✅ БЕЗ dotenv — переменные из Render Environment Variables
// ✅ ИСПРАВЛЕНО: user_id теперь TEXT для поддержки больших Telegram ID

const express = require('express');
const { Telegraf } = require('telegraf');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

// ==================== КОНФИГУРАЦИЯ ====================
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN = crypto.randomBytes(32).toString('hex');

// ==================== ОТЛАДКА ====================
console.log('🔍 DEBUG: Переменные окружения');
console.log('BOT_TOKEN:', process.env.BOT_TOKEN ? '✅ Есть' : '❌ Нет');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Есть' : '❌ Нет');
console.log('WEB_APP_URL:', process.env.WEB_APP_URL || '❌ Нет');
console.log('PORT:', process.env.PORT || '3000 (default)');

// ==================== EXPRESS ====================
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ==================== БАЗА ДАННЫХ ====================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
    console.error('❌ Ошибка PostgreSQL:', err);
});

// Проверка подключения
pool.connect()
    .then(client => {
        console.log('✅ База данных подключена!');
        client.release();
    })
    .catch(err => console.error('❌ Ошибка подключения к БД:', err.message));

// ==================== СОЗДАНИЕ ТАБЛИЦ ====================
const createTables = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 🔥 ИСПРАВЛЕНО: user_id TEXT вместо BIGINT 🔥
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username VARCHAR(255),
                balance BIGINT DEFAULT 0,
                last_claim TIMESTAMP DEFAULT NULL,
                last_ad_reward TIMESTAMP DEFAULT NULL,
                wallet_address TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 🔥 ИСПРАВЛЕНО: user_id TEXT вместо BIGINT 🔥
        await client.query(`
            CREATE TABLE IF NOT EXISTS withdraw_requests (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                amount BIGINT NOT NULL,
                wallet_address TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                approved_at TIMESTAMP DEFAULT NULL
            )
        `);

        // Индексы
        await client.query(`CREATE INDEX IF NOT EXISTS idx_withdraw_status ON withdraw_requests(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_withdraw_user ON withdraw_requests(user_id)`);

        await client.query('COMMIT');
        console.log('✅ Таблицы готовы');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка создания таблиц:', err);
    } finally {
        client.release();
    }
};

// ==================== TELEGRAM БОТ ====================
const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда /start
bot.start(async (ctx) => {
    // 🔥 ИСПРАВЛЕНО: user_id как строка 🔥
    const userId = String(ctx.from.id);
    const username = ctx.from.username || '';
    try {
        await pool.query(
            `INSERT INTO users (user_id, username) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username`,
            [userId, username]
        );
        await ctx.reply(
            `🐕 Добро пожаловать в DogePay!\n\n🪙 Баланс: 0\n💱 1000 🪙 = 1 DOGE`,
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '🚀 Открыть', web_app: { url: process.env.WEB_APP_URL } }]]
                }
            }
        );
    } catch (err) {
        console.error('Ошибка /start:', err);
        ctx.reply('❌ Ошибка сервера');
    }
});

// Команда /balance
bot.command('balance', async (ctx) => {
    try {
        // 🔥 ИСПРАВЛЕНО: user_id как строка 🔥
        const r = await pool.query('SELECT balance FROM users WHERE user_id = $1', [String(ctx.from.id)]);
        const b = r.rows[0]?.balance ?? 0;
        ctx.reply(`🪙 ${b} коинов`);
    } catch (err) { 
        console.error('Ошибка /balance:', err);
        ctx.reply('❌ Ошибка'); 
    }
});

// ==================== ЗАПУСК БОТА (БЕЗОПАСНЫЙ) ====================
let botLaunched = false;

const launchBot = async () => {
    if (botLaunched) {
        console.log('⚠️ Бот уже запущен');
        return;
    }
    
    if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN.includes('123456')) {
        console.error('❌ BOT_TOKEN не настроен! Проверь Render Environment Variables');
        return;
    }
    
    try {
        console.log('🔄 Запуск бота...');
        await bot.launch();
        botLaunched = true;
        console.log('🤖 Telegram бот успешно запущен');
    } catch (err) {
        console.error('❌ Ошибка запуска бота:', err.message);
        console.error('💡 Проверь: 1) BOT_TOKEN 2) Бот активен 3) Сеть Render');
    }
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ====================
const isAdmin = (req) => req.headers.authorization === `Bearer ${ADMIN_TOKEN}`;

// ==================== API: БАЛАНС ====================
app.get('/api/balance', async (req, res) => {
    try {
        // 🔥 ИСПРАВЛЕНО: user_id как строка 🔥
        const userId = String(req.query.user_id);
        const r = await pool.query('SELECT balance FROM users WHERE user_id = $1', [userId]);
        res.json({ success: true, balance: r.rows[0]?.balance ?? 0 });
    } catch (e) { 
        console.error('API /balance error:', e);
        res.status(500).json({ success: false, error: e.message }); 
    }
});

// ==================== 🔥 API: КРАН (10-30 🪙, 30 МИНУТ) 🔥 ====================
app.post('/api/claim', async (req, res) => {
    const client = await pool.connect();
    try {
        // 🔥 ИСПРАВЛЕНО: user_id как строка 🔥
        const user_id = String(req.body.user_id);
        const username = req.body.username;
        
        if (!user_id) return res.status(400).json({ success: false, error: 'Нет user_id' });

        await client.query(
            `INSERT INTO users (user_id, username) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username`,
            [user_id, username || null]
        );

        const check = await client.query('SELECT last_claim, balance FROM users WHERE user_id = $1 FOR UPDATE', [user_id]);
        const lastClaim = check.rows[0]?.last_claim;
        const balance = check.rows[0]?.balance ?? 0;

        // 🔥 ПРОВЕРКА КУЛДАУНА (30 МИНУТ = 1800 СЕК) 🔥
        if (lastClaim) {
            const diff = (new Date() - new Date(lastClaim)) / 1000;
            if (diff < 1800) {
                const wait = Math.ceil(1800 - diff);
                return res.status(429).json({ 
                    success: false, 
                    error: `Жди ${wait} сек`, 
                    waitTime: wait * 1000 
                });
            }
        }

        // Начисление 10-30 🪙
        const reward = Math.floor(Math.random() * 21) + 10;
        await client.query('UPDATE users SET balance = $1, last_claim = NOW() WHERE user_id = $2', [balance + reward, user_id]);
        await client.query('COMMIT');
        
        res.json({ success: true, reward, newBalance: balance + reward });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('API /claim error:', e);
        res.status(500).json({ success: false, error: e.message });
    } finally { 
        client.release(); 
    }
});

// 🔥 НОВЫЙ ЭНДПОИНТ: НАГРАДА ЗА РЕКЛАМУ (5-10 🪙, 10 МИНУТ) 🔥
app.post('/api/ad-reward', async (req, res) => {
    const client = await pool.connect();
    try {
        // 🔥 ИСПРАВЛЕНО: user_id как строка 🔥
        const user_id = String(req.body.user_id);
        const reward = req.body.reward;
        const type = req.body.type;
        
        console.log('📢 Ad reward request:', { user_id, reward, type });
        
        // Валидация
        if (!user_id || !reward) {
            return res.status(400).json({ success: false, error: 'Неверные данные' });
        }
        
        if (reward < 5 || reward > 10) {
            return res.status(400).json({ success: false, error: 'Неверная сумма награды' });
        }
        
        // 🔥 ИСПРАВЛЕНО: user_id как строка 🔥
        const userCheck = await client.query(
            'SELECT user_id, balance, last_ad_reward FROM users WHERE user_id = $1',
            [user_id]
        );
        
        if (userCheck.rows.length === 0) {
            await client.query(
                `INSERT INTO users (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
                [user_id]
            );
        }
        
        // Проверка кулдауна (10 минут = 600 сек)
        const check = await client.query(
            'SELECT balance, last_ad_reward FROM users WHERE user_id = $1 FOR UPDATE',
            [user_id]
        );
        
        const user = check.rows[0];
        const balance = user?.balance ?? 0;
        const lastAdReward = user?.last_ad_reward;
        
        if (lastAdReward) {
            const diff = (new Date() - new Date(lastAdReward)) / 1000;
            if (diff < 600) {
                const wait = Math.ceil(600 - diff);
                return res.status(429).json({ 
                    success: false, 
                    error: `Подождите ${wait} сек`,
                    waitTime: wait * 1000 
                });
            }
        }
        
        // Начисление
        const newBalance = balance + reward;
        
        await client.query(
            'UPDATE users SET balance = $1, last_ad_reward = NOW() WHERE user_id = $2',
            [newBalance, user_id]
        );
        
        await client.query('COMMIT');
        
        console.log(`✅ Ad reward: user ${user_id} +${reward} 🪙 | new balance: ${newBalance}`);
        
        res.json({ 
            success: true, 
            reward, 
            newBalance,
            message: `+${reward} 🪙 зачислено!`
        });
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ API /api/ad-reward error:', err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        client.release();
    }
});

// ==================== API: ВЫВОД ====================
app.post('/api/withdraw', async (req, res) => {
    const client = await pool.connect();
    try {
        // 🔥 ИСПРАВЛЕНО: user_id как строка 🔥
        const user_id = String(req.body.user_id);
        const amount = req.body.amount;
        const wallet_address = req.body.wallet_address;
        
        if (!user_id || !amount || !wallet_address) return res.status(400).json({ success: false, error: 'Заполни все поля' });
        if (amount < 10000) return res.status(400).json({ success: false, error: 'Мин. 10000 🪙' });

        await client.query('BEGIN');
        
        const user = await client.query('SELECT balance FROM users WHERE user_id = $1 FOR UPDATE', [user_id]);
        if (!user.rows[0]) { 
            await client.query('ROLLBACK'); 
            return res.status(404).json({ success: false, error: 'Пользователь не найден' }); 
        }
        if (user.rows[0].balance < amount) { 
            await client.query('ROLLBACK'); 
            return res.status(400).json({ success: false, error: 'Недостаточно средств' }); 
        }

        await client.query('UPDATE users SET balance = balance - $1 WHERE user_id = $2', [amount, user_id]);
        
        const reqRes = await client.query(
            'INSERT INTO withdraw_requests (user_id, amount, wallet_address) VALUES ($1, $2, $3) RETURNING id', 
            [user_id, amount, wallet_address]
        );
        
        await client.query('COMMIT');
        res.json({ success: true, requestId: reqRes.rows[0].id });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('API /withdraw error:', e);
        res.status(500).json({ success: false, error: e.message });
    } finally { 
        client.release(); 
    }
});

// ==================== API: АДМИН ====================

// Логин
app.post('/api/admin/login', (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) {
        res.json({ success: true, token: ADMIN_TOKEN });
    } else {
        res.status(401).json({ success: false, error: 'Неверный пароль' });
    }
});

// Список заявок
app.get('/api/admin/requests', async (req, res) => {
    if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Нет доступа' });
    try {
        const r = await pool.query(`
            SELECT r.id, r.user_id, u.username, r.amount, r.wallet_address, r.created_at 
            FROM withdraw_requests r 
            LEFT JOIN users u ON r.user_id = u.user_id 
            WHERE r.status = 'pending' 
            ORDER BY r.created_at ASC
        `);
        res.json({ success: true, requests: r.rows });
    } catch (e) { 
        console.error('API /admin/requests error:', e);
        res.status(500).json({ success: false, error: e.message }); 
    }
});

// Одобрить
app.post('/api/admin/approve', async (req, res) => {
    if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Нет доступа' });
    try {
        await pool.query("UPDATE withdraw_requests SET status = 'approved', approved_at = NOW() WHERE id = $1", [req.body.requestId]);
        res.json({ success: true });
    } catch (e) { 
        console.error('API /admin/approve error:', e);
        res.status(500).json({ success: false, error: e.message }); 
    }
});

// Отклонить (возврат монет)
app.post('/api/admin/reject', async (req, res) => {
    if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Нет доступа' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const r = await client.query('SELECT user_id, amount, status FROM withdraw_requests WHERE id = $1 FOR UPDATE', [req.body.requestId]);
        
        if (!r.rows[0] || r.rows[0].status !== 'pending') { 
            await client.query('ROLLBACK'); 
            return res.status(400).json({ success: false, error: 'Не найдено или обработано' }); 
        }
        
        await client.query('UPDATE users SET balance = balance + $1 WHERE user_id = $2', [r.rows[0].amount, r.rows[0].user_id]);
        await client.query("UPDATE withdraw_requests SET status = 'rejected' WHERE id = $1", [req.body.requestId]);
        
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('API /admin/reject error:', e);
        res.status(500).json({ success: false, error: e.message });
    } finally { 
        client.release(); 
    }
});

// ==================== ЗАПУСК СЕРВЕРА ====================
const startServer = async () => {
    try {
        await createTables();
        launchBot().catch(err => console.error('❌ launchBot error:', err));
        
        app.listen(PORT, () => {
            console.log(`🚀 Express сервер запущен на порту ${PORT}`);
            console.log(`🌐 URL: ${process.env.WEB_APP_URL}`);
        });
    } catch (err) {
        console.error('❌ Критическая ошибка запуска:', err);
        process.exit(1);
    }
};

startServer();

// ==================== ОСТАНОВКА ====================
process.once('SIGINT', async () => { 
    console.log('🛑 SIGINT received'); 
    if (botLaunched) bot.stop('SIGINT'); 
    await pool.end(); 
    process.exit(0); 
});

process.once('SIGTERM', async () => { 
    console.log('🛑 SIGTERM received'); 
    if (botLaunched) bot.stop('SIGTERM'); 
    await pool.end(); 
    process.exit(0); 
});
