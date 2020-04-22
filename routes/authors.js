const express = require('express');
var router = express.Router();

/* GET all authors. */
router.get('/', function(req, res, next) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        if (req.query.name != null && req.query.name !== '') {
            let authorName = req.query.name;
            con.query(`SELECT * FROM authors WHERE author_name LIKE '%` + authorName + `%'`,
                function (err, result) {
                    if (err) throw err;
                    console.log(result);
                    res.render('authors/indexAuthor', {authors: result})
                })
        } else {
            con.query('SELECT * FROM authors', function (err, result) {
                if (err) throw err;
                console.log(result);
                res.render('authors/indexAuthor', {authors: result});
            })
        }
    }
});

/* New Author form route */
router.get('/new', function (req, res) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        res.render('authors/newAuthor');
    }
});

/* Add new author to database */
router.post('/', function (req, res) {
  let name = req.body.name;
  let description = req.body.description;

  con.query('INSERT INTO authors(author_name,author_description) VALUES (?,?)',
      [name, description],
      function(err,result){
        if(err) {res.render('authors/newAuthor',{err: 'Error adding Author'})}
        let id = result.insertId;
        res.status(200).redirect('/authors/'+id);
      });
});

/* Show author page */
router.get('/:id', (req, res) => {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        con.query('SELECT * FROM authors WHERE author_id = ' + req.params.id, function (err, result) {
            if (err) {
                res.render('authors/showAuthor', {err: 'Error retrieving Author information'})
            }
            con.query('SELECT * FROM books WHERE author_id = ' + req.params.id, function (err, reslt) {
                if (err) {
                    res.render('authors/showAuthor', {err: 'Error retrieving data'})
                }else{
                res.render('authors/showAuthor', {authors: result, books: reslt, large: true});}
            });
        });
    }
});

/*  Edit Author Form Route */
router.get('/:id/edit', (req,res) => {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        con.query('SELECT * FROM authors WHERE author_id = ' + req.params.id, function (err, result) {
            if (err) throw err;
            console.log(result);
            res.render('authors/editAuthor', {authors: result});
        });
    }
});

/* Update author in database */
router.put('/:id', (req,res) => {
  let name = req.body.name;
  let description = req.body.description;
  let id = req.params.id;

  let qry = `UPDATE authors SET author_name = `+ mysql.escape(name) +`, author_description = `+ mysql.escape(description) +` WHERE author_id = ` + id;

  con.query(qry,
      function(err,result){
        if(err) throw err;
        res.status(200).redirect('/authors/'+id);
      });
});

/*Delete Author from database*/
router.delete('/:id', (req, res) => {
  con.query('SELECT * FROM books WHERE author_id = ?',[req.params.id], function (err, result, fields) {
    if (result.length > 0){
        req.flash('err', 'This Author still has books');
        res.redirect('/authors');
    }else{
      con.query('DELETE FROM authors WHERE author_id = ?',[req.params.id],
          function(err,result){
            if(err) throw err;
            res.status(200).redirect('/authors');
          });
    }
  })
});



module.exports = router;
