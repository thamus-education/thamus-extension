import Auth from './auth'
import $ from 'jquery'
import highlight from 'jquery-highlight'
import popover from 'webui-popover'
import axios from 'axios'
import Utils from './utils'

module.exports = new(function Translator() {
  Utils.injectStyle('styles/popover.css')
  Utils.injectStyle('styles/custom.css')

  return {
    clear_str: clear_str,
    clear_class_str: clear_class_str,
    createBox: createBox,
    redrawBox: redrawBox,
    extractWord: extractWord,
    createGeneralBox: createGeneralBox,
  }

  function clear_class_str (str) {
    return str.replace(/[\W]/g, '')
  }

  function clearSelection() {
    if(document.selection && document.selection.empty) {
      document.selection.empty()
    } else if(window.getSelection) {
      var sel = window.getSelection()
      sel.removeAllRanges()
    }
  }

  function extractWord (e) {
    String.prototype.regexIndexOf = function(regex, startpos) {
      var indexOf = this.substring(startpos || 0).search(regex);
      return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    }

    if (e != null && $(e.target).hasClass('phrasal')) {
      return $(e.target).text().toLowerCase();
    };
    var position = window.getSelection().anchorOffset;
    // var text = window.getSelection().anchorNode.cloneNode();
    if (window.getSelection().anchorNode == null) {
      return;
    }
    var tmp = window.getSelection().anchorNode.cloneNode().nodeValue;
    if(tmp == null) {
      return;
    }
    var str = '';
    // prevent shit from happening
    var i = 0;
    // for long articles
    while(i < 2000) {
    // cidado clicou na primeira palavra
      if (position <= tmp.regexIndexOf(/\s/g)) {
      str = tmp.slice(0, tmp.regexIndexOf(/\s/g));
      break;
      } else {
      if (tmp.indexOf(' ') == -1) {
        str = tmp;
        break;
      } else {
        position = position - tmp.regexIndexOf(/\s/g) - 1;
        tmp = tmp.slice(tmp.regexIndexOf(/\s/g) + 1);
        i += 1;
      };
      };
    };

    return str.toLowerCase();
  }

  function getCacheWord (word, cb) {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get(word, function (items) {
        resolve(items[word])
      })
    })
  };

  function cacheWord(word, data) {
    var storage = chrome.storage.local;
    var obj = {};
    obj[word] = data;
    chrome.storage.local.set(obj);
  }

  function clear_str (str) {
    return str.replace(/[^\w\d’'\-\s]+/g, '');
  }

  function clear_class_str (str) {
    return str.replace(/[\W]/g, '');
  }

  function generateHTML(data) {
    var html = '<ul class="list-group limited">';
    if (data == null) {
      return null;
    }
    for(var i = 0; i < data.length; i++){
      var translations = data[i].translation;
      if(translations != null && Object.keys(translations).length === 0) {
        continue;
      } else if(translations == null) {
        continue;
      }
      html += '<li class="list-group-item text-right trans-minor">' + data[i].source + '</li>';
      html += '<li class="list-group-item text-left">';
      // traducoes que nao sao de dicionarios
      if (Array.isArray(translations)) {
        for (var j = 0; j < translations.length; j++) {
          if(j == translations.length - 1) {
            html +=  translations[j].replace('_', ' ');
          } else {
            html +=  translations[j].replace('_', ' ') + ', ';
          }
          }
      } else {
        // traducoes de dicionarios
        var z = 0;
        var tamanho_obj = Object.keys(translations).length;
        for (var key in translations) {
          var tmp = translations[key];
          html += '<span class="pos-minor">' + key + ':</span> ';
          for (var k = 0; k < tmp.length; k++) {
            if(k == tmp.length - 1) {
              html +=  tmp[k];
            } else {
              html +=  tmp[k] + ', ';
            }
            
          }
          html += '</br>';
          z++;  
        }
      }
      
      html += '</li>';
    }
    html += '</ul>';
    return html;
  }

  async function getTranslation (word) {
    if(!word) {
      return
    }

    let user = await Auth.currentUser()

    let headers = {
      'Authorization': 'Bearer ' + user.token
    }

    let url = `https://translate.thamus.com.br/translate/${clear_str(word.toLowerCase())}`
    return axios.get(url, headers)
  }

  function generate_random_id () {
    var super_random = parseInt(Math.random() * 10000);
    return new Date().getUTCMilliseconds() * super_random;
  }

  async function createRandomIdBox(id, str, trans) {
    let user = await Auth.currentUser()

    if(trans) {
      $('#' + id).webuiPopover({
        placement: 'horizontal',
        title: clear_str(str),
        trigger:'sticky',
        padding: false,
        animation:'pop',
        closeable: true,
        content: generateHTML(trans),
        onHide: function ($element) {
          $('#' + id).webuiPopover('destroy')
          $('#' + id).webuiPopover({
            placement: 'horizontal',
            title: clear_str(str),
            trigger:'hover',
            padding: false,
            animation:'pop',
            content: generateHTML(trans),
            closeable: true
          })
        }
      })
      createManyBoxes(str, '.th-' + clear_str(str), trans);
    } else {
      // first time
      $('#' + id).webuiPopover({
        placement: 'horizontal',
        title: clear_str(str),
        trigger:'sticky',
        padding: false,
        animation:'pop',
        async: {
        type: 'GET',
        before: function (that, xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + user.token);
        },
        success: function (that, data) {
            cacheWord(str, data.trans);
            createManyBoxes(str, '.th-' + clear_str(str), data.trans);
          }
        },
        type:'async',
        url: 'https://translate.thamus.com.br/translate/' + clear_str(str.toLowerCase()),
        content: function(data){
          createManyBoxes(str, '.th-' + clear_str(str), data.trans);
            return generateHTML(data.trans);
        },
        closeable: true,
        onHide: async function ($element) {
          $('#' + id).webuiPopover('destroy')
          let translation = await getCacheWord(str)
          $('#' + id).webuiPopover({
            placement: 'horizontal',
            title: clear_str(str),
            trigger:'hover',
            padding: false,
            animation:'pop',
            content: generateHTML(translation),
            closeable: true
          })
        }
      });
    }
  }

  async function createGeneralBox (event, classe, color, str) {
    var element = color || 'thamus';
    var random_id = generate_random_id();

    clearSelection();
    $(classe).highlight(clear_str(str), { wordsOnly: true, element: element, className: 'th-' + clear_class_str(str)});
    if (event != null) {
      $(event.target).children('.th-' + clear_class_str(str)).attr('id', random_id);
      // checa para ver se ja possui uma traducao dessa palavra
      let trans = await getCacheWord(str)
      await createRandomIdBox(random_id, str, trans)
    } else {
      await redrawBox(str)
    }
  }

  async function createBox (event, classe, color, str, phrasal) {
    // highlight
    let user = await Auth.currentUser()
    if(str !== phrasal) {
      $('.th-' + phrasal).addClass('yt-high')
    } else {
      $('.th-' + str).addClass('yt-high')
    }

    let hold_translations = {};

    var result = $(event.target).webuiPopover({
      placement: 'horizontal',
      trigger:'sticky',
      closeable: true,
      animation:'pop',
      padding: false,
      title: str,
      async: {
        type: 'GET',
        before: function (that, xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + user.token)
        },
        success: function (that, data) {
          cacheWord(str, data.trans)
          let html = generateHTML(data.trans)
          $('.th-' + clear_str(str)).webuiPopover({
            title: clear_str(str),
            padding: false,
            trigger:'hover',
            animation:'pop',
            content: html,
            placement: 'horizontal',
            closeable: true
          })
          hold_translations[str] = html
        }
      },
      type:'async',
      url: 'https://translate.thamus.com.br/translate/' + clear_str(str.toLowerCase()),
      content: function(data){
          return generateHTML(data.trans)
      },
      onHide: function ($element) {
        $(event.target).webuiPopover('destroy')
        $(event.target).webuiPopover({
          placement: 'horizontal',
          title: clear_str(str),
          trigger:'hover',
          padding: false,
          animation:'pop',
          content: hold_translations[str],
          closeable: true
        })
      }          
    });
  }

  function createManyBoxes(word, classe, data) {
    $(classe).webuiPopover({
      placement: 'horizontal',
      title: clear_str(word),
      trigger:'hover',
      padding: false,
      animation:'pop',
      content: generateHTML(data),
      closeable: true
    })
  }

  async function redrawBox (str, phrasal) {
    // str -> get up
    // phrasal -> get@up
    // if the same, its not a phrasal
    let classe;
    if(str !== phrasal && phrasal != null) {
      $('.th-' + phrasal).addClass('yt-high')
      classe = phrasal
    } else {
      $('.th-' + clear_str(str)).addClass('yt-high')
      classe = clear_str(str)
    }
    
    // check cache
    let translation = await getCacheWord(str)
    if(translation){
      createManyBoxes(str, '.th-' + classe, translation)
    } else {
      let resp = await getTranslation()
      createManyBoxes(str, '.th-' + classe, resp.data)
    }
  }
})()