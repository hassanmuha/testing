const express = require("express");
const session = require("express-session");
const passport = require("passport");
const appID = require("ibmcloud-appid"); 
const WebAppStrategy = appID.WebAppStrategy;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


// connection to the database over mongodb
const url = "mongodb+srv://hassan:test@cluster0.ixu4d.mongodb.net/petcare?retryWrites=true&w=majority";

mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,});

const formSchema = new mongoose.Schema(
	{
		data: Object,
	},
	{
		collection: "contact"
	}
);

const Form  = mongoose.model("Form", formSchema);
const formData = (bodyData) => {
	Form ({data: bodyData}).save((err) => {
		if (err){
			throw err;
		}
	});
};


const app = express();


const port = process.env.PORT || 8082; //Project Port set to 8082


// Setup express application to use express-session middleware
// environments. See https://github.com/expressjs/session for
// additional documentation
// Must be configured with proper session storage for production

app.use(session({
	secret: "123456",
	resave: true,
	saveUninitialized: true,
	proxy: true
}));


// Configure express application to use passportjs
app.use(passport.initialize());
app.use(passport.session());


// Configure passportjs with user serialization/deserialization. This is required
// for authenticated session persistence accross HTTP requests. See passportjs docs
// for additional information http://passportjs.org/docs
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

passport.use(new WebAppStrategy({
	tenantId: "2f179ec2-b25a-4d77-9e0e-5c53c197fd09",
	clientId: "973acd02-e6d4-4b45-a35d-0be651f65687",
	secret: "YTIyYTA2NGYtMDU5Yi00Y2NjLTg5YjAtNjllNjc1ODZhMjFh",
	oauthServerUrl: "https://us-south.appid.cloud.ibm.com/oauth/v4/2f179ec2-b25a-4d77-9e0e-5c53c197fd09",
	redirectUri: "http://localhost:8082/appid/callback"
}));

// Handle callback
app.get('/appid/callback', passport.authenticate(WebAppStrategy.STRATEGY_NAME));


// Handle logout
app.get('/appid/logout', function(req, res){
	WebAppStrategy.logout(req);
	res.redirect('/');
});

// Protect the whole app
app.use(passport.authenticate(WebAppStrategy.STRATEGY_NAME));

// The /api/user API used to retrieve name of a currently logged in user
app.get('/api/user', (req, res) => {
	
	res.json({
		user: {
			name: req.user.name
		}
	});
});

// Serve static resources
app.use(express.static('./public'));


//Start server
app.listen(8082,() =>{
    console.log("Listening on Port http://localhost:8082");
});

//MongoDb 

const urlencodedParser = bodyParser.urlencoded({extended: false})

// The API used to post form values to mongodb 
app.post('/contact', urlencodedParser, (req, res) => {
	formData (req.body);
	res.redirect('/');
		
	});