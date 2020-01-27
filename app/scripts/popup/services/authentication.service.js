(function () {

  angular
    .module('thamusChromeApp')
    .service('authentication', authentication);

authentication.$inject = ['$http', '$window', '$location', '$rootScope', '$localStorage'];
function authentication ($http, $window, $location, $rootScope, $localStorage) {

  var saveToken = function (token) {
      chrome.storage.local.set({'thamus-chrome-token': token.token });
    };

    var getToken = function (cb) {
      chrome.storage.local.get('thamus-chrome-token', function (items) {
        cb(items['thamus-chrome-token']);
      });
    };

    var isLoggedIn = function(cb) {
      getToken(function (token) {
        if(token != undefined){
          try {
          //var payload = JSON.parse(decodeURIComponent(escape($window.atob(token.split('.')[1]))));
          // cb(payload.exp > Date.now() / 1000);
          cb(true);
        }

        catch (err) {
          logout();
        }

        } else {
          cb(false);
        }
      });
    };

    var currentUser = function(cb) {
      isLoggedIn(function (item) {
        if (item) {
          getToken(function (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            cb(payload);
          });
        }
      });
    };

    var login = function(user) {
      return $http.post('https://api.thamus.com.br/v1/login', user).then(function(data) {
        saveToken(data.data.token);
      });
    };

    var logout = function() {
      chrome.storage.local.remove('thamus-chrome-token');
      $location.path('/popup.html');
    };

    return {
      currentUser : currentUser,
      saveToken : saveToken,
      getToken : getToken,
      isLoggedIn : isLoggedIn,
      login : login,
      logout : logout,
    };
  }
})();