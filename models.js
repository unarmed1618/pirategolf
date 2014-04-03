var crypto = require('crypto'),
    Document,
    User,
    LoginToken,
    Team,
    GameHole,
    Game,
    CourseHole,
    Course;

function extractKeywords(text) {
  if (!text) return [];

  return text.
    split(/\s+/).
    filter(function(v) { return v.length > 2; }).
    filter(function(v, i, a) { return a.lastIndexOf(v) === i; });
}

function defineModels(mongoose, fn) {
  var Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

  /**
    * Model: Document
    */
  Document = new Schema({
    'title': { type: String, index: true },
    'data': String,
    'tags': [String],
    'keywords': [String],
    'user_id': ObjectId
  });

  Document.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  Document.pre('save', function(next) {
    this.keywords = extractKeywords(this.data);
    next();
  });

  /**
    * Model: Team  
    */
    Team = new Schema({
	
	'team_name' : String,
	'team_description' : String,
	'status' : String,
	'members' : [ObjectId]
    });
    Team.virtual('id')
	.get(function() {
	    return this._id.toHexString();
	});
  /**
    * Model: GameHoles
    */
GameHole = new Schema({
'gameid' : ObjectId,
'userid' : ObjectId,
'holeid' : ObjectId,
'holenum' : { type: String, index: true },
'holescore' : String,
'fairway' : String,
'goposition' : String,
'stroke_in_reg' : String,
'stroke_in_rough' : String,
'wedgedist' : String,
'greeninout' : String,
'where_on_green' : String,
'putts' : String,
'updown_success' : String,
'updown_bunker' : String,
'updown_inside_5' : String,
'score_to_par': String
});
  GameHole.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });
  /**
    * Model: Game
    */
Game = new Schema({
'user_id': ObjectId,
'course_id': ObjectId,
'game_type': String,
'game_date': String,
'total_score': String,
'adjusted_score': String,
'holes_played': String,
'game_completed': String,
'total_score_to_par': String,
'average_score': String

});
 Game.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });
  /**
    * Model: CourseHole
    */
    CourseHole = new Schema({
	'course_id': ObjectId,
	'hole_num' : { type: String, index: true },
	'hole_par' : String,
	'status' : String,
	'activity date' : String
    });
    CourseHole.virtual('id')
	.get(function() {
	    return this._id.toHexString();
	});
  /**
    * Model: Course -- Holds the holes
    */
Course = new Schema({
'course_name' : String,
'number_of_holes' : String,
'course_description' : String,
'course_location' : String,
'green_type' : String,
'has_pic': String,
'pic_location': String,
'status' : String,
'par_total' : String
});
    Course.virtual('id')
        .get(function() {
            return this._id.toHexString();
        });
  /**
    * Model: User -- User is combined with credentials.
    */
  function validatePresenceOf(value) {
    return value && value.length;
  }

  User = new Schema({
    'email': { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
    'last_name' : String,
    'first_name' : String,
    'displayname' : String,
    'username' : String,
    'user_type' : String,
    'phone' : String,
    'status' : String,
    'activityDate' : String,
    'failedAttempts' : String,
    'account_lock' : String,
    'hint' : String,
    'hashed_password': String,
    'salt': String
  });

  User.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  User.virtual('password')
    .set(function(password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashed_password = this.encryptPassword(password);
    })
    .get(function() { return this._password; });

  User.method('authenticate', function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  });
  
  User.method('makeSalt', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });

  User.method('encryptPassword', function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  });

  User.pre('save', function(next) {
    if (!validatePresenceOf(this.password)) {
      next(new Error('Invalid password'));
    } else {
      next();
    }
  });

  /**
    * Model: LoginToken
    *
    * Used for session persistence.
    */
  LoginToken = new Schema({
    email: { type: String, index: true },
    series: { type: String, index: true },
    token: { type: String, index: true }
  });

  LoginToken.method('randomToken', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });

  LoginToken.pre('save', function(next) {
    // Automatically create the tokens
    this.token = this.randomToken();

    if (this.isNew)
      this.series = this.randomToken();

    next();
  });

  LoginToken.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  LoginToken.virtual('cookieValue')
    .get(function() {
      return JSON.stringify({ email: this.email, token: this.token, series: this.series });
    });

  mongoose.model('Document', Document);
  mongoose.model('User', User);
  mongoose.model('LoginToken', LoginToken);
  mongoose.model('Team', Team);
  mongoose.model('GameHole', GameHole);
  mongoose.model('Game', Game);
  mongoose.model('CourseHole', CourseHole);
  mongoose.model('Course', Course);
  fn();
}

exports.defineModels = defineModels; 

