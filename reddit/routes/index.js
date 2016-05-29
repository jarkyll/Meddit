var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var Post = mongoose.model("Post")
var Comment = mongoose.model("Comment")

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

router.post("/posts", function(req, res, next){
  var post = new Post(req.body)
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


router.get('/posts/:post', function(req, res){
  //middleware function used, so the post obj attached to the
  // req object
  // sends json response
  res.json(req.post)
})

// put just modifies data
router.put('/posts/:post/upvote', function(req, res, next){
  //remember middleware used so a post obj is attached to the req
  req.post.upvote(function(err, post){
    if(err){
      return next(err)
    }
    res.json(post)
  })
})
//curl -X PUT http://localhost:3000/posts/<POST ID>/upvote


router.put('/posts/:post/downvote', function(req, res, next){
    req.post.downvote(function(err, post){
      if(err){
        return next(err)
      }
      res.json(post)
    })
})


router.post('/posts/:post/comments', function(req, res, next){
  // the comment is what is the the request body
  // req.body has parameters aka key-value pairs
  var comment = new Comment(req.body)
  comment.post = req.post
  comment.save(function(err, comment){
    if(err){
      next(err)
    }
    req.post.comments.push(comment)
    req.post.save(function(err, comment){
      if(err){
        next(err)
      }
      // saved to the post and now send the comment back to the client
      res.json(comment)
    })
  })
})


router.put('/posts/:post/comments/:comment/upvote', function(req, res, next){
  req.comment.upvote(function(err, comment){
    if(err){
      return next(err)
    }
    res.json(comment)
  })
})

router.put('/posts/:post/comments/:comment/downvote', function(req, res, next){
  req.comment.downvote(function(err, comment){
    if(err){
      next(err)
    }
    res.json(comment)
  })
})
module.exports = router;
