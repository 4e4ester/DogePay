// ============================================
// DOGEPAY - TELEGRAM MINI APP SERVER
// ============================================

// Подключение библиотек
const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { Pool } = require('pg');
const cors = require('cors');

// Инициализация приложения
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 3000;

// ============================================
// ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ (SUPABASE)
// ============================================
const pool = new Pool({
    host: 'db.xppivwbjpganbkdangmm.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    family: 4  // Принудительно IPv4
});

// ============================================
// СОЗДАНИЕ ТАБЛИЦЫ ПОЛЬЗОВАТЕЛЕЙ
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
    } catch (error) {
        console.error('❌ Ошибка базы данных:', error.message);
    }
}

// ============================================
// НАСТРОЙКА EXPRESS
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================
// TELEGRAM BOT - КОМАНДА /START
// ============================================
bot.start(async (ctx) => {
    try {
        const userId = ctx.from.id;
        const username = ctx.from.username || 'User';

        // Регистрация пользователя в базе
        await pool.query(
            `INSERT INTO users (user_id, username, balance, last_claim) 
             VALUES ($1, $2, 0, NOW() - INTERVAL '3 hours') 
             ON CONFLICT (user_id) DO NOTHING`,
            [userId, username]
        );

        // Отправка приветствия
        ctx.reply(
            `🐕 *DogePay*\n\n` +
            `🪙 Твой баланс: 0 коинов\n` +
            `💱 Курс: 1000 🪙 = 1 DOGE\n\n` +
            `Нажми кнопку ниже 👇`,
            { parse_mode: 'Markdown' },
            Markup.keyboard([
                [Markup.button.webApp('🚀 Открыть DogePay', process.env.WEB_APP_URL)]
            ]).resize()
        );
    } catch (error) {
        console.error('Ошибка /start:', error);
        ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
    }
});

// ============================================
// TELEGRAM BOT - КОМАНДА /BALANCE
// ============================================
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
        const doge = (balance / 1000).toFixed(4);

        ctx.reply(`🪙 Баланс: ${balance} коинов\n🐕 ~${doge} DOGE`);
    } catch (error) {
        console.error('Ошибка /balance:', error);
        ctx.reply('❌ Произошла ошибка.');
    }
});

// Запуск бота
bot.launch();
console.log('🤖 Бот запущен');

// ============================================
// API - ПОЛУЧИТЬ БАЛАНС
// ============================================
app.get('/api/balance', async (req, res) => {
    try {
        const userId = req.query.user_id;

        if (!userId) {
            return res.json({ error: 'Нет user_id' });
        }

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
// API - СБОР КРАНА (10-50 КОИНОВ, 3 ЧАСА)
// ============================================
app.post('/api/claim', async (req, res) => {
    try {
        const userId = req.body.user_id;

        if (!userId) {
            return res.json({ error: 'Нет user_id' });
        }

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

        // Проверка таймера (3 часа)
        if (hoursPassed < 3) {
            const remaining = Math.ceil(3 - hoursPassed);
            return res.json({
                success: false,
                message: `Подожди ещё ${remaining} ч.`,
                waitTime: remaining * 60 * 60 * 1000
            });
        }

        // Генерация награды (10-50 коинов)
        const reward = Math.floor(Math.random() * 41) + 10;

        // Обновление баланса
        await pool.query(
            'UPDATE users SET balance = balance + $1, last_claim = NOW() WHERE user_id = $2',
            [reward, userId]
        );

        res.json({
            success: true,
            reward: reward,
            message: `+${reward} 🪙 получено!`
        });

    } catch (error) {
        res.json({ error: error.message });
    }
});

// ============================================
// API - ВЫВОД СРЕДСТВ (МИН. 10000 КОИНОВ)
// ============================================
app.post('/api/withdraw', async (req, res) => {
    try {
        const { user_id, amount, wallet } = req.body;

        // Проверка полей
        if (!user_id || !amount || !wallet) {
            return res.json({ error: 'Заполните все поля' });
        }

        // Минимальный вывод (10000 коинов = 10 DOGE)
        if (amount < 10000) {
            return res.json({ error: 'Мин. вывод 10000 🪙 (10 DOGE)' });
        }

        // Проверка баланса
        const balanceResult = await pool.query(
            'SELECT balance FROM users WHERE user_id = $1',
            [user_id]
        );

        if (balanceResult.rows[0].balance < amount) {
            return res.json({ error: 'Недостаточно средств' });
        }

        // Списание баланса
        await pool.query(
            'UPDATE users SET balance = balance - $1, wallet_address = $2 WHERE user_id = $3',
            [amount, wallet, user_id]
        );

        res.json({
            success: true,
            message: '✅ Заявка создана! Ожидай выплаты.'
        });

    } catch (error) {
        res.json({ error: error.message });
    }
});

// ============================================
// API - ВВОД СРЕДСТВ (МИН. 10 DOGE)
// ============================================
app.post('/api/deposit', async (req, res) => {
    try {
        const { user_id, amount } = req.body;

        // Проверка полей
        if (!user_id || !amount) {
            return res.json({ error: 'Заполните все поля' });
        }

        // Минимальный ввод (10 DOGE)
        if (amount < 10) {
            return res.json({ error: 'Мин. ввод 10 DOGE' });
        }

        // Конвертация: 1 DOGE = 1000 коинов
        const coins = amount * 1000;

        // Начисление на баланс
        await pool.query(
            'UPDATE users SET balance = balance + $1 WHERE user_id = $2',
            [coins, user_id]
        );

        res.json({
            success: true,
            coins: coins,
            message: `+${coins} 🪙 зачислено!`
        });

    } catch (error) {
        res.json({ error: error.message });
    }
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🌐 Сервер запущен на порту ${PORT}`);
        console.log(`🔗 URL: ${process.env.WEB_APP_URL}`);
    });
});
