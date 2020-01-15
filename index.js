 const express = require('express');

const server = express();
server.use(express.json());

// Query params = ?teste=1
// Route params = /users/1
// Request body = { "name": "Diego", "email": "diego@rocketseat.com.br" }


const users = ['Diego','Claudio','Victor'];

server.use((req,res, next) => {
  console.log(`Metodo ${req.method}; URL ${req.url}`);

  return next();

});

function checkUserExists(req,res,next){
  if(!req.body.name){
    return res.status(400).json({error: 'User not found on request body'});
  }

  return next;
}

function checkUserInArray(req,res,next){
  const user = users[req.params.index];

  if(!users[req.params.index]){
    return res.status(400).json({error: 'User does not exist'});
  }

  req.user = user;
  return next();
}

server.get('/users/:index', checkUserInArray,(req,res) => {
    return res.json(req.user);
});
server.get('/users', (req,res) => {

  return res.json(users);
});

server.post('/users',checkUserExists,(req,res) => {

  const {name} = req.body;

  users.push(name);

  return res.json(users);

});

server.put('/users/:index',checkUserInArray,checkUserExists, (req,res) => {
  const {index} = req.params;
  const {name} = req.body;

  users[index] = name;

  return res.json(users);

});

server.delete('/users/:index',checkUserInArray, (req,res) => {
  const {index } = req.params;

  users.splice(index,1);

  return res.json(users);

 });

server.listen(3000);