const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
var router = express.Router();

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];

const storage = multer.diskStorage({
    destination: './public/images/uploads/',
    filename: function(req, file, cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
        cb(null, imageMimeTypes.includes(file.mimetype))
    }
}).single('cover');


// /* New Book form route */
router.get('/new', function (req, res) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/');}else {
        res.render('posts/newPosts', {sessUser: req.session.user});
    }
});


/* GET all posts. */
router.get('/:type', function(req, res) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/');}else {
        let search = req.query.search;
        let type = setType(req.params.type);
        if (search) {
            let searchQuery = '%' + search + '%';
            let qry = `SELECT * FROM posts INNER JOIN users ON users.user_id = posts.user_id WHERE type = ${mysql.escape(type)}
             AND (title LIKE ${mysql.escape(searchQuery)} OR content LIKE ${mysql.escape(searchQuery)})`;

            con.query(qry, function (err, result) {
                if (err) throw err;
                res.render(`posts/${req.params.type}Index`, {results: result, sessUser: req.session.user});
            })
        } else {
            con.query(`SELECT * FROM posts INNER JOIN users ON users.user_id = posts.user_id WHERE type = ${mysql.escape(type)}`, function (err, result) {
                if (err) throw err;
                res.render(`posts/${req.params.type}Index`, {title: type, results: result, sessUser: req.session.user});
            })
        }
    }
});


/* Add new book to database */
router.post('/', function (req, res) {
    upload(req, res, (err) => {
        if(err){
            res.render('posts/newPosts',{msg: err, sessUser: req.session.user});
        }else{
            const fileName = req.file != null ? req.file.filename : null;

            let title = req.body.title;
            let type = req.body.type;
            let cover = fileName;
            let excerpt = req.body.excerpt;
            let content = req.body.content;
            let userID = req.session.user;

            if(cover == null){
                res.render('posts/newPosts', {msg: 'Error: Wrong/Nofile type for Cover Image', sessUser: req.session.user});
            }else {
                con.query('INSERT INTO posts(title,type,content,excerpt,cover_image_name,user_id) VALUES (?,?,?,?,?,?)',
                    [title, type, content, excerpt, cover, userID],
                    function (err) {
                        if (err) {deleteImage(cover)}
                        res.status(200).redirect(`/profile/${userID}`);
                    });
            }
        }
    });
});


/* Show post page */
router.get('/:id/show', function (req, res) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/');}else {
        let qry = `SELECT * FROM posts INNER JOIN users ON users.user_id = posts.user_id WHERE posts.post_id = ${req.params.id}`;
        con.query(qry, function (err, result) {
            if (err) throw err;
            con.query(`SELECT COUNT(post_id) AS NumberOfLikes FROM likes WHERE post_id = ?`, [req.params.id],
                function (err, reslt) {
                if (err) throw err;
                con.query(`SELECT * FROM comments INNER JOIN users ON users.user_id = comments.user_id WHERE post_id = ?`,[req.params.id],
                    function (err, rslt) {
                    if (err) throw err;
                    res.render('posts/showPost', {
                        title: `View Post`,
                        posts: result,
                        sessUser: req.session.user,
                        likes: reslt,
                        comments: rslt});
                })
            })
        });
    }
});


/*  Edit Posts Form Route */
router.get('/:id/edit', (req,res) => {
    if(!req.session.username && !req.session.loggedin){res.redirect('/');}else {
        let qry = 'SELECT * FROM posts INNER JOIN users ON users.user_id = posts.user_id WHERE posts.post_id = ' + req.params.id;
        con.query(qry, function (err, result) {
            if (err) throw err;
            res.render('posts/editPosts', {results: result, sessUser: req.session.user});
        });
    }
});


/* Update posts in database */
router.put('/:id', function (req, res) {
    upload(req, res, function (err) {
        if(err){
            res.render('posts/editPosts',{msg: err, sessUser: req.session.user});
        }else{
            const fileName = req.file != null ? req.file.filename : null;

            let title = req.body.title;
            let type = req.body.type;
            let cover = fileName;
            let excerpt = req.body.excerpt;
            let content = req.body.content;

            let coverImg_prt = `, cover_image_name = ${mysql.escape(cover)}`;

            if(fileName == null || !req.file){coverImg_prt='';}

            let qry = `UPDATE posts SET title = ${mysql.escape(title)}, type = ${mysql.escape(type)}, 
            content = ${mysql.escape(content)}, excerpt = ${mysql.escape(excerpt)}${coverImg_prt} WHERE post_id = ${req.params.id}`;

            con.query(qry, function(err){
                if(err) throw err; //and delete uploaded image
                res.status(200).redirect(`/posts/${req.params.id}/show`);
            });
        }
    })
});


/*Delete Post from database*/
router.delete('/:id', (req, res) => {
    con.query('SELECT cover_image_name FROM posts WHERE post_id = '+req.params.id,function(err, result){
        if(err) throw err;

        let filename = result[0].cover_image_name;

        con.query('DELETE FROM posts WHERE post_id = ?',[req.params.id],
            function(err){
                if(err) throw err;
                deleteImage(filename);
                res.status(200).redirect(`/profile/${req.session.user}`);
            });
    })
});


/* route to like post */
router.post('/:id/like', (req, res) =>{
    con.query('SELECT * FROM likes WHERE post_id = ? AND user_id =?', [req.params.id, req.session.user],
        function (err, result) {
        if (result.length > 0){
            con.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [req.params.id, req.session.user],
                function () {
                    res.end();
                })
        }else {
            con.query('INSERT INTO likes(post_id,user_id) VALUES (?,?)', [req.params.id, req.session.user],
                function (err, reslt) {
                    if(err) throw err;
                    res.send(reslt);
                })
        }
        })
});


/* check if user has liked post */
router.get('/:id/checklike', function (req, res) {
    con.query(`SELECT * FROM likes WHERE post_id = ? AND user_id = ?`, [req.params.id, req.session.user],
        function (err, result) {
            if(result.length > 0){
                res.send(result)
            }else {
                res.end;
            }
        })
});


/* comment on post */
router.post('/:id/comment', function (req, res) {
    let postId = req.params.id;
    let comment = req.body.comment;
    let userId = req.session.user;
    console.log(userId);

    con.query(`INSERT INTO comments(post_id,comment,user_id) VALUES (?,?,?)`, [postId, comment, userId],
        function (err, result) {
        if(err) throw err;
        res.status(200).redirect(`/posts/${postId}/show`);
        })
});


function deleteImage(filename){
    fs.unlink(path.join('public/images/uploads/',filename), (err)=>{
        if(err) console.error(err)
    })
}

function setType(params){
    let type;
    if(params === 'poems'){
        type = 'Poem';
    }else if(params === 'stories'){
        type = 'Short Story'
    }else if(params === 'blogs'){
        type = 'Blog'
    }else {
        type = 'Other'
    }
    return type;
}


module.exports = router;
