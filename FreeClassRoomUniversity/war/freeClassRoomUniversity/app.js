var app = angular.module('freeClassRoomApp', []);

app.controller('ClassRoomCtrl', ['$scope', function($scope) {
	this.scope = $scope;
	this.scope.flash = null;
	const _this = this;
	_this.scope.hasFlash = false;
	
	$scope.listeRoomUniversity = [
		{
			id: 1,
			name: "TD1"
		},
		{
			id: 2,
			name: "TD2"
		},
		{
			id: 3,
			name: "TD3"
		},
		{
			id: 4,
			name: "TD4"
		},
		{
			id: 5,
			name: "TD5"
		}
	];
	
	_this.setFlash = function($type, $message) {
	    _this.scope.flash = {type: $type, message: $message};
	    setTimeout(function () {
	        angular.element('.flash-removable').addClass('fade');
	        console.log("methode flash");
	        setTimeout(function () {
	            _this.scope.$apply(function () {
	                _this.scope.flash = null;
	            });
	        }, 100000);
	        _this.scope.hasFlash = false;
	    }, 100000);
	}
	
	$scope.$watch("roomSelected", function() {
		_this.scope.hasFlash = true;
		_this.setFlash("info", "Vous avez selectionné une salle");
	});
}]);