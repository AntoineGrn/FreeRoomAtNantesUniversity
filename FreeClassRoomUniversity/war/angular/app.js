angular.module('freeClassRoomApp', ['ngRoute', 'ngMaterial', 'ngMessages'])
.controller("AppCtrl", function() {
  this.myDate = new Date();
  this.isOpen = false;
});