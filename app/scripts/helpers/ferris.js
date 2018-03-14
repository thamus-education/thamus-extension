require('../resources/ferris')
import $ from 'jquery'
import Utils from './utils'

module.exports = new(function Ferris() {
  return {
    commonFerris: commonFerris
  }

  function commonFerris() {
    Utils.injectStyle('styles/boundary-extra.css')
    createGeneralFerris();
    injectIframeHelper();
    injectSwal();
    var ferris = $('#thamusFerris'); // SEMPRE SERA ESSE ID - O QUE VARIA EH O HANDLER
    ferris.css('width', '100px').css('height', '100px');
  }

  function injectIframeHelper() {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('scripts/helpers/iframe.js');
    s.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
  }

  function injectSwal() {
    var s = document.createElement('div');
    s.id = 'thamusConnector';
    s.style.display = 'none';
    document.body.appendChild(s);
  }

  function createGeneralFerris () {
    let options = {
      'size': '60',
      'primaryIcon':'bars',
      'buttonColor': '#fff',
      'buttonBg': '#f39c12',
      'closeIcon': 'minus'
    };

    let icons = ['file-text-o','calculator','floppy-o','check'];
    $.ferrisWheelButton(options,icons);

    $('#ferrisWheelButton_menu').css('z-index', '9999');

    // create study hover helper
    if ($.ferrisWheelButton('getButton','file-text-o').length) {
      var study = $.ferrisWheelButton('getButton','file-text-o');
      study.css({'background-color':'#f39c12'});
      // study.webuiPopover({title:'Estudar texto', content:'',trigger:'hover', placement:'top'});
      study.children('i').attr('title', 'Clique para tornar o texto estudavel.');

      // create calculator hover helper
      var calculator = $.ferrisWheelButton('getButton','calculator');
      calculator.css({'background-color':'#6C7A89'});
      //calculator.webuiPopover({title:'Calcular estatisticas', content:'Clique para calcular as estatisticas.',trigger:'hover', placement:'top-left', width: '200'});
      calculator.children('i').attr('title', 'Clique para calcular as estatisticas.');

      // create save for later
      var save = $.ferrisWheelButton('getButton','floppy-o');
      save.css({'background-color':'#5bc0de'});
      //save.webuiPopover({title:'Salvar estudo', content:'Clique para salvar seu progresso no texto.',trigger:'hover', placement:'top-left', width: '200'});
      save.children('i').attr('title', 'Clique para salvar seu progresso no texto.');

      var finalize = $.ferrisWheelButton('getButton','check');
      finalize.css({'background-color':'#47a447'});
      //video.webuiPopover({title:'Carregar um video', content:'Clique para carregar um video do computador.',trigger:'hover', placement:'top-left', width: '200'});
      finalize.children('i').attr('title', 'Finalize o progresso do seu video.');
    }
  };
})()