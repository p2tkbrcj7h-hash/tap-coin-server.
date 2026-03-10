// server.js
const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

let db = {};
try { 
  db = JSON.parse(fs.readFileSync('db.json', 'utf-8')); 
} catch(e){ 
  db = {}; 
}

function saveDB() {
  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
}

// обновление игрока по токену
function updatePlayer(token, coinsToAdd = 0){
  if(!db[token]) db[token] = { coins: 0 };
  db[token].coins += coinsToAdd;
  saveDB();
  return db[token].coins;
}

// лидерборд
function getLeaderboard(top=5){
  const sorted = Object.entries(db).sort((a,b) => b[1].coins - a[1].coins);
  return sorted.slice(0, top)
    .map(([token, data], i) => `${i+1}. ${token}: ${data.coins}💰`)
    .join('\n');
}

// регистрация нового токена
app.post('/register', (req,res)=>{
  const { token } = req.body;
  if(!token) return res.status(400).json({error:'Token required'});
  if(!db[token]) db[token] = { coins:0 };
  saveDB();
  res.json({ token, coins: db[token].coins });
});

// получить количество монет
app.get('/coins', (req,res)=>{
  const token = req.query.token;
  if(!token || !db[token]) return res.status(400).json({ error: 'Invalid token' });
  res.json({ coins: db[token].coins });
});

// добавить монеты
app.post('/add', (req,res)=>{
  const { token, amount } = req.body;
  if(!token || !db[token]) return res.status(400).json({ error: 'Invalid token' });
  const coins = updatePlayer(token, Number(amount) || 0);
  res.json({ coins });
});

// лидерборд
app.get('/leaderboard', (req,res)=>{
  res.json({ leaderboard: getLeaderboard() });
});

app.listen(process.env.PORT || 3000, ()=>console.log("Server running"));
