 const express = require('express');

const server = express();
server.use(express.json());

// Query params = ?teste=1
// Route params = /users/1
// Request body = { "name": "Diego", "email": "diego@rocketseat.com.br" }


 const users = ['Diego','Claudio','Victor'];
server.get('/users/:id', (req,res) => {
  const {id} = req.params;

  return res.json(users[id]);
});
server.get('/users', (req,res) => {

  return res.json(users);
});

server.post('/users',(req,res) => {

  const {name} = req.body;

  users.push(name);

  return res.json(users);

});

server.put('/users/:index', (req,res) => {
  const {index} = req.params;
  const {name} = req.body;

  users[index] = name;

  return res.json(users);

});

server.delete('/users/:index', (req,res) => {
  const {index } = req.params;

  users.splice(index,1);

  return res.json(users);

 });

server.listen(3000);