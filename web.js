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
var sql = require('sql');
var jadeOptions = {filename: './', pretty:true };
var jade = require('jade');
var jadeAndre = fs.readFileSync('andre.jade');
var andreJade = jade.compile(jadeAndre, jadeOptions);
var jadeStatsBox = fs.readFileSync('stats.jade').toString();
var jadeStats = jade.compile(jadeStatsBox, jadeOptions);
var jadeVCarouselBox = fs.readFileSync('vCarousel.jade').toString();
var jadeVCarousel = jade.compile(jadeVCarouselBox, jadeOptions);
var jadeCarouselBox = fs.readFileSync('carousel.jade').toString();
var jadeCarousel = jade.compile(jadeCarouselBox, jadeOptions);
var jadeTableBox = fs.readFileSync('table.jade').toString();
var jadeTable = jade.compile(jadeTableBox, jadeOptions);
var jadeTemplate = fs.readFileSync('page.jade').toString();
var fn = jade.compile(jadeTemplate, jadeOptions);
var jadeForm = fs.readFileSync('form.jade').toString();
var jfm = jade.compile(jadeForm, jadeOptions);
var passport = require("passport");
var DigestStrategy =require('passport-http').DigestStrategy;
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
var hole_form;
//var carousel_form =
fs.readFile("hole_form.json","utf8",function(err,data) {
        if(err) throw err;
        hole_form = forms.create(JSON.parse(data));
    });

app.use(express.static(__dirname + '/publicstatic'));

app.use(logfmt.requestLogger()); //logfmt hook

//This is called at pirategolf.heroku.com/add
// req == the request's parameters
// res == the response
// res.send is a function that builds the response

console.log("Running configure...");

app.configure(function() {
	app.set(passport.initialize());
    });

console.log("Done!");
console.log("Building env...");
//app.use(express.static(__dirname + '/public'));
app.get('/env', function(req,res) {
	res.send(JSON.stringify(process.env));
    });
app.get('/andre',function(req,res) {
	res.send(andreJade()); 
});
console.log("Done!");
//For Brianc's sql builder--
var golfHoles = sql.define({
	name: 'GolfRounds',
	columns: ['player','course','tournament','practice','hole','score','fairway','goposition','wedgereg','wedgedist','wedgerough','greeninout','greenletter','putts','updownsuccess','updownbunker','updowninout']
    });
console.log("Building add...");

function toArray(thing) {
    var res = new Array();
    for( var item in thing) 
	{
	   res.push(thing[item]);
	}
    return res;
}





console.log("Done!");

// A hello world index stub
passport.use(new DigestStrategy({ qop: 'auth' },
  function(username, done) {
      console.log("Entering digeststrat");
      console.log(username);
      client.query("SELECT USERNAME, PASSWRD FROM Credentials WHERE USERNAME = $1", [username], function(err,result) {
      if (err) { return done(err); }
      if (!result) { return done(null, false); }
      return done(null, result.rows[0].username, result.rows[0].passwrd);
    });
  },
  function(params, done) {
    // validate nonces as necessary
    done(null, true)
  }
));
app.get('/api/me', 
  passport.authenticate('digest', { session: true }),
  function(req, res) {
    res.json(req.user);
  });
app.post('/login',passport.authenticate('digest', {successRedirect:'/Landing.html',failureRedirect:'/LoginPage.html'})

);

console.log("Generating root directory...");
app.get('/', function(req, res) {
    res.redirect('/!StartPage.html');
  });
console.log("Done!");
app.get('/coachstats', function(req,res) {
	res.send("This is a stub for coach report generation");
    });
app.get('/playerstats', function(req,res) {
	res.send("This is a stub for player report generation");
    });
app.get('/stats', function(req,res) {
	res.send("This is a stub for generalized report generation");
    });
app.get('/readspc', function(req,res) {
	res.send(JSON.stringify(req));

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


app.get('/formtest', function(req,res) {
	res.send(JSON.stringify(hole_form));

    });
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
app.get('/vCarousel',function(req,res) {
	var holes = new Array();
	for( var i=0; i<req.params.nHoles;i++)
	    holes.push(i);
	res.send(jadeVCarousel({"Holder": {}}))
    });
app.get('/carouselForm', function(req,res){
	//res.send("Stub. Adding a carousel style form input for mobile users.");
	//res.send(jadeCarousel({"fields": [{"name": "This"},{"name": "is"}]}));
	var holes = new Array();
	/*
	if(req.params.nHoles == 1)
	    holes.push(1);
	else if(req.params.nHoles == 9)
	    for(var i= 0; i <9; i++)
		holes.push(i);
	else if(req.params.nHoles == 18)
	    for(var i=0; i<18; i++)
		holes.push(i);
	*/
	for(var i=0; i<req.params.nHoles;i++)
	    {	    holes.push(i); }

	//TODO: 
	//res.send(JSON.stringify({"Holder": {"fields":insertion_form, "holes":holes}}));
	res.send(jadeCarousel( {"fields":JSON.stringify(hole_form),"holes": JSON.stringify(holes)}));

});
console.log("Done!");
app.get('/edit', function(req,res) {
	//if(req.
	res.send("Stub. Need an editor page");
	// Edit can manage Deletions, updates, and etc.
	//Just need to actually build it/ find one.


    });

// Don't mess with this stuff
console.log("Generating port...");
var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
    });
console.log("Done!");
