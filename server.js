// server.js
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
app.use(express.json());

// База данных
let db = {};
try { 
  db = JSON.parse(fs.readFileSync('db.json', 'utf-8')); 
} catch(e){ 
  db = {}; 
}

function saveDB(){ 
  fs.writeFileSync('db.json', JSON.stringify(db, null, 2)); 
}

function updatePlayer(id, coinsToAdd = 0){
  if(!db[id]) db[id] = { coins: 0 };
  db[id].coins += coinsToAdd;
  saveDB();
  return db[id].coins;
}

function getLeaderboard(top = 5){
  const sorted = Object.entries(db)
    .sort((a, b) => b[1].coins - a[1].coins);
  return sorted
    .slice(0, top)
    .map(([id, data], i) => `${i+1}. ${id}: ${data.coins}💰`)
    .join('\n');
}

// Отправка сообщений в Telegram
async function sendMessage(chatId, text){
  await fetch(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

// Webhook для бота
app.post('/webhook', async (req, res) => {
  const msg = req.body.message;
  if(!msg) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const text = msg.text;

  if(text === "/coin"){
    // Добавляем 1 монету
    const coins = updatePlayer(chatId, 1);
    await sendMessage(chatId, `💰 Вы получили 1 монету!\nВсего: ${coins}💰`);

    // Шанс появления сундука
    const rnd = Math.random();
    
    if(rnd < 0.05){ // обычный сундук
      for(let i=0;i<3;i++){
        await new Promise(r=>setTimeout(r, 300));
        await sendMessage(chatId, "🟫"); // подпрыгивание
      }
      const bonus = Math.floor(Math.random()*231)+20;
      const total = updatePlayer(chatId, bonus);
      await sendMessage(chatId, `🎉 Вы открыли обычный сундук и получили ${bonus}💰!\nВсего: ${total}💰`);
      
    } else if(rnd < 0.01){ // золотой сундук
      for(let i=0;i<3;i++){
        await new Promise(r=>setTimeout(r, 300));
        await sendMessage(chatId, "🟨"); // подпрыгивание
      }
      const bonus = Math.floor(Math.random()*501)+500;
      const total = updatePlayer(chatId, bonus);
      await sendMessage(chatId, `🌟 ЗОЛОТОЙ сундук! Вы получили ${bonus}💰!\nВсего: ${total}💰`);
    }

  } else if(text === "/leaderboard"){
    const board = getLeaderboard();
    await sendMessage(chatId, board ? "🏆 Лидерборд:\n" + board : "Пока нет игроков");
  } else {
    await sendMessage(chatId, "Выберите действие:\n/coin - монета\n/leaderboard - лидерборд");
  }

  res.sendStatus(200);
});

// Запуск сервера
app.listen(process.env.PORT || 3000, () => console.log("Server running"));
