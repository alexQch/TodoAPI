var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

sequelize.sync({force: false}).then( ()=>{
    console.log('Everything is synced');

    Todo.findById(3).then( (todo)=>{
        if (todo) {
            console.log(todo.toJSON());
        }else{
            console.log('todo not found');
        }
    });

    /*Todo.create({
        description: 'Walk my dog',
        completed: false
    }).then((todo)=>{
        return Todo.create({
            description: 'Clean trash office',
        })
    }).then( ()=>{
        return Todo.findAll({
            where: {
                description: {
                    $like: '%Office%'
                }
            }
        })
    }).then( (todos)=>{
        if (todos) {
            todos.forEach( (todo)=>{
                console.log(todo.toJSON());
            });
        }else{
            console.log('no TODO found');
        }
    }).catch((e)=>{
        console.log
    });*/
});
