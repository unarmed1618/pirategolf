// web.js
var express = require("express");
var logfmt = require("logfmt");
var pg = require("pg");
var conString = "postgres://zfaagftogdvhjz:pcXlJD1bP9AygIM7ivINuDOHvS@ec2-184-73-194-196.compute-1.amazonaws.com:5432/dfcvk500ed0il4";
var client = new pg.Client(conString);
client.connect();


var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
	res.send('Hello World!');
    });
app.get('/read', function(req, res) {
	var query = client.query('SELECT * FROM GolfRounds');
	query.on('row', function(row) {
		res.send(JSON.stringify(row));
			 });

    });
app.get('/readall', function(req, res) {
	var buff = "";
	//	res.send('A Reader will go here');
	var query = client.query('SELECT * FROM GolfRounds', function(err, result) {
		for(var i in result.rows) { 
		    buff += JSON.stringify(result.rows[i]);
		    buff += ", ";
		}
	    });
	res.send(buff);
    });
app.get('/write', function(req, res) {
    
	res.send('A write page will go here');


});
var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
    });




//pg.connect(conString, function(err ,client) {
	//	if(err) throw err;
	//var query = client.query('SELECT * FROM GolfRounds');
	
//	query.on('row', function(row) {
//		console.log(JSON.stringify(row));
//	    });
//    });
