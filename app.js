var app = angular.module("reddit", [])


app.controller("MainCtrl", ['$scope', function($scope){
	$scope.test = "Hello World"
	$scope.posts = [
  { title: 'post 1', upvotes: 10 },
  { title: 'post 2', upvotes: 1 },
  { title: 'post 3', upvotes: 3 },
  { title: 'post 4', upvotes: 4 },
  { title: 'post 5', upvotes: 7 }
];

	$scope.addPost = function() {
		/// === checks for same type and value
		if(!$scope.title ||  $scope.title === ""){
			return
		}
		else{
			$scope.posts.push({title: $scope.title, link: $scope.link, upvotes: 0})
			$scope.title = ""
			$scope.link = ""
		}
	}

	$scope.upvote = function(post){
		post.upvotes += 1
	}

	$scope.downvote = function(post){
		post.upvotes -= 1
	}


}])