const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', async (req, res)=>{
  try{
    const { message } = req.body;
    if(!message) return res.status(400).json({error:'No message'});

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization': `Bearer ${process.env.GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          {role:'system', content:'You are Groq Chat Pro - fast, helpful, low data. You are NOT ChatGPT.'},
          {role:'user', content: message}
        ]
      })
    });
    const data = await r.json();
    if(data.error) return res.status(400).json(data);
    res.json({reply: data.choices[0].message.content});
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'public','index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Running on '+PORT));
