var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

//depend on the environment, set up the correct database for use
if (env === 'production') {
    sequelize = neew Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres'
    });
}else{
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });
}


var db = {};

// this import func  can load in sequelize models from separate files
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
