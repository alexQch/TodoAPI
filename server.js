var express = require('express');
var bodyParser = require('body-parser');
var _ = require("underscore");
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

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
app.get('/todos', middleware.requireAuthentication, function (req, res) {
    var query = req.query; //an obj which has all the queries
    var where = {
        userId: req.user.get('id')
    };

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
app.get('/todos/:id', middleware.requireAuthentication, (req, res)=>{
    var todoId = parseInt(req.params.id);

    var where = {
        userId: req.user.get('id'),
        id: todoId
    }

    db.todo.findOne({where: where}).then( (todo)=>{
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
app.post('/todos', middleware.requireAuthentication, (req, res)=>{

    //call create on db.todo
    var body = _.pick(req.body, 'description', 'completed');
    db.todo.create(body).then( (todo)=>{
        //create the association here by addTodo
        req.user.addTodo(todo).then( ()=>{
            console.log(todo.toJSON());
            //the ref todo here is different than what we have in database
            return todo.reload();
        }).then( (todo)=>{
            res.json(todo.toJSON());
        });
    }).catch( (e)=>{
        res.status(400).json(e);
    });
    //  if sucessful then respond 200 and todo object
    //  if failed return the error obj by res.status(400).json(e)
});

//POST /users to add user into database
app.post('/users', (req, res)=>{
    var user = _.pick(req.body, 'email', 'password');
    db.user.create(user).then( (user)=>{
        res.json(user.toPublicJSON());
    }, (e)=>{
        res.status(400).send(e);
    }).catch( (e)=>{
        res.status(400).send(e);
    });
})
// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, (req, res)=>{
    //this step is important!!
    //we need to assure that the id is an number!
    //get the todo id
    var targetId = parseInt(req.params.id);

    db.todo.destroy({
        where: {
            id: targetId,
            userId: req.user.get('id')
        }
    }).then( (num)=>{
        console.log('Delete item num: ' + num);
        if (num === 1) {
            res.status(200).send( 'item deleted');
        }else if(num === 0){
            //204 means everything works fine
            //and we don't have anything to return
            res.status(204).send('item not  found!');
        }
    }, (e)=>{
        res.status(500).send();
    });

});

//PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, (req, res)=>{
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};
    var todoId = parseInt(req.params.id);

    //validation using hasOwnProperty('property') returns a boolean
    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findOne( {
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then( (todo)=>{
            if (todo) {
                return todo.update(attributes)
                    .then( (todo)=>{
                        res.json(todo.toJSON());
                    }, (e) =>{
                        res.status(400).send(e);
                    });
            }else{
                res.status(404).send();
            }
        }, ()=>{
            res.status(500).send();
        })
});


// POST /users/login
app.post('/users/login', (req, res)=>{
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then((user)=>{
        var token = user.generateToken('authentication');
        userInstance = user;
        return db.token.create({
            token: token
        })
    }).then( (tokenInstance)=>{
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch( (e)=>{
        res.status(401).send();
    });
});

//DELETE /users/login
app.delete('/users/login',middleware.requireAuthentication, (req, res)=>{
    req.token.destroy().then( ()=>{
        res.status(204).send();
    }).catch( (e)=>{
        res.status(500).send();
    });
});

db.sequelize.sync({force: true}).then( ()=>{
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
});

