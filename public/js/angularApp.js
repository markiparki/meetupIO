var app = angular.module('angularApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {
	// init root user data
	$rootScope.authenticated = false;
	$rootScope.currentUser = {picture:"", username:""};
});

app.config(function($routeProvider){
	$routeProvider
		//
		.when('/', {
			templateUrl: 'partials/start.html',
			controller: ''
		})
		.when('/events', {
			templateUrl: 'partials/eventList.html',
			controller: 'eventAllController'
		})
		.when('/user/profile', {
			templateUrl: 'partials/userProfile.html'
		})
});

app.factory('eventService', function($resource){
	return $resource('/api/event/:id');
});

app.factory('userService', function($resource){
	return $resource('/api/user/:id');
});


app.controller('eventAllController', function(eventService, $scope, $rootScope){
	$scope.events = eventService.query();

	$scope.newEvent = {created_by: '', text: '', created_at: ''};
	$scope.post = function() {
	  $scope.newEvent.created_by = $rootScope.current_user;
	  $scope.newEvent.created_at = Date.now();
	  eventService.save($scope.newEvent, function(){
	    $scope.events = postService.query();
	    $scope.newEvent = {created_by: '', text: '', created_at: ''};
	  });
	};
});

app.controller('initController', function($http, $rootScope){
	// loads user data at start
	$http.get('/api/user/profile').success(function(data){
		if(!data)
      		console.log("debug: Error loading currentUser");
      	
      	$rootScope.authenticated = true;
        $rootScope.currentUser = data;
	});
	// overrides userdata at logout
	$rootScope.logout = function(){
    	$http.get('auth/logout');
    	$rootScope.authenticated = false;
    	$rootScope.currentUser = {};
	};
});