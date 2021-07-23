var cityModel = require('../models/cities');
var UserModel = require('../models/users');
var express = require('express');
var router = express.Router();
var request = require('sync-request');

/* GET users listing. */
router.post('/sign-up', async function(req, res, next) {
  // console.log('POST /sign up req.body', req.body);
  
  var newUser = new UserModel ({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  var user = await UserModel.findOne({
    email : req.body.email
  })
  // console.log('POST /sign-up existing user#1', user)
  // console.log('POST /sign-up newUser : #1', newUser)

  if (user === null){
    // console.log('POST /sign-up existing user user#2', user)
    // console.log('POST /sign-up newUser : #2', newUser)
    await newUser.save();
    req.session.user ={
      id :newUser._id,  
      username: newUser.username
    }
    // console.log('/sign-up req.session :', req.session.user);
    res.redirect('/weather');
    
  } else {

    res.render('login');

  }

  // console.log('POST /sign-up newUser: ',newUser);
});

router.post('/sign-in', async function(req, res, next){
  // console.log('POST /sign-in req.body', req.body);
  
  var users = await UserModel.find({email: req.body.email, password: req.body.password});
  
  // console.log('POST /sign-in users find()', users);

  if (users.length > 0){

    req.session.user = {
      username : users[0].username,
      id : users[0]._id
    }
    // console.log('USERS sign-in', users);
    // console.log('POST /sign-in req.session.user :', req.session.user)
    res.redirect('/weather');

  } else {
    
    res.redirect('/login')
  }
})

router.get('/logout', function (req, res, next){
  // console.log('GET /logout req.session.user.user #1: ', req.session.user)
  req.session.user = null;
  // console.log('GET /logout req.session.user.user #2: ', req.session.user)
  res.redirect('/')
})

module.exports = router;
