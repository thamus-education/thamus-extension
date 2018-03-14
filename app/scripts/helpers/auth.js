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
    if(token !== undefined){
      try {
        var payload = JSON.parse(decodeURIComponent(escape(window.atob(token.split('.')[1]))))
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
    if(!isLogged) {
      return false
    }

    let token = await getToken()
    var payload = JSON.parse(window.atob(token.split('.')[1]))
    var obj = {
      id: payload._id,
      email : payload.email,
      name : payload.name,
      confirmed: payload.confirmed,
      tested: payload.tested,
      active: payload.active,
      subscription: payload.subscription,
      token: token,
      limit: payload.limit
    }

    tmpUser = _.clone(obj)
    return obj
  }

  async function isAllowed () {
    let user = await currentUser()
    if(!user) {
      return false
    }

    if(!user.limit) {
      return true && user.confirmed && user.tested
    }

    if(user.limit && user.subscription.plan == 0) {
      if(user.limit.length > 10) {
        return false
      }

      return true && user.confirmed && user.tested
    }

    if(user.limit && user.subscription.plan == 5) {
      if(user.limit.length > 5) {
        return false
      }

      return true && user.confirmed && user.tested
    }
  }
})()