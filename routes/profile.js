const express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:user', function(req, res, next) {
    if(req.session.username && req.session.loggedin) {
        con.query('SELECT * FROM users WHERE user_id = ' +mysql.escape(req.params.user), function (err, result, fields) {
            if (err) throw err;
            res.render('profile.hbs', {title: 'Profile', sessUser: req.session.user, user: result});
        })
    }else{
        res.redirect('/');
    }
});

module.exports = router;
