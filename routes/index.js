const express = require('express');
const bcrypt = require('bcryptjs');
var router = express.Router();


/* GET index/Login page. */
router.get('/', function(req, res, next) {
  if(req.session.username && req.session.loggedin){
    res.redirect('/home');
  }else {
    res.render('index', {title: 'the reposi-story - Login', layout: 'indexLayout.hbs'});
  }
});

router.get('/gotoSignUp', function (req, res) {
  if(req.session.username && req.session.loggedin){
    res.redirect('/home');
  }else {
    res.render('signUp', {title: 'the reposi-story - Sign Up', layout: 'indexLayout'})
  }
});

/*Authenticate user. */
router.post('/auth', function(req, res){
  console.log('POST request received at /auth');
  let email = req.body.email;
  let password = req.body.psw;

  if(email && password){
    con.query('SELECT * FROM users WHERE email = ?', [email], function(err,result){
      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, function(err, reslt) {
          if(reslt){
            req.session.loggedin = true;
            req.session.username = email;
            req.session.user = result[0].user_id;
            console.log("User logged in");
            res.redirect('/home');
          }else{
            // console.log('Wrong Password');
            res.render('index', { error: 'Invalid Password', layout: 'indexLayout.hbs', title: 'the reposi-story - Login'});
          }
        });
      } else{
        // console.log('Incorrect Username and/or Password!');
        res.render('index', {error: 'Invalid Email and/or Password', layout: 'indexLayout.hbs', title: 'the reposi-story - Login'});
      }
    });
  } else{
    res.render('index', {error: 'Please enter Email and Password!', layout: 'indexLayout.hbs', title: 'the reposi-story - Login'});
  }
});

/* Sign up users */
router.post('/signUp', function(req,res){
  bcrypt.hash(req.body.password, 10, function(err, hash) {

    con.query('SELECT * FROM users WHERE username = ? OR email = ?', [req.body.username,req.body.email],
        function (err,reslt) {
          if(reslt.length > 0){
            req.flash('info', 'This username and/or email is already in use');
            res.redirect('/gotoSignUp');
          }else{
            con.query('INSERT INTO users(fullname,username,email,password,activated) VALUES (?,?,?,?,?)',
                [req.body.fullname, req.body.username, req.body.email, hash, 1],
                function(err){
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
