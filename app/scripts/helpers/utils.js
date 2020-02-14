import $ from 'jquery'
import compromise from 'compromise'

var forbidden = [
  'thamus.com.br',
  'google.com',
  'google.com.br',
  'facebook.com',
  'youtube.com',
  //'uol.com.br',
  //'globo.com',
  'live.com',
  'mercadolivre.com',
  'br.yahoo.com',
  'olx.com.br',
  'pt.wikipedia.org',
  'olx.com.br',
  'netflix.com',
  'instagram.com',
  'popads.net',
  'caixa.gov.br',
  'americanas.com.br',
  'fatosdesconhecidos.com.br',
  'adf.ly',
  'curapelanatureza.com.br',
  'whatsapp.com',
  'abril.com.br',
  'pt.aliexpress.com',
  'correios.com.br',
  'metropoles.com',
  'bet365.com',
  'xvideos.com',
  'twitter.com',
  'googleweblight.com',
  'itau.com.br',
  'sp.gov.br',
  'bol.uol.com.br',
  'tumblr.com',
  'folha.uol.com.br',
  'br.pinterest.com',
  'submarino.com.br',
  'ig.com.br',
  'terra.com.br',
  //'vagalume.com.br',
  'fazenda.gov.br',
  'bb.com.br',
  'santandernet.com.br',
  'pornhub.com',
  'vivo.com.br',
  'bradesco.com.br',
  //'letras.mus.br',
  'netshoes.com.br',
  'techtudo.com.br',
  'esporte.uol.com.br',
  'xhamster.com',
  'linkedin.com',
  '4shared.com',
  'zlx.com.br',
  'casasbahia.com.br',
  'reclameaqui.com.br',
  'portalinteressante.com',
  'askcom.me',
  'microsoft.com',
  'baixaki.com.br',
  'tecmundo.com.br',
  'mediafire.com',
  'hao123.com',
  'txxx.com',
  'comandofilmes.net',
  'buscape.com.br',
  'walmart.com.br',
  'thepiratebay.org',
  'esporte.uol.com.br',
  'torrentdosfilmes.com',
  'noticias.uol.com.br',
  'superanimes.com',
  'adorocinema.com',
  'magazineluiza.com.br',
  'clickjogos.com.br',
  'extra.com.br',
  'mg.gov.br',
  'twitch.tv',
  'bing.com',
  'cifraclub.com.br',
  'amazon.com',
  'amazon.com.br',
  'pt.savefrom.net',
  'xpg.uol.com.br',
  'imgur.com',
  'kabum.com.br',
  'steampowered.com',
  'filmesonlinehd11.cc',
  'saraiva.com.br',
  'oi.com.br',
  'r7.com',
  'campograndenews.com.br',
  'netvasco.com.br',
  'santander.com.br',
  'apple.com',
  'shoptime.com.br',
  'clicrbs.com.br',
  'pagseguro.com.br',
  'jusbrasil.com.br',
  'mulheresgostosas.org',
  'toptestes.com',
  'estadao.com.br',
  'vagas.com.br',
  'pontofrio.com.br',
  'ouo.io',
  'thepiratefilmes.com',
  'filmeseseriesonline.net',
  'pr.gov.br',
  'acesso.uol.com.br',
  'bmail.uol.com.br',
  'br.leagueoflegends.com',
  'booking.com',
  'dropbox.com',
  'megafilmesonline.net',
  'dafiti.com.br',
  'roblox.com',
  'gearbest.com',
  'doubleclickbygoogle.com',
  'ebay.com',
  'pciconcursos.com.br',
  'zoom.com.br',
  'ricardoeletro.com.br',
  'filmesonlinex.net',
  'cameraprive.com',
  'ero-advertising.com',
  'espn.uol.com.br',
  'ask.com',
  'freepik.com',
  'upornia.com',
  'nametests.com',
  'hilltopads.net',
  'doutissima.com.br',
  'office.com',
  'ce.gov.br',
  'erq.io',
  'tudogostoso.com.br',
  'vk.com',
  'animeai.net',
  'fvpimageviewer.com',
  'tvefamosos.uol.com.br',
  'redtube.com',
  'videodownloadconverter.com',
  'vimeo.com',
  'spotify.com',
  'mec.gov.br',
  'cloudify.cc',
  'fbcdn.net',
  'rj.gov.br',
  'palcomp3.com',
  'tripadvisor.com.br',
  'batepapo.uol.com.br',
  'dailymotion.com',
  'wonderlandads.com',
  'catracalivre.com.br',
  'poki.com.br',
  'tudocelular.com'
]

module.exports = new(function Utils () {
  function isFerrisRequested (key) {
    return new Promise (function (resolve, reject) {
      chrome.storage.local.get('thamus-settings-' + key, function (items) {
        if (items['thamus-settings-' + key] === undefined) {
          resolve(false);
        } else {
          resolve(items['thamus-settings-' + key]);
        }
      })
    })
  }

  const injectStyle = function(link) {
    let s = document.createElement("link")
    s.href = chrome.extension.getURL(link)
    s.type = "text/css"
    s.rel = "stylesheet"
    document.head.appendChild(s) 
  }

  const injectScript = function(link) {
    let s = document.createElement("script")
    s.src = chrome.extension.getURL(link)
    document.head.appendChild(s) 
  }

  const injectStringScript = function (script) {
    let s = document.createElement("script")
    s.type = 'text/javascript';
    s.innerHTML = script
    document.head.appendChild(s) 
  }

  return {
    isFerrisRequested: isFerrisRequested,
    isNotForbidden: isNotForbidden,
    cleanLinks: cleanLinks,
    nlpText: nlpText,
    injectStyle: injectStyle,
    injectScript: injectScript,
    injectStringScript
  }

  function cleanLinks (classe) {
    var main_class = classe || 'mainArticle';
    $('.' + main_class).find('a').each(function(){
      // caso seja uma imagem
      if ($(this).children('img').length > 0) {
        $(this).attr('target', '_blank');
        return;
      }
      var el = $(this);
      var link = el.attr('href');
      el.removeAttr('href');
      el.replaceWith('<span style="text-decoration: underline;">' + el.text() + '</span> <a href="' + link + '" target="_blank" style="cursor: pointer">(link)</a>');
    });
  }

  function extractDomain(data) {
    var    a      = document.createElement('a');
           a.href = data;
    return a.hostname.replace('www.', '');
  }

  function isNotForbidden(url) {
    return !forbidden.includes(extractDomain(url));
  }

  /*
    NATURAL LANGUAGE PROCESSING
  */

  function nlpText (text) {
    return compromise(text).sentences().reduce((processed, sentence) => {
      // iterate every word in sentence
      sentence.terms().data().forEach(term => {
        // push word to processed
        processed.push({
          normal : term.normal,
          tag    : term.bestTag
        })
      })

      return processed
    }, [])
  }
})()

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        // c. Increase k by 1.
        // NOTE: === provides the correct "SameValueZero" comparison needed here.
        if (o[k] === searchElement) {
          return true;
        }
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}

// FOR PHRASAL VERBS

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function createAsciiHash(start, count) {
  return Array.apply(0, Array(count))
    .map(function (element, index) { 
      return String.fromCharCode(index + start);  
  });
}

var ASCII_LENGTH = 14;

// generate strange characters
var ASCII = createAsciiHash(33, ASCII_LENGTH);
ASCII = ASCII.filter(function (item) {
  return item != '.' || item != '!';
});