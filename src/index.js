const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find(user => user.username === username);

  if(!userExists){
    return response.status(404).json({
      error:"User not found"
    });
  }

  request.username = username;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({
      error:"Username already used"
    });
  }

  const user = {
    id:uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const todos = users.find(user => user.username === username).todos;

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  const todo = { 
    id: uuidv4(), 
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  const userIndex = users.findIndex(user => user.username === username);

  users[userIndex].todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const user = users.find(user => user.username === username);

  const userIndex = users.findIndex(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({
      error:"Todo not found"
    });
  }

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  users[userIndex].todos[todoIndex] = {
    ...todo,
    title,
    deadline
  }

  return response.status(200).json({
    ...todo,
    title,
    deadline
  })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find(user => user.username === username);

  const userIndex = users.findIndex(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({
      error:"Todo not found"
    });
  }

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  users[userIndex].todos[todoIndex] = {
    ...todo,
   done:true
  }

  return response.status(200).json({
    ...todo,
    done:true
  })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find(user => user.username === username);

  const userIndex = users.findIndex(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({
      error:"Todo not found"
    });
  }

  const todosUpdateList = users[userIndex].todos.filter(todo => todo.id !== id);

  users[userIndex].todos = todosUpdateList;

  return response.status(204).send()
});

module.exports = app;