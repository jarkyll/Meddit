var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var passport = require("passport")
var Post = mongoose.model("Post")
var Comment = mongoose.model("Comment")
var User = mongoose.model("User")
var Subthread = mongoose.model("Subthread")
var jwt = require('express-jwt')
var auth = jwt({secret: 'SECRET', userProperty: 'payload'})


/* GET home page.  ESSENTIAL FOR THE FRONTEND renders the index.ejs*/
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });

});

//delete admin of specific post update
router.put("/subthreads/:subthread/admins/:user/delete",  auth, function(req, res, next){
  // we check if the user(payload is in admins), then we check if user is an admins
  var user = req.payload
  var target = req.user
  var subthread = req.subthread
  if(req.subthread.isAdmin(user)){
    req.subthread.deleteAdmin(user, function(err, subthread){
      if(err){
        return next(err)
      }
      res.json(subthread)
    })
  }
  else{
    //they are not an admin
  }

})

router.put("/subthreads/:subthread/admins/:user/add", auth, function(req, res, next){
  var user = req.user
  var subthread = req.subthread
  req.subthread.addAdmin(user, function(err, subthread){
    if(err){
      return next(err)
    }
    res.json(subthread)
  })

})



//get all of the subthreads
router.get("/subthreads", function(req, res, next){
  Subthread.find(function(err, subthreads){
    if(err){
      return next(err)
    }
    res.json(subthreads)
  })

})

//create a subthread
router.post("/subthreads", auth, function(req, res, next){
  var subthread = new Subthread(req.body)
  //issue adding an author in the model if it didn't have one earlier
  subthread.admins.push(req.payload._id)
  subthread.members.push(req.payload._id)
  // only contains the name of the subthread
  // we created a post and have it sent
  // save that post in the database
  subthread.save(function(err, subthread){
    if(err){
      return next(err)
    }
    res.json(subthread)
  });
});

// gets all the posts
router.get('/posts', function(req, res, next){
  //mongodb function remember
  Post.find(function(err, posts){
    if(err){
      // find out what next does
      // next(err) tells Express to pass the error along
      // until an error that handles middleware can deal with it
      return next(err);
    }
    // sends json response
    res.json(posts)
  });
});

// creating a new post
router.post("/posts", auth, function(req, res, next){
  var post = new Post(req.body)
  //issue adding an author in the model if it didn't have one earlier

  post.author = req.payload.username
  // we created a post and have it sent
  // save that post in the database
  post.save(function(err, post){
    if(err){
      return next(err)
    }
    res.json(post)
  });
});


//testing
//post call
///curl --data 'title=test&link=http://test.com' http://localhost:3000/posts
// get call
///curl http://localhost:3000/posts

router.get('/posts/:post', function(req, res, next){
  //middleware function used, so the post obj attached to the
  // req object
  // sends json response
  req.post.populate('comments', function(err, post){
    if(err){
      return next(err)
    }
    res.json(post)
  })
})

router.post('/posts/:post/comments', auth, function(req, res, next){
  // the comment is what is the the request body
  // req.body has parameters aka key-value pairs
  var comment = new Comment(req.body)
  comment.post = req.post
  comment.author = req.payload.username
  comment.save(function(err, comment){
    if(err){
      return next(err)
    }
    req.post.comments.push(comment)
    req.post.save(function(err, post){
      if(err){
        next(err)
      }
      // saved to the post and now send the comment back to the client
      res.json(comment)
    })
  })
})

// put just modifies data
router.put('/posts/:post/upvote', auth, function(req, res, next){
  //remember middleware used so a post obj is attached to the req
  req.post.upvote(function(err, post){
    if(err){
      return next(err)
    }
    res.json(post)
  })
})
//curl -X PUT http://localhost:3000/posts/<POST ID>/upvote

router.put('/posts/:post/downvote', auth, function(req, res, next){
    req.post.downvote(function(err, post){
      if(err){
        return next(err)
      }
      res.json(post)
    })
})

router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next){
  req.comment.upvote(function(err, comment){
    if(err){
      return next(err)
    }
    res.json(comment)
  })
})

router.put('/posts/:post/comments/:comment/downvote', auth, function(req, res, next){
  req.comment.downvote(function(err, comment){
    if(err){
      next(err)
    }
    res.json(comment)
  })
})

// passport auth routing
//AUTH
router.post("/register", function(req, res, next){
  //console.log("res is: ", res.body)
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'})
  }

  var user = new User();
  user.username = req.body.username
  user.setPassword(req.body.password)
  user.save(function(err){
    if(err){
      return next(err)
    }
    return res.json({token: user.generateJWT()})
  })
})

router.post("/login", function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: "Please fill out all fields"})
  }

  // this uses the LocalStrategy that we created earlier
  passport.authenticate('local', function(err, user, info){
    if(err){
      return next(err)
    }
    if(user){
      return res.json({token: user.generateJWT()})
    }
    else{
      return res.status(401).json(info)
    }
  })(req, res, next)
})

// whenever a function that uses :post runs,
// if the post parameter has an id, then it fetches
// the post objefct and attaches it to the req object
// JUST A SETUP OF THE POST PARAMETER
router.param('post', function(req, res, next, id){
  //query call
  var query = Post.findById(id);

  // execute the query at a later time
  // it is called when query.complete or query.error is called
  query.exec(function(err, post){
    if(err){
      return next(err)
    }
    if(!post){
      return next(new Error("can\'t find post"));
    }

    req.post = post;
    return next()
  })
})

router.param("comment", function(req, res, next, id){
  var query = Comment.findById(id);
  query.exec(function(err, comment){
    if(err){
      return next(err)
    }
    if(!comment){
      return next(new Error("can\'t find comment"))
    }
    req.comment = comment;
    return next()
  })
})

router.param("subthread", function(req, res, next, id){
  var query = Subthread.findById(id);
  query.exec(function(err, subthread){
    if(err){
      return next(err)
    }
    if(!subthread){
      return next(new Error("can\'t find subthread"))
    }
    req.subthread = subthread
    return next()
  })
})

router.param("user", function(req, res, next, id){
  var query = User.findById(id);
  query.exec(function(err, user){
    if(err){
      return next(err)
    }
    if(!user){
      return next(new Error("can\'t find user"))
    }
    // the user we get from executing the query
    req.user = user
    return next()
  })
})

module.exports = router;
