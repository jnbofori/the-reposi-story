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


/* GET all posts. */
router.get('/', function(req, res, next) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/');}else {
        let title = req.query.title;
        let publishedAfter = req.query.published_after;
        let publishedBefore = req.query.published_before;

        if (title || publishedAfter || publishedBefore) {
            let nd = ` AND`, end = ` AND`;
            let titlepart = ` title LIKE '%` + title + `%'`;
            let publishedafterPrt = ` publish_date > ` + `'` + publishedAfter + `'`;
            let publishedbeforePrt = ` publish_date < ` + `'` + publishedBefore + `'`;

            if (!title) {
                titlepart = '';
                nd = '';
            }
            if (!publishedAfter) {
                publishedafterPrt = '';
                nd = '';
            }
            if (!publishedBefore) {
                publishedbeforePrt = '';
                end = '';
            }
            if (!title && !publishedAfter) {
                end = '';
            }

            let qry = `SELECT * FROM books WHERE` + titlepart + nd + publishedafterPrt + end + publishedbeforePrt;

            con.query(qry, function (err, result, fields) {
                if (err) throw err;
                res.render('posts/indexPoems', {books: result});
            })
        } else {
            con.query('SELECT * FROM posts', function (err, result, fields) {
                if (err) throw err;
                res.render('posts/indexPoems', {books: result});
            })
        }
    }
});


/* New Book form route */
router.get('/new', function (req, res) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/');}else {
        con.query('SELECT * FROM writers', function (err, result, fields) {
            if (err) throw err;
            res.render('posts/newBook', {authors: result});
        })
    }
});

/* Add new book to database */
router.post('/', function (req, res) {
    upload(req, res, (err) => {
        if(err){
            res.render('posts/newBook',{msg: err});
        }else{
            const fileName = req.file != null ? req.file.filename : null

            let title = req.body.title;
            let author = req.body.author;
            let publish_date = req.body.publish_date;
            let page_count = req.body.page_count;
            let cover = fileName;
            let description = req.body.description;

            if(cover == null){
                res.render('posts/newBook', {msg: 'Error: Wrong file type for Cover Image'});
            }else {
                con.query('INSERT INTO posts(title,description,publish_date,page_count,cover_image_name,author_id) VALUES (?,?,?,?,?,?)',
                    [title, description, publish_date, page_count, cover, author],
                    function (err, result) {
                        if (err) {deleteImage(cover)};
                        res.status(200).redirect('/posts');
                    });
            }
        }
    });
});

/* Show book page */
router.get('/:id', function (req, res) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/');}else {
        let qry = 'SELECT posts.book_id,posts.title,posts.description,posts.publish_date,posts.page_count,posts.cover_image_name,' +
            ' writers.author_name,writers.author_id FROM posts INNER JOIN writers ON writers.author_id = posts.author_id WHERE posts.book_id = ' + req.params.id;
        con.query(qry, function (err, result) {
            if (err) throw err;
            res.render('posts/showBook', {books: result});
        });
    }
});

/*  Edit Book Form Route */
router.get('/:id/edit', (req,res) => {
    if(!req.session.username && !req.session.loggedin){res.redirect('/');}else {
        let qry = 'SELECT posts.book_id,posts.title,posts.description,posts.publish_date,posts.page_count,posts.cover_image_name,' +
            ' writers.author_name,writers.author_id FROM posts INNER JOIN writers ON writers.author_id = posts.author_id WHERE posts.book_id = ' + req.params.id;
        con.query(qry, function (err, result) {
            if (err) throw err;
            res.render('posts/editBook', {results: result});
        });
    }
});

/* Update posts in database */
router.put('/:id', function (req, res) {
    upload(req, res, function (err) {
        if(err){
            res.render('posts/editBook',{msg: err});
        }else{
            const fileName = req.file != null ? req.file.filename : null

            let title = req.body.title;
            let author = req.body.author;
            let publish_date = req.body.publish_date;
            let page_count = req.body.page_count;
            let cover = fileName;
            let description = req.body.description;

            let publishDate_prt = ` publish_date = `+mysql.escape(publish_date)+`,`;
            let coverImg_prt = ` cover_image_name = `+mysql.escape(cover)+`,`;

            if(!publish_date){publishDate_prt='';}
            if(fileName == null || !req.file){coverImg_prt='';}

            let qry = `UPDATE books SET title = `+mysql.escape(title)+ `, description = `+mysql.escape(description)+`,` + publishDate_prt + ` page_count=`+mysql.escape(page_count)+`,`+coverImg_prt+ ` author_id=`+author+`
        WHERE book_id = ` + req.params.id;

            con.query(qry, function(err,result){
                if(err) throw err; //and delete uploaded image
                res.status(200).redirect('/posts/'+req.params.id);
            });
        }
    })
});

/*Delete Book from database*/
router.delete('/:id', (req, res) => {
    con.query('SELECT cover_image_name FROM posts WHERE book_id = '+req.params.id,function(err, result){
        if(err) throw err;

        let filename = result[0].cover_image_name;
        deleteImage(filename);
        con.query('DELETE FROM posts WHERE book_id = ?',[req.params.id],
            function(err,result){
                if(err) throw err;
                res.status(200).redirect('/posts');
            });
    })
});

function deleteImage(filename){
    fs.unlink(path.join('public/images/uploads/',filename), (err)=>{
        if(err) console.error(err)
    })
}


module.exports = router;
