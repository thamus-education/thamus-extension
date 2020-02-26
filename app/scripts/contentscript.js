// import $ from 'jquery'
// import axios from 'axios'
import Utils from './helpers/utils'

const initInterval = setInterval(function () {
  if (!document || !document.head || !document.body) {
    return;
  }

  if(window.self !== window.top) {
    return
  }

  clearInterval(initInterval)

  // add div to know if extension is installed
  const thamusExtension = document.createElement('div');
  thamusExtension.id = "thamusExtension"
  document.body.appendChild(thamusExtension);
}, 100)


async function getVisibility() {
  const visible = {};

  const promises = ['netflix', 'youtube', 'general'].map(context => {
    return new Promise(function(resolve, _reject) {
      chrome.storage.local.get('thamus-settings-' + context, function (items) {
        const isVisible = items['thamus-settings-' + context]

        visible[context] = isVisible

        resolve(items['thamus-settings-' + context])
      })
    })
  })

  await Promise.all(promises)
  
  return visible
}

function getToken (){
  return new Promise(function(resolve, reject) {
    chrome.storage.local.get('thamus-chrome-token', function (items) {
      resolve(items['thamus-chrome-token'])
    })
  })
}

async function main() { 
  if (window.self === window.top) {
    const THAMUS_APP_DATA = {
      token: await getToken(),
      visible: await getVisibility()
    }

    // only inject if it is logged
    if (THAMUS_APP_DATA.token) {
      Utils.injectStringScript(`var THAMUS_APP_DATA = ${JSON.stringify(THAMUS_APP_DATA)}`)
      Utils.injectScript('/scripts/general.js')
    }
  }
}

main()

if (window.self === window.top) {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (var key in changes) {
      var storageChange = changes[key];
      
      const context = key.replace('thamus-settings-', '')
      const isVisible = storageChange.newValue
      
      const params = { context , isVisible }
      
      Utils.injectStringScript(`setVisibility && setVisibility(${JSON.stringify(params)})`)
    }
  });
}

// import Auth from './helpers/auth'
// import GeneralStudy from './helpers/general'
// import Ferris from './helpers/ferris'

// import iframe from './helpers/iframe'
// import _ from 'lodash'

// ;(async function () {
//   // INJECT NETFLIX SUBTITLE WATCHER
//   (function injectNetflixSubWatcher() {
//     var url = document.location.href;
//     if(url.indexOf('netflix') !== -1 && window.self === window.top) {
//       Utils.injectScript('/scripts/helpers/netflixsub.js')
//     }
//   })()

//   var isInstalledNode = document.createElement('div')
//   isInstalledNode.id = 'thamusex-is-installed'
//   document.body.appendChild(isInstalledNode)

//   // listen to login events
//   chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if(request.action == 'login-success') {
//       iframe.createIframe('scripts/helpers/fragments/iframe_login_success.js')
//     } else if (request.action == 'login-error') {
//       iframe.createIframe('scripts/helpers/fragments/iframe_login_fail.js')
//     }
//   })

//   async function injectGeneral() {
//     let allowed = await Auth.isAllowed()
//     let requested = await Utils.isFerrisRequested('geral')

//     if(allowed && requested) {
//       if(GeneralStudy.shouldLoadGeneralFerris()) {
//         Ferris.commonFerris()
//         GeneralStudy.createGeneralStudyHandler()
//       }
//     }
//   }
// })()