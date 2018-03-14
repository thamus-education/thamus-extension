import angular from 'angular'
import { $routeProvider, $locationProvider } from 'angular-route'
import { ngStorage } from 'ngstorage'
import $ from 'jquery'

angular.module('thamusChromeApp', ['ngRoute', 'ngStorage']);

function config ($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/popup.html', {
      templateUrl: chrome.extension.getURL('pages/popup/popup.html'),
      controller: 'loginCtrl',
      controllerAs: 'vm'
    })
    .when('/app', {
      templateUrl: chrome.extension.getURL('pages/popup/main.html'),
      controller: 'mainCtrl',
      controllerAs: 'vm'
    })
    .otherwise({redirectTo: '/popup.html'});
}

angular
  .module('thamusChromeApp')
  .config(['$routeProvider', '$locationProvider', config]);