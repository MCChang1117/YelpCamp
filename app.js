var express   		= require("express"),
	app   			= express(),
	path 			= require("path"),
	bodyParser 		= require("body-parser"),
	mongoose 		= require("mongoose"),
	flash 			= require("connect-flash"),
	passport 		= require("passport"),
	LocalStrategy 	= require("passport-local"),
	methodOverride 	= require("method-override"),
	Campground 		= require("./models/campground"),
	Comment 		= require("./models/comment"),
	User 			= require("./models/user"),
	seedDB 			= require("./seed");

require('dotenv').config();

var PORT 	= process.env.PORT;
var url 	= process.env.DATABASEURL;

// requiring routes
var commentRoutes 		= require("./routes/comments"),
	campgroundRoutes 	= require("./routes/campgrounds"),
	indexRoutes 		= require("./routes/index");

// seedDB(); // seed the database
mongoose.connect(url, {
	// The following codes are used to solve DeprecationWarning issue
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useCreateIndex: true
});

// ***********************************************************************************
// Create data manually
// ***********************************************************************************

// Originally, These codes are used to create the sample data in campground

// Campground.create(
// 	{
// 		name: "Taichung", 
// 		image: "https://source.unsplash.com/2400x1600/?camp",
// 		description: "It's in the middle of Taiwan"
// 	}, function(err, campground){
// 		if(err){
// 			console.log(err);
// 		} else {
// 			console.log("NEWLY CREATED CAMPGROUND: ");
// 			console.log(campground);
// 		}
// 	});
// ***********************************************************************************

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// Define the location of the static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));
app.use(flash());

// ***********************************************************************************
// Image URL
// ***********************************************************************************

// All images are exported from unsplash

// var campgrounds = [
// 	{name: "Taipei", image: "https://source.unsplash.com/1600x900/?camp"},
// 	{name: "Taichung", image: "https://source.unsplash.com/2400x1600/?camp"},
// 	{name: "Hsinchu", image: "https://source.unsplash.com/1920x1458/?camp"}, 
// 	{name: "Tainan", image: "https://source.unsplash.com/1600x900/?night"}, 
// 	{name: "Kaoshung", image: "https://source.unsplash.com/daily"}, 
// 	{name: "Taoyuan", image: "https://source.unsplash.com/user/scottagoodwill"}, 
// 	{name: "Taitung", image: "https://source.unsplash.com/1920x1280/?camp"}, 
// 	{name: "New Taipei", image: "https://source.unsplash.com/1600x900/?tent"},
// 	{name: "E.SUN", image: "https://source.unsplash.com/1600x900/?mountain"}
// ];

// ***********************************************************************************

app.locals.moment = require("moment");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Once again Rusty wins cutest dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make the following variables be available to all pages
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(PORT, () => console.log("The YelpCamp Server Has Started!!!"))