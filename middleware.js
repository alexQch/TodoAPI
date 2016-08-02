var cryptojs = require('crypto-js');

module.exports = function(db){
    //define middleware here
    return {
        requireAuthentication: function(req, res, next){
            var token = req.get('Auth') || '';

            db.token.findOne({
                where: {
                    tokenHash: cryptojs.MD5(token).toString()
                }
            }).then( (tokenInstance)=>{
                if (!tokenInstance) {
                    throw new Error('no token instance found!');
                }
                req.token = tokenInstance;

                return db.user.findByToken(token);
            }).then( (user)=>{
                req.user = user;
                next();
            }).catch( (e)=>{
                res.status(401).send(e);
            });
        }
    };
};
