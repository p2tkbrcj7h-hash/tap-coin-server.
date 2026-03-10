const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let db = {};
try { db = JSON.parse(fs.readFileSync('db.json', 'utf-8')); } 
catch(e){ db = {}; }

function saveDB() { fs.writeFileSync('db.json', JSON.stringify(db, null, 2)); }

// Регистрация
app.post('/register', (req, res) => {
    const { login, password } = req.body;
    if(!login || !password) return res.json({ error: "Введите логин и пароль" });
    if(db[login]) return res.json({ error: "Пользователь уже существует" });
    db[login] = { password, coins: 0 };
    saveDB();
    res.json({ coins: 0 });
});

// Вход
app.post('/login', (req, res) => {
    const { login, password } = req.body;
    if(!db[login] || db[login].password !== password) return res.json({ error: "Неверный логин или пароль" });
    res.json({ coins: db[login].coins });
});

// Добавление монет
app.post('/add', (req, res) => {
    const { login, amount } = req.body;
    if(!login || !db[login]) return res.json({ error: "Сначала войдите" });
    db[login].coins += amount || 0;
    saveDB();
    res.json({ coins: db[login].coins });
});

// Получение монет
app.get('/coins', (req, res) => {
    const { login } = req.query;
    if(!login || !db[login]) return res.json({ coins: 0 });
    res.json({ coins: db[login].coins });
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));
