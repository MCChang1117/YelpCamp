var express   		= require("express"),
	app   			= express(),
	path 			= require("path"),
	bodyParser 		= require("body-parser"),
	mongoose 		= require("mongoose"),
	passport 		= require("passport"),
	LocalStrategy 	= require("passport-local"),
	methodOverride 	= require("method-override"),
	Campground 		= require("./models/campground"),
	Comment 		= require("./models/comment"),
	User 			= require("./models/user"),
	seedDB 			= require("./seed");

// requiring routes
var commentRoutes 		= require("./routes/comments"),
	campgroundRoutes 	= require("./routes/campgrounds"),
	indexRoutes 		= require("./routes/index");

// seedDB(); // seed the database
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost/yelp_camp");


/*Campground.create(
	{
		name: "Taichung", 
		image: "https://source.unsplash.com/2400x1600/?camp",
		description: "It's in the middle of Taiwan"
	}, function(err, campground){
		if(err){
			console.log(err);
		} else {
			console.log("NEWLY CREATED CAMPGROUND: ");
			console.log(campground);
		}
	});*/


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// Define the location of the static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));

/*var campgrounds = [
	{name: "Taipei", image: "https://source.unsplash.com/1600x900/?camp"},
	{name: "Taichung", image: "https://source.unsplash.com/2400x1600/?camp"},
	{name: "Hsinchu", image: "https://source.unsplash.com/1920x1458/?camp"}, 
	{name: "Tainan", image: "https://source.unsplash.com/1600x900/?night"}, 
	{name: "Kaoshung", image: "https://source.unsplash.com/daily"}, 
	{name: "Taoyuan", image: "https://source.unsplash.com/user/scottagoodwill"}, 
	{name: "Taitung", image: "https://source.unsplash.com/1920x1280/?camp"}, 
	{name: "New Taipei", image: "https://source.unsplash.com/1600x900/?tent"},
	{name: "E.SUN", image: "https://source.unsplash.com/1600x900/?mountain"}
];
*/

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

// Make the variable, currectUser, available to all pages
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000, function(){
	console.log("The YelpCamp Server Has Started!!!");
});