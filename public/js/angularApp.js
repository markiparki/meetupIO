var app = angular.module('angularApp', ['ngRoute', 'ngMap']).run(function($rootScope, $http) {
	// init root user data
	$http.get('/api/user/profile')
		.success(function(response) {
      		$rootScope.authenticated = true;
	        $rootScope.currentUser = response;
	        console.log('authenticated: ' + $rootScope.authenticated + ' | current user: ' + $rootScope.currentUser.username);
		})
		.error(function(response) {
        	console.log('error: ' + response);
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
		//
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
		})
});

app.controller('eventListController', function($location, $scope, $rootScope, $http) {

	$scope.query = function(){
		$http.get('/api/event/', {params: {dist: $scope.query.dist, lat: $scope.query.lat, lng: $scope.query.lng}})
		.success(function(response){
			$scope.events = response;
		})
		.error(function(response) {
        	console.log('error: ' + response);
        });
	};
	// gets event list
	$scope.query();

	// create new events
	$scope.newEvent = {title: '', body: '', date: '', lng: '', lat: '', createdBy: ''};
	$scope.post = function() {
  		$scope.newEvent.createdBy = $rootScope.currentUser;
  		$http.post('/api/event/', $scope.newEvent)
  			.success(function() {
	    		$scope.newEvent = {title: '', body: '', date: '', lng: '', lat: '', createdBy: ''};
	    		$location.path(/event/);
	  		})
	  		.error(function(response) {
	        	console.log('error: ' + response);
	        });
	};
});

app.controller('eventController', function($scope, $rootScope, $route, $routeParams, $http) {
	// TODO: Service.get is only the promise, not the real event!!! CHECK ALL CONTROLLER!
	$http.get('/api/event/' + $routeParams.id)
		.success(function(response) {
	    	$scope.event = response;
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
		})
		.error(function(response) {
        	console.log('error: ' + response);
        });

	//add Comment
	$scope.newComment = {body:'', createdBy:''};
	$scope.newComment.createdBy = $rootScope.currentUser;

	$scope.addComment = function(newComment){
		$http.put('/api/event/' + $routeParams.id + '/comment', $scope.newComment)
			.success(function(response) {
		        console.log(response);
		        // TODO: any way to only update comments? server side get comments???
		        $route.reload();
		        $scope.newComment = {body:'', createdBy:''};
			})
			.error(function(response) {
	        	console.log('error: ' + response);
	        });
	};

	// Participate / Leave
	$scope.joinEvent = function(){
		$http.get('/api/event/' + $routeParams.id + '/join')
			.success(function(response) {
		        console.log(response);
		        // TODO: any way to only update participants? server side get comments???
		        $route.reload();
			})
			.error(function(response) {
	        	console.log('error: ' + response);
	        });
	};
	$scope.leaveEvent = function(){
		$http.get('/api/event/' + $routeParams.id + '/leave')
			.success(function(response) {
		        console.log(response);
		        // TODO: any way to only update participants? server side get comments???
		        $route.reload();
			})
			.error(function(response) {
	        	console.log('error: ' + response);
	        });
	};
});	

app.controller('userController', function($http, $routeParams, $scope) {
	$http.get('/api/user/' + $routeParams.id)
		.success(function(response) {
	    	$scope.user = response;
		})
		.error(function(response) {
        	console.log('error: ' + response);
        });
})

app.controller('userProfileController', function($http, $scope) {
	$http.get('/api/event/user/participated')
		.success(function(response) {
	    	$scope.eventsParticipated = response;
		})
		.error(function(response) {
        	console.log('error: ' + response);
        });

    $http.get('/api/event/user/created')
		.success(function(response) {
	    	$scope.eventsCreated = response;
		})
		.error(function(response) {
        	console.log('error: ' + response);
        });
})

app.controller('mapController', function(NgMap, NavigatorGeolocation, $scope) {
	var vm = this;
	vm.markerPos = "";

	vm.getPlacePos = function() {
		vm.place = this.getPlace();
		vm.map.setCenter(vm.place.geometry.location);
		vm.markerPos = vm.place.geometry.location;
		$scope.newEvent.lat = $scope.query.lat = vm.place.geometry.location.lat();
		$scope.newEvent.lng = $scope.query.lng = vm.place.geometry.location.lng();
	}

	vm.getMarkerPos = function() {
		vm.pos = this.getPosition();
		vm.markerPos = vm.pos;
		$scope.newEvent.lat = $scope.query.lat = vm.markerPos.lat();
		$scope.newEvent.lng = $scope.query.lng = vm.markerPos.lng();
	}

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
	}
	NgMap.getMap().then(function(map) {
		vm.map = map;
	});
});