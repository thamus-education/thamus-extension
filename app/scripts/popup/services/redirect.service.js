angular.module('thamusChromeApp')
  .run(['$rootScope', '$location', 'authentication', function ($rootScope, $location, authentication) {
    $rootScope.$on('$routeChangeStart', function (event) {
      authentication.isLoggedIn(function (isLogged) {
        if (isLogged) {
          $location.path('/app');
        } else {
          $location.path('/popup.html');
        };
      });
    });
  }])