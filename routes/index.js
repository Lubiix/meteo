var cityModel = require('../models/cities');
var UserModel = require('../models/users');
var express = require('express');
var router = express.Router();
var request = require('sync-request');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('login');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/weather', async function(req, res, next){
  var cityList = await cityModel.find();
  var erreur = false;
  // console.log('GET /weather req.session :', req.session)
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



module.exports = router;

