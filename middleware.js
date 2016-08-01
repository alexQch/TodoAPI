module.exports = function(db){
    //define middleware here
    return {
        requireAuthentication: function(req, res, next){
            var token = req.get('Auth');

            db.user.findByToken(token).then( (user)=>{
                req.user = user;
                next();
            }, (e)=>{
                res.status(401).send();
            })
        }
    };
};
