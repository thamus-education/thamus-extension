// $('.button-nfplayerSubtitles').click()

// var status = false
// var english = ['inglês', 'ingles', 'english']

// $('.track-list-subtitles').children().each((i, el) => {
//   let value = $(el).text()
//   let isEnglish = english.some(item => value.indexOf(item) != -1)
//   if(isEnglish) {
//     $(el).click()
//     status = true
//   }
// })

// console.log(status)
// $('.button-nfplayerSubtitles').click()


// $('.track-list-audio').children().each((i, el) => {
//   console.log($(el).text())
// })



// resetVariables()
// IFFE -> WATCH NETFLIX CHANGES
// getNetflixSub() -> devtools
// getSubtitle()
// createNetflixHandlers -> movein, mouveout, click
// makeNetflixReady
// watchNetflixSub
// generatePhrasalSubtitle
// injectNetflixFerris
// createStudyHandler();
// createCalculatorHandler();
// createSaveHandler();
// createFinishHandler();
// isPossible();

import Auth from './auth'
import $ from 'jquery'
import Utils from './utils'
import Ferris from './ferris'
import Translator from './translator'
import axios from 'axios'
import iframe from './iframe'
import ThamusApi from './api'
import Later from './later'
import highlight from 'jquery-highlight'
import popover from 'webui-popover'
import franc from 'franc'
import Alert from './alert'
import loading from 'gasparesganga-jquery-loading-overlay'
import _ from 'lodash'

module.exports = new(function Netflix () {
  var NET_SUBTITLE = {};
  var interval_netflix = 95914;
  var NLP = {};
  var PHRASALS = [];

  var HIGHLIGHTED_WORDS = [];
  var TOTAL = 0;
  var UNIQUE = 0;

  // play and pause controls
  let playClass = '.button-nfplayerPlay'
  let pauseClass = '.button-nfplayerPause'

  var ASCII_LENGTH = 14

  function createAsciiHash(start, count) {
    return Array.apply(0, Array(count))
    .map(function (element, index) { 
      return String.fromCharCode(index + start) 
    })
  }

  // generate strange characters
  var ASCII = createAsciiHash(33, ASCII_LENGTH)
  ASCII = ASCII.filter(function (item) {
    return item != '.' || item != '!'
  })

  return {
    getNetflixSub : getNetflixSub,
    getSubtitle: getSubtitle,
    makeNetflixReady: makeNetflixReady,
    injectNetflixFerris: injectNetflixFerris,
    getVideoId: getVideoId,
    isPossible: isPossible,
    shouldInject: shouldInject,
  }

  function resetVariables () {
    //NET_SUBTITLE = {};
    PHRASALS = [];
    NLP = {};
    HIGHLIGHTED_WORDS = [];
    TOTAL = 0;
    UNIQUE = 0;
    // unbind
    $('body').off('mouseenter', '.thamusNetflix-container', mouseEntra);
    $('body').off('mouseleave', '.thamusNetflix-container', mouseSai);
    $('body').off('click', 'thword', clique);
  }

  async function shouldInject () {
    var LAST_ID = 0;
    let user = await Auth.currentUser()

    setInterval(async function () {
      let current_url = document.location.href

      let allowed = await Auth.isAllowed()
      let requested = await Utils.isFerrisRequested('netflix')

      if(current_url.indexOf('netflix.com') == - 1){
        return
      }

      if(!allowed || !requested || current_url.indexOf('netflix.com/watch') == -1) {
        LAST_ID = 0
        resetVariables()
        $('#thamusFerris').remove()
        return
      }

      if(current_url.indexOf('netflix.com/watch') != -1 && getVideoId() != LAST_ID) {
        resetVariables()
        LAST_ID = getVideoId()

        // need to check if this is possible
        let possible = await isPossible()
        if(possible && $('#thamusFerris').length === 0) {
          Ferris.commonFerris()
          injectNetflixFerris()  
        } else {
          $('#thamusFerris').remove()
          $('.thamusNetflixHelper').remove()
        }

      }
    }, 1000)
  }

  async function getNetflixSub(url) {
    let response = await axios.get(url)
    let data = response.data

    // extract subtitle
    let subtitle = ''
    $(data).find('p').each(function() {
      subtitle += $(this)[0].innerText + ' '
    })
    
    let language = franc(subtitle.slice(0, 2000))

    return { language, subtitle }
  }

  async function getSubtitle(lang) {
    let subtitles = []

    $('.netflixSubs').each(function (item) {
      subtitles.push($(this).attr('id'))
    })

    subtitles = await Promise.all(subtitles.map(subtitle => getNetflixSub(subtitle)))
    subtitles = subtitles.filter(subtitle => subtitle.language == 'eng')
    let sub = _.maxBy(subtitles, subtitle => subtitle.subtitle.length)
    return sub.subtitle
  }

  function watchSubs () {
    // stop study session
  }

  function watchAudio () {
    // stop study session
  }

  function findPhrasals() {
    var key;
    for (let key in NLP) {
      if(key.split(/\s/).length > 1) {
        PHRASALS.push(key);
      }
    }
  }

  function mouseEntra () {
    $(pauseClass).click()
  }

  function mouseSai() {
    if(!isShowingPopover()) {
      $(playClass).click()
    }
  }

  async function clique (e) {
    var str = $(e.target).text().toLowerCase();
    var str_class = str.replace(/\s/g, '_');
    // mark or unmark
    let clearClass = Translator.clear_class_str(str_class)
    let key = Translator.clear_str(str)

    if($('.th-' + clearClass).hasClass('yt-high')) {
      $('.th-' + clearClass).removeClass('yt-high')
      HIGHLIGHTED_WORDS = HIGHLIGHTED_WORDS.filter(function (item) { return item != '.th-' + clearClass })
      NLP[key] ? delete NLP[key].status : null
    } else {
      NLP[key] ?  NLP[key].status = 'marked' : null  

      await Translator.createBox(e, 'classe', 'color', str, str_class);
      HIGHLIGHTED_WORDS.push('.th-' + clearClass);
    }
  }

  function createTranslatorHandlers () {
    $('body').on('mouseenter', '.thamusNetflix-container', mouseEntra);
    $('body').on('mouseleave', '.thamusNetflix-container', mouseSai);
    $('body').on('click', 'thword', clique);
  }

  function makeNetflixReady () {
    // make sure hover is not showing when we click
    if(!$('.track-list-subtitles').length) $('.button-nfplayerSubtitles').click()
    
    // matches if has this language
    let english = ['inglês', 'ingles', 'english']

    // mark rigth subtitle
    $('.track-list-subtitles').children().each((i, el) => {
      let value = $(el).text()
      let isEnglish = english.some(item => value.toLowerCase().indexOf(item) != -1)
      if(isEnglish) {
        $(el).click()
      }
    })

    // mark right audio
    $('.track-list-audio').children().each((i, el) => {
      let value = $(el).text()
      let isEnglish = english.some(item => value.toLowerCase().indexOf(item) != -1)
      if(isEnglish) {
        $(el).click()
      }
    })
    
    if($('.track-list-subtitles').length) $('.button-nfplayerSubtitles').click()
  }

  function duplicateSubtitleContainer () {
    var thamusEl = $('.player-timedtext').clone();
    thamusEl
      .removeClass('player-timedtext')
      .removeClass('hidden')
      .addClass('thamusNetflixHelper');
    if(thamusEl.children().length !== 0) {
      thamusEl.children().removeClass('player-timedtext-text-container');
      thamusEl.children().addClass('thamusNetflix-container');
    } else {
      thamusEl.append('<div class="thamusNetflix-container"></div>');
    }
    $('.player-timedtext').parent().append(thamusEl);
  }

  function updateStyles () {
    // container style
    var thamusHelper = $('.thamusNetflixHelper');
    var style = $('.player-timedtext').attr('style');
    thamusHelper.attr('style', style);
    thamusHelper.css('display', 'block');
    // children style
    // need to wait netflix logic to kick-in
    setTimeout(function () {
      if($('.player-timedtext').children()) {
        style = $('.player-timedtext').children().attr('style');
        thamusHelper.children().attr('style', style);
        thamusHelper.children().css('display', 'block');
      }
      // make sure original is not visible
      $('.player-timedtext').css('display', 'none')
    }, 10);
  }

  function hidePopovers () {
    $('.webui-popover').each(function () {
      if($(this).css('display') === 'block') {
        $(this).css('display', 'none');
      }
    })
  }

  function isShowingPopover() {
    var control = false;
    $('.webui-popover').each(function () {
      if($(this).css('display') === 'block') {
        control = true;
        return;
      }
    })
    return control;
  }

  function watchNetflixSub(){
    if($('.player-timedtext').length !== 0) {
      clearInterval(interval_netflix);
      duplicateSubtitleContainer();
      createTranslatorHandlers();
      var HOLD_TEXT = '@THIS @WILL @NEVER @HAPPEN';

      var thamusHelper = $('.thamusNetflixHelper');

      $('.player-timedtext').bind('DOMSubtreeModified',function(){
        if($('.player-timedtext-text-container').length != 0) {
          updateStyles();
          var text = $('.player-timedtext-text-container')[0].innerText;
          if(text != HOLD_TEXT && text != '') {
            // updates control text
            HOLD_TEXT = text;
            hidePopovers();
            thamusHelper.children().empty();
            var filhos = $('.player-timedtext-text-container').children().length;
            $('.player-timedtext-text-container').children().each(function (i, item) {
              var span = $(this).clone();
              var new_text = generatePhrasalSubtitle(span.text(), PHRASALS);
              if (filhos > 1 && i === filhos - 1) {
                new_text = '<br>' + new_text;
              }
              span.html(new_text);
              span.css('text-align', 'center');
              thamusHelper.children().append(span);
            });

            HIGHLIGHTED_WORDS.forEach(function (str) {
              var phrasal = str.replace('.th-', '')
              str = phrasal.replace('_', ' ');
              if(str === phrasal) {
                var exist = $('.th-' + str).addClass('yt-high');
              } else {
                var exist = $('.th-' + phrasal).addClass('yt-high');
              }
              if (exist.length >= 1) {
                // cria o popover com hover
                Translator.redrawBox(str, phrasal);
                try {
                  //Translator.redrawBox(str);
                    } catch (err) {
                      console.log('falhou em criar o popover');
                    };
              }
            });
          }
        } 
      })
    }
  }

  function generatePhrasalSubtitle(phrase, ph_verb) {
    // hold hash table to map strange characters to phrasal verbs
    var ASCII_LOOKUP = {};

    // first replace phrasal with strange characters
    var times = Math.ceil(ph_verb.length / ASCII_LENGTH);
    ph_verb.forEach(function (item, i) {
      var code = ASCII[i % ASCII_LENGTH].repeat(3 + times - Math.floor(i / ASCII_LENGTH));
      phrase = phrase.replace(item, code);
      ASCII_LOOKUP[code] = item;
    })

    // replace words with word bindings
    phrase = phrase.replaceAll(/\b(\w+)\b/g, function(_, word) {
      return '<thword class="th-' + word.toLowerCase() + '">' + word + '</thword>';
    })

    // replace ascii with hash lookup
    for(let key in ASCII_LOOKUP) {
      var class_alike = ASCII_LOOKUP[key].toLowerCase().replaceAll(/\s/g, '_');
      phrase = phrase.replace(key, '<thword class="th-' + class_alike + '">' + ASCII_LOOKUP[key] + '</thword>');
    };

    return phrase;
  }

  function injectNetflixFerris () {
    createStudyHandler();
    createCalculatorHandler();
    createSaveHandler();
    createFinishHandler();
  }

  function createCalculatorHandler() {
    $.ferrisWheelButton('getButton','calculator').on('click', async function(ev){
      if(Object.keys(NLP).length == 0) return;

      if(!UNIQUE && !TOTAL) return;
      var key;
      var obj = {};
      obj.words = [];
      // se NLP existe
      for(key in NLP) {
        obj.words.push(NLP[key]);
      };
      obj.unique = parseFloat(UNIQUE);
      obj.total = parseFloat(TOTAL);

      var elementExists = document.getElementById('thamusStats');
      if(elementExists && JSON.parse(elementExists.innerText).length) {
        iframe.createIframe('scripts/helpers/fragments/iframe_calculator.js');
      } else {
        $(pauseClass).click()
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
    });
  }

  function createSaveHandler() {
    $.ferrisWheelButton('getButton','floppy-o').on('click', async function(ev){
      let name = ''
      $('.video-title').children().children().each((i, el) => name += `${el.innerText} `)

      let user = await Auth.currentUser()

      await Later.buttonSave(null,
        NLP, 
        user.id,
        'https://www.netflix.com/watch/' + getVideoId(),
        'netflix',
        name)
    });
  }

  function getVideoId () {
    try {
      var id = document.location.href
            .replace('watch/', '@TROQUE@')
            .split('@TROQUE@')[1]
            .split('?')[0];
      return id;
    } catch (err) {
      return false;
    }

  }

  function createFinishHandler() {
    $.ferrisWheelButton('getButton','check').on('click', async function(ev){
      let user = await Auth.currentUser()
      await ThamusApi.buttonFinish(NLP, user.id, getVideoId())
    });
  }

  function createStudyHandler(){
    $.ferrisWheelButton('getButton', 'file-text-o').on('click', async function(ev){
      $.LoadingOverlay('show')
      makeNetflixReady()
      // show loading
      $(pauseClass).click()

      // tries to get the subtitle
      let sub
      try {
        sub = await getSubtitle('eng')
      } catch(e) {
        console.log(e)
        $.LoadingOverlay('hide')
        Alert.createSimpleSwal ('error', 'Erro', "Houve um erro na hora de obter a legenda. Por favor, atualize a página.")
        return
      }

      // process text locally and get id
      let words = Utils.nlpText(sub)
      let video_id = getVideoId()

      // send to do NLP on the server
      let resp
      try {
        resp = await ThamusApi.getNlp(words, 'netflix', video_id)
      } catch (e) {
        $.LoadingOverlay('hide')
        iframe.createIframe('scripts/helpers/fragments/iframe_estourou.js')
        return
      }

      // watch changes on netflix
      interval_netflix = setInterval(watchNetflixSub, 500)

      // update NLP locally
      resp.words.forEach(function (word) {
        NLP[word.word] = word
      })
      findPhrasals()

      TOTAL = resp.total
      UNIQUE = resp.unique

      $.LoadingOverlay('hide')

      // check if is saved
      let isSaved = await Later.isSaved('netflix')

      if(isSaved.status) {
        let words = _.get(isSaved, 'words.data.content', [])
        words.map(async function (word) {
          HIGHLIGHTED_WORDS.push('.th-' + word)
          NLP[word].status = 'marked'
        })
      }

      $(playClass).click()
    })
  }

  function isPossible () {
    return new Promise(function (resolve, reject) {
      var p_interval = setInterval(async function () {
        if($('.button-nfplayerSubtitles').length) {
          clearInterval(p_interval)
          resolve(await canStudy())
        }
      }, 500) 
    })
  }

  function canStudy() {
    return new Promise(function (resolve, reject) {
      var p_interval = setInterval(async function () {
        // make sure hover is not showing when we click
        if(!$('.track-list-subtitles').length) $('.button-nfplayerSubtitles').click()

        let hasSubtitle = false
        let hasAudio = false
        // indicates that we walked in the children
        let wasCalled = false
        // matches if has this language
        let english = ['inglês', 'ingles', 'english']
        // hold selected subtitle
        let selectedSubtitle = $('.track-list-subtitles > .selected').text()

        // check if has subtitles
        $('.track-list-subtitles').children().each((i, el) => {
          wasCalled = true
          let value = $(el).text()
          let isEnglish = english.some(item => value.toLowerCase().indexOf(item) != -1)
          // this is a hack to load all the subtitles
          $(el).click()
          if(isEnglish) {
            hasSubtitle = true
          }
        })

        // rollback to previous selected subtitle
        $('.track-list-subtitles').children().each((i, el) => {
          let value = $(el).text()
          if(value == selectedSubtitle) $(el).click()
        })

        // check if has audio
        $('.track-list-audio').children().each((i, el) => {
          let value = $(el).text()
          let isEnglish = english.some(item => value.toLowerCase().indexOf(item) != -1)
          if(isEnglish) {
            hasAudio = true
          }
        })
        
        if($('.track-list-subtitles').length) $('.button-nfplayerSubtitles').click()
        if(wasCalled){
          clearInterval(p_interval)
          resolve(hasSubtitle && hasAudio)
        }
      }, 200)
    }) 
  }
})()