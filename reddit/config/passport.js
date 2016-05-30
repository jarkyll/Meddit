var passport = require("passport")
var LocalStrategy = require('passport-local').Strategy
//LocalStrategy expects to find credentials in parameters username and password
var mongoose = require("mongoose")
var User = mongoose.model('User')

//Calling done will make the flow jump back into passport.authenticate.
passport.use(new LocalStrategy(
  function(username, password, done){
    User.findOne({ username: username}, function(err, user){
      if(err){
        return done(err)
      }
      if(!user){
        // message: is optional
        return done(null, false, {message: "Incorrect username"})
      }
      if(!user.validPassword(password)){
        return done(null, false, {message: "Incorrect password"})
      }
      return done(null, user)
    })
  }
))
