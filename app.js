var express   	= require("express"),
	app   		= express(),
	path 		= require("path"),
	bodyParser 	= require("body-parser"),
	mongoose 	= require("mongoose");

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost/yelp_camp");

// SCHEMA SETUP (We will put these into separate file)

var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

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
			res.render("index", {campgrounds: allCampgrounds});
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
	res.render("new");
});

// SHOW - shows more info about one campground
app.get("/campgrounds/:id", function(req, res){
	// find the campground with provided ID
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err);
		} else {
			// render show template with that campground
			res.render("show", {campground: foundCampground});
		}
	});
});

app.listen(3000, function(){
	console.log("The YelpCamp Server Has Started!!!");
});