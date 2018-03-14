import $ from 'jquery'

(function () {
angular
    .module('thamusChromeApp')
    .controller('loginCtrl', loginCtrl);

loginCtrl.$inject = ['$location','authentication', '$scope', '$window'];

function loginCtrl($location, authentication, $scope, $window) {
  var vm = this;

  vm.error = null;
  
  vm.credentials = {
    email : '',
    password : ''
  };

  vm.onFacebook = function () {
    $window.open('https://www.facebook.com/dialog/oauth?client_id=267659906914316&response_type=token&scope=email&redirect_uri=http://www.facebook.com/connect/login_success.html');
  }

  vm.cadastrar = function () {
    $window.open('http://thamus.com.br');
  }

  vm.onSubmit = function () {
    if (!vm.credentials.email || !vm.credentials.password) {
      vm.error = 'Você precisa preencher todos os campos.';
      $('form').addClass('has-error');
      return false;
    } else {
      vm.doLogin();
    }
  }

  vm.doLogin = function() {
    authentication
      .login(vm.credentials)
      .catch(function(err){
        vm.error = err.data.message;
      })
      .then(function(){
        authentication.getToken(function (token) {
          if (token === undefined) {
            $('form').addClass('has-error');
            vm.error = 'Senha ou usuario invalidos.';
          } else {
            $location.path('/app');
            $scope.$apply();
          }
        });
      });
  };
};
})();