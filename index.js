// ⚠️ САМОЕ ВАЖНОЕ: Принудительно использовать IPv4 для ВСЕХ DNS-запросов
require('dns').setDefaultResultOrder('ipv4first');

const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔷 ПОДКЛЮЧЕНИЕ К БАЗЕ
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
    // family: 4 больше не нужен, dns.setDefaultResultOrder решает проблему глобально
});

async function testDB() {
    try {
        console.log('🔄 Подключение к БД...');
        await pool.query('SELECT 1');
        console.log('✅ База подключена!');
        return true;
    } catch (e) {
        console.error('❌ Ошибка БД:', e.message);
        return false;
    }
}

async function initDB() {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            user_id BIGINT PRIMARY KEY,
            username TEXT,
            balance BIGINT DEFAULT 0,
            last_claim TIMESTAMP DEFAULT NOW(),
            wallet_address TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )`);
        console.log('✅ Таблица users готова');
    } catch (e) {
        console.error('❌ Ошибка таблицы:', e.message);
    }
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
    const uid = ctx.from.id;
    const un = ctx.from.username || 'User';
    try {
        await pool.query(
            `INSERT INTO users (user_id, username, balance, last_claim) 
             VALUES ($1, $2, 0, NOW() - INTERVAL '3 hours') 
             ON CONFLICT (user_id) DO NOTHING`,
            [uid, un]
        );
        ctx.reply(
            `🐕 *DogePay*\n\n🪙 Баланс: 0\n💱 1000 🪙 = 1 DOGE`,
            { parse_mode: 'Markdown' },
            Markup.keyboard([[Markup.button.webApp('🚀 Открыть', process.env.WEB_APP_URL)]]).resize()
        );
    } catch (e) {
        ctx.reply('❌ Ошибка сервера');
    }
});

bot.command('balance', async (ctx) => {
    try {
        const r = await pool.query('SELECT balance FROM users WHERE user_id = $1', [ctx.from.id]);
        if (!r.rows[0]) return ctx.reply('❌ Нажми /start');
        const b = r.rows[0].balance;
        ctx.reply(`🪙 ${b} коинов\n🐕 ~${(b/1000).toFixed(4)} DOGE`);
    } catch (e) {
        ctx.reply('❌ Ошибка');
    }
});

bot.launch().then(() => console.log('🤖 Бот запущен')).catch(e => console.error('❌ Бот:', e.message));
process.on('SIGINT', () => bot?.stop());
process.on('SIGTERM', () => bot?.stop());

app.get('/api/balance', async (req, res) => {
    try {
        const r = await pool.query('SELECT balance FROM users WHERE user_id = $1', [req.query.user_id]);
        res.json({ balance: r.rows[0]?.balance || 0 });
    } catch (e) { res.json({ error: e.message }); }
});

app.post('/api/claim', async (req, res) => {
    try {
        const uid = req.body.user_id;
        if (!uid) return res.json({ error: 'Нет ID' });
        const r = await pool.query('SELECT * FROM users WHERE user_id = $1', [uid]);
        if (!r.rows[0]) return res.json({ error: 'Не найден' });
        const hours = (new Date() - new Date(r.rows[0].last_claim)) / 36e5;
        if (hours < 3) {
            const w = Math.ceil(3 - hours);
            return res.json({ success: false, message: `Жди ещё ${w} ч.`, waitTime: w * 36e5 });
        }
        const reward = Math.floor(Math.random() * 41) + 10;
        await pool.query('UPDATE users SET balance = balance + $1, last_claim = NOW() WHERE user_id = $2', [reward, uid]);
        res.json({ success: true, reward, message: `+${reward} 🪙` });
    } catch (e) { res.json({ error: e.message }); }
});

app.post('/api/withdraw', async (req, res) => {
    try {
        const { user_id, amount, wallet } = req.body;
        if (!user_id || !amount || !wallet) return res.json({ error: 'Заполни все поля' });
        if (amount < 10000) return res.json({ error: 'Мин. 10000 🪙 (10 DOGE)' });
        const r = await pool.query('SELECT balance FROM users WHERE user_id = $1', [user_id]);
        if (r.rows[0].balance < amount) return res.json({ error: 'Мало средств' });
        await pool.query('UPDATE users SET balance = balance - $1, wallet_address = $2 WHERE user_id = $3', [amount, wallet, user_id]);
        res.json({ success: true, message: '✅ Заявка создана!' });
    } catch (e) { res.json({ error: e.message }); }
});

app.post('/api/deposit', async (req, res) => {
    try {
        const { user_id, amount } = req.body;
        if (!user_id || !amount) return res.json({ error: 'Заполни все поля' });
        if (amount < 10) return res.json({ error: 'Мин. 10 DOGE' });
        await pool.query('UPDATE users SET balance = balance + $1 WHERE user_id = $2', [amount * 1000, user_id]);
        res.json({ success: true, coins: amount * 1000, message: `+${amount*1000} 🪙` });
    } catch (e) { res.json({ error: e.message }); }
});

(async () => {
    const ok = await testDB();
    if (ok) await initDB();
    app.listen(PORT, () => console.log(`🌐 Порт ${PORT} | 🔗 ${process.env.WEB_APP_URL}`));
})();
