import axios from 'axios'
import _ from 'lodash'

const getAllTabs = function (args) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.query(args, function (tabs){
      resolve(tabs)
    })
  });
}

function getParameterByName(url, name) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

async function onOAuthLogin(tabId, changeInfo, tab){
  const tabs = await getAllTabs({})
  const extensionTab = _.find(tabs, tab => tab.url.indexOf('isThamusExtension') !== -1)

  if (!extensionTab) {
    return
  }

  const isThamusExtension = getParameterByName(extensionTab.url, 'isThamusExtension')
  const token = getParameterByName(extensionTab.url, 'token')

  if (isThamusExtension != 'true') {
    return
  }

  if (!token) {
    return
  }

  chrome.storage.local.set({ 'thamus-chrome-token': token })

  chrome.tabs.remove(extensionTab.id)
  
  const currentTab = await getAllTabs({ currentWindow: true, active: true })
  chrome.tabs.sendMessage(currentTab[0].id, {'action': 'login-success'})

  // let currentTab = await getAllTabs({ currentWindow: true, active : true })
  // chrome.tabs.sendMessage(currentTab[0].id, {'action': 'login-error'})
}

chrome.tabs.onUpdated.addListener(onOAuthLogin)