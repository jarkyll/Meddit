var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var passport = require("passport")
var Post = mongoose.model("Post")
var Comment = mongoose.model("Comment")
var User = mongoose.model("User")
var jwt = require('express-jwt')
var auth = jwt({secret: 'SECRET', userProperty: 'payload'})
/* GET home page.  ESSENTIAL FOR THE FRONTEND renders the index.ejs*/
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

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

router.post("/posts", auth, function(req, res, next){
  var post = new Post(req.body)
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
      return next(new Error("can\'t fint comment"))
    }
    req.comment = comment;
    return next()
  })
})


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
module.exports = router;
