import $ from 'jquery'
import iframe from './iframe'
import Utils from './utils'
import franc from 'franc'
import Ferris from './ferris'
import ThamusApi from './api'
import readability from './readability'
import Auth from './auth'
import Translator from './translator'
import Later from './later'
import _ from 'lodash'
import loading from 'gasparesganga-jquery-loading-overlay'

module.exports = new(function GeneralStudyHandler() {
  let NLP = {}

  return {
    shouldLoadGeneralFerris,
    createGeneralStudyHandler
  }

  function checkMainWindow() {
    return window.self === window.top;
  }

  function checkLanguage() {
    return franc(document.body.innerText) == 'eng';
  }

  function shouldLoadGeneralFerris() {
    return checkMainWindow() && Utils.isNotForbidden() && checkLanguage();
  }

  function createGeneralStudyHandler() {
    let TOTAL, UNIQUE

    $.ferrisWheelButton('getButton','file-text-o').on('click', async function(ev){
      
      $.LoadingOverlay('show')

      let thamusExists = document.getElementById('thamusText')

      if(!thamusExists) {
        let status = studyGeneralText()
        if(status) {
          $.LoadingOverlay('hide')
          iframe.createIframe('scripts/helpers/fragments/iframe_study_fail.js')
          return
        }
      }

      // grab text
      let text = document.getElementById('thamusText').innerText

      // process text
      let processed = Utils.nlpText(text)
      
      // sends to endpoint
      let resp
      try {
        resp = await ThamusApi.getNlp(processed, 'text', document.location.href)
      } catch (e) {
        $.LoadingOverlay('hide')
        iframe.createIframe('scripts/helpers/fragments/iframe_estourou.js')
        return
      }
        
      $.LoadingOverlay('hide')
      iframe.createIframe('scripts/helpers/fragments/iframe_study.js')
      createGeneralTranslator()
      var elementExists = document.getElementById('thamusStats')
      if (elementExists) {
        elementExists.innerText = JSON.stringify(resp)
      } else {
        var s = document.createElement('div')
        s.id = 'thamusStats'
        s.style.display = 'none'
        s.innerText = JSON.stringify(resp)
        document.body.appendChild(s)
      }

      _.get(resp, 'words', []).forEach(word => NLP[word.word] = word)
      Utils.cleanLinks('thamusHelper')
      UNIQUE = resp.unique
      TOTAL = resp.total


      let isSaved = await Later.isSaved('text')

      if(isSaved.status) {
        let words = _.get(isSaved, 'words.data.content', [])
        words.map(async function (word) {
          await Translator.createGeneralBox(null, '.thamusHelper', null, word)
          NLP[word].status = 'marked'
        })
      }
    })

    $.ferrisWheelButton('getButton','calculator').on('click', async function(ev){
      if(Object.keys(NLP).length == 0) return;

      var key;
      var obj = {}
      obj.words = []
      // se NLP existe
      for(key in NLP) {
        obj.words.push(NLP[key])
      }
      obj.unique = parseFloat(UNIQUE)
      obj.total = parseFloat(TOTAL)

      var elementExists = document.getElementById('thamusStats')
      if(JSON.parse(elementExists.innerText).length) {
        iframe.createIframe('scripts/helpers/fragments/iframe_calculator.js')
      } 
      else {
        $.LoadingOverlay('show')
        let resp = await ThamusApi.calculate(obj)

        if (elementExists) {
          elementExists.innerText = JSON.stringify(resp)
        } else {
          var s = document.createElement('div')
          s.id = 'thamusStats'
          s.style.display = 'none'
          s.innerText = JSON.stringify(resp)
          document.body.appendChild(s)
        }

        $.LoadingOverlay('hide')
        iframe.createIframe('scripts/helpers/fragments/iframe_calculator.js')
      }
    })

    $.ferrisWheelButton('getButton','floppy-o').on('click', async function(ev){
      let user = await Auth.currentUser()

      await Later.buttonSave(null,
        NLP, 
        user.id,
        document.location.href,
        'text',
        document.title)
    });

    $.ferrisWheelButton('getButton','check').on('click', async function(ev){
      let user = await Auth.currentUser()

      await ThamusApi.buttonFinish(NLP, user.id, document.location.href)
    });
  }

  function createGeneralTranslator(){
    $('body').on('click', '.thamusHelper', async function(e) {
      // extrai a palavra
      var str = Translator.extractWord(e);
      if (str == null) {
        return;
      }
        
      let cleanedClass = Translator.clear_class_str(str)
      let alreadyExists = $('.th-' + cleanedClass);

      // the key that will be in the NLP
      let key = Translator.clear_str(str.toLowerCase())

      if (_.get(alreadyExists, 'length', 0)) {
        // classe existe, temos que dar unhighlight
        $('.th-' + cleanedClass).webuiPopover('hide')
        $('.th-' + cleanedClass).webuiPopover('destroy')
        $('.thamusHelper').unhighlight({ wordsOnly: true, element: 'thamus', className: 'th-' + cleanedClass })
        
        NLP[key] ? delete NLP[key].status : null
      } else {
        await Translator.createGeneralBox(e, '.thamusHelper', null, str)
        NLP[key] ?  NLP[key].status = 'marked' : null  
      }
    })
  }

  function studyGeneralText () {
    try {
      var prepared = readability.prepDocument(document.cloneNode(true));
      var article = readability.grabArticle(prepared);

      var child_jquery = $(article.firstChild)

      var id = $(child_jquery).attr('id')
      if (id != null) {
        var text_found = $('#' + id)
        text_found.addClass('thamusHelper')
      } else {
        var classe = $(child_jquery).attr('class')
        var text_found = $('.' + classe.replace(/ /g, '.'))
        text_found.addClass('thamusHelper')
        // get text -> remove comments -> remove scripts
        // .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      }

      var cleaned_text = text_found.get(0).innerText.replace(/<!--[\s\S]*?-->/g, '')

      // append this dom element
      var s = document.createElement('div')
      s.id = 'thamusText'
      s.style.display = 'none'
      s.innerText = cleaned_text
      document.body.appendChild(s)
      return 0
    } catch (err){
      console.log(err)
      return 1
    }
  }
})()