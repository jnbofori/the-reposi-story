const express = require('express');
const bcrypt = require('bcryptjs');
var router = express.Router();

let app = express();

/* GET index/Login page. */
router.get('/', function(req, res, next) {
  if(req.session.username && req.session.loggedin){
    res.redirect('/home');
  }else {
    res.render('index', {title: 'Login', layout: 'indexLayout.hbs'});
  }
});

/*Authenticate user. */
router.post('/auth', function(req, res){
  console.log('POST request received at /auth');
  let username = req.body.uname;
  let password = req.body.psw;

  if(username && password){
    con.query('SELECT * FROM users WHERE username = ?', [username], function(err,result,fields){
      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, function(err, reslt) {
          if(reslt){
            req.session.loggedin = true;
            req.session.username = username;
            console.log("User logged in");
            res.redirect('/home');
          }else{
            console.log('Wrong Password');
            res.render('index', { error: 'Invalid Password' });
          }
        });
      } else{
        console.log('Incorrect Username and/or Password!');
        res.render('index', {error: 'Invalid Username and/or Password'});
      }
    });
  } else{
    res.send('Please enter Username and Password!');
    res.end();
  }
});

/* Sign up users */
router.post('/signUp', function(req,res){
  bcrypt.hash(req.body.password, 10, function(err, hash) {

    con.query('SELECT * FROM users WHERE username = ? OR email = ?', [req.body.username,req.body.email],
        function (err,reslt,fields) {
          if(reslt.length > 0){
            req.flash('info', 'This username and/or email is already in use');
            res.redirect('/');
          }else{
            con.query('INSERT INTO users(fullname,username,email,password,activated) VALUES (?,?,?,?,?)',
                [req.body.fullname, req.body.username, req.body.email, hash, 1],
                function(err,result){
                  if(err) throw err;
                  res.status(200).redirect('/home');
                });
          }
        });
  });
});

/* Log users out */
router.get('/logout', function (req, res) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return console.log(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
