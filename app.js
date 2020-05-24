var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// Define the location of the static files
app.use(express.static(path.join(__dirname, 'public')));

var campgrounds = [
	{name: "Taipei", image: "https://pixabay.com/get/52e3d5404957a514f1dc84609620367d1c3ed9e04e507440752d79d3904fc6_340.jpg"},
	{name: "Taichung", image: "https://pixabay.com/get/55e8dc404f5aab14f1dc84609620367d1c3ed9e04e507440752d79d3904fc6_340.jpg"},
	{name: "Hsinchu", image: "https://pixabay.com/get/57e8d0424a5bae14f1dc84609620367d1c3ed9e04e507440752d79d3904fc6_340.jpg"},
	{name: "Tainan", image: "https://pixabay.com/get/52e8d4444255ae14f1dc84609620367d1c3ed9e04e507440752d79d3904fc6_340.jpg"},
	{name: "Kaoshung", image: "https://pixabay.com/get/57e1dd4a4350a514f1dc84609620367d1c3ed9e04e507440752d79d3904fc6_340.jpg"},
	{name: "Taoyuan", image: "https://pixabay.com/get/57e8d1454b56ae14f1dc84609620367d1c3ed9e04e507440752d79d3904fc6_340.jpg"},
	{name: "Taitung", image: "https://pixabay.com/get/57e1d14a4e52ae14f1dc84609620367d1c3ed9e04e507440752d79d3904fc6_340.jpg"},
	{name: "New Taipei", image: "https://pixabay.com/get/54e5dc474355a914f1dc84609620367d1c3ed9e04e507440752d79d3904fc6_340.jpg"},
	{name: "E.SUN", image: "https://pixabay.com/get/57e8d1464d53a514f1dc84609620367d1c3ed9e04e507440752d79d3904fc6_340.jpg"}
];

app.get("/", function(req, res){
	res.render("landing");
});

app.get("/campgrounds", function(req, res){
	res.render("campgrounds", {campgrounds: campgrounds});
});

// Use the same URL "/campgrounds" is fine since get and post are different > Convention
// Create a new campground
app.post("/campgrounds", function(req, res){
	// get data from form and add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var newCampground = {name: name, image: image}
	campgrounds.push(newCampground);
	// redirect back to campgrounds page
	res.redirect("/campgrounds");
});

// "/campgrounds/new" > conventional name
// Show the form that would send the data to the post route
app.get("/campgrounds/new", function(req, res){
	res.render("new");
});

app.listen(3000, function(){
	console.log("The YelpCamp Server Has Started!!!");
});