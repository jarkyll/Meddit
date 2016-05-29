var mongoose = require('mongoose')

var CommentSchema = new mongoose.Schema({
  body: String,
  author: String,
  upvotes: {type: Number, default: 0},
  post: {type: mongoose.Schema.Types.ObjectId, ref:'Post'}
  // ObjectId is the 12 byte mongo id stored in the database, the ref refer
  // what type of object the id is refering to and helps to get the object
})

CommentSchema.methods.upvote = function(cb){
  this.upvotes += 1
  this.save(cb)
}

CommentSchema.methods.downvote = function(cb){
  this.upvotes -= 1
  this.save(cb)
}



var Comment = mongoose.model('Comment', CommentSchema)
