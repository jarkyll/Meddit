var mongoose = require('mongoose')

var PostSchema = new mongoose.Schema({
  title: String,
  link: String,
  upvotes: {type: Number, default: 0},
  author: {type: String, default: null},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment"}]
})
// create a PostSchema model called Post
// cb stands for callback
PostSchema.methods.upvote = function(cb){
  this.upvotes += 1
  this.save(cb)
}

PostSchema.methods.downvote = function(cb){
  this.upvotes -= 1
  this.save(cb)
}

var Post = mongoose.model('Post', PostSchema)
