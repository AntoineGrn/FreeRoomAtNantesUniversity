angular.module('todoApp', ['ngRoute']).controller('app', function() {})

$(document).ready(function() {
	$('#datetimepickerDebut').datetimepicker({
		locale: 'fr'
	});
	$('#datetimepickerFin').datetimepicker({
		locale: 'fr'
	});
    $('#calendar').fullCalendar({
    	header: {
			left: 'prev,next today myCustomButton',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
		lang: 'fr',
    	dayClick: function() {
            alert('a day has been clicked!');
        },
        weekends: false,
        local: 'fr',
        weekNumbers: true,
        events: [
			{
				title: 'All Day Event',
				start: moment('2017-06-15T12:00:00'),
				end: moment('2017-06-15T15:00:00'),
			}
		],
		customButtons: {
			myCustomButton: {
	            text: 'Ajouter une réservation',
	            click: function() {
	            	$('#AjoutResaModale').modal('show');
	            }
	        }
	    },
	    eventClick: function(calEvent, jsEvent, view) {
	    	console.log(calEvent);
	        alert('Event: ' + calEvent.title);
	        alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
	        alert('View: ' + view.name);
	        // change the border color just for fun
	        $(this).css('border-color', 'red');

	    }
    })
});