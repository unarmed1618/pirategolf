// web.js
var express = require("express");
var logfmt = require("logfmt");
var pg = require("pg");

var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
	res.send('Hello World!');
    });
app.get('/read', function(req, res) {
	res.send('A Reader will go here');
    });

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
    });
pg.connect(process.env.DATABASE_URL, function(err,client) {
	var query = client.query('SELECT * FROM GolfRounds');
	
	query.on('row', function(row) {
		console.log(JSON.stringify(row));
	    });
    });