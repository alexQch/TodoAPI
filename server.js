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
    var todo = _.pick(req.body, 'description', 'completed');
    //use _.pick to only pick description and completed
    if ( !_.isBoolean(todo.completed)
        || !_.isString(todo.description)
        || todo.description.trim().length === 0)
    {
        return res.status(400).send();
    }

    //update body.description to the trim value
    todo.description = todo.description.trim();
    todo.id = todoNextId++;
    todos.push(todo);
    res.json(todo);
});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res)=>{
    //this step is important!!
    //we need to assure that the id is an number!
    var targetId = parseInt(req.params.id);
    //get the todo id
    //find the todo obj based on id
    var matchedTodoObj = _.findWhere(todos, { id: targetId});
    
    if (!matchedTodoObj) {
        res.status(404).json("error": "no todo foudn");
    }

    //remove it from todos using _.without
    todos = _.without(todos, matchedTodoObj);
    //return the deleted obj
    res.json(matchedTodoObj);
});


app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
});
