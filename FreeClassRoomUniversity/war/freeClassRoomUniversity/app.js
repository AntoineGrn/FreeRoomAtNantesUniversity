const app = angular.module('freeClassRoomApp', ['ui.calendar', 'ui.bootstrap'])

const ClassRoomCtrl = function($scope, $rootScope, $http) {
	// init variables
	this.scope = $scope;
	this.http = $http;
	this.scope.flash = null;
	const _this = this;
	this.scope.hasFlash = false;
	this.scope.listeEmails = [{email:""}];
	this.scope.events = [];
	this.scope.listeEventsDatastore = [];
	this.scope.reservation = {};
	this.scope.userId = null;
	
	// liste de tous les créneaux en dur car ne change pas (à filtrer suivant ceux déjà pris)
	$scope.listeCreneauxUniversity = [
		{id: 1,libelle: "8h00 - 9h20"},
		{id: 2,libelle: "9h30 - 10h50"},
		{id: 3,libelle: "11h00 - 12h20"},
		{id: 4,libelle: "14h00 - 15h20"},
		{id: 5,libelle: "15h30 - 16h50"},
		{id: 6,libelle: "17h00 - 18h20"}
	];
	
	// appel web service pour recuperer toutes les salles et formattage de la reponse
	this.scope.getAllUniversityRoom = function() {
		_this.http(
		{
			method: 'GET',
			url: 'https://1-dot-freeclassroomsuniversity.appspot.com/_ah/api/monapi/v1/rooms/get'
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
			$scope.listeRoomUniversity = result;
		}, function errorCallback(response) {
			console.log("erreur inattendue");
		});
	}
	// récupération de toutes les salles de l'université
	this.scope.getAllUniversityRoom();
	
	// appel au web service pour ajouter un nouveau creneau de reserver pour une salle, une date, un creneau donné
	this.scope.addResa = function(reservation) {
		const data = {
			userId: reservation.userId, 
			start: reservation.start, 
			end: reservation.end, 
			salle: reservation.salle, 
			mail: reservation.mail, 
			nbPersonne: reservation.nbPersonne, 
			desc: reservation.desc
		};
		_this.http(
				{
					method: 'POST',
					url: 'https://1-dot-freeclassroomsuniversity.appspot.com/_ah/api/monapi/v1/creneaux/post',
					params: data,
					headers: {'Content-Type': 'application/json'}
				}
		).then(function successCallback(response) {
			console.log(response)
		}, function errorCallback(response) {
			console.log("erreur inattendue");
		});
	}

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
		_this.scope.nomSalleSelected = recherche.roomSelected.libelle;
		_this.http(
				{
					method: 'GET',
					url: 'https://1-dot-freeclassroomsuniversity.appspot.com/_ah/api/monapi/v1/creneaux/get/test/' + recherche.roomSelected.name.split(".", 1),
					headers : {'Accept' : 'application/json'}
				}
				).then(function successCallback(response) {
					if (response.data) {
						angular.forEach(response.data.items, function(item) {
							if(new Date(item.properties.start).getUTCHours() !== 8 && new Date(item.properties.end).getUTCHours() !== 19) {
								_this.scope.listeEventsDatastore.push({
									date: new Date(item.properties.start).getDay() + "/" + new Date(item.properties.start).getMonth() + "/" + new Date(item.properties.start).getYear(),
									creneau: new Date(item.properties.start).getHours() + "h" + new Date(item.properties.start).getMinutes() + " - " + new Date(item.properties.end).getHours() + "h" + new Date(item.properties.end).getMinutes(),
						            salle: item.properties.salle,
						            title: "COURS"
								});
								
								_this.scope.events.push({
						            start: item.properties.start,
						            end: item.properties.end,
						            title: "COURS",
						            className: ['creneauOccupe']
						        });
								_this.scope.eventSources = [_this.scope.events];
							}
						});
					}
				}, function errorCallback(response) {
					console.log("erreur inattendue");
				});
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
    		_this.scope.roomSelected = recherche.roomSelected;
    	}
    }
    
    this.scope.submitFormResa = function(formIsValid, reservation){
    	if (formIsValid) {
    		let dateHeureStart = null;
    		let dateHeureEnd = null;
    		if (reservation.creneauSelected.id === 1) {
    			dateHeureStart = new Date(reservation.dateSelected);
    			dateHeureStart.setHours(8, 0);
        		dateHeureEnd = new Date(reservation.dateSelected);
        		dateHeureEnd.setHours(9,20);
    		} else if (reservation.creneauSelected.id === 2) {
    			dateHeureStart = new Date(reservation.dateSelected);
    			dateHeureStart.setHours(9, 30);
        		dateHeureEnd = new Date(reservation.dateSelected);
        		dateHeureEnd.setHours(10,50);
    		} else if (reservation.creneauSelected.id === 3) {
    			dateHeureStart = new Date(reservation.dateSelected);
    			dateHeureStart.setHours(11, 0);
        		dateHeureEnd = new Date(reservation.dateSelected);
        		dateHeureEnd.setHours(12,20);
    		} else if (reservation.creneauSelected.id === 4) {
    			dateHeureStart = new Date(reservation.dateSelected);
    			dateHeureStart.setHours(14, 0);
        		dateHeureEnd = new Date(reservation.dateSelected);
        		dateHeureEnd.setHours(15,20);
    		} else if (reservation.creneauSelected.id === 5) {
    			dateHeureStart = new Date(reservation.dateSelected);
    			dateHeureStart.setHours(15, 30);
        		dateHeureEnd = new Date(reservation.dateSelected);
        		dateHeureEnd.setHours(16,50);
    		} else if (reservation.creneauSelected.id === 6) {
    			dateHeureStart = new Date(reservation.dateSelected);
    			dateHeureStart.setHours(17, 0);
        		dateHeureEnd = new Date(reservation.dateSelected);
        		dateHeureEnd.setHours(18,20);
    		}
    		
    		let listeEmails = "";
    		angular.forEach(reservation.email, function(value, key) {
    			if (key == 0) {
    				listeEmails = listeEmails + value + ";" ;
    			} else {
    				listeEmails = listeEmails + ";" + value;
    			}
    		});
    		
    		const reservationStandard = {
				userId: _this.scope.userId !== null ? _this.scope.userId : "usertest", 
				start: dateHeureStart.toISOString(), 
				end: dateHeureEnd.toISOString(), 
				salle: _this.scope.recherche.roomSelected.name, 
				mail: listeEmails, 
				nbPersonne: reservation.capaciteSalle, 
				desc: reservation.desc
    		};
    		_this.scope.addResa(reservationStandard);
			_this.scope.events.push({
	            start: dateHeureStart,
	            end: dateHeureEnd,
	            title: "RESERVED BY YOU",
	            className: ['creneauReserve']
	        });
			_this.scope.eventSources = [_this.scope.events];
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
	this.scope.$watch("formulaireRechercheSalleDispo", function() {
		if (_this.scope.recherche && _this.scope.recherche.roomSelected) {
			_this.scope.hasFlash = true;
			_this.scope.setFlash("info", "Vous avez selectionné une salle");
		}		
	});
	
	// watch sur le formulaire de reservation
	this.scope.$watch("reservation", function() {
		console.log(_this.scope.reservation);		
	});
	
	this.scope.verifUserConnected = function() {
		_this.scope.userId = $("#userId").html();
	}

	
	// watch sur la date selectionnee pour ajouter une reservation
	// filtrage sur les créneaux disponibles à cette date
	this.scope.$watch("reservation.dateSelected", function() {
		if (_this.scope.reservation && _this.scope.reservation.dateSelected) {
			const tmpListeCreneauxOccupes = _this.scope.events.filter(creneau => new Date(creneau.start).getDay() === _this.scope.reservation.dateSelected.getDay() && new Date(creneau.start).getMonth() === _this.scope.reservation.dateSelected.getMonth() && new Date(creneau.start).getYear() === _this.scope.reservation.dateSelected.getYear());
			_this.scope.listeCreneauxLibres = _this.scope.listeCreneauxUniversity;
			
			angular.forEach(tmpListeCreneauxOccupes, function(creneauOccupe) {
				const heureDebut = new Date(creneauOccupe.start).getUTCHours();
				const heureFin = new Date(creneauOccupe.end).getUTCHours();
				
				if (heureDebut >= 8 && heureDebut < 10) {
					_this.scope.listeCreneauxLibres = _this.scope.listeCreneauxLibres.filter(creneau => creneau.id !== 1);
				}
				if ((heureDebut >= 9 && heureDebut < 11) || (heureFin >= 9 && heureFin < 11) || (heureDebut <= 9 && heureFin >= 11)) {
					_this.scope.listeCreneauxLibres = _this.scope.listeCreneauxLibres.filter(creneau => creneau.id !== 2);
				} 
				if ((heureDebut >= 11 && heureDebut < 13) || (heureFin >= 11 && heureFin < 13) || (heureDebut <= 11 && heureFin >= 13)) {
					_this.scope.listeCreneauxLibres = _this.scope.listeCreneauxLibres.filter(creneau => creneau.id !== 3);
				}
				if ((heureDebut >= 14 && heureDebut < 16) || (heureFin >= 14 && heureFin < 16) || (heureDebut <= 14 && heureFin >= 16)) {
					_this.scope.listeCreneauxLibres = _this.scope.listeCreneauxLibres.filter(creneau => creneau.id !== 4);
				} 
				if ((heureDebut >= 15 && heureDebut < 17) || (heureFin >= 15 && heureFin < 17) || (heureDebut <= 15 && heureFin >= 17)) {
					_this.scope.listeCreneauxLibres = _this.scope.listeCreneauxLibres.filter(creneau => creneau.id !== 5);
				}
				if ((heureDebut >= 17 && heureDebut < 19) || (heureFin >= 17 && heureFin < 19) || (heureDebut <= 17 && heureFin >= 19)) {
					_this.scope.listeCreneauxLibres = _this.scope.listeCreneauxLibres.filter(creneau => creneau.id !== 6);
				}
			});
		}		
	});
	
	
	this.scope.addNewInputEmail= function() {
		_this.scope.listeEmails.push({email:""});
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
