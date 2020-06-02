const express = require('express');
const bcrypt = require('bcryptjs');
var router = express.Router();

/* GET all writers. */
router.get('/', function(req, res, next) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        if (req.query.name != null && req.query.name !== '') {
            let writerName = '%' + req.query.name + '%';
            con.query(`SELECT * FROM users WHERE fullname LIKE ` + mysql.escape(writerName),
                function (err, result) {
                    if (err) throw err;
                    res.render('writers/indexWriter', {title: 'Explore Writers', writers: result, sessUser: req.session.user})
                })
        } else {
            con.query('SELECT * FROM users', function (err, result) {
                if (err) throw err;
                res.render('writers/indexWriter', {title: 'Explore Writers', writers: result, sessUser: req.session.user});
            })
        }
    }
});


/* Show writer page */
router.get('/:id', (req, res) => {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        con.query('SELECT * FROM users WHERE user_id = ' + mysql.escape(req.params.id), function (err, result) {
            if (err) {
                res.render('writers/showWriter', {err: 'Error retrieving Writer information', sessUser: req.session.user})
            }
            con.query('SELECT * FROM posts WHERE user_id = ' + mysql.escape(req.params.id), function (err, reslt) {
                if (err) {
                    res.render('writers/showWriter', {err: 'Error retrieving data', sessUser: req.session.user})
                }else{
                res.render('writers/showWriter', {writers: result, posts: reslt, large: true, sessUser: req.session.user});}
            });
        });
    }
});

/*  Edit writer Form Route */
router.get('/:id/edit', (req,res) => {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        con.query(`SELECT * FROM users WHERE user_id = ${mysql.escape(req.params.id)}`, function (err, result) {
            if (err) throw err;
            res.render('writers/editWriter', {writers: result, sessUser: req.session.user});
        });
    }
});

/* Update writer in database */
router.put('/:id', (req,res) => {
  let name = req.body.name;
  let bio = req.body.bio;
  let username = req.body.username;
  let id = req.params.id;

  con.query(`SELECT * FROM users WHERE username = ?`,[username], function (err, result) {
      if (result.length > 0){
          if(result[0].user_id == id){
              update(name, bio, username, id, res)
          }else{
              req.flash('err', 'Username already in use')
              res.redirect(`/writers/${id}/edit`)
          }
      }else {
          update(name, bio, username, id, res)
      }
  });
});


/*Delete User from database*/
router.delete('/:id', (req, res) => {
    con.query('DELETE FROM posts WHERE user_id = ?', [req.params.id], function (err, result) {
        if (err) throw err;
      con.query('DELETE FROM users WHERE user_id = ?',[req.params.id],
          function(err,result){
            if(err) throw err;
            res.status(200).redirect('/logout');
          });
    })
});


function update(name, bio, username, id, res) {
    let qry = `UPDATE users SET fullname = ?, bio = ?, username = ? WHERE user_id = ?`;
    con.query(qry,[name, bio, username, id],
        function(err,result){
            if(err) throw err;
            res.status(200).redirect('/writers/'+id);
        });
}



module.exports = router;
