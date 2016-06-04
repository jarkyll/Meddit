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

CommentSchema.methods.deleteComment = function(comment, cb){
  var id = user._id
  //check if the comment belongs to a post that belongs to a subthread that
  // they are an admin for

}



var Comment = mongoose.model('Comment', CommentSchema)
