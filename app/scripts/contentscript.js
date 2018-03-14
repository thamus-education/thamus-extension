import $ from 'jquery'
import axios from 'axios'

import Utils from './helpers/utils'
import Auth from './helpers/auth'
import GeneralStudy from './helpers/general'
import Ferris from './helpers/ferris'

import iframe from './helpers/iframe'
import Youtube from './helpers/youtube'
import Netflix from './helpers/netflix'
import _ from 'lodash'

;(async function () {
  // INJECT NETFLIX SUBTITLE WATCHER
  (function injectNetflixSubWatcher() {
    var url = document.location.href;
    if(url.indexOf('netflix') !== -1 && window.self === window.top) {
      Utils.injectScript('/scripts/helpers/netflixsub.js')
    }
  })()

  var isInstalledNode = document.createElement('div')
  isInstalledNode.id = 'thamusex-is-installed'
  document.body.appendChild(isInstalledNode)

  // listen to login events
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action == 'login-success') {
      iframe.createIframe('scripts/helpers/fragments/iframe_login_success.js')
    } else if (request.action == 'login-error') {
      iframe.createIframe('scripts/helpers/fragments/iframe_login_fail.js')
    }
  })

  async function injectGeneral() {
    let allowed = await Auth.isAllowed()
    let requested = await Utils.isFerrisRequested('geral')

    if(allowed && requested) {
      if(GeneralStudy.shouldLoadGeneralFerris()) {
        Ferris.commonFerris()
        GeneralStudy.createGeneralStudyHandler()
      }
    }
  }

  window.addEventListener('load', function() {
    injectGeneral()
    Youtube.shouldInject()
    Netflix.shouldInject()
  })
})()