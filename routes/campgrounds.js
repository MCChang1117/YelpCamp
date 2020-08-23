var express 	= require("express");
var router 		= express.Router();
var Campground 	= require("../models/campground");
// if you require the folder, the system will automatically require index.js under this folder
var middleware 	= require("../middleware");
var multer 		= require('multer');
var cloudinary 	= require('cloudinary');

var storage = multer.diskStorage({
	filename: function(req, file, callback) {
    	callback(null, Date.now() + file.originalname);
  	}
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter})

cloudinary.config({ 
  	cloud_name: process.env.CLOUD_NAME, 
  	api_key: process.env.CLOUDINARY_API_KEY, 
  	api_secret: process.env.CLOUDINARY_API_SECRET
});

// INDEX - Show all campgrounds
router.get("/", function(req, res){
	// Get all campgrounds from DB
	var perPage = 8;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery : 1;
	var matchResult = null;
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.countDocuments({name: regex}).exec(function (err, count) {
				if(err){
					console.log(err);
					res.redirect('back');
				} else {
					if(allCampgrounds.length < 1){
						matchResult = 'No campgrounds match "' + req.query.search + '", please try again.';					
					} else {
						matchResult = 'Campgrounds match "' + req.query.search + '" :';
					}
					res.render("campgrounds/index", {
						campgrounds: allCampgrounds, 
						matchResult: matchResult,
						current: pageNumber, 
						pages: Math.ceil(count / perPage),
						search: req.query.search
					});
				}
			});
		});
	} else {
		Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.countDocuments().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        matchResult: matchResult,
                        search: false
                    });
                }
            });
        });
	}	
});

// Use the same URL "/campgrounds" is fine since get and post are different > Convention
// CREATE - Add new campgrounds to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
	 cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      	if(err) {
        	req.flash('error', err.message);
        	return res.redirect('back');
      	}
      	// add cloudinary url for the image to the campground object under image property
      	req.body.campground.image = result.secure_url;
      	// add image's public_id to campground object
      	req.body.campground.imageId = result.public_id;
      	// add author to campground
      	req.body.campground.author = {
        	id: req.user._id,
        	username: req.user.username
      	}	
      	Campground.create(req.body.campground, function(err, campground) {
        	if (err) {
          	req.flash('error', err.message);
          	return res.redirect('back');
       		}
       		// req.flash("success", campground.name + " Campground Successfully Created!");
        	res.redirect('/campgrounds/' + campground.id);
      	});
    });
});

// "/campgrounds/new" > conventional name
// NEW - Show the form that would send the data to the post route
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
	// find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		} else {
			// render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		res.render("campgrounds/edit", {campground: campground});
	});
});

// UPDATE Campground Route

router.put("/:id", upload.single('image'), function(req, res){
	// Find and update the correct campground
	Campground.findById(req.params.id, async function(err, campground){
		if(err){
			req.flash('error', err.message);
			res.redirect("back");
		} else {
			if (req.file) {
				try {
					await cloudinary.v2.uploader.destroy(campground.imageId);
					var result = await cloudinary.v2.uploader.upload(req.file.path);
					campground.imageId = result.public_id;
					campground.image = result.secure_url;
				} catch(err) {
					req.flash('error', err.message);
					res.redirect("back");
				};
			};
			campground.price = req.body.campground.price;
			campground.name = req.body.campground.name;
			campground.description = req.body.campground.description;
			campground.save();
			req.flash("success", "Successfully Updated!");
			res.redirect("/campgrounds/" + campground._id);
		}
	});
	// Redirect somewhere(show page)
})

// DESTROY Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, async function(err, campground){
//	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			req.flash('error', err.message);
			return res.redirect("back");
		} else {
			try {
				await cloudinary.v2.uploader.destroy(campground.imageId);
				campground.remove();
				req.flash('success', 'Campground deleted successfully!');
				res.redirect("/campgrounds");
			} catch (err) {
				req.flash('error', err.message);
				return res.redirect("back");
			}
		}
	})
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;