var app = angular.module('classRoomApp', []);
app.controller("classRoomCtrl", function($scope, $location, $http) {
	this.scope = $scope;
	$scope.student = {
        firstName: "Mahesh",
        lastName: "Parashar",
        
        fullName: function() {
           var studentObject;
           studentObject = $scope.student;
           return studentObject.firstName + " " + studentObject.lastName;
        }
     };
});