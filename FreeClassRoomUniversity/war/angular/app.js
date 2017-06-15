angular.module('todoApp', ['ngRoute']).controller('app', function() {})

$(document).ready(function() {
    $('#calendar').fullCalendar({
        // put your options and callbacks here
    	header: {
			left: 'prev,next today',
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
    })
});