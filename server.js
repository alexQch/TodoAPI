var express = require('express');
var bodyParser = require('body-parser');
var _ = require("underscore");
var db = require('./db.js');

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
// GET /todos?key=value
app.get('/todos', function (req, res) {
    var queryParams = req.query; //an obj which has all the queries
    //if no query params, simply return the whole array
    var filteredTodos = todos;
    if ( queryParams.hasOwnProperty('completed')
        && queryParams.completed === 'true'
    ){
            filteredTodos = _.where(todos, {completed : true});
    }else if ( queryParams.hasOwnProperty('completed')
                && queryParams.completed === 'false'
    ){
            filteredTodos = _.where(todos, {completed : false});
    }

    if ( queryParams.hasOwnProperty('q')){
        var q = queryParams.q.trim();
        if (q.length > 0) {
            filteredTodos = _.filter(filteredTodos, (todo)=>{
                if (todo.description.toLowerCase().indexOf(q.toLowerCase()) > -1) {
                    return true;
                }else{
                    return false;
                }
            });
        }
    }
    res.json(filteredTodos);

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
        res.status(404).json({"error": "no todo found"});
    }

    //remove it from todos using _.without
    todos = _.without(todos, matchedTodoObj);
    //return the deleted obj
    res.json(matchedTodoObj);
});

//PUT /todos/:id
app.put('/todos/:id', (req, res)=>{
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};
    var todoId = parseInt(req.params.id);
    var matchedTodoObj = _.findWhere(todos, { id: todoId });

    //if there's on matched todo return 404
    if (!matchedTodoObj) {
        return res.status(404).send();
    }

    //validation using hasOwnProperty('property') returns a boolean
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    }else if( body.hasOwnProperty('completed')){
        res.status(400).send();
    }else{
        // never provided attribute, no problem here
    }

    if (body.hasOwnProperty('description')
        && _.isString(body.description)
        && body.description.trim().length > 0
    ) {
        validAttributes.description = body.description;
    }else if( body.hasOwnProperty('description')){
        res.status(400).send();
    }

    // HERE do update by _.extend
    // objects in javascript are passed by reference
    _.extend(matchedTodoObj, validAttributes);
    res.json(matchedTodoObj);

});

db.sequelize.sync().then( ()=>{
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
});

