var app = angular.module('angularApp', ['ngRoute', 'ngResource', 'ngMap']).run(function($rootScope, $http) {
	// init root user data
	$rootScope.authenticated = false;
	$rootScope.currentUser = {picture:"", username:""};
});

app.config(function($routeProvider) {
	$routeProvider
		//
		.when('/', {
			templateUrl: 'partials/start.html',
			controller: ''
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
			templateUrl: 'partials/userProfile.html'
		})
});

app.factory('eventService', function($resource) {
	return $resource('/api/event/:id');
});

app.factory('userService', function($resource) {
	return $resource('/api/user/:id');
});


app.controller('eventListController', function(eventService, $location, $scope, $rootScope) {
	// gets event list
	$scope.events = eventService.query();

	// create new events
	$scope.newEvent = {title: '', body: '', date: '', lng: '', lat: '', createdBy: ''};
	$scope.post = function() {
	  $scope.newEvent.createdBy = $rootScope.currentUser;
	  eventService.save($scope.newEvent, function() {
	    $scope.events = eventService.query();
	    $scope.newEvent = {title: '', body: '', date: '', lng: '', lat: '', createdBy: ''};
	    $location.path(/event/);
	  });
	};
});

app.controller('eventController', function(eventService, $scope, $routeParams) {
	console.log("Event loaded: " + $routeParams.id);
	$scope.event = eventService.get({id: $routeParams.id});
});	

app.controller('mapController', function($scope) {
	$scope.address = "current-location";
});


// TODO: scope ot this????
app.controller('MyCtrl', function(NgMap, NavigatorGeolocation, $scope) {
	var vm = this;

	vm.placeChanged = function() {
		vm.place = this.getPlace();
		vm.currentPos = vm.place.geometry.location;
		vm.map.setCenter(vm.currentPos);
		$scope.newEvent.lat = vm.currentPos.lat();
		$scope.newEvent.lng = vm.currentPos.lng();
	}

	NgMap.getMap().then(function(map) {
		vm.map = map;
	});

	vm.getMarkerLocation = function() {
		vm.pos = this.getPosition();
		$scope.newEvent.lat = vm.pos.lat();
		$scope.newEvent.lng = vm.pos.lng();
		// vm.map.setCenter(vm.pos);
	}

	vm.getCurrentLocation = function() {
		NavigatorGeolocation.getCurrentPosition().then(function(position) {
			vm.currentPos = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
			};
			$scope.newEvent.lat = vm.currentPos.lat;
			$scope.newEvent.lng = vm.currentPos.lng;

			vm.map.setCenter(vm.currentPos);
		});
	}
});


app.controller('initController', function($http, $rootScope) {
	// loads user data at start
	$http.get('/api/user/profile')
		.success(function(data) {
      		$rootScope.authenticated = true;
	        $rootScope.currentUser = data;
	        console.log('authenticated: ' + $rootScope.authenticated + ' | current user: ' + $rootScope.currentUser.username);
		})
		.error(function(data) {
        	console.log('error: ' + data);
        });
	// overrides userdata at logout
	$rootScope.logout = function() {
    	$rootScope.authenticated = false;
    	$rootScope.currentUser = {};
    	console.log('authenticated: ' + $rootScope.authenticated + ' | current user: ' + $rootScope.currentUser.username);
	};
});