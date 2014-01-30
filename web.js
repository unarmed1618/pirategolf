//Current task- Attach the form to the button. Find a way to possibly do this natively in node.js rather than bullshit with HTML
//Hopefully this will work. 
//


// web.js -- Filename 


// This section necessary to declare plugins/extensions
var express = require("express");
var logfmt = require("logfmt");
var pg = require("pg").native;
var forms = require("forms");
// Plugin Declarations complete
var params = { host: 'ec2-184-73-194-196.compute-1.amazonaws.com' , user: 'zfaagftogdvhjz', password: 'pcXlJD1bP9AygIM7ivINuDOHvS', database: 'dfcvk500ed0il4', ssl: false }
// Local variables necessary for plugins
// String for connecting to the database so it can be changed if necessary-
//var conString = "postgres://zfaagftogdvhjz:pcXlJD1bP9AygIM7ivINuDOHvS@ec2-184-73-194-196.compute-1.amazonaws.com:5432/dfcvk500ed0il4";
// Client instatiation
var client = new pg.Client(params);
//Forms hooks
var fields = forms.fields, validators = forms.validators;


var buff = "Database:"; // For a string to append a full read to
client.connect(); //To actually establish a connection TODO: Use a client pool instead of this.

//express local 
var app = express();

// The actual instertion form constructor
var insertion_form = forms.create({
	player: fields.string({required: true}),
	course: fields.string({required: true}),
	tournament: fields.string(),
	practice: fields.boolean({required:true}),
	hole: fields.number({required:true}),
	score: fields.number({required:true}),
	fairway: fields.string({required:true, validators: [validators.maxlength(1)]}),
	goposition: fields.string({validators: [validators.maxlength(1)]}),
	wedgereg: fields.string({validators: [validators.maxlength(1)]}),
	wedgedist: fields.number(),
	wedgerough: fields.string({validators: [validators.maxlength(1)]}),
	greeninout: fields.string({validators: [validators.maxlength(1)]}),
	greenletter: fields.string({validators: [validators.maxlength(1)]}),
	putts: fields.number(),
	updownsuccess: fields.string({validators: [validators.maxlength(1)]}),
	updownbunker: fields.string({validators: [validators.maxlength(1)]}),
	updowninout: fields.number()
	}); 


app.use(logfmt.requestLogger()); //logfmt hook

//This is called at pirategolf.heroku.com/add
// req == the request's parameters
// res == the response
// res.send is the function that builds the response



app.get('/add', function(req,res) {
	res.send(insertion_form.toHTML()+ '<button type= "button">Submit</button>');
	//	Builds the form
	
    });



// A hello world index stub

app.get('/', function(req, res) {
	// You can also generate content this way- I'm planning to create some formatting functions and shit for when we need to make pretty stuff.
	res.writeHead(200, { 'Content-Type': 'text/html' });
	res.write('<!DOCTYPE html><html lang="en"><head>');
	res.write('<meta charset="utf-8">');
	res.write('<title>' + 'Some words' + '</title>');
	res.write('</head><body>');
	res.write('<h1><tt>' + 'more words' + '</tt></h1>');
	res.write('</body></html>');
	res.end();
    });

// Pulls up the first file in the database for testing purposes
// TODO: Make this respond to req params and build a query.
app.get('/read', function(req, res) {
	var query = client.query('SELECT * FROM GolfRounds'); //Builds and sends the actual sql query
	query.on('row', function(row) { // Event function for row behavior
		res.send(JSON.stringify(row)); //Puts the row into a string and sends it as a response
			 });
    });
//Pulls all files in the golfrounds table.
app.get('/readall', function(req, res) {
	
	//	res.send('A Reader will go here');
	var query = client.query('SELECT * FROM GolfRounds', function(err, result) { 
		//Appends all rows recieved in 'result' to the buffer
		for(var i in result.rows) { 
		    buff += JSON.stringify(result.rows[i]);
		    buff += ", ";
		}
		
    });
	res.send(buff); //responds with the filled buffer
    });
// a stub for a posting page
app.get('/write/', function(req, res) {
	var r = req.query;
	// forming the query manually for now
	var query = client.query('INSERT INTO GolfRounds VALUES (' + r.player + ',' + r.course + ',' +  r.tournament + ',' + r.practice + ',' + r.hole + ',' + r.score +',' + r.fairway  + ',' + r.goposition + ',' + r.wedgereg + ',' + r.wedgedist + ','+ r.wedgerough + ',' + r.wedgerough + ',' + r.greeninout + ',' + r.greenletter + ',' + r.putts + ',' + r.updownsuccess + ',' + r.updownbunker + ',' + r.updowninout + ')');
	res.send('A write page will go here');
	

});

// Don't mess with this stuff
var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
    });

