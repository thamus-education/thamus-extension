import axios from 'axios'
import $ from 'jquery'

var thamusEvent = document.createEvent('Event')
thamusEvent.initEvent('thamusEvent', true, true)

function firethamusEvent (data) {
  hiddenDiv = document.getElementById('thamusConnector')
  hiddenDiv.innerText = data
  hiddenDiv.dispatchEvent(thamusEvent)
}

module.exports.callIframe = function callIframe (caller, data) {
  if (data) {
    if (caller === 'pdf') {
      var blob = new Blob([data], {type: 'application/pdf'})
      var data = URL.createObjectURL(blob)
    } else if (caller === 'video') {
      var blob = new Blob([data], {type: 'video/mp4'})
      var data = URL.createObjectURL(blob)
    }

  }
  firethamusEvent(JSON.stringify({'caller': caller, 'data': data}))
}

module.exports.createIframe = async function createIframe (script) {
  // create iframe
  var iframe = document.createElement('iframe')

  // set css on iframe
  iframe.className = 'boundary-default-iframe thamusFrame'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.allowtransparency = true
  iframe.style.position = 'fixed'
  iframe.style.top = '0px'
  iframe.style.left = '0px'
  iframe.style.right = '0px'
  iframe.style.bottom = '0px'
  iframe.style.border = 'none'
  iframe.style.margin = '0'
  iframe.style.padding = '0'
  iframe.style.overflow = 'hidden'
  iframe.style['z-index'] = '999999'
  iframe.id = 'swalFrame'

  var body = document.body
  $('body').prepend(iframe)
  
  // APPEND SOURCES
  var val = `<link rel="stylesheet" type="text/css" href="${chrome.extension.getURL('styles/sweetalert2.min.css')}">`
  val += `<link rel="stylesheet" type="text/css" href="${chrome.extension.getURL('styles/bootstrap.min.css')}">`
  val += `<link rel="stylesheet" type="text/css" href="${chrome.extension.getURL('styles/custom.css')}">`
  val += `<script type="text/javascript" src="${chrome.extension.getURL(script)}"></script>`
  val += '<style> body {background-color: transparent !important} </style>'

  // get a handle on the <iframe>d document (in a cross-browser way)
  var doc = iframe.contentWindow || iframe.contentDocument
  if (doc.document) {
    doc = doc.document
  }

  // open, write content to, and close the document
  doc.open()
  doc.write(val)
  doc.close()
}