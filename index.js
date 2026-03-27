const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 3000;

// 🔷 ПОДКЛЮЧЕНИЕ К SUPABASE (IPv4 принудительно)
const pool = new Pool({
    host: 'db.xppivwbjpganbkdangmm.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    family: 4
});

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
        console.log('✅ Таблица users создана!');
    } catch (err) {
        console.error('❌ Ошибка БД:', err);
    }
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    await pool.query(
        `INSERT INTO users (user_id, username, balance, last_claim) 
         VALUES ($1, $2, 0, NOW() - INTERVAL '3 hours') 
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, ctx.from.username]
    );
    ctx.reply(
        `🐕 DogePay\n\n🪙 Баланс: 0\n💱 1000 🪙 = 1 DOGE`,
        Markup.keyboard([[Markup.button.webApp('🚀 Открыть', process.env.WEB_APP_URL)]]).resize()
    );
});

bot.command('balance', async (ctx) => {
    const result = await pool.query('SELECT balance FROM users WHERE user_id = $1', [ctx.from.id]);
    if (result.rows.length === 0) return ctx.reply('❌ Нажми /start');
    const b = result.rows[0].balance;
    ctx.reply(`🪙 ${b} коинов\n🐕 ~${(b/1000).toFixed(4)} DOGE`);
});

bot.launch();
console.log('🤖 Бот запущен!');

app.get('/api/balance', async (req, res) => {
    const r = await pool.query('SELECT balance FROM users WHERE user_id = $1', [req.query.user_id]);
    res.json({ balance: r.rows[0]?.balance || 0 });
});

app.post('/api/claim', async (req, res) => {
    const r = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.body.user_id]);
    if (!r.rows[0]) return res.json({ error: 'Не найден' });
    const hours = (new Date() - new Date(r.rows[0].last_claim)) / 1000 / 60 / 60;
    if (hours < 3) return res.json({ success: false, message: `Жди ещё ${Math.ceil(3-hours)} ч.` });
    const reward = Math.floor(Math.random() * 41) + 10;
    await pool.query('UPDATE users SET balance = balance + $1, last_claim = NOW() WHERE user_id = $2', [reward, req.body.user_id]);
    res.json({ success: true, reward });
});

app.post('/api/withdraw', async (req, res) => {
    const { user_id, amount, wallet } = req.body;
    if (!user_id || !amount || !wallet) return res.json({ error: 'Заполни все поля' });
    if (amount < 10000) return res.json({ error: 'Мин. 10000 🪙 (10 DOGE)' });
    const r = await pool.query('SELECT balance FROM users WHERE user_id = $1', [user_id]);
    if (r.rows[0].balance < amount) return res.json({ error: 'Недостаточно' });
    await pool.query('UPDATE users SET balance = balance - $1, wallet_address = $2 WHERE user_id = $3', [amount, wallet, user_id]);
    res.json({ success: true, message: 'Заявка создана!' });
});

app.post('/api/deposit', async (req, res) => {
    const { user_id, amount } = req.body;
    if (!user_id || !amount) return res.json({ error: 'Заполни все поля' });
    if (amount < 10) return res.json({ error: 'Мин. 10 DOGE' });
    await pool.query('UPDATE users SET balance = balance + $1 WHERE user_id = $2', [amount * 1000, user_id]);
    res.json({ success: true, coins: amount * 1000 });
});

initDB().then(() => {
    app.listen(PORT, () => console.log(`🌐 Порт ${PORT}`));
});
