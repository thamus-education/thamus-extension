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

  const hold = document.createElement;
  if(document.createElement) {
    document.createElement = function(evt) {
      var ele = hold.apply(this, arguments);
      if(arguments[0] == 'INPUT') {
        $.get('https://ipv4-c001-cgh001-claro-br-net-isp.1.oca.nflxvideo.net/?o=AQHFlSUHejWE291drA4Dzqij-2UZF5cUyasIlGdPXC_ABmfmCxIIx26lqgN8MbUmRRWkb4gj-FgjMJj-MQhr8XjmbkEnjpaAz-tfGzwDx6HEbH0UL5BG2073SwmkzzHWsthGhA6rDFbyAYSuDPV3uRofTLK7KFurpHsqz4NRNnjK3JJ4yTRY26_woMRTvAPOOp3JxIS_nzE&v=3&e=1519617612&t=CrBjJDAXNoxr46f_2TgHp8IPdx4')
          .then(a => {
            var oMyBlob = new Blob([a])
            var file = new File([oMyBlob], "Gooo")

            Object.defineProperty(ele, "files", {
              get: function () { return [file] } 
            });

            ele.dispatchEvent(new Event('change'))
          })

        //ele.click = function () {}
      }

      return ele;
    }
  }

      function makeAction(keyCode) {
        let element = document['createEvent']('KeyboardEvent');
        Object['defineProperty'](element, 'keyCode', {
            get: function() {
                return this['keyCodeVal']
            }
        });
        Object['defineProperty'](element, 'which', {
            get: function() {
                return this['keyCodeVal']
            }
        });
        element['initKeyboardEvent']('keydown', true, true, document['defaultView'], false, true, true, true, keyCode, keyCode)
        element['keyCodeVal'] = keyCode;
        document['activeElement']['dispatchEvent'](element)
    }

    makeAction(84)

  console.log('put click handler')
  window.onclick = function(event) { console.log(event) }

  window.addEventListener('load', function() {
    injectGeneral()
    Youtube.shouldInject()
    Netflix.shouldInject()
  })
})()