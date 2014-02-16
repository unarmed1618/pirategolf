//Form now posts successfully to the database
//Tasks- User Tables, User login functionality, etc, (Probably available as a drop-in)
// - Everything else
//Hopefully this will work. 
//


// web.js -- Filename 


// This section necessary to declare plugins/extensions
var util = require("util");
var jquery = require("jquery");
var express = require("express");
var logfmt = require("logfmt");
var fs = require('fs');
var jadeOptions = {filename: './', pretty:true };
var jade = require('jade');
var jadeCarouselBox = fs.readFileSync('carousel.jade').toString();
var jadeCarousel = jade.compile(jadeCarouselBox, jadeOptions);
var jadeTableBox = fs.readFileSync('table.jade').toString();
var jadeTable = jade.compile(jadeTableBox, jadeOptions);
var jadeTemplate = fs.readFileSync('page.jade').toString();
var fn = jade.compile(jadeTemplate, jadeOptions);
var jadeForm = fs.readFileSync('form.jade').toString();
var jfm = jade.compile(jadeForm, jadeOptions);
console.log("vars up except pg");
if(process.env.PWD == "/app"||"/Users/johndarrow/pirategolfWS/pirategolf")
    var pg = require("pg").native;
else
   var pg = require("pg");
console.log("pg built");
var forms = require("forms");

// Plugin Declarations complete

// Local variables necessary for plugins
// String for connecting to the database so it can be changed if necessary-
//var conString = "postgres://zfaagftogdvhjz:pcXlJD1bP9AygIM7ivINuDOHvS@ec2-184-73-194-196.compute-1.amazonaws.com/dfcvk500ed0il4";



if(process.env.PWD == "/app")
    var conString = process.env.DATABASE_URL;
else if(process.env.PWD == "/Users/johndarrow/pirategolfWS/pirategolf")
    var conString = "postgres://zfaagftogdvhjz:pcXlJD1bP9AygIM7ivINuDOHvS@ec2-184-73-194-196.compute-1.amazonaws.com/dfcvk500ed0il4";
else
    var conString = "postgres://postgres:postgres@localhost/localGolf";



// Client instatiation
console.log("Creating client at " + conString + "...");
var client = new pg.Client(conString);
console.log("Done!");
//Forms hooks
var fields = forms.fields, validators = forms.validators;



var buff = "Database:"; // For a string to append a full read to


console.log("Attempting to connect to DB...");
client.connect(); //To actually establish a connection TODO: Use a client pool instead of this.
console.log("Done!");
//express local 
console.log("Creating express...");
var app = express();
console.log("Done!");
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
//var carousel_form =

app.use(logfmt.requestLogger()); //logfmt hook

//This is called at pirategolf.heroku.com/add
// req == the request's parameters
// res == the response
// res.send is a function that builds the response

console.log("Running configure...");
/*
app.configure(function() {
	app.set('views', __dirname);
	app.set('view engine', 'jade');

	app.use(express.bodyParser());
	app.use(app.router);
    });
*/
console.log("Done!");
console.log("Building env...");
app.get('/env', function(req,res) {
	res.send(JSON.stringify(process.env));
    });
console.log("Done!");
console.log("Building add...");
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
console.log("Done!");
console.log("Pulling in css and javascript...");
app.get('/bootstrap.css', function(req,res) {
        res.writeHead(200, {"Content-Type": "text/css"});
        fs.readFile('./css/bootstrap.css' , 'utf8', function(err, fd) {
                res.end(fd);
            });
    });
app.get('/bootstrap.css.map',function(req,res) {
        res.send(fs.readFileSync('css/bootstrap.css.map').toString());
    });
app.get('/bootstrap.js',function(req,res){
        res.writeHead(200, {"Content-Type": "text/javascript"});
        fs.readFile('js/bootstrap.js', 'utf8', function(err, fd) {
                res.end(fd);
            });
    });
app.get('/docs.js',function(req,res){
	res.writeHead(200, {"Content-Type": "text/javascript"});
	fs.readFile('js/docs.min.js', 'utf8' ,function(err, fd) {
		res.end(fd);
	    });
    });
app.get('/fonts/glyphicons-halflings-regular.woff',function(req,res){
	res.send(fs.readFileSync('fonts/glyphicons-halflings-regular.woff'))
	    });
console.log("Done!");

// A hello world index stub
console.log("Generating root directory...");
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
console.log("Done!");
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


app.get('/formtest', function(req,res) {
	res.send(JSON.stringify(insertion_form));

    });
/*
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
*/
//Designed to use Jade to clean up the output into a table
app.get('/readjade',function(req,res) {
	var rows = [];
	var query = client.query('SELECT * FROM GolfRounds');
	query.on('row', function(row){
		rows.push(row);
	    });
	query.on('end', function(row){
		res.send(jadeTable({"Result": {"rows": rows}}));
	    });
    });
console.log("Generating Carousel...");
app.get('/carouselForm', function(req,res){
	//res.send("Stub. Adding a carousel style form input for mobile users.");
	//res.send(jadeCarousel({"fields": [{"name": "This"},{"name": "is"}]}));
	res.send(jadeCarousel(insertion_form));

});
console.log("Done!");
app.get('/edit', function(req,res) {
	//if(req.
	res.send("Stub. Need an editor page");
	// Edit can manage Deletions, updates, and etc.
	//Just need to actually build it/ find one.


    });
    //app.post('/edit', function(req,res) {
	
	//   });

// Don't mess with this stuff
console.log("Generating port...");
var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
    });
console.log("Done!");
