require('dns').setDefaultResultOrder('ipv4first');

const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 3000;

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
            last_ads TIMESTAMP DEFAULT NOW() - INTERVAL '1 hour',
            wallet_address TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )`);
        
        await pool.query(`CREATE TABLE IF NOT EXISTS withdraw_requests (
            id SERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL,
            amount BIGINT NOT NULL,
            wallet_address TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
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

bot.start(async (ctx) => {
    const uid = ctx.from.id;
    const un = ctx.from.username || 'User';
    try {
        await pool.query(
            `INSERT INTO users (user_id, username, balance, last_claim, last_ads) 
             VALUES ($1, $2, 0, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour') 
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

app.post('/api/ads-reward', async (req, res) => {
    try {
        const uid = req.body.user_id;
        if (!uid) return res.json({ error: 'Нет ID' });
        const r = await pool.query('SELECT * FROM users WHERE user_id = $1', [uid]);
        if (!r.rows[0]) return res.json({ error: 'Не найден' });
        const hours = (new Date() - new Date(r.rows[0].last_ads)) / 36e5;
        if (hours < 1) {
            const w = Math.ceil(1 - hours);
            return res.json({ success: false, message: `Жди ещё ${w} ч.`, waitTime: w * 36e5 });
        }
        const reward = Math.floor(Math.random() * 16) + 5;
        await pool.query('UPDATE users SET balance = balance + $1, last_ads = NOW() WHERE user_id = $2', [reward, uid]);
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
        await pool.query('UPDATE users SET balance = balance - $1 WHERE user_id = $2', [amount, user_id]);
        await pool.query('INSERT INTO withdraw_requests (user_id, amount, wallet_address) VALUES ($1, $2, $3)', [user_id, amount, wallet]);
        res.json({ success: true, message: '✅ Заявка создана! Ожидай проверки.' });
    } catch (e) { res.json({ error: e.message }); }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        if (password === 'admin123') res.json({ success: true });
        else res.json({ success: false, error: 'Неверный пароль' });
    } catch (e) { res.json({ error: e.message }); }
});

app.get('/api/admin/requests', async (req, res) => {
    try {
        const pending = await pool.query("SELECT * FROM withdraw_requests WHERE status = 'pending' ORDER BY created_at DESC");
        const approved = await pool.query("SELECT * FROM withdraw_requests WHERE status = 'approved' ORDER BY approved_at DESC LIMIT 10");
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM withdraw_requests WHERE status = 'pending') as pending,
                (SELECT COUNT(*) FROM withdraw_requests WHERE status = 'approved') as total_withdraws
        `);
        res.json({ pending: pending.rows, approved: approved.rows, stats: stats.rows[0] });
    } catch (e) { res.json({ error: e.message }); }
});

app.post('/api/admin/approve', async (req, res) => {
    try {
        const { request_id } = req.body;
        await pool.query("UPDATE withdraw_requests SET status = 'approved', approved_at = NOW() WHERE id = $1", [request_id]);
        res.json({ success: true });
    } catch (e) { res.json({ error: e.message }); }
});

app.post('/api/admin/reject', async (req, res) => {
    try {
        const { request_id } = req.body;
        const reqData = await pool.query('SELECT * FROM withdraw_requests WHERE id = $1', [request_id]);
        if (reqData.rows.length > 0) {
            const withdraw = reqData.rows[0];
            await pool.query('UPDATE users SET balance = balance + $1 WHERE user_id = $2', [withdraw.amount, withdraw.user_id]);
        }
        await pool.query("UPDATE withdraw_requests SET status = 'rejected' WHERE id = $1", [request_id]);
        res.json({ success: true });
    } catch (e) { res.json({ error: e.message }); }
});

(async () => {
    const ok = await testDB();
    if (ok) await initDB();
    app.listen(PORT, () => console.log(`🌐 Порт ${PORT} | 🔗 ${process.env.WEB_APP_URL}`));
})();
