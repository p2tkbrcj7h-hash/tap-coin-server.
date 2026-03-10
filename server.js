// server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Загрузка базы игроков
let db = {};
try {
  db = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
} catch (e) {
  db = {};
}

// Сохраняем базу
function saveDB() {
  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
}

// Регистрация токена
app.post('/register', (req, res) => {
  const { token } = req.body;
  if (!token) return res.json({ error: "Токен не передан" });
  if (!db[token]) db[token] = { coins: 0 }; // если нет, создаём
  saveDB();
  res.json({ token, coins: db[token].coins });
});

// Добавление монет
app.post('/add', (req, res) => {
  const { token, amount } = req.body;
  if (!token || !db[token]) return res.json({ error: "Сначала зарегистрируйтесь" });
  db[token].coins += amount || 0;
  saveDB();
  res.json({ coins: db[token].coins });
});

// Получение монет
app.get('/coins', (req, res) => {
  const { token } = req.query;
  if (!token || !db[token]) return res.json({ coins: 0 });
  res.json({ coins: db[token].coins });
});

// Лидерборд (топ-10)
app.get('/top', (req, res) => {
  const top = Object.entries(db)
    .map(([token, data]) => ({ token, coins: data.coins }))
    .sort((a,b) => b.coins - a.coins)
    .slice(0,10);
  res.json(top);
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
