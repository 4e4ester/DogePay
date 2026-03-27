const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

// ========== НАСТРОЙКИ ==========
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 3000;

// Подключение к PostgreSQL (Render сам добавит DATABASE_URL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ========== СРЕДСТВА ==========
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ========== БАЗА ДАННЫХ ==========
// Создаём таблицу пользователей при запуске
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id BIGINT PRIMARY KEY,
                username TEXT,
                balance BIGINT DEFAULT 0,
                last_claim TIMESTAMP,
                wallet_address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ База данных готова!');
    } catch (err) {
        console.error('❌ Ошибка базы данных:', err);
    }
}

// ========== БОТ TELEGRAM ==========
bot.start((ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    
    // Регистрируем пользователя в базе
    pool.query(
        'INSERT INTO users (user_id, username, balance, last_claim) VALUES ($1, $2, 0, NOW() - INTERVAL \'3 hours\') ON CONFLICT (user_id) DO NOTHING',
        [userId, username]
    );
    
    ctx.reply(
        `🐕 Добро пожаловать в DogePay!\n\n` +
        `🪙 Твой баланс: 0 коинов\n` +
        `💱 Курс: 1000 🪙 = 1 DOGE\n\n` +
        `Нажми кнопку ниже, чтобы открыть ферму! 🚀`,
        Markup.keyboard([
            [Markup.button.webApp('🚀 Открыть DogePay', process.env.WEB_APP_URL || 'https://dogepay.onrender.com')]
        ]).resize()
    );
});

bot.command('balance', (ctx) => {
    const userId = ctx.from.id;
    pool.query('SELECT balance FROM users WHERE user_id = $1', [userId], (err, res) => {
        if (err || res.rows.length === 0) {
            ctx.reply('❌ Пользователь не найден. Нажмите /start');
            return;
        }
        const balance = res.rows[0].balance;
        const doge = (balance / 1000).toFixed(4);
        ctx.reply(`🪙 Твой баланс: ${balance} коинов\n🐕 (~${doge} DOGE)`);
    });
});

bot.launch();
console.log('🤖 Бот запущен!');

// ========== API ДЛЯ МИНИ-АППА ==========

// Получить баланс пользователя
app.get('/api/balance', async (req, res) => {
    const userId = req.query.user_id;
    if (!userId) return res.json({ error: 'Нет user_id' });
    
    try {
        const result = await pool.query('SELECT balance FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.json({ balance: 0 });
        }
        res.json({ balance: result.rows[0].balance });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// Забрать с крана (10-50 коинов, раз в 3 часа)
app.post('/api/claim', async (req, res) => {
    const userId = req.body.user_id;
    if (!userId) return res.json({ error: 'Нет user_id' });
    
    try {
        const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (user.rows.length === 0) {
            return res.json({ error: 'Пользователь не найден' });
        }
        
        const lastClaim = user.rows[0].last_claim;
        const now = new Date();
        const hoursPassed = (now - lastClaim) / 1000 / 60 / 60;
        
        if (hoursPassed < 3) {
            const remaining = Math.ceil(3 - hoursPassed);
            return res.json({ 
                success: false, 
                message: `Подожди ещё ${remaining} ч.`,
                waitTime: remaining * 60 * 60 * 1000
            });
        }
        
        // Рандом от 10 до 50
        const reward = Math.floor(Math.random() * 41) + 10;
        
        await pool.query(
            'UPDATE users SET balance = balance + $1, last_claim = NOW() WHERE user_id = $2',
            [reward, userId]
        );
        
        res.json({ success: true, reward });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// Запрос на вывод средств
app.post('/api/withdraw', async (req, res) => {
    const userId = req.body.user_id;
    const amount = req.body.amount; // в коинах
    const wallet = req.body.wallet;
    
    if (!userId || !amount || !wallet) {
        return res.json({ error: 'Заполните все поля' });
    }
    
    if (amount < 10000) {
        return res.json({ error: 'Мин. вывод 10000 🪙 (10 DOGE)' });
    }
    
    try {
        const user = await pool.query('SELECT balance FROM users WHERE user_id = $1', [userId]);
        if (user.rows[0].balance < amount) {
            return res.json({ error: 'Недостаточно средств' });
        }
        
        await pool.query(
            'UPDATE users SET balance = balance - $1, wallet_address = $2 WHERE user_id = $3',
            [amount, wallet, userId]
        );
        
        // Здесь потом будет логика отправки DOGE через API
        res.json({ success: true, message: 'Заявка создана! Ожидай выплаты.' });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// Запрос на ввод средств
app.post('/api/deposit', async (req, res) => {
    const userId = req.body.user_id;
    const amount = req.body.amount; // в DOGE
    
    if (!userId || !amount) {
        return res.json({ error: 'Заполните все поля' });
    }
    
    if (amount < 10) {
        return res.json({ error: 'Мин. ввод 10 DOGE' });
    }
    
    const coins = amount * 1000;
    
    try {
        await pool.query(
            'UPDATE users SET balance = balance + $1 WHERE user_id = $2',
            [coins, userId]
        );
        
        res.json({ success: true, coins, message: `+${coins} 🪙 зачислено!` });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// ========== ЗАПУСК СЕРВЕРА ==========
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🌐 Сервер запущен на порту ${PORT}`);
    });
});