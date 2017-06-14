angular.module('todoApp', ['mwl.calendar', 'ngRoute', 'ui.bootstrap'])
  .controller('TodoListController', function() {
    var todoList = this;
    todoList.todos = [
      {text:'learn AngularJS', done:true},
      {text:'build an AngularJS app', done:false}];
 
    todoList.addTodo = function() {
      todoList.todos.push({text:todoList.todoText, done:false});
      todoList.todoText = '';
    };
 
    todoList.remaining = function() {
      var count = 0;
      angular.forEach(todoList.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };
 
    todoList.archive = function() {
      var oldTodos = todoList.todos;
      todoList.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) todoList.todos.push(todo);
      });
    };
  });

angular.module('todoApp')
.config(['calendarConfig', function(calendarConfig) {

  // View all available config
  console.log(calendarConfig);

  // Change the month view template globally to a custom template
  //calendarConfig.templates.calendarMonthView = 'path/to/custom/template.html'; 

  // Use either moment or angular to format dates on the calendar. Default angular. Setting this will override any date formats you have already set.
  calendarConfig.dateFormatter = 'moment';

  // This will configure times on the day view to display in 24 hour format rather than the default of 12 hour
  calendarConfig.allDateFormats.moment.date.hour = 'HH:mm';

  // This will configure the day view title to be shorter
  calendarConfig.allDateFormats.moment.title.day = 'ddd D MMM';

  // This will set the week number hover label on the month view
  calendarConfig.i18nStrings.weekNumber = 'Week {week}';

  // This will display all events on a month view even if they're not in the current month. Default false.
  calendarConfig.displayAllMonthEvents = true;

  // Make the week view more like the day view, ***with the caveat that event end times are ignored***.
  calendarConfig.showTimesOnWeekView = true;

}]);