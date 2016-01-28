var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function($rootScope) {
	$rootScope.authenticated = false;
	$rootScope.currentUser = '';
	
	$rootScope.signout = function(){
    	$http.get('auth/logout');
    	$rootScope.authenticated = false;
    	$rootScope.currentUser = '';
	};
});