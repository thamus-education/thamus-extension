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
    $window.open('https://api.thamus.com.br/v1/connect/facebook?isThamusExtension=true')
  }

  vm.onGoogle = function () { 
    $window.open('https://api.thamus.com.br/v1/connect/google?isThamusExtension=true')
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