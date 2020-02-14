// import $ from 'jquery'
// import axios from 'axios'
import Utils from './helpers/utils'

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
      token: await getToken()
    }

    // only inject if it is logged
    if (THAMUS_APP_DATA.token) {
      Utils.injectStringScript(`var THAMUS_APP_DATA = ${JSON.stringify(THAMUS_APP_DATA)}`)
      Utils.injectScript('/scripts/general.js')
    }
  }
}

main()
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