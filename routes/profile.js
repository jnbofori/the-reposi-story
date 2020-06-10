const express = require('express');

var router = express.Router();

/* GET profile page. */
router.get('/', function(req, res) {
    if(req.session.username && req.session.loggedin) {
        con.query('SELECT * FROM users WHERE user_id = ' +mysql.escape(req.session.user), function (err, result) {
            if (err) throw err;
            con.query('SELECT * FROM posts WHERE user_id = ' + mysql.escape(req.session.user), function (err, reslt) {
                if (err) throw err;
                con.query(`SELECT COUNT(likes.post_id) AS NumberOfLikes FROM posts INNER JOIN likes ON likes.post_id = posts.post_id WHERE posts.user_id = ?`,
                    [req.session.user], function (err, rslt) {
                        res.render('profile/profile', {
                            title: `${result[0].fullname} - Profile`,
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



module.exports = router;
