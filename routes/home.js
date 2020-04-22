const express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.username && req.session.loggedin) {
        con.query('SELECT * FROM books ORDER BY created_at DESC LIMIT 12', function (err, result, fields) {
            if (err) throw err;
            res.render('home.hbs', {title: 'Home', sessUser: req.session.username, books: result});
        })
    }else{
        res.redirect('/');
    }
});

module.exports = router;
