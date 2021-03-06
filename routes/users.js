var express = require('express');
var app = express.Router();
var Q = require("q");
var UserController = require("../userController");
var UserModel = require("../models/user");
// var Book = require("../models/book");

// Send the error message back to the client
var sendError = function (req, res, err, message) {
  console.log('Render the error template back to the client.');
  res.render("error", {
    error: {
      status: 500,
      stack: JSON.stringify(err.errors)
    },
    message: message
  });
};

// Retrieve all auction items for the current user
var getUserItems = function (userId) {
  var deferred = Q.defer();

  console.log('Another promise to let the calling function know when the database lookup is complete');
  console.log()
  Items.find({user: userId}, function (err, items ) {
    //console.log(err,books);
    if (!err) {
      console.log('User found');
      console.log('No errors when looking up items. Resolve the promise (even if none were found).');
      deferred.resolve(index);
    } else {
      console.log('There was an error looking up items. Reject the promise.');
      deferred.reject(err);
    }
  });

  return deferred.promise;
};
// Handle the request for the registration form


app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  console.log("inside /user/register");
  res.render("register");
});

app.get("/index", function (req, res) {
  console.log("inside /user/register");
  res.render("index",{
    title: "Welcome to Savings Multiplied",
    username: UserController.getCurrentUser().username,
    item_props:{}
  });
});


app.post("/register", function (req, res) {
  UserModel.findOne({username: req.body.username}, function(err, item) {
    if (err) {
      console.log(err);
    } else {
      console.log("looked in user database; returned", item);
      if (item === null) {
        // save user info to database
        var newUser = new UserModel(req.body);
        newUser.save(function(err, user) {
          if (err) {
            sendError(req, res, err, "Failed to register user");
          } else {
            console.log("New user registered and saved to database");
          }
        });

        setTimeout(function() { // SET TIMEOUT START

        // login user

          UserController.login(req.body.username, req.body.password)

            // After the database call is complete and successful,
            // the promise returns the user object
            .then(function (validUser) {

              console.log('Ok, now we are back in the route handling code and have found a user');
              console.log('validUser',validUser);
              console.log('Find any books that are assigned to the user');

              // Now find the books that belong to the user

              getUserItems(validUser._id)
                .then(function (items) {
                  // Render the book list
                  res.redirect("index");
                })
                .fail(function (err) {
                  sendError(req, res, {errors: err.message}, "Failed")
                });
            })

            // After the database call is complete but failed
            .fail(function (err) {
              console.log('Failed looking up the user');
              sendError(req, res, {errors: err.message}, "Failed")
            })

         }, 500); // SET TIMEOUT END

      } else {
        // username is a duplicate, so do something else
        console.log("user name is a duplicate");
        res.render('login', {
          message: "User name is currently in use. Please login or try again."
        });
      }
    }
  });
});


// Handle the login action
app.post("/login", function (req, res) {

  console.log('Hi, this is Node handling the /user/login route');

  // Attempt to log the user is with provided credentials
  UserController.login(req.body.username, req.body.password)

    // After the database call is complete and successful,
    // the promise returns the user object
    .then(function (validUser) {

      console.log('Ok, now we are back in the route handling code and have found a user');
      console.log('validUser',validUser);
      console.log('Find any items that are assigned to the user');

      // Now find the books that belong to the user

      getUserItems(validUser.username)
        .then(function (auction) {
          // Render the book list
          res.redirect("auction");
        })
        .fail(function (err) {
          sendError(req, res, {errors: err.message}, "Failed")
        });
    })

    // After the database call is complete but failed
    .fail(function (err) {
      console.log('Failed looking up the user');
      // sendError(req, res, {errors: err.message}, "Failed")
      res.render('login', {
         message: "Unable to locate username or password. Please Register or try again."
       });
    })
});

app.get("/profile", function (req, res) {
  var user = UserController.getCurrentUser();

  if (user !== null) {
    getUserItems(user.username).then(function (items) {
      res.render("userProfile", {
        username: user.username,
        books: books
      });
    });
  } else {
    res.redirect("/");
  }

});

app.get('/logout', function (req, res) {
  UserController.logout();
  res.redirect("/");
});


module.exports = app;
