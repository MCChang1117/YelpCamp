# YelpCamp Project

# Before you start

If you have not set "nodemon" before, please see "setup_automate_server_restart.txt" and follow the instruction

# Setup a new blank project

## 1. Setup packages (git bash):

### Create the folder and initialize the npm

	mkdir "The Folder"
	cd to the folder	
	npm init

#### in npm setting

* Set entry point to app.js (preference)
* Other variables use the default

### Create the main javascript file and install all required packages

	touch app.js
	npm install --save express ejs body-parser request mongoose method-override express-sanitizer

#### Package Description

* body-parser package: Extract the data from server side (from form)
* ejs package: make a page look like html but it can also use javascript syntax
* mongoose: ODM (Object Data Mapper) > Interact the database (mongodb) within javascript file
* method-override: HTTP does not support method other than POST (e.g. PUT, DELETE)
	* a way to separete different RESTful ROUTE out
* express-sanitizer: Sanitize the input
	* e.g. Avoid the input of script "Alert"
	
### Open the database

	mongod

* Type the above code in a NEW git bash whose file path is set as default

## 2. Setup basic code for running the server (in app.js):

### Define variables

	var express 		= require("express");
	var app 			= express();
	var bodyParser 		= require("body-parser");
	var request 		= require("request");
	var path 			= require("path");
	var mongoose 		= require("mongoose");
	var methodOverride 	= require("method-override"),

### Body Parser setting

	app.use(bodyParser.urlencoded({extended: true}));

* Do not explain in the lesson, just type the code

### ejs setting

	app.set("view engine", "ejs");

* Function: include ejs file without typing .ejs

### method-override setting

	app.use(methodOverride("_method"));

### express-sanitizer setting

	app.use(expressSanitizer());
* Goes after "Body Parser Setting"

### Static file path setting

	app.use(express.static(path.join(__dirname, 'public')));

* e.g. for external css file

### Connect to the database and set the data format

#### Connect to the database

	mongoose.set('useUnifiedTopology', true);
	mongoose.set('useNewUrlParser', true);
	mongoose.connect("mongodb://localhost/'database'");

* If you have any issues about "Deprecation Warnings", please see this [website](https://mongoosejs.com/docs/deprecations.html)
* mongoose.set: solve the deprecation warnings (useUnifiedTopology & useNewUrlParser)

#### Define a pattern for the data

	var campgroundSchema = new mongoose.Schema({
		name: String,
		image: String
	});

#### Compile and save to the model

	var Campground = mongoose.model("Campground", campgroundSchema);

* Do things by using "Campground" (e.g. Campground.create();)

### listen

	app.listen(3000, function(){
		console.log("Server listening on port 3000");
	});

* Function: Tell Express to listen for request (start server)

### set home page

	app.get("/", function(req, res){
		res.render("home");
	});

## 3. Run the back-end server (git bash):

### Create the correspond homepage ejs file

	mkdir views
	touch views/home.ejs

* Type anything inside "home.ejs" to make sure it connects successfully 

		<h1>HOME PAGE</h1>

### Start the back-end server

	nodemon

- You should eee the message "Server listening on port 300" in git bash
- Open the browser and type the following URL > localhost:3000
- Once you save "app.js", the back-end server will start automatically

# mongodb setting (in git bash)

## Install and set the enviroment variables for mongodb

### Create the data folder and the necessary subfolder for mongodb

	mkdir /c/data
	mkdir /c/data/db

## Open git bash in "default file path"

## Start the database

### in git bash

	mongod

* File path: C:\mongodb\bin\mongod.exe
* Function: Start the database and keep it running in the background, Node.js could be able to connect to it

## Open mongo shell and connect to the database

### Open "ANOTHER" git bash

	mongo

- File path: C:\mongodb\bin\mongo.exe
- Function: Mongodb shell to will connect the database
- In mongod git bash, there will be a message "connection accepted from..."
- The following steps are executed in mongo git bash

## Create and set the separate database

### Make a separate database for every app that we made

	use "the database" 

* e.g. use demo

### Insert the data into the database

	db."collection".insert("data")

* Explain: The data put in () will be inserted to the "collection" in the database just set in the previous step
* The following is an example (dogs > collection, {} > data):

		db.dogs.insert({
			"name": "Lucy",
			"breed": "Mutt"
		});

# Notes

## {datas: data}

	res.render("results", {datas: data});

* Explain: Pass the object "data" from app.js to results.ejs with the variable's name "datas"

## action="/results", name="search"

	<form action="/results" method="GET">
		<input type="text" placeholder="search term" name="search">
		<input type="submit">
	</form>

* name: Where the input variable stores
* results: The page that will go to after submitting the input

## External css file path

	app.use(express.static(path.join(__dirname, 'public')));

### put the bootstrap.css into the following directory

	./public
		/css
			/bootstrap.css
	./views
		/partials
			/header.ejs
	./app.js

* bootstrap.css: where to put bootstrap.css
* header.ejs: link to css with the static path: public (No matter how header.ejs changes the path, the link always refers to public)
* app.js: type the static file path setting

### in header.ejs, type link in following form
	
	<link rel="stylesheet" type="text/css" href="/css/bootstrap.css">

## RESTFUL ROUTES

name 	| url 			| verb 	| description
--------|---------------|-------|----------------------------------
INDEX 	| /dogs 		| GET 	| Display a list of all dog
NEW 	| /dogs/new 	| GET 	| Display form to make a new dog
CREATE 	| /dogs 		| POST 	| Add new dog to DB
SHOW 	| /dogs/:id 	| GET 	| Shows info about one dog

* ``/dogs/:id`` in SHOW: show the things IN PARTICULAR
* REST: a mapping between HTTP routes and CRUD
	* CRUD:
		- CREATE
		- READ
		- UPDATE
		- DESTROY

## <%= blog.body %> versus <%- blog.body %>

* =: Just display the string
* -: Evaluate and run the return as the code