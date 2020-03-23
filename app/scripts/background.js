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

function sM(a) {
  var b;
  if (null !== yr)
      b = yr;
  else {
      b = wr(String.fromCharCode(84));
      var c = wr(String.fromCharCode(75));
      b = [b(), b()];
      b[1] = c();
      b = (yr = window[b.join(c())] || "") || ""
  }
  var d = wr(String.fromCharCode(116))
      , c = wr(String.fromCharCode(107))
      , d = [d(), d()];
  d[1] = c();
  c = "&" + d.join("") + "=";
  d = b.split(".");
  b = Number(d[0]) || 0;
  for (var e = [], f = 0, g = 0; g < a.length; g++) {
      var l = a.charCodeAt(g);
      128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023),
          e[f++] = l >> 18 | 240,
          e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
          e[f++] = l >> 6 & 63 | 128),
          e[f++] = l & 63 | 128)
  }
  a = b;
  for (f = 0; f < e.length; f++)
      a += e[f],
          a = xr(a, "+-a^+6");
  a = xr(a, "+-3^+b+-f");
  a ^= Number(d[1]) || 0;
  0 > a && (a = (a & 2147483647) + 2147483648);
  a %= 1E6;
  return (a.toString() + "." + (a ^ b))
}

var yr = null;
var wr = function(a) {
  return function() {
      return a
  }
}
  , xr = function(a, b) {
  for (var c = 0; c < b.length - 2; c += 3) {
      var d = b.charAt(c + 2)
          , d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d)
          , d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
      a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
  }
  return a
};


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.event == 'thamusGoogleTranslate') {
    const { text, from, to } = message.data

    axios.get('https://translate.googleapis.com/translate_a/single?dt=t&dt=bd&dt=qc&dt=rm&dt=ex', {
      params: {
        client: 'gtx',
        hl: 'en',
        sl: from,
        tl: to,
        q: text,
        dj: 1,
        tk: sM(text)
      }
    }).then(r => {
      sendResponse({ message, result: r, hasError: false })
    }).catch(e => {
      sendResponse({ message, error: e, hasError: true })
    })
  } else {
    sendResponse({ message, received: 'ok' })
  }

  return true
});