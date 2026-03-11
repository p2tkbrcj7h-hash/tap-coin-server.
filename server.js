const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

let db = {};

try{
db = JSON.parse(fs.readFileSync("db.json","utf8"));
}catch(e){
db = {};
}

function save(){
fs.writeFileSync("db.json",JSON.stringify(db,null,2));
}

app.post("/register",(req,res)=>{
const token = req.body.token;

if(!db[token]){
db[token]={coins:0};
save();
}

res.json({token,coins:db[token].coins});
});

app.get("/coins",(req,res)=>{
const token=req.query.token;

if(!db[token]){
return res.json({coins:0});
}

res.json({coins:db[token].coins});
});

app.post("/add",(req,res)=>{
const token=req.body.token;
const amount=req.body.amount;

if(!db[token]){
db[token]={coins:0};
}

db[token].coins+=amount;

save();

res.json({coins:db[token].coins});
});

app.listen(3000,()=>{
console.log("Server running");
});
