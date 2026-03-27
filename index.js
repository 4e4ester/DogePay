const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const cors = require('cors');

// ========== НАСТРОЙКИ ==========
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 3000;

// Подключение к MongoDB
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('✅ MongoDB подключена!'))
    .catch(err => console.error('❌ Ошибка MongoDB:', err));

// Схема пользователя в базе данных
const userSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, unique: true },
    username: String,
    balance: { type: Number, default: 0 },
    last_claim: { type: Date, default: () => new Date(Date.now() - 3 * 60 * 60 * 1000) },
    wallet_address: String,
    created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ========== СРЕДСТВА ==========
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ========== БОТ TELEGRAM ==========
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    
    await User.findOneAndUpdate(
        { user_id: userId },
        { username },
        { upsert: true, new: true }
    );
    
    ctx.reply(
        `🐕 Добро пожаловать в DogePay!\n\n` +
        `🪙 Твой баланс: 0 коинов\n` +
        `💱 Курс: 1000 🪙 = 1 DOGE\n\n` +
        `Нажми кнопку ниже, чтобы открыть ферму! 🚀`,
        Markup.keyboard([
            [Markup.button.webApp('🚀 Открыть DogePay', process.env.WEB_APP_URL)]
        ]).resize()
    );
});

bot.command('balance', async (ctx) => {
    const userId = ctx.from.id;
    const user = await User.findOne({ user_id: userId });
    
    if (!user) {
        ctx.reply('❌ Пользователь не найден. Нажмите /start');
        return;
    }
    
    const doge = (user.balance / 1000).toFixed(4);
    ctx.reply(`🪙 Твой баланс: ${user.balance} коинов\n🐕 (~${doge} DOGE)`);
});

bot.launch();
console.log('🤖 Бот запущен!');

// ========== API ДЛЯ МИНИ-АППА ==========

// Получить баланс пользователя
app.get('/api/balance', async (req, res) => {
    const userId = req.query.user_id;
    if (!userId) return res.json({ error: 'Нет user_id' });
    
    try {
        const user = await User.findOne({ user_id: userId });
        res.json({ balance: user ? user.balance : 0 });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// Забрать с крана (10-50 коинов, раз в 3 часа)
app.post('/api/claim', async (req, res) => {
    const userId = req.body.user_id;
    if (!userId) return res.json({ error: 'Нет user_id' });
    
    try {
        const user = await User.findOne({ user_id: userId });
        if (!user) {
            return res.json({ error: 'Пользователь не найден' });
        }
        
        const now = new Date();
        const lastClaim = user.last_claim || new Date(0);
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
        
        user.balance += reward;
        user.last_claim = now;
        await user.save();
        
        res.json({ success: true, reward, newBalance: user.balance });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// Запрос на вывод средств
app.post('/api/withdraw', async (req, res) => {
    const userId = req.body.user_id;
    const amount = req.body.amount;
    const wallet = req.body.wallet;
    
    if (!userId || !amount || !wallet) {
        return res.json({ error: 'Заполните все поля' });
    }
    
    if (amount < 10000) {
        return res.json({ error: 'Мин. вывод 10000 🪙 (10 DOGE)' });
    }
    
    try {
        const user = await User.findOne({ user_id: userId });
        if (!user || user.balance < amount) {
            return res.json({ error: 'Недостаточно средств' });
        }
        
        user.balance -= amount;
        user.wallet_address = wallet;
        await user.save();
        
        res.json({ success: true, message: 'Заявка создана! Ожидай выплаты.' });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// Запрос на ввод средств
app.post('/api/deposit', async (req, res) => {
    const userId = req.body.user_id;
    const amount = req.body.amount;
    
    if (!userId || !amount) {
        return res.json({ error: 'Заполните все поля' });
    }
    
    if (amount < 10) {
        return res.json({ error: 'Мин. ввод 10 DOGE' });
    }
    
    const coins = amount * 1000;
    
    try {
        const user = await User.findOne({ user_id: userId });
        if (!user) {
            return res.json({ error: 'Пользователь не найден' });
        }
        
        user.balance += coins;
        await user.save();
        
        res.json({ success: true, coins, newBalance: user.balance, message: `+${coins} 🪙 зачислено!` });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// ========== ЗАПУСК СЕРВЕРА ==========
app.listen(PORT, () => {
    console.log(`🌐 Сервер запущен на порту ${PORT}`);
});
