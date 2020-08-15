var express 	= require("express");
var router 		= express.Router();
var passport 	= require("passport");
var User 		= require("../models/user");
var middleware 	= require("../middleware");

router.get("/", function(req, res){
	res.render("landing");
});

//==================
// AUTH ROUTES
//==================

// Show register form
router.get("/register", function(req, res){
	res.render("register", {page: "register"});
});

// Handle sign up logic

router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	// eval(require("locus")) // Stop the code, so developer could take a look
	if(req.body.adminCode === 'secretCode') {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if(err){
		    console.log(err);
		    return res.render("register", {error: err.message});
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Successfully Signed Up! Nice to meet you " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

// Show login form
router.get("/login", function(req, res){
	res.render("login", {page: "login"});
})

// Handling login logic
// app.post("/login", middleware, callback)
router.post("/login", passport.authenticate("local",
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){
});

// Logout Route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!")
	res.redirect("/campgrounds");
});

module.exports = router;