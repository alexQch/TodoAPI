var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function( sequelize, DataTypes ){
    var user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: { //a random characters to be used before hash
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function(value){
                //generate the hashed password
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);

                //store all necessary values
                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    },{
        hooks: {
            beforeValidate: function(user, options){
                // user.email
                if (typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function(body){
                return new Promise( (resolve, reject)=>{
                    if (typeof body.email === 'string'
                        && body.email.trim().length > 0
                        && typeof body.password === 'string'
                        && body.password.trim().length > 0
                    ) {
                        //find one which takes the serach query then return
                        //fetch user account using db.user.findOne...
                        user.findOne({
                            where: {
                                email: body.email,
                            }
                        }).then((user) =>{
                            if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                                return reject();
                            }
                            resolve(user);
                        }, (e)=>{
                            return reject();
                        });
                    }else{
                        return reject();
                    }
                });
            },
            findByToken: function(token){
                return new Promise( (resolve, reject)=>{
                    try {
                        //decrypt the JWT code
                        var decodedJWT = jwt.verify(token, 'qwerty098');
                        //decrypt the data
                        var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#');
                        var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

                        user.findById(tokenData.id).then( (user)=>{
                            if (user) {
                                resolve(user);
                            }else{
                                reject();
                            }
                        }, (e)=>{
                            reject();
                        });
                    } catch (e) {
                        reject();
                    }
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function () {
                var json = this.toJSON();
                return _.pick(json, "id", "email", "updatedAt", "createdAt")
            },
            generateToken: function(type){
                if (!_.isString(type)) {
                    return undefined;
                }

                try {
                    var stringData = JSON.stringify({id: this.get('id'), type: type});
                    var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#').toString();
                    var token = jwt.sign({
                        token: encryptedData,
                    }, 'qwerty098'); //this string is the JWT password

                    return token;
                } catch (e) {
                    /* handle error */
                    console.error(e);
                    return undefined;
                }
            }
        }
    });
    return user;
}
