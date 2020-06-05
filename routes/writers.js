const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
var router = express.Router();

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];

const storage = multer.diskStorage({
    destination: './public/images/profileImages/',
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
}).single('profile');


/* GET all writers. */
router.get('/', function(req, res) {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        if (req.query.name != null && req.query.name !== '') {
            let writerName = '%' + req.query.name + '%';
            con.query(`SELECT * FROM users WHERE fullname LIKE ${mysql.escape(writerName)} OR username LIKE ${mysql.escape(writerName)}`,
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


/*  Edit writer Form Route */
router.get('/edit', (req,res) => {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        con.query(`SELECT * FROM users WHERE user_id = ${mysql.escape(req.session.user)}`, function (err, result) {
            if (err) throw err;
            res.render('writers/editWriter', {writers: result, sessUser: req.session.user});
        });
    }
});



/* Update writer in database */
router.put('/', (req,res) => {
    let username = req.body.username;
    let id = req.session.user;
    con.query(`SELECT * FROM users WHERE username = ?`,[username], function (err, result) {
      if (result.length > 0){
          if(result[0].user_id == id){
              update(req, res)
          }else{
              req.flash('err', 'Username already in use');
              res.redirect(`/writers/edit`)
          }
      }else {
          update(req, res)
      }
  });
});


/*Delete User from database*/
router.delete('/', (req, res) => {
    con.query('DELETE FROM posts WHERE user_id = ?', [req.session.user], function (err) {
        if (err) throw err;
      con.query('DELETE FROM users WHERE user_id = ?',[req.session.user],
          function(err){
            if(err) throw err;
            res.status(200).redirect('/logout');
          });
    })
});


/* route to update account details */
router.get('/account', (req, res) => {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        con.query('SELECT * FROM users WHERE user_id = ?', [req.session.user], function (err, result) {
            if (err) throw err;
            res.render('profile/updateAccount', {title: 'Update Account Details', sessUser: req.session.user, user: result})
        })
    }
});


/* Update email */
router.put('/email', (req, res) => {
    let email = req.body.email;
    let id = req.session.user;

    con.query(`SELECT * FROM users WHERE email = ?`,[email], function (err, result) {
        if (result.length > 0){
            if(result[0].user_id == id){
                updateEmail(email, id, res);
            }else{
                res.render(`profile/updateAccount`, {
                    title: 'Update Account Details',
                    sessUser: req.session.user,
                    user: result, error: 'Email Address Already in use'});
            }
        }else {
            // con.query(`SELECT * FROM users WHERE user_id = ?`, [id], function () {
                updateEmail(email, id, res);
            // })
        }
    });
});


/* Update password */
router.put('/password', (req, res) => {
    let currPassword = req.body.currPassword;
    let newPassword = req.body.newPassword;
    let id = req.session.user;

    con.query(`SELECT * FROM users WHERE user_id = ?`, [id], function (err, result) {
        bcrypt.compare(currPassword, result[0].password, function (err, reslt) {
            if(reslt){
                bcrypt.hash(newPassword, 10, function (err, hash) {
                    let qry = `UPDATE users SET password = ? WHERE user_id = ?`;
                    con.query(qry,[hash, id],
                        function(err){
                            if(err) throw err;
                            res.status(200).redirect('/profile');
                        });
                })
            }else {
                res.render(`profile/updateAccount`, {
                    title: 'Update Account Details',
                    sessUser: req.session.user,
                    user: result,
                    error: 'Invalid Password'});
            }
        })
    })
});


/* Show writer page */
router.get('/:id', (req, res) => {
    if(!req.session.username && !req.session.loggedin){res.redirect('/')}else {
        con.query('SELECT * FROM users WHERE user_id = ' + mysql.escape(req.params.id), function (err, result) {
            if (err) throw err;
            con.query('SELECT * FROM posts WHERE user_id = ' + mysql.escape(req.params.id), function (err, reslt) {
                if (err) throw err;
                con.query(`SELECT COUNT(likes.post_id) AS NumberOfLikes FROM posts INNER JOIN likes ON likes.post_id = posts.post_id WHERE posts.user_id = ?`,
                    [req.params.id], function (err, rslt) {
                        res.render('writers/showWriter', {
                            title: 'View Writer',
                            writers: result,
                            posts: reslt,
                            likes: rslt,
                            noOfPosts: reslt.length,
                            sessUser: req.session.user});
                    })
            });
        });
    }
});


function update(req, res) {
    upload(req, res, function (err) {
        if(err){
            req.flash('err', 'Error uploading file');
            res.redirect(`writers/${req.params.id}/edit`);
        }else{
            const fileName = req.file != null ? req.file.filename : null;

            let name = req.body.name;
            let bio = req.body.bio;
            let username = req.body.username;
            let id = req.session.user;
            let profile = fileName;

            let profileImg_prt = `, profile = ${mysql.escape(profile)}`;

            if(fileName == null || !req.file){profileImg_prt='';}

            let qry = `UPDATE users SET fullname = ?, bio = ?, username = ?${profileImg_prt} WHERE user_id = ?`;
            con.query(qry,[name, bio, username, id],
                function(err){
                    if(err) {
                        deleteProfileImage(profile);
                        throw err;
                    }
                    res.status(200).redirect('/profile');
                });
        }
    })
}

function updateEmail(email, id, res){
    let qry = `UPDATE users SET email = ? WHERE user_id = ?`;
    con.query(qry,[email, id], function(err){
        if(err) throw err;
        res.status(200).redirect('/profile');
    });
}

function deleteProfileImage(filename){
    fs.unlink(path.join('public/images/profileImages/',filename), (err)=>{
        if(err) console.error(err)
    })
}



module.exports = router;
