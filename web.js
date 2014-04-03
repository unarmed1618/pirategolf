//Form now posts successfully to the database

var express = require('express'),
    connect = require('connect'),
    jade = require('jade'),
    app = module.exports = express.createServer(),
//    app = module.exports = express(),
    mongoose = require('mongoose'),
    mongoStore = require('connect-mongodb'),
    mailer = require('mailer'),
    stylus = require('stylus'),
    markdown = require('markdown').markdown,
    connectTimeout = require('connect-timeout'),
    util = require('util'),
    path = require('path'),
    models = require('./models'),
    db,
    Document,
    User,
    Team,
    LoginToken,
    Course,
    CourseHole,
    Game,
    GameHole,
    Settings = { development: {}, test: {}, production: {} },
    emails,
    jquery = require("jquery"),
    logfmt = require("logfmt"),
    fs = require('fs'),
    sql = require('sql'),
    jadeOptions = {filename: './', pretty:true };
//var jadeStatsBox = fs.readFileSync('new.jade').toString();
//var newUserJade = jade.compile(jadeStatsBox, jadeOptions);
var bcrypt = require("bcrypt");
//console.log("vars up except pg");
function renderJadeFile(template, options) {
  var fn = jade.compile(template, options);
  return fn(options.locals);
}
//if(process.env.PWD == "/app"||"/Users/johndarrow/pirategolfWS/pirategolf")
//    var pg = require("pg").native;
//else
//   var pg = require("pg");
//console.log("pg built");
var forms = require("forms");
var holes = [1, 2, 3,4, 5, 6, 7, 8, 9, 10, 11, 12, 13,14,15,16,17,18];
// Plugin Declarations complete

// Local variables necessary for plugins
// String for connecting to the database so it can be changed if necessary-
//var conString = "postgres://zfaagftogdvhjz:pcXlJD1bP9AygIM7ivINuDOHvS@ec2-184-73-194-196.compute-1.amazonaws.com/dfcvk500ed0il4";
      

emails = {
  send: function(template, mailOptions, templateOptions) {
    mailOptions.to = mailOptions.to;
    renderJadeFile(path.join(__dirname, 'views', 'mailer', template), templateOptions, function(err, text) {
      // Add the rendered Jade template to the mailOptions

// Only send mails in production                                        
      mailOptions.body = text;
      // Merge the app's mail options                             
      var keys = Object.keys(app.set('mailOptions')),
          k;
      for (var i = 0, len = keys.length; i < len; i++) {
        k = keys[i];
        if (!mailOptions.hasOwnProperty(k))
          mailOptions[k] = app.set('mailOptions')[k]
      }

      console.log('[SENDING MAIL]', util.inspect(mailOptions)); 
      if (app.settings.env == 'production') {
        mailer.send(mailOptions,
          function(err, result) {
            if (err) {
              console.log(err);
            }
          }
		    );
      }
    });
  },

  sendWelcome: function(user) {
    this.send('welcome.jade', { to: user.email, subject: 'Welcome to Nodepad' }, { locals: { user: user } });
  }
};

app.helpers(require('./helpers.js').helpers);
app.dynamicHelpers(require('./helpers.js').dynamicHelpers);

app.configure('development', function() {
  app.set('db-uri', 'mongodb://human:human@ds035448.mongolab.com:35448/heroku_app21249341');
  app.use(express.errorHandler({ dumpExceptions: true }));
  app.set('view options', {
    pretty: true
  });
});

app.configure('test', function() {
  app.set('db-uri', 'mongodb://human:human@ds035448.mongolab.com:35448/heroku_app21249341');
  app.set('view options', {
    pretty: true
  });
});

app.configure('production', function() {
  app.set('db-uri', 'mongodb://human:human@ds035448.mongolab.com:35448/heroku_app21249341');
});

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  //app.use(connectTimeout({ time: 10000 }));
  app.use(express.session({ store: mongoStore(app.set('db-uri')), secret: 'topsecret' }));
  app.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }))
  app.use(express.methodOverride());
  app.use(stylus.middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  app.set('mailOptions', {
    host: 'localhost',
    port: '25',
    from: 'nodepad@example.com'
  });
});

models.defineModels(mongoose, function() {
 // app.Document = Document = mongoose.model('Document');
  app.User = User = mongoose.model('User');
  app.LoginToken = LoginToken = mongoose.model('LoginToken');
  app.Team = Team = mongoose.model('Team');
  app.Course = Course = mongoose.model('Course');
  app.CourseHole = CourseHole = mongoose.model('CourseHole');
  app.Game = Game =mongoose.model('Game');
  app.GameHole = GameHole = mongoose.model('GameHole');

  db = mongoose.connect(app.set('db-uri'));
})

function authenticateFromLoginToken(req, res, next) {
  var cookie = JSON.parse(req.cookies.logintoken);

  LoginToken.findOne({ email: cookie.email,
                       series: cookie.series,
                       token: cookie.token }, (function(err, token) {
    if (!token) {
      res.redirect('/sessions/new');
      return;
    }

    User.findOne({ email: token.email }, function(err, user) {
      if (user) {
       req.session.user_id = user.id;
        req.currentUser = user;

        token.token = token.randomToken();
        token.save(function() {
          res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
          next();
        });
      } else {
        res.redirect('/sessions/new');
     }
    });
  }));
}
function loadUserPassive(req,res,next) {
console.log("Entered passiveLoad");
    if (req.session.user_id) {
	console.log("Entered If");
	User.findByID(req.session.user_id, function(err,user) {
	    if (user) {
		console.log("Found User");
		req.currentUser = user;
		next();
	    }  else {
		console.log("User not Found");
		next();
		}
});
} else {
    console.log("No user logged in");
    next();
}
}
function loadUser(req, res, next) {
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(err, user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/sessions/new');
      }
    });
  } else if (req.cookies.logintoken) {
    authenticateFromLoginToken(req, res, next);
  } else {
    res.redirect('/sessions/new');
  }
}
app.get('/loadNav', loadUserPassive, function(req,res) {

 //res.render('banner.jade', { locals: { currentUser: req.currentUser}});


res.redirect('/BannerPage.html');


});


app.post('/AddCourseForm.html', function(req,res) {
    var c = new Course();
    var rp = req.body;
    console.log(rp.location);
    c.course_name = rp.course_name;
    c.number_of_holes = rp.numholes;
    c.course_description = rp.description;
    c.course_location = rp.location;
    c.green_type = rp.greentype;
    c.status = "Active";
    var total = 0;
//    var courseholes = new Array();
    var coursepars = [rp.hole1par,rp.hole2par,rp.hole3par,rp.hole4par,rp.hole5par,rp.hole6par,rp.hole7par, rp.hole8par, rp.hole9par, rp.hole10par,rp.hole11par,rp.hole12par,rp.hole13par,rp.hole14par,rp.hole15par,rp.hole16par,rp.hole17par, rp.hole18par]; 
    
    for(var i =1; i<=parseInt(rp.numholes); i++)
    {
	//console.log("In Array");
	ch = new CourseHole();
	ch.course_id = c.id;
	ch.hole_num = i;
	ch.hole_par = coursepars[i];
	ch.save();
	total = total + parseInt(coursepars[i]);
    }
	c.par_total = total;
c.save();    
});
//Get all courses as list
app.get('/courselist', function(req, res) {
Course.find({}, function(err, courses){
if(courses) {
res.render('courseList.jade', {'locals': {'courses': courses}});
}
else {
res.send('No Courses Found :(');
}
})});
app.get('/coursetable', function(req, res) {
Course.find({}, function(err, courses){
if(courses) {
res.render('courseTable.jade', {'locals': {'courses': courses}});
}
else {
res.send('No Courses Found :(');
}})
});
//Detail form for course with hole data
// Not working presently.
app.get('/course/:id', function(req, res) {
Course.findOne({'id':req.params[0]}, function(err, course){
if(course) {
CourseHole.find({'course_id':course.id}, function(err, holes){
if(holes)
{res.render('courseHolesTable.jade', {'locals': {'course': course, 'holes': holes}});
} else {
res.send('No Holes on this Course :(');
}
});
} else {
res.send('Course Not Found :(');
}})
});
//Edit and delete functions. Modify Later.
app.put('/course/:id?',function(req, res) {
});
app.del('/course/:id?',function(req, res) {
});
/*
// Courses                                                              
app.post('/course.:format?', function(req,res) {
});
app.get('/course/:id?', function(req, res) {
});
app.put('/course/:id?',function(req, res) {
});
app.del('/course/:id?',function(req, res) {
});
// Courses
app.post('/course.:format?', function(req,res) {
});
app.get('/course/:id?', function(req, res) {
});
app.put('/course/:id?', function(req, res) {
});
app.del('/course/:id?', function(req, res) {
});
*/
// Users                                                               
app.get('/users/new', function(req, res) {
  res.render('users/new.jade', {
    locals: { user: new User(), method:"post" }
  });
});
// A list of all users
app.get('/users', function(req,res){
User.find({}, function(err, users) {
    if(users) {
	res.render('usersTable.jade', {locals: { 'users': users }});
    }
    else {
	res.send("No Users Found :(");
    }
    });
});
//Edit existing
app.get('/users/:id', function(req, res){
User.findOne({'id': req.params[0]}, function(err, user){
if(user)
{
res.render('users/new.jade', {
    locals: { 'user': user, 'method': 'put'  }
  });
} else {
res.send("User not found :(");
}
});
});
app.post('/users.:format?', function(req, res) {
  var user = new User(req.body.user);

  function userSaveFailed() {
    req.flash('error', 'Account creation failed');
    res.render('users/new.jade', {
      locals: { user: user }
    });
  }

  user.save(function(err) {
    if (err) return userSaveFailed();
 
req.flash('info', 'Your account has been created');
    emails.sendWelcome(user);

    switch (req.params.format) {
      case 'json':
        res.send(user.toObject());
      break;

      default:
        req.session.user_id = user.id;
        res.redirect('/Landing.html');
    }
  });
});

// Sessions                                                                   
app.get('/sessions/new', function(req, res) {
   res.redirect('/LoginPage.html');
//   res.render('sessions/new.jade', {
 //   locals: { user: new User() }
 // });
});
app.post('/sessions', function(req, res) {
  User.findOne({ email: req.body.user.email }, function(err, user) {
    if (user && user.authenticate(req.body.user.password)) {
      req.session.user_id = user.id;

      // Remember me                                          
      if (req.body.remember_me) {
        var loginToken = new LoginToken({ email: user.email });
        loginToken.save(function() {
          res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/Landing.html' });
          res.redirect('/Landing.html');
        });
      } else {//no remember
        res.redirect('/Landing.html');
      }
    } else {
      req.flash('error', 'Incorrect credentials');
      res.redirect('/sessions/new');
    }
  });

});

app.del('/sessions', loadUser, function(req, res) {
  if (req.session) {
    LoginToken.remove({ email: req.currentUser.email }, function() {});
    res.clearCookie('logintoken');
    req.session.destroy(function() {});
  }
  res.redirect('/sessions/new');
});




if(process.env.PWD == "/app")
    var conString = process.env.DATABASE_URL;
else if(process.env.PWD == "/Users/johndarrow/pirategolfWS/pirategolf")
    var conString = "postgres://zfaagftogdvhjz:pcXlJD1bP9AygIM7ivINuDOHvS@ec2-184-73-194-196.compute-1.amazonaws.com/dfcvk500ed0il4";
else
    var conString = "postgres://postgres:postgres@localhost/localGolf";



// Client instatiation
//console.log("Creating client at " + conString + "...");
//var client = new pg.Client(conString);
//console.log("Done!");
//Forms hooks
var fields = forms.fields, validators = forms.validators, widgets = forms.validators;



var buff = "Database:"; 

app.use(express.static(__dirname + '/publicstatic'));

app.use(logfmt.requestLogger()); //logfmt hook

app.get('/env', function(req,res) {
	res.send(JSON.stringify(process.env));
    });


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

//console.log("Generating Carousel...");
app.get('/vCarousel',loadUser,function(req,res) {
//    res.send(JSON.stringify(hole_form));
        res.render('vCarousel.jade',{"Holder": {"holes":holes}});
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
	console.log("Listening on " + port);
//console.log('Express server listening on port %d, environment: %s', app.address().port, app.settings.env)
  console.log('Using connect %s, Express %s, Jade %s', connect.version, express.version, jade.version); 

   });
//console.log("Done!");
