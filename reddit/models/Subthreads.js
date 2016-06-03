var mongoose = require('mongoose')


var SubthreadSchema = new mongoose.Schema({
  admins: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
  name: String,
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  rules: [String]
})


SubthreadSchema.methods.isAdmin = function(user){
  var index = this.admins.indexOf(user._id)
  return (index > -1)
}

SubthreadSchema.methods.addAdmin = function(user, cb){
  var id = user._id
  console.log("id to be added: " + id)
  var index = this.admins.indexOf(id)
  if(index <= -1){
    this.admins.push(id)
  }
  else{
    //they are 0 or greater aka in array
  }
  this.save(cb)
}

SubthreadSchema.methods.deleteAdmin = function(user, cb){
  var id = user._id
  console.log("id to be deleted: " + id)
  var index = this.admins.indexOf(id)
  if(index > -1){
    this.admins.splice(index, 1)
  }
  else{
    //the person is not in the array
  }
  this.save(cb)
}

  //add admin
  // delete admin
  //add subscribed members
  //remove subscribed members

// only put methods here for PUT calls


var Subthread = mongoose.model("Subthread", SubthreadSchema)
