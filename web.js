//Form now posts successfully to the database
//Tasks- User Tables, User login functionality, etc, (Probably available as a drop-in)
// - Everything else
//Hopefully this will work. 
//
// web.js -- Filename 
// This section necessary to declare plugins/extensions
/*
var express       =   require("express"), 
    connect     =   require("connect"), 
    postmark    =   require("postmark")(POSTMARK_API_KEY);
*/
//var login = require("login").postgresql;
var util = require("util");
var jquery = require("jquery");
var express = require("express");
var logfmt = require("logfmt");
var fs = require('fs');
var sql = require('sql');
var jadeOptions = {filename: './', pretty:true };
var jade = require('jade');
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
var connect = require("connect");
var bcrypt = require("bcrypt");
var everyauth = require("everyauth");
//console.log("vars up except pg");
if(process.env.PWD == "/app"||"/Users/johndarrow/pirategolfWS/pirategolf")
    var pg = require("pg").native;
else
   var pg = require("pg");
//console.log("pg built");
var forms = require("forms");
var holes = [1, 2, 3,4, 5, 6, 7, 8, 9, 10, 11, 12, 13,14,15,16,17,18];
// Plugin Declarations complete

// Local variables necessary for plugins
// String for connecting to the database so it can be changed if necessary-
//var conString = "postgres://zfaagftogdvhjz:pcXlJD1bP9AygIM7ivINuDOHvS@ec2-184-73-194-196.compute-1.amazonaws.com/dfcvk500ed0il4";
var everyauth = require('everyauth')
  , connect = require('connect');
/*
everyauth.password
  .getLoginPath('/login') // Uri path to the login page
  .postLoginPath('/login') // Uri path that your login form POSTs to
  .loginView('a string of html; OR the name of the jade/etc-view-engine view')
  .authenticate( function (login, password) {
    // Either, we return a user or an array of errors if doing sync auth.
    // Or, we return a Promise that can fulfill to promise.fulfill(user) or promise.fulfill(errors)
    // `errors` is an array of error message strings
    //
    // e.g., 
    // Example 1 - Sync Example

     if (usersByLogin[login] && usersByLogin[login].password === password) {
       return usersByLogin[login];
     } else {
       return ['Login failed'];
     }
    //
    // Example 2 - Async Example
//     var promise = this.Promise()
 //    client.query("Select username, passwrd from credentials where username='$1'",[login], function (err, result) {
   //    if (err) return promise.fulfill([err]);
    //   promise.fulfill(result);
    // }
     return promise;

  })
  .loginSuccessRedirect('/') // Where to redirect to after a login

    // If login fails, we render the errors via the login view template,
    // so just make sure your loginView() template incorporates an `errors` local.
    // See './example/views/login.jade'

  .getRegisterPath('/register') // Uri path to the registration page
  .postRegisterPath('/register') // The Uri path that your registration form POSTs to
  .registerView('a string of html; OR the name of the jade/etc-view-engine view')
  .validateRegistration( function (newUserAttributes) {
    // Validate the registration input
    // Return undefined, null, or [] if validation succeeds
    // Return an array of error messages (or Promise promising this array)
    // if validation fails
    //
    // e.g., assuming you define validate with the following signature
    // var errors = validate(login, password, extraParams);
    // return errors;
    //
    // The `errors` you return show up as an `errors` local in your jade template
  })
  .registerUser( function (newUserAttributes) {
    // This step is only executed if we pass the validateRegistration step without
    // any errors.
    //
    // Returns a user (or a Promise that promises a user) after adding it to
    // some user store.
    //
    // As an edge case, sometimes your database may make you aware of violation
    // of the unique login index, so if this error is sent back in an async
    // callback, then you can just return that error as a single element array
    // containing just that error message, and everyauth will automatically handle
    // that as a failed registration. Again, you will have access to this error via
    // the `errors` local in your register view jade template.
    // e.g.,
    //  var promise = this.Promise();
    //  User.create(newUserAttributes, function (err, user) {
    //   if (err) return promise.fulfill([err]);
    //   promise.fulfill(user);
    // });
    // return promise;
    //
    // Note: Index and db-driven validations are the only validations that occur 
    // here; all other validations occur in the `validateRegistration` step documented above.
  })
  .registerSuccessRedirect('/'); // Where to redirect to after a successful registration

var routes = function (app) {
  // Define your routes here
};
*/



if(process.env.PWD == "/app")
    var conString = process.env.DATABASE_URL;
else if(process.env.PWD == "/Users/johndarrow/pirategolfWS/pirategolf")
    var conString = "postgres://zfaagftogdvhjz:pcXlJD1bP9AygIM7ivINuDOHvS@ec2-184-73-194-196.compute-1.amazonaws.com/dfcvk500ed0il4";
else
    var conString = "postgres://postgres:postgres@localhost/localGolf";



// Client instatiation
//console.log("Creating client at " + conString + "...");
var client = new pg.Client(conString);
//console.log("Done!");
//Forms hooks
var fields = forms.fields, validators = forms.validators, widgets = forms.validators;



var buff = "Database:"; // For a string to append a full read to
//console.log("Attempting to connect to DB...");
//client.connect(); //To actually establish a connection TODO: Use a client pool instead of this.
//console.log("Done!");
//express local 
//console.log("Creating express...");
var app = express();
var hole_form = forms.create({
     hole_score: fields.number({required:true, widget: widgets.number}),
     fairway: fields.string({required:true, maxlength:1,widget: widgets.text}),
     goposition: fields.string ({required:true, maxlength:1,widget: widgets.text}),
     stroke_in_reg: fields.string ({required:true,maxlength:1,widget: widgets.text}),
     stroke_in_ruff: fields.string ({required:true,maxlength:1,widget: widgets.text}),
     wedgedist: fields.number ({required:true,widget : widgets.number}),
     greeninout: fields.number ({required:true,widget : widgets.number}),
     where_on_green: fields.string ({required:true, maxlength:1,widget : widgets.text}),
     putts: fields.number ({required:true,widget : widgets.number}),
     updown_success:fields.number ({required:true,widget : widgets.number}),
     updown_bunker:fields.number({required:true,widget : widgets.number}),
     updown_inside5:fields.number({required:true,widget : widgets.number})
}

);
//var holes = new Array();
/*fs.readFile("hole_form.json","utf8",function(err,data) {
        if(err) throw err;
        hole_form = forms.create(JSON.parse(data));
    });
*/
app.use(express.static(__dirname + '/publicstatic'));

app.use(logfmt.requestLogger()); //logfmt hook

//This is called at pirategolf.heroku.com/add
// req == the request's parameters
// res == the response

// res.send is a function that builds the response


//console.log("Running configure...");
/*
pg.connect(config.postgresql, function (err, db) {
  var auth = login(app, db, postmark, { 
    app_name: "Magical Application", 
    base_url: "http://unicorn.example.com", 
    from: "donotreply@example.com"
  });.
});
*/

//console.log("Done!");
//console.log("Building env...");
//app.use(express.static(__dirname + '/public'));
app.get('/env', function(req,res) {
	res.send(JSON.stringify(process.env));
    });
//console.log("Done!");
//For Brianc's sql builder--
var golfHoles = sql.define({
	name: 'GolfRounds',
	columns: ['player','course','tournament','practice','hole','score','fairway','goposition','wedgereg','wedgedist','wedgerough','greeninout','greenletter','putts','updownsuccess','updownbunker','updowninout']
    });
//console.log("Building add...");

function toArray(thing) {
    var res = new Array();
    for( var item in thing) 
	{
	   res.push(thing[item]);
	}
    return res;
}

//console.log("Done!");

//console.log("Generating root directory...");
app.get('/', function(req, res) {
    res.redirect('/!StartPage.html');
  });
//console.log("Done!");
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
app.get('/holeForm',function(req,res) {
//var holes = new Array();
   // for( var i=0; i<18;i++)
 //       holes.push(i+1);
//    res.send(JSON.stringify(holes));
    var stuff = {"holes": holes, "holeForm": hole_form};
    res.send(JSON.stringify(stuff));

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
//console.log("Generating Carousel...");
app.get('/vCarousel',function(req,res) {
//    res.send(JSON.stringify(hole_form));
	res.send(jadeVCarousel({"Holder": {"holes":holes}}));
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
	for(var i=0; i<18;i++)
	    {	    holes.push(i); }

	//TODO: 
	//res.send(JSON.stringify({"Holder": {"fields":insertion_form, "holes":holes}}));
	res.send(jadeCarousel(JSON.stringify( {"fields":JSON.stringify(hole_form),"holes": JSON.stringify(holes)})));

});
//console.log("Done!");
app.get('/edit', function(req,res) {
	//if(req.
	res.send("Stub. Need an editor page");
	// Edit can manage Deletions, updates, and etc.
	//Just need to actually build it/ find one.


    });

// Don't mess with this stuff
//console.log("Generating port...");
var port = process.env.PORT || 5000;
app.listen(port, function() {
	//console.log("Listening on " + port);
    });
//console.log("Done!");
