const app = angular.module('freeClassRoomApp', ['ui.calendar', 'ui.bootstrap'])

const ClassRoomCtrl = function($scope, $rootScope, $http, uiCalendarConfig, $compile) {
	// init variables
	this.scope = $scope;
	this.http = $http;
	this.compile = $compile;
	this.scope.flash = null;
	const _this = this;
	this.scope.hasFlash = false;
	this.scope.listeEmails = [{email:""}];
	this.scope.events = [];
	this.scope.listeEventsDatastore = [];
	this.scope.listeResaUser = [];
	this.scope.reservation = {};
	this.scope.userId = null;
	this.scope.connexionOk= false;
	
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
					url: 'https://1-dot-freeclassroomsuniversity.appspot.com/_ah/api/monapi/v1/creneaux/post/setCreneau',
					params: data,
					headers: {'Content-Type': 'application/json'}
				}
		).then(function successCallback(response) {
			angular.element("#AddResaModale").modal('hide');
			_this.scope.setFlash("info", "Votre réservation s'est effectuée avec succès");
			_this.scope.reservation = null;
			// rechargement des données 
			_this.scope.rechargeAllEvents();
		}, function errorCallback(response) {
			console.log("erreur inattendue");
		});
	}

	// définition des événements du calendrier
	$scope.eventSources = [$scope.events];
	
	/* evenement click sur une reservation */
    _this.scope.alertOnEventClick = function( date, jsEvent, view){
    	const dateDebutStandard = new Date(date.start);
    	const dateFinStandard = new Date(date.end);
    	const minutesDebutStandard = dateDebutStandard.getUTCMinutes() === 0 ? "" : dateDebutStandard.getUTCMinutes();
    	
    	const dateStandardisee = dateDebutStandard.getUTCDate() + "/" + (dateDebutStandard.getUTCMonth() + 1) + "/" + dateDebutStandard.getUTCFullYear();
    	const creneauStandardise = dateDebutStandard.getUTCHours() + "h" + minutesDebutStandard + " - " + dateFinStandard.getUTCHours() + "h" + dateFinStandard.getUTCMinutes();
    	_this.scope.event = _this.scope.listeEventsDatastore.filter(resa => resa.date === dateStandardisee && resa.creneau === creneauStandardise)[0];
    	angular.element("#DetailCreneauModale").modal('show');
    };
	
	/* Tooltip au survol des reservations */
    this.scope.eventRender = function( event, element, view ) { 
        element.attr({'tooltip': event.title,
                     'tooltip-append-to-body': true});
        _this.compile(element)(_this.scope);
    };
	
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
        eventRender: _this.scope.eventRender,
        eventClick: _this.scope.alertOnEventClick,
        dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
        dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"], 
        monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"],
        monthNamesShort: ["Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"]
      }
    };
    
    // appel au service REST pour recuperer les reservations effectuées par l'utilisateur
    // ajouter la liste au calendrier
    this.scope.rechercherReservationByUser = function() {
    	_this.scope.verifUserConnected();
    	const userId = _this.scope.userId;
    	_this.scope.listeResaUser = [];
    	_this.http(
				{
					method: 'GET',
					url: 'https://1-dot-freeclassroomsuniversity.appspot.com/_ah/api/monapi/v1/reservations/get/' + userId,
					headers : {'Accept' : 'application/json'}
				}
				).then(function successCallback(response) {
					if (response.data) {
						angular.forEach(response.data.items, function(item) {
							if(new Date(item.properties.start).getUTCHours() !== 8 && new Date(item.properties.end).getUTCHours() !== 19) {
								const minutesDebutStandard = new Date(item.properties.start).getUTCMinutes() === 0 ? "" : new Date(item.properties.start).getUTCMinutes();
								const nomSalle = _this.scope.listeRoomUniversity.filter(room => room.name === item.properties.salle);
								_this.scope.listeResaUser.push({
									date: new Date(item.properties.start).getUTCDate() + "/" + (new Date(item.properties.start).getUTCMonth() + 1) + "/" + new Date(item.properties.start).getUTCFullYear(),
									creneau: new Date(item.properties.start).getUTCHours() + "h" + minutesDebutStandard + " - " + new Date(item.properties.end).getUTCHours() + "h" + new Date(item.properties.end).getUTCMinutes(),
						            salle: nomSalle,
						            nbPersonne: item.properties.nbPersonne, 
								});
							}
						});
					}
				}, function errorCallback(response) {
					console.log("erreur inattendue");
				});
    }
    
    // appel au service REST pour recuperer les reservations effectuées par salle
    // ajouter la liste au calendrier
    this.scope.rechercherReservationBySalle = function(recherche) {
    	_this.scope.verifUserConnected();
    	const userId = _this.scope.userId;
    	_this.http(
				{
					method: 'GET',
					url: 'https://1-dot-freeclassroomsuniversity.appspot.com/_ah/api/monapi/v1/reservations/get/' + userId + "/" + recherche.roomSelected.name,
					headers : {'Accept' : 'application/json'}
				}
				).then(function successCallback(response) {
					if (response.data) {
						angular.forEach(response.data.items, function(item) {
							if(new Date(item.properties.start).getUTCHours() !== 8 || new Date(item.properties.end).getUTCHours() !== 19) {
								const minutesDebutStandard = new Date(item.properties.start).getUTCMinutes() === 0 ? "" : new Date(item.properties.start).getUTCMinutes();
								const nomSalle = _this.scope.listeRoomUniversity.filter(room => room.name === item.properties.salle);
								
								_this.scope.listeEventsDatastore.push({
									date: new Date(item.properties.start).getUTCDate() + "/" + (new Date(item.properties.start).getUTCMonth() + 1) + "/" + new Date(item.properties.start).getUTCFullYear(),
									creneau: new Date(item.properties.start).getUTCHours() + "h" + minutesDebutStandard + " - " + new Date(item.properties.end).getUTCHours() + "h" + new Date(item.properties.end).getUTCMinutes(),
						            salle: nomSalle,
						            title: item.properties.userID === _this.scope.userId ? "RESERVED BY YOU" : "RESERVED BY STUDENT",
						            description: item.properties.desc,
						            mail: item.properties.mail,
						            nbPersonne: item.properties.nbPersonne
								});
								
								_this.scope.events.push({
						            start: item.properties.start,
						            end: item.properties.end,
						            title: item.properties.userID === _this.scope.userId ? "RESERVED BY YOU" : "RESERVED BY STUDENT",
						            className: item.properties.userID === _this.scope.userId ? ['creneauOccupeReserve'] : ['creneauReserve']
						        });
							}
						});
					}
				}, function errorCallback(response) {
					console.log("erreur inattendue");
				});
    }
    
    // appel au service REST pour recuperer les créneaux de la salle selectionnee 
    // ajouter la liste des creneaux au calendier
    this.scope.rechercherDisponibilites = function(recherche) {
		_this.scope.nomSalleSelected = recherche.roomSelected.libelle;
		_this.scope.verifUserConnected();
		_this.http(
				{
					method: 'GET',
					url: 'https://1-dot-freeclassroomsuniversity.appspot.com/_ah/api/monapi/v1/creneaux/get/'+ _this.scope.userId +'/' + recherche.roomSelected.name.split(".", 1)[0],
					headers : {'Accept' : 'application/json'}
				}
				).then(function successCallback(response) {
					if (response.data) {
						angular.forEach(response.data.items, function(item) {
							if(new Date(item.properties.start).getUTCHours() !== 8 && new Date(item.properties.end).getUTCHours() !== 19) {
								const minutesDebutStandard = new Date(item.properties.start).getUTCMinutes() === 0 ? "" : new Date(item.properties.start).getUTCMinutes();
								const nomSalle = _this.scope.listeRoomUniversity.filter(room => room.name.split(".", 1)[0] === item.properties.salle);
								_this.scope.listeEventsDatastore.push({
									date: new Date(item.properties.start).getUTCDate() + "/" + (new Date(item.properties.start).getUTCMonth() + 1) + "/" + new Date(item.properties.start).getUTCFullYear(),
									creneau: new Date(item.properties.start).getUTCHours() + "h" + minutesDebutStandard + " - " + new Date(item.properties.end).getUTCHours() + "h" + new Date(item.properties.end).getUTCMinutes(),
						            salle: nomSalle,
						            title: "COURS"
								});
								
								_this.scope.events.push({
						            start: item.properties.start,
						            end: item.properties.end,
						            title: "COURS",
						            className: ['creneauOccupe']
						        });
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
    		uiCalendarConfig.calendars['calendar'].fullCalendar('removeEvents');
    		_this.scope.verfiConnexionUser();
    		_this.scope.rechercherDisponibilites(recherche);
    		_this.scope.rechercherReservationBySalle(recherche);
    		_this.scope.roomSelected = recherche.roomSelected;
    	}
    }
    
    this.scope.rechargeAllEvents = function() {
    	const recherche = {
    			roomSelected: {
    				name: _this.scope.recherche.roomSelected.name
    			}
    	};
    	uiCalendarConfig.calendars['calendar'].fullCalendar('removeEvents');
		_this.scope.verfiConnexionUser();
		_this.scope.rechercherDisponibilites(recherche);
		_this.scope.rechercherReservationBySalle(recherche);
		_this.scope.rechercherReservationByUser();
		_this.scope.roomSelected = recherche.roomSelected;
    }
    
    this.scope.submitFormResa = function(formIsValid, reservation){
    	if (formIsValid) {
    		let dateHeureStart = null;
    		let dateHeureEnd = null;
    		dateHeureStart = new Date(reservation.dateSelected.setHours(4));
    		dateHeureEnd = new Date(reservation.dateSelected.setHours(4));
    		if (reservation.creneauSelected.id === 1) {
    			dateHeureStart.setHours(8,0);
        		dateHeureEnd.setHours(9,20);
    		} else if (reservation.creneauSelected.id === 2) {
    			dateHeureStart.setHours(9, 30);
        		dateHeureEnd.setHours(10,50);
    		} else if (reservation.creneauSelected.id === 3) {
    			dateHeureStart.setHours(11, 0);
        		dateHeureEnd.setHours(12,20);
    		} else if (reservation.creneauSelected.id === 4) {
    			dateHeureStart.setHours(14, 0);
        		dateHeureEnd.setHours(15,20);
    		} else if (reservation.creneauSelected.id === 5) {
    			dateHeureStart.setHours(15, 30);
        		dateHeureEnd.setHours(16,50);
    		} else if (reservation.creneauSelected.id === 6) {
    			dateHeureStart.setHours(17, 0);
        		dateHeureEnd.setHours(18,20);
    		}
    		
    		let listeEmails = "";
    		angular.forEach(reservation.email, function(value, key) {
    			if (key == 0) {
    				listeEmails = listeEmails + value ;
    			} else {
    				listeEmails = listeEmails + ";" + value;
    			}
    		});
    		_this.scope.verifUserConnected();
    		let descStandard = reservation.title ? reservation.title : "";
    		descStandard = descStandard + "\n" + (reservation.desc ? reservation.desc : "");
    		const reservationStandard = {
				userId: _this.scope.userId, 
				start: dateHeureStart.toISOString().split(':00.', 1), 
				end: dateHeureEnd.toISOString().split(':00.', 1), 
				salle: _this.scope.recherche.roomSelected.name, 
				mail: listeEmails, 
				nbPersonne: reservation.capaciteSalle, 
				desc: descStandard
    		};
    		_this.scope.addResa(reservationStandard);
    	}
    }
    
	// definition de la methode flash pour les notifications 
	this.scope.setFlash = function($type, $message) {
		_this.scope.hasFlash = true;
	    _this.scope.flash = {type: $type, message: $message};
	    setTimeout(function () {
	        angular.element('.flash-removable').addClass('fade');
	        setTimeout(function () {
	            _this.scope.$apply(function () {
	                _this.scope.flash = null;
	                _this.scope.hasFlash = false;
	            });
	        }, 3000);
	    }, 3000);
	}
	
	// watch sur la salle selectionnee pour recharger le calendrier par la suite
	this.scope.$watch("formulaireRechercheSalleDispo", function() {
		if (_this.scope.recherche && _this.scope.recherche.roomSelected) {
			_this.scope.hasFlash = true;
			_this.scope.setFlash("info", "Vous avez selectionné une salle");
		}		
	});
	
	this.scope.verfiConnexionUser = function() {
		_this.scope.verifUserConnected();
		if (document.getElementById("#userId") !== null && angular.element(document.getElementById("#userId").value) !== undefined) {
			_this.scope.userId = angular.element(document.getElementById("#userId").value).selector;
		} else {
			_this.scope.setFlash("info", "Veuillez vous connectez pour effectuer des réservations");
		}
		if (_this.scope.userId !== null && _this.scope.userId !== undefined) {
			_this.scope.connexionOk = true;
		}
	}
	
	this.scope.verifUserConnected = function() {
		if (document.getElementById("#userId") !== null && angular.element(document.getElementById("#userId").value) !== undefined) {
			_this.scope.userId = angular.element(document.getElementById("#userId").value).selector;
		} else {
			_this.scope.setFlash("info", "Veuillez vous connectez pour effectuer des réservations");
		}
	}

	// watch sur la checkbox de saisie des emails pour la resa
	this.scope.$watch("showAdresseMailOk", function() {
		if (!_this.scope.showAdresseMailOk) {
			_this.scope.reservation.email = [];
		}		
	});
	
	// watch sur la date selectionnee pour ajouter une reservation
	// filtrage sur les créneaux disponibles à cette date
	this.scope.$watch("reservation.dateSelected", function() {
		if (_this.scope.reservation && _this.scope.reservation.dateSelected) {
			const tmpListeCreneauxOccupes = _this.scope.events.filter(creneau => new Date(creneau.start).getDate() === _this.scope.reservation.dateSelected.getDate() && new Date(creneau.start).getMonth() === _this.scope.reservation.dateSelected.getMonth() && new Date(creneau.start).getYear() === _this.scope.reservation.dateSelected.getYear());
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
	
	this.scope.$watch("userId", function() {
		if(_this.scope.userId !== null) {
			_this.scope.rechercherReservationByUser();
		}
	});
	
	setTimeout(function () {
		_this.scope.rechercherReservationByUser();
	}, 5000);
	
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
