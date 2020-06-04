const express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    if(req.session.username && req.session.loggedin) {
        con.query('SELECT * FROM users WHERE user_id = ' +mysql.escape(req.session.user), function (err, result) {
            if (err) throw err;
            con.query('SELECT * FROM posts WHERE user_id = ' + mysql.escape(req.session.user), function (err, reslt) {
                if (err) throw err;
                con.query(`SELECT COUNT(likes.post_id) AS NumberOfLikes FROM posts INNER JOIN likes ON likes.post_id = posts.post_id WHERE posts.user_id = ?`,
                    [req.session.user], function (err, rslt) {
                        res.render('profile/profile', {
                            title: 'Profile',
                            user: result,
                            posts: reslt,
                            likes: rslt,
                            noOfPosts: reslt.length,
                            sessUser: req.session.user
                        });
                    })
            });
        })
    }else{
        res.redirect('/');
    }
});


router.get('/numberOfLikes', function (req, res) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/');}else{
        con.query(`SELECT COUNT(likes.post_id) AS NumberOfLikes FROM posts INNER JOIN likes ON likes.post_id = posts.post_id WHERE posts.user_id = ?`,
            [req.session.user], function (err, result) {

            })
    }
});

// SELECT COUNT(post_id) AS NumberOfLikes FROM likes WHERE post_id = ?

//SELECT * FROM likes INNER JOIN posts ON posts.post_id = likes.post_id WHERE posts.user_id = 2;

//SELECT * FROM posts INNER JOIN likes ON likes.post_id = posts.post_id WHERE posts.user_id = 3


module.exports = router;
