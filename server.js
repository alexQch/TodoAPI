var express = require('express');
var bodyParser = require('body-parser');
var _ = require("underscore");

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

//we apply the body parsre middleware here so that
//express will parse the body for us to access it
//later
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
    res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', (req, res)=>{
    var todoId = parseInt(req.params.id);
    var matchedTodoObj = _.findWhere(todos, { id: todoId });
    console.log(`id: ${todoId}  matchedTodoObj: ${matchedTodoObj}`);

    if (!matchedTodoObj) {
        console.log('matched obj not found!');
        //to send a 404: res.status(404).send();
        res.status(404).send();
    }else{
        // send back json data
        res.json(matchedTodoObj);
    }
});

//POST /todos
app.post('/todos', (req, res)=>{
    var todo = req.body;
    todo.id = todoNextId++;
    todos.push(todo);
    res.json(todo);
});


app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
});
