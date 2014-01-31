//Form now posts successfully to the database
//Tasks- User Tables, User login functionality, etc, (Probably available as a drop-in)
// - Everything else
//Hopefully this will work. 
//


// web.js -- Filename 


// This section necessary to declare plugins/extensions
var util = require("util");
var express = require("express");
var logfmt = require("logfmt");
var fs = require('fs');
var jade = require('jade');
var jadeTemplate = fs.readFileSync('page.jade').toString();
var fn = jade.compile(jadeTemplate);
var pg = require("pg").native;
var forms = require("forms");

// Plugin Declarations complete

// Local variables necessary for plugins
// String for connecting to the database so it can be changed if necessary-

var conString = "postgres://zfaagftogdvhjz:pcXlJD1bP9AygIM7ivINuDOHvS@ec2-184-73-194-196.compute-1.amazonaws.com:5432/dfcvk500ed0il4";
// Client instatiation
var client = new pg.Client(conString);
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
	practice: fields.boolean(),
	hole: fields.number({required:true}),
	score: fields.number({required:true}),
	fairway: fields.string({required:true, validators: [validators.maxlength(1)]}),
	goposition: fields.string({validators: [validators.maxlength(1)]}),
	wedgereg: fields.string({validators: [validators.maxlength(1)]}),
	wedgedist: fields.number(),
	wedgerough: fields.string({validators: [validators.maxlength(1)]}),
	greeninout: fields.number(),//fields.string({validators: [validators.maxlength(1)]}),
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
// res.send is a function that builds the response


app.configure(function() {
	app.set('views', __dirname);
	app.set('view engine', 'jade');

	app.use(express.bodyParser());
	app.use(app.router);
    });

app.get('/add', function(req,res) {
	insertion_form.handle(req, {
		success: function (form) {
		    // there is a request and the form is valid                                                                              
		    // form.data contains the submitted data                                                                                 
		    var practiceCaster;
		    if(form.data.practice)
			practiceCaster=1;
		    else
			practiceCaster=0;
		    res.writeHead(200, {'Content-Type': 'text/html'});
		    res.write('<h1>Success!</h1>');
		    client.query('INSERT INTO GolfRounds VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)',[form.data.player ,  form.data.course , form.data.tournament , practiceCaster , form.data.hole , form.data.score , form.data.fairway  , form.data.goposition , form.data.wedgereg , form.data.wedgedist , form.data.wedgerough , form.data.greeninout , form.data.greenletter, form.data.putts , form.data.updownsuccess , form.data.updownbunker , form.data.updowninout], function(err, result){
			    if (err) throw err;                            
			    res.write('posted');   });    
		    res.end('<pre>' + util.inspect(form.data) + '</pre>'+ form.data.player);},                                                                                 
		    
		    other: function(form) {
		    res.send(fn({
			     
				    title: 'Adding A Score',
					form: insertion_form.toHTML()
					 }));


		}
	    });       

	
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
/*
app.get('/read',function(req,res) {
var query = client.query('SELECT 1 FROM GolfRounds');
        query.on('row', function(row) {
                res.send(JSON.stringify(row));
	    });
	
    });
*/
// TODO: Make this respond to req params and build a query.
//Pulls all files in the golfrounds table.
app.get('/readall', function(req, res) {
	//	buff = "Database:";
	//	res.send('A Reader will go here');
	res.writeHead(200, { 'Content-Type': 'text/html' });
	var query = client.query('SELECT * FROM GolfRounds', function(err, result) { 
		//Appends all rows recieved in 'result' to the buffer
		//res.writeHead(200, { 'Content-Type': 'text/html' });
		for(var i in result.rows) { 
		    res.write( JSON.stringify(result.rows[i]));
		    
		}
		res.end(); //responds with the filled buffer	
    });
       
    });

app.get('/edit', function(req,res) {
	res.send("Stub. Need an editor page");
	// Edit can manage Deletions, updates, and etc.
	//Just need to actually build it/ find one.


    });

// Don't mess with this stuff
var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
    });

