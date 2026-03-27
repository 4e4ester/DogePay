require('dns').setDefaultResultOrder('ipv4first');

const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 3000;

// 🔷 БАЗА ДАННЫХ (Neon)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testDB() {
    try {
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
        
        await pool.query(`CREATE TABLE IF NOT EXISTS deposit_requests (
            id SERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            tx_hash TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            coins BIGINT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            approved_at TIMESTAMP
        )`);
        
        console.log('✅ Таблицы готовы');
    } catch (e) {
        console.error('❌ Ошибка таблиц:', e.message);
    }
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 🔷 БОТ
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
        ctx.reply('❌ Ошибка');
    }
});

bot.command('balance', async (ctx) => {
    const r = await pool.query('SELECT balance FROM users WHERE user_id = $1', [ctx.from.id]);
    if (!r.rows[0]) return ctx.reply('❌ Нажми /start');
    const b = r.rows[0].balance;
    ctx.reply(`🪙 ${b} коинов\n🐕 ~${(b/1000).toFixed(4)} DOGE`);
});

bot.launch().then(() => console.log('🤖 Бот запущен')).catch(e => console.error('❌ Бот:', e.message));
process.on('SIGINT', () => bot?.stop());
process.on('SIGTERM', () => bot?.stop());

// 🔷 API: БАЛАНС
app.get('/api/balance', async (req, res) => {
    try {
        const r = await pool.query('SELECT balance FROM users WHERE user_id = $1', [req.query.user_id]);
        res.json({ balance: r.rows[0]?.balance || 0 });
    } catch (e) { res.json({ error: e.message }); }
});

// 🔷 API: КРАН
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

// 🔷 API: ВЫВОД
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

// 🔷 API: АДМИН ЛОГИН
app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        if (password === 'admin123') {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: 'Неверный пароль' });
        }
    } catch (e) { res.json({ error: e.message }); }
});

// 🔷 API: АДМИН - ЗАЯВКИ
app.get('/api/admin/requests', async (req, res) => {
    try {
        const pending = await pool.query("SELECT * FROM deposit_requests WHERE status = 'pending' ORDER BY created_at DESC");
        const approved = await pool.query("SELECT * FROM deposit_requests WHERE status = 'approved' ORDER BY approved_at DESC LIMIT 10");
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM deposit_requests WHERE status = 'pending') as pending,
                (SELECT COUNT(*) FROM deposit_requests WHERE status = 'approved') as total_deposits
        `);
        res.json({ pending: pending.rows, approved: approved.rows, stats: stats.rows[0] });
    } catch (e) { res.json({ error: e.message }); }
});

// 🔷 API: АДМИН - ОДОБРИТЬ
app.post('/api/admin/approve', async (req, res) => {
    try {
        const { request_id } = req.body;
        const reqData = await pool.query('SELECT * FROM deposit_requests WHERE id = $1', [request_id]);
        if (reqData.rows.length === 0) return res.json({ error: 'Заявка не найдена' });
        const deposit = reqData.rows[0];
        const coins = Math.floor(deposit.amount * 1000);
        await pool.query('UPDATE users SET balance = balance + $1 WHERE user_id = $2', [coins, deposit.user_id]);
        await pool.query("UPDATE deposit_requests SET status = 'approved', coins = $1, approved_at = NOW() WHERE id = $2", [coins, request_id]);
        res.json({ success: true });
    } catch (e) { res.json({ error: e.message }); }
});

// 🔷 API: АДМИН - ОТКЛОНИТЬ
app.post('/api/admin/reject', async (req, res) => {
    try {
        const { request_id } = req.body;
        await pool.query("UPDATE deposit_requests SET status = 'rejected' WHERE id = $1", [request_id]);
        res.json({ success: true });
    } catch (e) { res.json({ error: e.message }); }
});

// 🔷 ЗАПУСК
(async () => {
    const ok = await testDB();
    if (ok) await initDB();
    app.listen(PORT, () => console.log(`🌐 Порт ${PORT} | 🔗 ${process.env.WEB_APP_URL}`));
})();
