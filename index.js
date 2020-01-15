 const express = require('express');

const server = express();

// Query params = ?teste=1
// Route params = /users/1
// Request body = { "name": "Diego", "email": "diego@rocketseat.com.br" }


server.get('/users/:id', (req,res) => {
  const nome = req.query.nome;
  const id = req.params.id;

  return res.json({message: `Hello ${id}`});
});

server.listen(3000);