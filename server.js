// server.js
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
app.use(express.json());

// База данных игроков
let db = {};
try { 
  db = JSON.parse(fs.readFileSync('db.json', 'utf-8')); 
} catch(e){ 
  db = {}; 
}

function saveDB(){
  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
}

// Обновление игрока
function updatePlayer(id, coinsToAdd = 0){
  if(!db[id]) db[id] = { coins: 0 };
  db[id].coins += coinsToAdd;
  saveDB();
  return db[id].coins;
}

// Лидерборд
function getLeaderboard(top=5){
  const sorted = Object.entries(db).sort((a,b) => b[1].coins - a[1].coins);
  return sorted.slice(0, top)
    .map(([id, data], i) => `${i+1}. ${id}: ${data.coins}💰`)
    .join('\n');
}

// Отправка сообщения
async function sendMessage(chatId, text){
  await fetch(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({chat_id: chatId, text})
  });
}

// Вебхук для Telegram
app.post('/webhook', async (req,res)=>{
  const msg = req.body.message;
  if(!msg) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const text = msg.text;

  if(text === "/coin"){
    // Начисляем монету
    const coins = updatePlayer(chatId, 1);
    await sendMessage(chatId, `💰 Вы получили 1 монету!\nВсего: ${coins}💰`);

  } else if(text === "/leaderboard"){
    const board = getLeaderboard();
    await sendMessage(chatId, board ? "🏆 Лидерборд:\n"+board : "Пока нет игроков");

  } else {
    await sendMessage(chatId, "Выберите действие:\n/coin - монета\n/leaderboard - лидерборд");
  }

  res.sendStatus(200);
});

// Запуск сервера
app.listen(process.env.PORT || 3000, ()=>console.log("Server running"));
