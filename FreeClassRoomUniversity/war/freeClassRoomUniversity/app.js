const app = angular.module('freeClassRoomApp', ['ui.calendar', 'ui.bootstrap']);
app.controller('ClassRoomCtrl', function($scope, $rootScope) {
	this.scope = $scope;
	this.scope.flash = null;
	const _this = this;
	_this.scope.hasFlash = false;
	
	$scope.listeRoomUniversity = [
		{id: 1,name: "TD1"},
		{id: 2,name: "TD2"},
		{id: 3,name: "TD3"},
		{id: 4,name: "TD4"},
		{id: 5,name: "TD5"}
	];
	
	$scope.listeCreneauxUniversity = [
		{id: 1,libelle: "8h00 - 9h20"},
		{id: 2,libelle: "9h30 - 10h50"},
		{id: 3,libelle: "11h00 - 12h20"},
		{id: 4,libelle: "14h00 - 15h20"},
		{id: 5,libelle: "15h30 - 16h50"},
		{id: 5,libelle: "17h00 - 18h20"}
	];
	
	$scope.eventSource = [];
	
	/* config object */
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'month basicWeek basicDay agendaWeek agendaDay',
          center: 'title',
          right: 'today prev,next'
        },
        eventClick: $scope.alertEventOnClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    };
    
    _this.rechercherDisponibilites = function(recherche) {
    	console.log(_this.scope.formulaireRechercheSalleDispo.$validate);
    	console.log(recherche);
    }
	
	_this.setFlash = function($type, $message) {
	    _this.scope.flash = {type: $type, message: $message};
	    setTimeout(function () {
	        angular.element('.flash-removable').addClass('fade');
	        console.log("methode flash");
	        setTimeout(function () {
	            _this.scope.$apply(function () {
	                _this.scope.flash = null;
	            });
	        }, 5000);
	        _this.scope.hasFlash = false;
	    }, 5000);
	}
	
	$scope.$watch("roomSelected", function() {
		_this.scope.hasFlash = true;
		_this.setFlash("info", "Vous avez selectionné une salle");
	});
});