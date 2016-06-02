var mongoose = require('mongoose')


var SubthreadSchema = new mongoose.Schema({
  admins: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
  name: String,
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  rules: [String]
})


  //add admin
  // delete admin
  //add subscribed members
  //remove subscribed members

// only put methods here for PUT calls


var Subthread = mongoose.model("Subthread", SubthreadSchema)
