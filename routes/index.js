var cityModel = require('../models/cities');
var UserModel = require('../models/users');
var express = require('express');
var router = express.Router();
var request = require('sync-request');


/* GET home page. */

router.get('/weather', async function(req, res, next){
  // console.log('GET /weather req.query', req.query)
  console.log('GET /weather req.session.user', req.session.user)
  if (req.session.user === undefined) {
    res.redirect('/')
  }
  var cityList = await cityModel.find();
  var erreur = false;
  // console.log('GET /weather req.session.user :', req.session.user)
  res.render('weather', {cityList, erreur})
});

router.post('/add-city', async function(req, res, next){
  var data = request("GET", `https://api.openweathermap.org/data/2.5/weather?q=${req.body.newcity}&units=metric&lang=fr&appid=92d0597fb2ff416b900c98d31c7e6d6c`) 
  var dataAPI = JSON.parse(data.body)

  var erreur = !!dataAPI.message

  var alreadyExist = await cityModel.findOne({ name: req.body.newcity.toLowerCase() });

  if(alreadyExist == null && dataAPI.name){
    var newCity = new cityModel({
      name: req.body.newcity.toLowerCase(),
      desc:  dataAPI.weather[0].description,
      img: "http://openweathermap.org/img/wn/"+dataAPI.weather[0].icon+".png",
      temp_min: dataAPI.main.temp_min,
      temp_max: dataAPI.main.temp_max,
      lon: dataAPI.coord.lon,
      lat: dataAPI.coord.lat
    });

    await newCity.save();
  }
  
  cityList = await cityModel.find();
  console.log('POST /add-city cityList :', )
  res.render('weather', {cityList, erreur})
});

router.get('/delete-city', async function(req, res, next){
  var erreur = false;
  await cityModel.deleteOne({
    _id: req.query.id
  })

  var cityList = await cityModel.find();

  res.render('weather', {cityList, erreur})
});

router.get('/update-cities', async function(req, res, next){
  var erreur = false;
  var cityList = await cityModel.find();

  for(var i = 0; i< cityList.length; i++){
    var data = request("GET", `https://api.openweathermap.org/data/2.5/weather?q=${cityList[i].name}&units=metric&lang=fr&appid=0c815b9455235455a301668a56c67b18`) 
    var dataAPI = JSON.parse(data.body)
  
    await cityModel.updateOne({
      _id: cityList[i].id
    }, {
      name: cityList[i].name,
      desc:  dataAPI.weather[0].description,
      img: "http://openweathermap.org/img/wn/"+dataAPI.weather[0].icon+".png",
      temp_min: dataAPI.main.temp_min,
      temp_max: dataAPI.main.temp_max,
    })
  }

  var cityList = await cityModel.find();

  res.render('weather', {cityList, erreur})
});

router.post('/sign-up', async function(req, res, next) {
  console.log('POST /sign up req.body', req.body.username.length);
  if (req.body.username.length > 0 && req.body.email.length > 0 && req.body.password.length > 0) {

    var newUser = new UserModel ({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
  
    //On cherche si cette email existe
    var user = await UserModel.findOne({ 
      email : req.body.email
    })
    // console.log('POST /sign-up existing user#1', user)
    // console.log('POST /sign-up newUser : #1', newUser)
    
    //Si email pas existant on sign-up
    if (user === null){
      // console.log('POST /sign-up existing user user#2', user)
      // console.log('POST /sign-up newUser : #2', newUser)
      await newUser.save(); // add user to BDD
      req.session.user ={
        id :newUser._id,  
        username: newUser.username
      }
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
  console.log('POST /sign-in req.session.user', req.session.user)
  
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

router.get('/', function(req, res, next) {
  res.redirect('login');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

module.exports = router;

