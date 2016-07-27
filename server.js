var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
    id: 1,
    description: 'Meet mom for lunch',
    completed: false
}, {
    id: 2,
    description: 'Go to market',
    completed: false
}, {
    id: 3,
    description: 'Feed the cat',
    completed: true
}];

app.get('/', function (req, res) {
    res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
    res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', (req, res)=>{
    var todoId = req.params.id;
    var matchedTodoObj;
    //iterate over todo array and find a match
    todos.forEach( (curVal)=>{
        console.log(curVal.id);
        if (curVal.id === todoId) {
            console.log('matched todo obj found');
            matchedTodoObj = curVal;
        }
    });

    if (!matchedTodoObj) {
        console.log('matched obj not found!');
        //to send a 404: res.status(404).send();
        res.status(404).send();
    }else{
        // send back json data
        res.json(matchedTodoObj);
    }
});

app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
});
