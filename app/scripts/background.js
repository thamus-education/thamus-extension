import axios from 'axios'
import _ from 'lodash'

const successURL = 'www.facebook.com/connect/login_success.html'

// wrapper around chrome.tabs.query function
const tabsPromise = function (args) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.query(args, function (tabs){
      resolve(tabs)
    })
  });
}

async function onFacebookLogin(tabId, changeInfo, tab){
  let tabs = await tabsPromise({}) // get all tabs
  let facebookTab = _.find(tabs, tab => tab.url.indexOf(successURL) !== -1)

  if (!facebookTab) {
    return
  }

  try {
    // extract access token
    var params = facebookTab.url.split('#')[1];
    var accessToken = params.split('&')[0];
    accessToken = accessToken.split('=')[1];

    // remove facebook tab
    chrome.tabs.remove(facebookTab.id)

    // login user to thamus website
    let user = await axios.get('https://graph.facebook.com/me/?access_token=' + accessToken)
    let token = await axios.get('https://thamus.com.br/api/users/auth/facebook/chrome/' + user.data.id)
    chrome.storage.local.set({'thamus-chrome-token': token.data.data})
    
    // notify that this was a sucess
    let currentTab = await tabsPromise({ currentWindow: true, active : true })
    chrome.tabs.sendMessage(currentTab[0].id, {'action': 'login-success'})
  } catch (e) {
    // notify that an error occured
    let currentTab = await tabsPromise({ currentWindow: true, active : true })
    chrome.tabs.sendMessage(currentTab[0].id, {'action': 'login-error'})
  }
}

chrome.tabs.onUpdated.addListener(onFacebookLogin)