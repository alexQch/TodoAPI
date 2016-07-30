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
    var query = req.query; //an obj which has all the queries
    var where = {};

    if ( query.hasOwnProperty('completed')
        && query.completed === 'true'
    ){
        where.completed = true;
    }else if ( query.hasOwnProperty('completed')
                && query.completed === 'false'
    ){
        where.completed = false;
    }

    if ( query.hasOwnProperty('q')){
        var q = query.q.trim();
        if (q.length > 0) {
            where.description  = {
                $like: `%${q}%`
            }
        }
    }

    console.log('where: ');
    console.log(where);

    db.todo.findAll({
        where: where
    }).then( (todos)=>{
        if (!!todos) {
            res.json(todos);
        }else{
            res.status(404).send();
        }
    }, (e)=>{
        res.status(500).send();
    });

});

// GET /todos/:id
app.get('/todos/:id', (req, res)=>{
    var todoId = parseInt(req.params.id);

    db.todo.findById(todoId).then( (todo)=>{
        if (!!todo) {
            res.json(todo.toJSON());
        }else{
            res.status(404).send();
        }
    }, (e)=>{
        res.status(404).json(e);
    });
});

//POST /todos
app.post('/todos', (req, res)=>{

    //call create on db.todo
    var todo = _.pick(req.body, 'description', 'completed');
    db.todo.create(todo).then( (todo)=>{
        res.json(todo.toJSON());
    }).catch( (e)=>{
        res.status(400).json(e);
    });
    //  if sucessful then respond 200 and todo object
    //  if failed return the error obj by res.status(400).json(e)
});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res)=>{
    //this step is important!!
    //we need to assure that the id is an number!
    //get the todo id
    var targetId = parseInt(req.params.id);

    db.todo.destroy({
        where: {
            id: targetId
        }
    }).then( (num)=>{
        console.log('Delete item num: ' + num);
        if (num === 1) {
            res.status(200).send( 'item deleted');
        }else if(num === 0){
            //204 means everything works fine 
            //and we don't have anything to return
            res.status(204).send('item found!');
        }
    }, (e)=>{
        res.status(500).send();
    });

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

