var express   		= require("express"),
	app   			= express(),
	path 			= require("path"),
	bodyParser 		= require("body-parser"),
	mongoose 		= require("mongoose"),
	passport 		= require("passport"),
	LocalStrategy 	= require("passport-local"),
	Campground 		= require("./models/campground"),
	Comment 		= require("./models/comment"),
	User 			= require("./models/user"),
	seedDB 			= require("./seed");

seedDB();
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost/yelp_camp");


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


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// Define the location of the static files
app.use(express.static(path.join(__dirname, 'public')));

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

app.get("/", function(req, res){
	res.render("landing");
});

// INDEX - Show all campgrounds
app.get("/campgrounds", function(req, res){
	// Get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
		}
	});
});

// Use the same URL "/campgrounds" is fine since get and post are different > Convention
// CREATE - Add new campgrounds to DB
app.post("/campgrounds", function(req, res){
	// get data from form and add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var newCampground = {name: name, image: image, description: desc}
	// Create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			// redirect back to campgrounds page
			res.redirect("/campgrounds");
		}
	});
});

// "/campgrounds/new" > conventional name
// NEW - Show the form that would send the data to the post route
app.get("/campgrounds/new", function(req, res){
	res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
app.get("/campgrounds/:id", function(req, res){
	// find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		} else {
			console.log(foundCampground)
			// render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// ******************************************************
// COMMENTS ROUTES
// ******************************************************

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
	// find campground by id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground});
		}
	});
});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
	// lookup campground using ID
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else {
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
	// create new comment
	// connect new comment to campground
	// redirect campground show page
});

//==================
// AUTH ROUTES
//==================

// Show register form
app.get("/register", function(req, res){
	res.render("register");
});

// Handle sign up logic

app.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/campgrounds");
		});
	});
});

// Show login form
app.get("/login", function(req, res){
	res.render("login");
})

// Handling login logic
// app.post("/login", middleware, callback)
app.post("/login", passport.authenticate("local",
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){
});

// Logout Route
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(3000, function(){
	console.log("The YelpCamp Server Has Started!!!");
});