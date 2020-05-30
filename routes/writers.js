const express = require('express');
var router = express.Router();

/* GET all writers. */
router.get('/', function(req, res, next) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        if (req.query.name != null && req.query.name !== '') {
            let writerName = '%' + req.query.name + '%';
            con.query(`SELECT * FROM users WHERE fullname LIKE ` + mysql.escape(writerName),
                function (err, result) {
                    if (err) throw err;
                    console.log(result);
                    res.render('writers/indexWriter', {writers: result, sessUser: req.session.user})
                })
        } else {
            con.query('SELECT * FROM users', function (err, result) {
                if (err) throw err;
                console.log(result);
                res.render('writers/indexWriter', {writers: result, sessUser: req.session.user});
            })
        }
    }
});

/* New Author form route */
// router.get('/new', function (req, res) {
//     if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
//         res.render('writers/newAuthor');
//     }
// });

/* Add new author to database */
// router.post('/', function (req, res) {
//   let name = req.body.name;
//   let description = req.body.description;
//
//   con.query('INSERT INTO writers(author_name,author_description) VALUES (?,?)',
//       [name, description],
//       function(err,result){
//         if(err) {res.render('writers/newAuthor',{err: 'Error adding Author'})}
//         let id = result.insertId;
//         res.status(200).redirect('/writers/'+id);
//       });
// });

/* Show writer page */
router.get('/:id', (req, res) => {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        con.query('SELECT * FROM users WHERE user_id = ' + mysql.escape(req.params.id), function (err, result) {
            if (err) {
                res.render('writers/showWriter', {err: 'Error retrieving Writer information', sessUser: req.session.user})
            }
            con.query('SELECT * FROM posts WHERE author_id = ' + mysql.escape(req.params.id), function (err, reslt) {
                if (err) {
                    res.render('writers/showWriter', {err: 'Error retrieving data', sessUser: req.session.user})
                }else{
                res.render('writers/showWriter', {writers: result, books: reslt, large: true, sessUser: req.session.user});}
            });
        });
    }
});

/*  Edit Author Form Route */
router.get('/:id/edit', (req,res) => {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        con.query('SELECT * FROM users WHERE user_id = ' + mysql.escape(req.params.id), function (err, result) {
            if (err) throw err;
            console.log(result);
            res.render('writers/editWriter', {writers: result});
        });
    }
});

/* Update author in database */
router.put('/:id', (req,res) => {
  let name = req.body.name;
  let description = req.body.description;
  let id = req.params.id;

  let qry = `UPDATE authors SET fullname = `+ mysql.escape(name) +`, bio = `+ mysql.escape(description) +` WHERE user_id = ` + id;

  con.query(qry,
      function(err,result){
        if(err) throw err;
        res.status(200).redirect('/writers/'+id);
      });
});

/*Delete User from database*/
router.delete('/:id', (req, res) => {
  con.query('SELECT * FROM posts WHERE author_id = ?',[req.params.id], function (err, result, fields) {
    if (result.length > 0){
        req.flash('err', 'This Author still has posts');
        res.redirect('/writers');
    }else{
      con.query('DELETE FROM writers WHERE author_id = ?',[req.params.id],
          function(err,result){
            if(err) throw err;
            res.status(200).redirect('/writers');
          });
    }
  })
});



module.exports = router;
