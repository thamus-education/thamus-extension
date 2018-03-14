// DONE - resetVariables()
// DONE - IFFE -> WATCH NETFLIX CHANGES
// DONE - getYoutbeSub() -> devtools
// DONE - getSubtitle()
// NOT - adjustSubs()
// NOT - adjustAudio()
// DONE - createTranslatorHandlers
// DONE - makeReady
// DONE - watchSubtitleChanges
// LACK - generatePhrasalSubtitle
// DONE - injectFerris
// DONE - createStudyHandler();
// DONE - createCalculatorHandler();
// DONE - createSaveHandler();
// DONE - createFinishHandler();
// DONE - isPossible();

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
import loading from 'gasparesganga-jquery-loading-overlay'
import _ from 'lodash'

module.exports = new(function Youtube () {
  function createAsciiHash(start, count) {
    return Array.apply(0, Array(count))
      .map(function (element, index) { 
        return String.fromCharCode(index + start);  
    });
  }

  var ASCII_LENGTH = 14

  // generate strange characters
  var ASCII = createAsciiHash(33, ASCII_LENGTH)
  ASCII = ASCII.filter(function (item) {
    return item != '.' || item != '!'
  })

  var NLP = {};
  var YT_SUBTITLE = {};
  var HIGHLIGHTED_WORDS = [];
  var TOTAL = 0;
  var UNIQUE = 0;
  var PHRASALS = [];

  return {
    isPossible: isPossible,
    injectFerris: injectFerris,
    getYoutubeSub: getYoutubeSub,
    shouldInject : shouldInject
  }

  function resetVariables () {
    PHRASALS = []
    NLP = {};
    // only reset subtitle if not the same ID
    HIGHLIGHTED_WORDS = [];
    YT_SUBTITLE = {}
    TOTAL = 0;
    UNIQUE = 0;
    var el = document.getElementById('thamusStats');
    if(el) {
      el.parentNode.removeChild(el);
    }
    $('#thamus-sub').remove()
    $('#movie_player').unbind('DOMSubtreeModified');
    $('#movie_player').unbind('mousedown');
    $('#movie_player').unbind('mouseenter');
    $('#movie_player').unbind('mouseleave');
  }


  async function shouldInject () {
    var LAST_ID = 0

    // if we are not in the main window, return
    if(window.self !== window.top) {
      return
    }

    let user = await Auth.currentUser()

    setInterval(async function () {
      let current_url = document.location.href

      if($('.ad-interrupting').length) {
        return
      }

      if(current_url.indexOf('youtube.com') == - 1){
        return
      }

      let allowed = await Auth.isAllowed()
      let requested = await Utils.isFerrisRequested('yt')

      if(!allowed || !requested || current_url.indexOf('youtube.com/watch') == -1) {
        LAST_ID = 0
        resetVariables()
        $('#thamusFerris').remove()
        return
      }

      let currentId = findGetParameter(document.location.href, 'v')

      if(current_url.indexOf('youtube.com/watch') != -1 && currentId != LAST_ID) {
        resetVariables()
        // need to check if this is possible
        let possible = await isPossible()
        if(possible && $('#thamusFerris').length === 0) {
          LAST_ID = currentId
          Ferris.commonFerris()
          injectFerris()  
        } else {
          console.log('IM REMOVING')
          $('#thamusFerris').remove()
          $('#thamus-sub').remove()
        }

      }
    }, 1000)
  };

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

  function getYoutubeSub(url) {
    var video = findGetParameter(document.location.href, 'v');
    var lang = findGetParameter(url, 'lang')
  }

  function injectFerris() {
    createStudyHandler();
    createCalculatorHandler();
    createSaveHandler();
    createFinishHandler();
  }

  async function getSubtitle () {
    var video = findGetParameter(document.location.href, 'v');

      let links = [
        `https://www.youtube.com/api/timedtext?v=${video}&lang=en&fmt=vtt`,
        `https://www.youtube.com/api/timedtext?v=${video}&lang=en&name=Default&fmt=vtt`,
        `https://www.youtube.com/api/timedtext?v=${video}&lang=en-GB&fmt=vtt`,
        `https://www.youtube.com/api/timedtext?v=${video}&lang=en-GB&name=Default&fmt=vtt`,
      ]
    
    let subtitles = await Promise.all(links.map(link => axios.get(link)))
    console.log(subtitles)
    let subtitle = _.find(subtitles, resp => resp.data != '')
    console.log(subtitle)
    
    return subtitle
  }

  function makeReady() {
    $('.ytp-settings-button').click();
    $('.ytp-menuitem-label-count').click();
    $('.ytp-panel-menu').find('.ytp-menuitem-label').each(function () {
      if (isEnglish(this.innerText)) {
        $(this).click();
        $('.watch-title').click();
      };
    });
  }

  function clearSubtitle(sub) {
    return sub
      .replace(/(.*)-->(.*)/g, '')
      .replace('WEBVTT', '')
      .replace('Kind: captions', '')
      .replace('Language: en', '')
      .replace('\n', ' ');
  }

  function createTranslatorHandlers () {
    // play on mouse leave
    $('#movie_player').on('mouseleave', '#thamus-sub', function(e) {
      //console.log($(e.target).css("display"));
      if ($('.ytp-play-button').attr('aria-label') == 'Reproduzir' && !isShowingPopover()) {
        $('.ytp-play-button').click();
      }
    });
    // pause the video on mouseenter
    $('#movie_player').on('mouseenter', '#thamus-sub', function(e) {
        if ($('.ytp-play-button').attr('aria-label') == 'Pausa') {
          $('.ytp-play-button').click();
        }
    });

    $('#movie_player').on('mousedown', 'thword', async function (e) {
      var str = $(e.target).text().toLowerCase();
      var str_class = str.replace(/\s/g, '_');
      // mark or unmark
      let clearClass = Translator.clear_class_str(str_class)
      let key = Translator.clear_str(str)

      if($('.th-' + clearClass).hasClass('yt-high')) {
        $('.th-' + clearClass).removeClass('yt-high');
        HIGHLIGHTED_WORDS = HIGHLIGHTED_WORDS.filter(function (item) { return item != '.th-' + clearClass });
        NLP[key] ? delete NLP[key].status : null
      } else {
        NLP[key] ?  NLP[key].status = 'marked' : null  

        await Translator.createBox(e, 'classe', 'color', str, str_class);
        HIGHLIGHTED_WORDS.push('.th-' + clearClass);
      }

      // make sure the video is paused
      function pause () {
        let label = $('.ytp-play-button').attr('aria-label') 
        if (label == 'Pausa' || label == 'Pause') {
          $('.ytp-play-button').click()
          clearInterval(inter)
        }
      }

      pause()
      var inter = setInterval(pause, 5)
    })

    $('#movie_player').on('click', '#thamus-sub', function (e) {
      // make sure the video is paused
      if ($('.ytp-play-button').attr('aria-label') == 'Pausa') {
          $('.ytp-play-button').click();
        }
    })
  }

  function watchSubtitleChanges() {
    var HOLD_TEXT = '@THIS @WILL @NEVER @HAPPEN';;
    $('#movie_player').bind('DOMSubtreeModified',function(){
      if ($('.captions-text').html() != null) {
        $('.caption-window').addClass('ytsub');
        $('.captions-text').addClass('ytsub');
        $('.captions-text').children().addClass('ytsub');
        $('.captions-text').children().attr('id', 'thamus-sub');

        var thamus = $('#thamus-sub');

        var cleaned = thamus.clone().text().replaceAll(/[^a-zA-Z]/g, '');
        // isso significa basicamente que a legenda mudou
        var th_exists = thamus.html() && thamus.html().indexOf('th-') + 1 ? true : false;
        if (cleaned != '' && (cleaned != HOLD_TEXT || !th_exists)) {
          // locate the br tag
          var regex = /\b(\w+)\<\/thword\>\s*(&nbsp;)<br>/g;
          var text = $('.captions-text').html();

          var newText = thamus.clone().text();

          HOLD_TEXT = newText.replaceAll(/[^a-zA-Z]/g, '');
          // create the tag
          newText = generatePhrasalSubtitle(newText, PHRASALS);
          thamus.html(newText);

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
            }
          })
        }
      }
    })
  }

  function generatePhrasalSubtitle(phrase, ph_verb) {
    // hold hash table to map strange characters to phrasal verbs
    var ASCII_LOOKUP = {};

    // first replace phrasal with strange characters
    ph_verb.forEach(function (item, i) {
      var code = ASCII[i % ASCII_LENGTH].repeat(Math.floor(i / ASCII_LENGTH) + 3);
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

    return phrase.replace('   ', '<br>').replace('  ', '<br>');
  }


  function findPhrasals() {
    var key;
    for (key in NLP) {
      if(key.split(/\s/).length > 1) {
        PHRASALS.push(key);
      }
    }
  }

  function createStudyHandler() {
    $.ferrisWheelButton('getButton','file-text-o').on('click', async function(ev){
      makeReady()
      $.LoadingOverlay('show')
      if ($('.ytp-play-button').attr('aria-label') == 'Pausa') {
        $('.ytp-play-button').click()
      }

      let resp = await getSubtitle()

      if(!resp){
        $.LoadingOverlay('hide')
        return
      }

      resp = resp.data

      var data = clearSubtitle(resp);

      var words = Utils.nlpText(data);
      var video_id = findGetParameter(document.location.href, 'v');

      try {
        resp = await ThamusApi.getNlp(words, 'youtube', video_id)
      } catch (e) {
        $.LoadingOverlay('hide')
        iframe.createIframe('scripts/helpers/fragments/iframe_estourou.js')
        return
      }

      if ($('.ytp-play-button').attr('aria-label') == 'Reproduzir') {
        $('.ytp-play-button').click();
      }

      watchSubtitleChanges();
      createTranslatorHandlers(); 

      // fill the NLP
      resp.words.forEach(function(word) {
        NLP[word.word] = word;
      });

      findPhrasals();

      TOTAL = resp.total;
      UNIQUE = resp.unique;

      $.LoadingOverlay('hide')

      // FILL IN SAVED STUFF
      let isSaved = await Later.isSaved('youtube')

      if(isSaved.status) {
        let words = _.get(isSaved, 'words.data.content', [])
        words.map(async function (word) {
          HIGHLIGHTED_WORDS.push('.th-' + word)
          NLP[word].status = 'marked'
        })
      }
    })
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
      let user = await Auth.currentUser()

      await Later.buttonSave(null,
        NLP, 
        user.id,
        'https://www.youtube.com/watch?v=' + findGetParameter(document.location.href, 'v'),
        'youtube',
        document.title)
    });
  }

  function createFinishHandler() {
    $.ferrisWheelButton('getButton','check').on('click', async function(ev){

      let user = await Auth.currentUser()

      let location = 'https://www.youtube.com/watch?v=' + findGetParameter(document.location.href, 'v')
      await ThamusApi.buttonFinish(NLP, user.id, location)
    });
  }

  function isEnglish(t) {
    return (t.indexOf('Inglês') != -1 && t.indexOf('automaticamente') == -1) ||
      (t.indexOf('English') != -1 && t.indexOf('automatically') == -1)
  }

  function isPossible () {
    var status = false;

    $('.ytp-settings-button').click();

    $('.ytp-menuitem-label-count').click();
    $('.ytp-popup').css('display', 'none');

    var stop = false;

    $('.ytp-panel-menu').find('.ytp-menuitem-label').each(function () {
      if (this.innerText == 'Reprodução automática') {
        stop = true;
      };
    })

    $('.ytp-panel-menu').find('.ytp-menuitem-label').each(function () {
      if (isEnglish(this.innerText)) {
        var id = findGetParameter(document.location.href, 'v')
        if(this.innerText.indexOf('Reino Unido') != -1) YT_SUBTITLE['en-GB@' + id] = true;
        else YT_SUBTITLE['en@' + id] = true;
        status = true;
      };
    });

    $('.ytp-settings-button').click();
    return status;
  }

  function findGetParameter(url, parameterName) {
    var result = null,
    tmp = [];
    try {
      var items = url.split('?')[1].split('&');
      for (var index = 0; index < items.length; index++) {
        tmp = items[index].split('=');
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
      }
      return result;
    } catch (e) {
      return null;
    }
  }
})()