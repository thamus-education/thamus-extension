import _ from 'lodash'

module.exports = new(function Auth() {
  return {
    getToken: getToken,
    isLoggedIn: isLoggedIn,
    currentUser: currentUser,
    tmpUser: tmpUser,
    isAllowed: isAllowed
  }

  var tmpUser = {}

  function getToken (){
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get('thamus-chrome-token', function (items) {
        resolve(items['thamus-chrome-token'])
      })
    })
  }

  async function isLoggedIn() {
    let token = await getToken()
    
    if (token !== undefined) {
      try {
        JSON.parse(decodeURIComponent(escape(window.atob(token.split('.')[1]))))
        return true
      } catch (err) {
        return false
      }
    } else {
      return false
    }
  }

  async function currentUser () {
    let isLogged = await isLoggedIn()
   
    if (!isLogged) {
      return false
    }

    let token = await getToken()
    var payload = JSON.parse(window.atob(token.split('.')[1]))
    
    return payload
  }

  async function isAllowed () {
    let isLogged = await isLoggedIn()
    
    return isLogged
  }
})()