const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { randomUUID } = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

let db = {};
try { db = JSON.parse(fs.readFileSync('db.json', 'utf-8')); } 
catch(e){ db = {}; }

function saveDB() { fs.writeFileSync('db.json', JSON.stringify(db, null, 2)); }

app.post('/register', (req, res) => {
    let token = req.body.token || randomUUID();
    if(!db[token]) db[token] = { coins: 0 };
    saveDB();
    res.json({ token, coins: db[token].coins });
});

app.post('/add', (req,res)=>{
    const { token, amount } = req.body;
    if(!token || !db[token]) return res.json({ error: "Сначала получите токен" });
    db[token].coins += amount || 0;
    saveDB();
    res.json({ coins: db[token].coins });
});

app.get('/coins', (req,res)=>{
    const { token } = req.query;
    if(!token || !db[token]) return res.json({ coins: 0 });
    res.json({ coins: db[token].coins });
});

app.listen(process.env.PORT || 3000, ()=>console.log('Server running'));
