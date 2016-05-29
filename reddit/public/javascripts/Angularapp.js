var app = angular.module("reddit", ['ui.router'])


app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$stateProvider
	.state('home', {
		url: "/home",
		templateUrl: "/home.html",
		controller: "MainCtrl",
		resolve: {
			postPromise: ['posts', function(posts){
				// go tho the posts module(factory) and
				// do the function where we do posts.getall()
				return posts.getAll()
			}]
		}
	})
	.state('posts', {
		url: "/posts/{id}",
		templateUrl: "/posts.html",
		controller: "PostsCtrl",
		resolve: {
			post: ['$stateParams', 'posts', function($stateParams, posts){
				return posts.getComments($stateParams.id)
			}]
		}
	})
	$urlRouterProvider.otherwise('home')
}])




// factory allows for the data to be used in other controllers
// remember $scope is not persistent, so if we go out of scope, bye bye data
app.factory("posts", ['$http', function($http){
	var object = {
		posts: []
	}

	object.getAll = function(){
		return $http.get("/posts").success(function(data){
			angular.copy(data, object.posts)
			//deep copy of data to object.posts
		})
	}

	object.create = function(post){
		return $http.post("/posts", post).success(function(data){
			object.posts.push(data)
		})
	}

	object.upvote = function(post){
		return $http.put("/posts/" + post._id + "/upvote").success(function(data){
			// this is because we don't copy that change, but we just added 1 to the post
			// in the database
			post.upvotes += 1
		})
	}

	object.downvote = function(post){
		return $http.put("/posts/" + post._id + "/downvote").success(function(data){
			post.upvotes -= 1
		})
	}

	object.getComments = function(id){
		return $http.get("/posts/" + id).then(function(res){
			return res.data
		})
	}

	object.addComment = function(id, comment){
		return $http.post("/posts/" + id + "/comments", comment)
	}

	object.commentUpvote = function(post, comment){
		return $http.put("/posts/" + post._id + "/comments/" + comment._id + "/upvote").success(function(data){
			comment.upvotes += 1
		})
	}

	object.commentDownvote = function(post, comment){
		return $http.put("/posts/" + post._id + "/comments/" + comment._id + "/downvote").success(function(data){
			comment.upvotes -= 1
		})
	}


	return object

}])



app.controller("MainCtrl", ['$scope', 'posts', function($scope, posts){
	$scope.posts = posts.posts

	$scope.addPost = function() {
		if(!$scope.title ||  $scope.title === ""){
			return
		}
		else{
			posts.create({title: $scope.title, link:$scope.link})
			$scope.title = ""
			$scope.link = ""
		}
	}

	$scope.upvote = function(post){
		posts.upvote(post)
	}

	$scope.downvote = function(post){
		posts.downvote(post)
	}


}])


app.controller("PostsCtrl", ['$scope', 'post', 'posts', function($scope, post, posts){
	$scope.post = post


	$scope.upvote = function(comment){
		posts.commentUpvote(post, comment)
	}
	$scope.downvote = function(comment){
		posts.commentDownvote(post, comment)
	}
	$scope.addComment = function(){
		if($scope.body === ''){
			return
		}
		posts.addComment(post._id, {
			body: $scope.body,
			author: 'user',
		}).success(function(comment){
			$scope.post.comments.push(comment)
			console.log("comment")
			console.log($scope.post)
		})
		$scope.body = ''

	}
}])
