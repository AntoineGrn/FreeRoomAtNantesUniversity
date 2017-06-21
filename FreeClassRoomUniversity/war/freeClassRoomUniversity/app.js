const app = angular.module('freeClassRoomApp', ['ui.calendar', 'ui.bootstrap']);

const ClassRoomCtrl = function($scope, $rootScope, $http) {
	// init variables
	this.scope = $scope;
	this.http = $http;
	this.scope.flash = null;
	const _this = this;
	this.scope.hasFlash = false;
	
	// appel web service pour recuperer toutes les salles et formattage de la reponse
	this.scope.getAllUniversityRoom = function() {
		_this.http(
		{
			method: 'GET',
			url: 'https://1-dot-freeclassroomsuniversity.appspot.com/_ah/api/monapi/v1/entitycollection'
		}
		).then(function successCallback(response) {
			const result = response.data.items.map(function(item) {
				const roomStandard= {
					id: item.key.id,
					libelle: item.properties.salle,
					name: item.properties.name
				};
				return roomStandard;
			})
			console.log(result);
			$scope.listeRoomUniversity = result;
		}, function errorCallback(response) {
			console.log("erreur inattendue");
		});
	}
	// récupération de toutes les salles de l'université
	this.scope.getAllUniversityRoom();
	
	// appel au web service pour ajouter un nouveau creneau de reserver pour une salle, une date, un creneau donné
	this.scope.addResa = function() {
		_this.http(
		{
			method: 'GET',
			url: 'https://1-dot-freeclassroomsuniversity.appspot.com/monapi/v1/monapi.roomEndPoint.setCreneau'
		}
		).then(function successCallback(response) {
			console.log(response)
		}, function errorCallback(response) {
			console.log("erreur inattendue");
		});
	}

	// liste de tous les créneaux en dur car ne change pas (à filtrer suivant ceux déjà pris)
	$scope.listeCreneauxUniversity = [
		{id: 1,libelle: "8h00 - 9h20"},
		{id: 2,libelle: "9h30 - 10h50"},
		{id: 3,libelle: "11h00 - 12h20"},
		{id: 4,libelle: "14h00 - 15h20"},
		{id: 5,libelle: "15h30 - 16h50"},
		{id: 5,libelle: "17h00 - 18h20"}
	];
	// evenements factice pour tester
	$scope.events = [
        {
            title: 'Event1',
            start: '2017-06-19'
        },
        {
            title: 'Event2',
            start: '2017-06-20'
        }
    ];
	// définition des événements du calendrier
	$scope.eventSources = [$scope.events];
	
	/* config calendar */
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        locale: 'fr',
        header:{
          left: 'month agendaWeek agendaDay',
          center: 'title',
          right: 'today prev,next'
        },
        dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
        dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"], 
        monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"],
        monthNamesShort: ["Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"]
      }
    };
    
    // appel au service REST pour recuperer les créneaux de la salle selectionnee 
    // ajouter la liste des creneaux au calendier
    this.scope.rechercherDisponibilites = function(recherche) {
    	if (_this.scope.formulaireRechercheSalleDispo.$valid) {
    		_this.scope.nomSalleSelected = recherche.roomSelected.libelle;
    		_this.http(
    				{
    					method: 'GET',
    					url: 'https://1-dot-freeclassroomsuniversity.appspot.com/_ah/api/monapi/v1/creneaux/get/' + recherche.roomSelected.name.split(".", 1),
    					headers : {'Accept' : 'application/json'}
    				}
    				).then(function successCallback(response) {
    					angular.forEach(response.data.items, function(item) {
    						$scope.listeEventsDatastore.push({
    							date: new Date(item.properties.start).getDay() + "/" + new Date(item.properties.start).getMonth() + "/" + new Date(item.properties.start).getYear(),
    							creneau: new Date(item.properties.start).getHour() + new Date(item.properties.end).getHour(),
    				            salle: item.properties.salle,
    						});
    						$scope.events.push({
    				            start: item.properties.start,
    				            end: item.properties.end,
    				            salle: item.properties.salle,
    				            className: ['creneauOccupe']
    				        });
    					});
    				}, function errorCallback(response) {
    					console.log("erreur inattendue");
    				});
    	}
    }
    // méthode de création d'un événement dans le calendrier
    this.scope.addEvent = function(title, creneau, salle, capacite, listeEmail, date) {
    	$scope.events.push({
            title: title,
            start: "date + creneau debut",
            end: "date+ creneau fin",
            salle: salle,
            capacite: capacite,
            listeEmail: listeEmail,
            className: ['creneauReserve']
        });
    	$scope.eventSources = [$scope.events];
    }
    // verification validite formulaire de recherche de salle + creneaux
    // puis appel à la méthode de chargement des créneaux de la salle selectionnee
    this.scope.submitForm = function(formIsValid, recherche){
    	if (formIsValid) {
    		_this.scope.rechercherDisponibilites(recherche);
    	}
    }
	// definition de la methode flash pour les notifications 
	this.scope.setFlash = function($type, $message) {
	    _this.scope.flash = {type: $type, message: $message};
	    setTimeout(function () {
	        angular.element('.flash-removable').addClass('fade');
	        setTimeout(function () {
	            _this.scope.$apply(function () {
	                _this.scope.flash = null;
	                _this.scope.hasFlash = false;
	            });
	        }, 2000);
	    }, 2000);
	}
	
	// watch sur la salle selectionnee pour recharger le calendrier par la suite
	// TODO appeler la méthode de chargement des creneaux de la salle directement pour eviter un clic
	this.scope.$watch("recherche.roomSelected", function() {
		if (_this.scope.recherche) {
			_this.scope.hasFlash = true;
			_this.scope.setFlash("info", "Vous avez selectionné une salle");
		}		
	});
	// watch sur la date selectionnee pour ajouter une reservation
	// filtrage sur les créneaux disponibles à cette date
	this.scope.$watch("recherche.roomSelected", function() {
		if (_this.scope.recherche.roomSelected) {
			_this.scope.hasFlash = true;
			_this.scope.setFlash("info", "Vous avez selectionné une salle");
		}		
	});
	const html = "";
	// méthode utilisée pour l'authentification par google
	this.scope.onSignIn = function(googleUser) {
	  const profile = googleUser.getBasicProfile();
	  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
	  console.log('Name: ' + profile.getName());
	  console.log('Image URL: ' + profile.getImageUrl());
	  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
	  html = $(".g-signin2").html();
	  $(".g-signin2").html('<a href="#" onclick="signOut();">Déconnexion</a>');
	}

	// méthode utilisée pour la deconnexion par google
	this.scope.signOut = function() {
	  var auth2 = gapi.auth2.getAuthInstance();
	  auth2.signOut().then(function () {
		  $(".g-signin2").html(html);
	  });
	}
	
	// init google maps ... pour eviter les erreurs en console
	$scope.map = null;
	const map = null;
	this.initialize = function() {
	    geocoder = new google.maps.Geocoder();
	    var latlng = new google.maps.LatLng(-34.397, 150.644);
	    var mapOptions = {
	      zoom: 8,
	      center: latlng
	    }
	    map = new google.maps.Map();
	  }
}
app.controller('ClassRoomCtrl', ClassRoomCtrl);