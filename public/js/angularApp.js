var app = angular.module('angularApp', ['ngRoute', 'ngMap']).run(function($rootScope, $http) {
	// init root user data
	$http.get('/api/user/profile')
		.then(function successCallback(response) {
      		$rootScope.authenticated = true;
	        $rootScope.currentUser = response.data;
	        console.log('authenticated: ' + $rootScope.authenticated + ' | current user: ' + $rootScope.currentUser.username);
		}, function errorCallback(response) {
        	console.log('error: ' + response.status);
        });
    // overrides userdata at logout
	$rootScope.logout = function() {
    	$rootScope.authenticated = false;
    	$rootScope.currentUser = {};
	};
});

// client routing
app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			redirectTo: '/event'
		})
		.when('/event', {
			templateUrl: 'partials/eventList.html',
			controller: 'eventListController'
		})
		.when('/event/add', {
			templateUrl: 'partials/eventAdd.html',
			controller: 'eventListController'
		})
		.when('/event/:id', {
			templateUrl: 'partials/event.html',
			controller: 'eventController'
		})
		.when('/user/profile', {
			templateUrl: 'partials/userProfile.html',
			controller: 'userProfileController'
		})
		.when('/user/:id', {
			templateUrl: 'partials/user.html',
			controller: 'userController'
		});
});

// NOTE: Workaround for "Possibly unhandled rejection: ZERO_RESULTS" Error in Event
// See: https://github.com/angular-ui/ui-router/issues/2889
app.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);

app.controller('eventListController', function($location, $scope, $rootScope, $http) {
	$scope.query = function(){
		$http.get('/api/event/', {params: {dist: $scope.query.dist, lat: $scope.query.lat, lng: $scope.query.lng}})
		.then(function successCallback(response){
			$scope.events = response.data;
		}, function errorCallback(response) {
        	console.log('error: ' + response.status);
        });
	};
	// gets event list
	$scope.query();

	// creates new event
	$scope.newEvent = {title: '', body: '', date: '', lng: '', lat: '', createdBy: ''};
	$scope.post = function() {
  		$scope.newEvent.createdBy = $rootScope.currentUser;
  		$http.post('/api/event/', $scope.newEvent)
  			.then(function successCallback() {
	    		$scope.newEvent = {title: '', body: '', date: '', lng: '', lat: '', createdBy: ''};
	    		$location.path(/event/);
	  		}, function errorCallback(response) {
	        	console.log('error: ' + response.status);
	        });
	};
});

app.controller('eventController', function($scope, $rootScope, $route, $routeParams, $http) {
	$http.get('/api/event/' + $routeParams.id)
		.then(function successCallback(response) {
	    	$scope.event = response.data;
	    	$scope.userParticipates = function(){
				for (var i = 0; i < $scope.event.participants.length; i++) {
			        if ($scope.event.participants[i]._id === $rootScope.currentUser._id)
			            return true;
			    }
			    return false;
			};
			$scope.isOwnEvent = function(){
				if ($scope.event.createdBy._id === $rootScope.currentUser._id)
					return true;

				return false;
			};
		}, function errorCallback(response) {
        	console.log('error: ' + response.status);
        });

	//add Comment
	$scope.newComment = {body:'', createdBy:''};
	$scope.newComment.createdBy = $rootScope.currentUser;

	$scope.addComment = function(newComment){
		$http.put('/api/event/' + $routeParams.id + '/comment', $scope.newComment)
			.then(function successCallback(response) {
		        console.log(response.data);
		        // reload route after adding a comment and set newComment back
		        $route.reload();
		        $scope.newComment = {body:'', createdBy:''};
			}, function errorCallback(response) {
	        	console.log('error: ' + response.status);
	        });
	};

	// Participate / Leave
	$scope.joinEvent = function(){
		$http.put('/api/event/' + $routeParams.id + '/join')
			.then(function successCallback(response) {
		        console.log(response.data);
		        // reload route after joining the event
		        $route.reload();
			}, function errorCallback(response) {
	        	console.log('error: ' + response.status);
	        });
	};

	$scope.leaveEvent = function(){
		$http.put('/api/event/' + $routeParams.id + '/leave')
			.then(function successCallback(response) {
		        console.log(response.data);
		        // reload route after leaving the event
		        $route.reload();
			}, function errorCallback(response) {
	        	console.log('error: ' + response.status);
	        });
	};
});	

app.controller('userController', function($http, $routeParams, $scope) {	
	$http.get('/api/user/' + $routeParams.id)
		.then(function successCallback(response) {
	    	$scope.user = response.data;
		}, function errorCallback(response) {
        	console.log('error: ' + response.status);
        });
});

app.controller('userProfileController', function($http, $scope) {	
	$http.get('/api/event/user/participated')
		.then(function successCallback(response) {
	    	$scope.eventsParticipated = response.data;
		}, function errorCallback(response) {
        	console.log('error: ' + response.status);
        });

    $http.get('/api/event/user/created')
		.then(function successCallback(response) {
	    	$scope.eventsCreated = response.data;
		}, function errorCallback(response) {
        	console.log('error: ' + response.status);
        });
});

app.controller('mapController', function(NgMap, NavigatorGeolocation, $scope) {
	var vm = this;
	vm.markerPos = "";

// NOTE: Places Marker and Radius not moving after update. Needs to be fixed.
	vm.getPlacePos = function() {
		vm.place = this.getPlace();
		// alert(vm.place.geometry.location);
		vm.markerPos = vm.place.geometry.location;
		// alert(vm.markerPos);
		vm.map.setCenter(vm.place.geometry.location);
		$scope.newEvent.lat = $scope.query.lat = vm.place.geometry.location.lat();
		$scope.newEvent.lng = $scope.query.lng = vm.place.geometry.location.lng();
	};

	vm.getMarkerPos = function() {
		vm.pos = this.getPosition();
		vm.markerPos = vm.pos;
		$scope.newEvent.lat = $scope.query.lat = vm.markerPos.lat();
		$scope.newEvent.lng = $scope.query.lng = vm.markerPos.lng();
	};

	// user location
	vm.getCurrentPos = function() {
		NavigatorGeolocation.getCurrentPosition().then(function(position) {
			vm.currentPos = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
			};
			vm.map.setCenter(vm.currentPos);
			vm.markerPos = vm.currentPos;
			$scope.newEvent.lat = $scope.query.lat = vm.markerPos.lat;
			$scope.newEvent.lng = $scope.query.lng = vm.markerPos.lng;
		});
	};

	NgMap.getMap().then(function(map) {
		vm.map = map;
	});
});