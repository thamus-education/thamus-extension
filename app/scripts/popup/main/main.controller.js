import $ from 'jquery'

(function () {
angular
    .module('thamusChromeApp')
    .controller('mainCtrl', mainCtrl);

mainCtrl.$inject = ['$location','authentication', '$scope', '$window', '$rootScope'];

function mainCtrl ($location, authentication, $scope, $window, $rootScope) {

  $scope.checkboxModel = {
    yt : true,
    netflix : true,
    geral: false // disable general for now 
  };

  $scope.logout = function() {
    authentication.logout();
  };

  //get options

  var arr = [];
  for (let key in $scope.checkboxModel) {
    arr.push(key);
  }

  arr.forEach(function (key) {
    chrome.storage.local.get('thamus-settings-' + key, function (items) {
      if (items['thamus-settings-' + key] === undefined) {
        var obj = {};
        obj['thamus-settings-' + key] = true;
        chrome.storage.local.set(obj);
        $scope.checkboxModel[key] = true;
      } else {
        $scope.checkboxModel[key] = items['thamus-settings-' + key];
      }
    });
  });


  $scope.mudaStatus = function (model) {
    // send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {change: model});
    });
    // update storages
    for (let key in $scope.checkboxModel) {
      var index = 'thamus-settings-' + key;
      var obj = {};
      obj[index] = $scope.checkboxModel[key];
      chrome.storage.local.set(obj);
    }
  }

  $scope.data = { name: "" };
  $scope.data.message = "";

  authentication.currentUser(function (user) {
    $scope.data.name = user.name;
    console.log(user.limit);
    $scope.$apply() 
  })
}

})();