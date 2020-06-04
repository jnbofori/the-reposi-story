const express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    if(req.session.username && req.session.loggedin) {
        con.query('SELECT * FROM posts INNER JOIN users ON users.user_id = posts.user_id WHERE type = "Poem" ORDER BY created_at DESC LIMIT 4', function (err, result) {
            if (err) throw err;
            con.query('SELECT * FROM posts INNER JOIN users ON users.user_id = posts.user_id WHERE type = "Short Story" ORDER BY created_at DESC LIMIT 4', function (err, reslt) {
                if (err) throw err;
                con.query('SELECT * FROM posts INNER JOIN users ON users.user_id = posts.user_id WHERE type = "Blog" ORDER BY created_at DESC LIMIT 4', function (err, rslt) {
                    if (err) throw err;
                    res.render('home.hbs', {
                        title: 'Home',
                        sessUser: req.session.user,
                        poems: result,
                        shortStories: reslt,
                        blogs: rslt});
                })
            })
        });
    }else{
        res.redirect('/');
    }
});



module.exports = router;
