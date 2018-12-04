var express = require('express');
var http = require('http');

var app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));
app.get('/', (req, res) => {
    res.render('index.html');
});

var Game = new require('./server/Game');
var game = new Game(app);

game.runServer();
game.ioON();