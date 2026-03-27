// ========== ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ==========
const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { Pool } = require('pg');
const cors = require('cors');

// ========== НАСТРОЙКИ СЕРВЕРА ==========
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 3000;

// ========== ПОДКЛЮЧЕНИЕ К SUPABASE (PostgreSQL) ==========
const pool = new Pool({
    // Берем ссылку из настроек Render
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // ⚠️ ВАЖНО: Принудительно указываем правильный хост (замени на свой!)
    host: 'db.xppivwbjpganbkdangmm.supabase.co', 
    // Принудительно используем IPv4 (это исправляет ошибку ENETUNREACH)
    family: 4 
});

// ========== СОЗДАНИЕ ТАБЛИЦЫ В БАЗЕ ДАННЫХ ==========
async function initDB() {
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
        console.log('✅ Таблица users создана в Supabase!');
    } catch (err) {
        console.error('❌ Ошибка базы данных:', err);
    }
}

// ========== НАСТРОЙКИ EXPRESS ==========
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ========== БОТ TELEGRAM ==========

// Команда /start
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    
    // Сохраняем пользователя в базе (если новый)
    await pool.query(
        `INSERT INTO users (user_id, username, balance, last_claim) 
         VALUES ($1, $2, 0, NOW() - INTERVAL '3 hours') 
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, username]
    );
    
    ctx.reply(
        `🐕 Добро пожаловать в DogePay!\n\n` +
        `🪙 Твой баланс: 0 коинов\n` +
        `💱 Курс: 1000 🪙 = 1 DOGE\n\n` +
        `Нажми кнопку, чтобы открыть ферму! 🚀`,
        Markup.keyboard([
            [Markup.button.webApp('🚀 Открыть DogePay', process.env.WEB_APP_URL)]
        ]).resize()
    );
});

// Команда /balance
bot.command('balance', async (ctx) => {
    const userId = ctx.from.id;
    const result = await pool.query(
        'SELECT balance FROM users WHERE user_id = $1', 
        [userId]
    );
    
    if (result.rows.length === 0) {
        ctx.reply('❌ Пользователь не найден. Нажмите /start');
        return;
    }
    
    const balance = result.rows[0].balance;
    const doge = (balance / 1000).toFixed(4);
    ctx.reply(`🪙 Твой баланс: ${balance} коинов\n🐕 (~${doge} DOGE)`);
});

// Запуск бота
bot.launch();
console.log('🤖 Бот запущен!');

// ========== API ДЛЯ МИНИ-АППА ==========

// 📊 Получить баланс пользователя
app.get('/api/balance', async (req, res) => {
    const userId = req.query.user_id;
    if (!userId) return res.json({ error: 'Нет user_id' });
    
    try {
        const result = await pool.query(
            'SELECT balance FROM users WHERE user_id = $1', 
            [userId]
        );
        res.json({ balance: result.rows[0]?.balance || 0 });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// 🚰 Забрать с крана (10-50 коинов, раз в 3 часа)
app.post('/api/claim', async (req, res) => {
    const userId = req.body.user_id;
    if (!userId) return res.json({ error: 'Нет user_id' });
    
    try {
        // Получаем данные пользователя
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
        
        // Проверяем таймер 3 часа
        if (hoursPassed < 3) {
            const remaining = Math.ceil(3 - hoursPassed);
            return res.json({ 
                success: false, 
                message: `Подожди ещё ${remaining} ч.`,
                waitTime: remaining * 60 * 60 * 1000
            });
        }
        
        // Генерируем награду 10-50 коинов
        const reward = Math.floor(Math.random() * 41) + 10;
        
        // Обновляем баланс и время сбора
        await pool.query(
            'UPDATE users SET balance = balance + $1, last_claim = NOW() WHERE user_id = $2',
            [reward, userId]
        );
        
        res.json({ 
            success: true, 
            reward: reward, 
            message: `+${reward} 🪙 получено!` 
        });
        
    } catch (err) {
        res.json({ error: err.message });
    }
});

// 💸 Запрос на вывод средств
app.post('/api/withdraw', async (req, res) => {
    const userId = req.body.user_id;
    const amount = req.body.amount; // в коинах
    const wallet = req.body.wallet; // адрес DOGE
    
    // Проверка полей
    if (!userId || !amount || !wallet) {
        return res.json({ error: 'Заполните все поля' });
    }
    
    // Мин. вывод 10000 коинов = 10 DOGE
    if (amount < 10000) {
        return res.json({ error: 'Мин. вывод 10000 🪙 (10 DOGE)' });
    }
    
    try {
        // Проверяем баланс
        const result = await pool.query(
            'SELECT balance FROM users WHERE user_id = $1', 
            [userId]
        );
        
        if (result.rows[0].balance < amount) {
            return res.json({ error: 'Недостаточно средств' });
        }
        
        // Списываем баланс и сохраняем адрес кошелька
        await pool.query(
            'UPDATE users SET balance = balance - $1, wallet_address = $2 WHERE user_id = $3',
            [amount, wallet, userId]
        );
        
        // Здесь потом будет автоматическая отправка DOGE
        res.json({ 
            success: true, 
            message: '✅ Заявка создана! Ожидай выплаты.' 
        });
        
    } catch (err) {
        res.json({ error: err.message });
    }
});

// 💰 Запрос на ввод средств (тестовый режим)
app.post('/api/deposit', async (req, res) => {
    const userId = req.body.user_id;
    const amount = req.body.amount; // в DOGE
    
    if (!userId || !amount) {
        return res.json({ error: 'Заполните все поля' });
    }
    
    // Мин. ввод 10 DOGE
    if (amount < 10) {
        return res.json({ error: 'Мин. ввод 10 DOGE' });
    }
    
    // Конвертируем: 1 DOGE = 1000 коинов
    const coins = amount * 1000;
    
    try {
        await pool.query(
            'UPDATE users SET balance = balance + $1 WHERE user_id = $2',
            [coins, userId]
        );
        
        res.json({ 
            success: true, 
            coins: coins, 
            message: `+${coins} 🪙 зачислено!` 
        });
        
    } catch (err) {
        res.json({ error: err.message });
    }
});

// ========== ЗАПУСК СЕРВЕРА ==========
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🌐 Сервер запущен на порту ${PORT}`);
        console.log(`🔗 Supabase подключен!`);
    });
});
