// index.js — DogePay Telegram Mini App Server
// Node.js + Express + Telegraf + PostgreSQL (Neon)
// ✅ УБРАЛ dotenv — работает напрямую с Render

const express = require('express');
const { Telegraf } = require('telegraf');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

// ==================== КОНФИГУРАЦИЯ ====================
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'admin123';
const ADMIN_TOKEN = crypto.randomBytes(32).toString('hex');

// ==================== ИНИЦИАЛИЗАЦИЯ EXPRESS ====================
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ==================== ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ ====================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
    console.error('❌ Неожиданная ошибка PostgreSQL:', err);
    process.exit(1);
});

// ==================== СОЗДАНИЕ ТАБЛИЦ ====================
const createTables = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id BIGINT PRIMARY KEY,
                username VARCHAR(255),
                balance BIGINT DEFAULT 0,
                last_claim TIMESTAMP DEFAULT NULL,
                wallet_address TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS withdraw_requests (
                id SERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                amount BIGINT NOT NULL,
                wallet_address TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                approved_at TIMESTAMP DEFAULT NULL
            )
        `);

        await client.query(`CREATE INDEX IF NOT EXISTS idx_withdraw_requests_status ON withdraw_requests(status)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_withdraw_requests_user_id ON withdraw_requests(user_id)`);

        await client.query('COMMIT');
        console.log('✅ Таблицы созданы / проверены');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Ошибка создания таблиц:', err);
        throw err;
    } finally {
        client.release();
    }
};

// ==================== TELEGRAM БОТ ====================
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || '';
    try {
        await pool.query(
            `INSERT INTO users (user_id, username) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username`,
            [userId, username]
        );
        const webAppUrl = process.env.WEB_APP_URL;
        await ctx.reply(
            `🐕 Добро пожаловать в DogePay!\n\nЗдесь вы можете получать криптовалюту в кране и выводить её.\n\nНажмите кнопку ниже, чтобы открыть Mini App.`,
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '🚀 Открыть Mini App', web_app: { url: webAppUrl } }]]
                }
            }
        );
    } catch (err) {
        console.error('Ошибка в /start:', err);
        await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
    }
});

bot.command('balance', async (ctx) => {
    const userId = ctx.from.id;
    try {
        const result = await pool.query(`SELECT balance FROM users WHERE user_id = $1`, [userId]);
        const balance = result.rows[0]?.balance ?? 0;
        await ctx.reply(`💰 Ваш баланс: ${balance} 🪙`);
    } catch (err) {
        console.error('Ошибка в /balance:', err);
        await ctx.reply('❌ Не удалось получить баланс. Попробуйте позже.');
    }
});

let botLaunched = false;
const launchBot = async () => {
    if (botLaunched) return;
    try {
        await bot.launch();
        botLaunched = true;
        console.log('🤖 Telegram бот запущен');
    } catch (err) {
        console.error('❌ Ошибка запуска бота:', err);
        throw err;
    }
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
const isAdmin = (req) => {
    const authHeader = req.headers.authorization;
    return authHeader === `Bearer ${ADMIN_TOKEN}`;
};

// ==================== API ENDPOINTS ====================

app.get('/api/balance', async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ success: false, error: 'user_id is required' });
        const result = await pool.query(`SELECT balance FROM users WHERE user_id = $1`, [user_id]);
        const balance = result.rows[0]?.balance ?? 0;
        res.json({ success: true, balance });
    } catch (err) {
        console.error('API /balance error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.post('/api/claim', async (req, res) => {
    const client = await pool.connect();
    try {
        const { user_id, username } = req.body;
        if (!user_id) return res.status(400).json({ success: false, error: 'user_id is required' });

        await client.query(
            `INSERT INTO users (user_id, username) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username`,
            [user_id, username || null]
        );

        const claimCheck = await client.query(`SELECT last_claim, balance FROM users WHERE user_id = $1 FOR UPDATE`, [user_id]);
        const lastClaim = claimCheck.rows[0]?.last_claim;
        const currentBalance = claimCheck.rows[0]?.balance ?? 0;

        if (lastClaim) {
            const now = new Date();
            const lastClaimDate = new Date(lastClaim);
            const diffSeconds = (now - lastClaimDate) / 1000;
            if (diffSeconds < 60) {
                const waitSeconds = Math.ceil(60 - diffSeconds);
                return res.status(429).json({ success: false, error: `Подождите ${waitSeconds} секунд`, nextClaimIn: waitSeconds });
            }
        }

        const amount = Math.floor(Math.random() * (30 - 10 + 1) + 10);
        const newBalance = currentBalance + amount;
        const now = new Date();

        await client.query(`UPDATE users SET balance = $1, last_claim = $2 WHERE user_id = $3`, [newBalance, now, user_id]);
        await client.query('COMMIT');
        res.json({ success: true, amount, newBalance, nextClaimTime: now.getTime() + 60000 });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('API /claim error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        client.release();
    }
});

app.post('/api/withdraw', async (req, res) => {
    const client = await pool.connect();
    try {
        const { user_id, amount, wallet_address } = req.body;
        if (!user_id || !amount || !wallet_address) return res.status(400).json({ success: false, error: 'Missing required fields' });
        if (amount < 1) return res.status(400).json({ success: false, error: 'Amount must be positive' });

        await client.query('BEGIN');
        const userRes = await client.query(`SELECT balance FROM users WHERE user_id = $1 FOR UPDATE`, [user_id]);
        if (userRes.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ success: false, error: 'User not found' }); }
        const currentBalance = userRes.rows[0].balance;
        if (currentBalance < amount) { await client.query('ROLLBACK'); return res.status(400).json({ success: false, error: 'Insufficient balance' }); }

        await client.query(`UPDATE users SET balance = balance - $1 WHERE user_id = $2`, [amount, user_id]);
        const insertRes = await client.query(`INSERT INTO withdraw_requests (user_id, amount, wallet_address) VALUES ($1, $2, $3) RETURNING id`, [user_id, amount, wallet_address]);
        const requestId = insertRes.rows[0].id;

        await client.query('COMMIT');
        res.json({ success: true, requestId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('API /withdraw error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        client.release();
    }
});

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) res.json({ success: true, token: ADMIN_TOKEN });
    else res.status(401).json({ success: false, error: 'Invalid password' });
});

app.get('/api/admin/requests', async (req, res) => {
    if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
    try {
        const result = await pool.query(`SELECT r.id, r.user_id, u.username, r.amount, r.wallet_address, r.created_at FROM withdraw_requests r LEFT JOIN users u ON r.user_id = u.user_id WHERE r.status = 'pending' ORDER BY r.created_at ASC`);
        res.json({ success: true, requests: result.rows });
    } catch (err) {
        console.error('API /admin/requests error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.post('/api/admin/approve', async (req, res) => {
    if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const client = await pool.connect();
    try {
        const { requestId } = req.body;
        if (!requestId) return res.status(400).json({ success: false, error: 'requestId is required' });
        await client.query('BEGIN');
        const check = await client.query(`SELECT status FROM withdraw_requests WHERE id = $1 FOR UPDATE`, [requestId]);
        if (check.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ success: false, error: 'Request not found' }); }
        if (check.rows[0].status !== 'pending') { await client.query('ROLLBACK'); return res.status(400).json({ success: false, error: 'Request already processed' }); }
        await client.query(`UPDATE withdraw_requests SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = $1`, [requestId]);
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('API /admin/approve error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        client.release();
    }
});

app.post('/api/admin/reject', async (req, res) => {
    if (!isAdmin(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const client = await pool.connect();
    try {
        const { requestId } = req.body;
        if (!requestId) return res.status(400).json({ success: false, error: 'requestId is required' });
        await client.query('BEGIN');
        const reqData = await client.query(`SELECT user_id, amount, status FROM withdraw_requests WHERE id = $1 FOR UPDATE`, [requestId]);
        if (reqData.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ success: false, error: 'Request not found' }); }
        if (reqData.rows[0].status !== 'pending') { await client.query('ROLLBACK'); return res.status(400).json({ success: false, error: 'Request already processed' }); }
        const { user_id, amount } = reqData.rows[0];
        await client.query(`UPDATE users SET balance = balance + $1 WHERE user_id = $2`, [amount, user_id]);
        await client.query(`UPDATE withdraw_requests SET status = 'rejected' WHERE id = $1`, [requestId]);
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('API /admin/reject error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// ==================== ЗАПУСК СЕРВЕРА ====================
const startServer = async () => {
    try {
        await createTables();
        await launchBot();
        app.listen(PORT, () => {
            console.log(`🚀 Express сервер запущен на порту ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Критическая ошибка при запуске:', err);
        process.exit(1);
    }
};

startServer();

// ==================== GRACEFUL SHUTDOWN ====================
const shutdown = async (signal) => {
    console.log(`🛑 ${signal} получен, закрываем соединения...`);
    if (botLaunched) bot.stop(signal);
    await pool.end();
    process.exit(0);
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
