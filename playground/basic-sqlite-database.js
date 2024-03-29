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


var User = sequelize.define('user', {
    email: Sequelize.STRING
});


Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
    //force: true
}).then( ()=>{
    console.log('Everything is synced');

    User.findById(1).then( (user)=>{
        //find the todos associated with user
        user.getTodos({
            where: {
                completed: true
            }
        }).then(( todos )=>{
            todos.forEach( (todo)=>{
                console.log(todo.toJSON());
            });
        })
    })
    /*User.create({
        email: 'alex.qch@live.com'
    }).then( ()=>{
        return Todo.create({
            description: 'Clean yard'
        });
    }).then((todo)=>{
        //associate user with todo
        User.findById(1).then( (user)=>{
            user.addTodo(todo);
        })
    })*/
});
