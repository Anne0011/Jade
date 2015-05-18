var express = require('express');
var app = express.Router();

/* GET home page. */
app.get('/', function(req, res, next) {
  console.log("trying to load index");
  res.render('index', { title: 'Express' });
});

module.exports = app;
