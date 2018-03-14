import axios from 'axios'
import Auth from './auth'
import swal from 'sweetalert2'
import $ from 'jquery'

module.exports = new(function ThamusApi() {
  return {
    calculateStats: calculateStats,
    calculate: calculate,
    getNlp: getNlp,
    buttonFinish: buttonFinish
  }

  function calculateStats (usable, discart) {
    var inc_unique = 1 / usable.unique;
    var novas = usable.unique - discart.length;
    var fq_total = 0;

    for(var i = discart.length -1; i >= 0 ; i--){
      for (var j = 0; j < usable.words.length; j++) {
        if (usable.words[j].word === discart[i] && usable.words[j].exists == null) {
          usable.words[j].exists = true;
          fq_total += parseFloat(usable.words[j].count) / usable.total;
          discart.splice(i, 1);
        }
      }
    }

    return [novas, usable.total, fq_total]
  }

  async function calculate(words, cb) {
    let user = await Auth.currentUser()

    let payload = {
      id: user.id,
      words: words.words
    }

    let headers = {
      'Authorization': 'Bearer ' + user.token
    }

    let resp = await axios.post('https://thamus.com.br/api/calculate', payload, headers)

    return calculateStats(words, resp.data)
  }

  function cleanWord(word) {
    return word.replace(/(\[|\]|\W\-|\-\W|^\-|\W$)/g, '').trim();
  }

  function contaPalavras(processed) {
    var contadas = {};
    var words = [];
    // conta-se as palavras
    for(var i = 0; i < processed.length; i++){
      if (processed[i].normal != "") {
        var name = cleanWord(processed[i].normal);
        if (contadas[name] == null) {
          words.push(name);
          contadas[name] = {'count' : 1, 'tag': processed[i].tag, 'word': name};
        } else {
          contadas[name] = {'count' : contadas[name]['count'] + 1, 'tag': processed[i].tag, 'word': name};
        };
      }
    }

    return { words: words, contadas: contadas };
  }

  function joinCounts (resp, contadas) {
    var num_total = 0;

    var resp = resp.map(function(obj) {
      if(contadas[obj.word]) {
        if(!obj.count) {
          obj.count = 0;
        };
        obj.count += contadas[obj.word].count;
        num_total += obj.count;
      } else {
        if(isNaN(obj.count)) {
          obj.count = 1;
        };
        num_total += obj.count;
      };
      return obj;
    })

    return {'words': resp, 'total': num_total, 'unique': resp.length}
  }

  async function getNlp(words, src, video_id, cb) {
    var contagem = contaPalavras(words)
    let token = await Auth.getToken()
    let user = await Auth.currentUser()
    let response = await axios({
      method: 'post',
      url: 'https://thamus.com.br/api/nlp',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      data: {
        'words': contagem.words,
        'src' : src,
        'id' : user.id,
        'url': video_id
      }
    })

    response = joinCounts(response.data, contagem.contadas)
    return response
  }


  async function addMultipleCards(cards, id, saved, cb) {
    let user = await Auth.currentUser()

    let payload = {
      id: user.id,
      cards: cards,
      saved: saved,
    }

    let headers = {
      'Authorization': 'Bearer ' + user.token
    }

    try {
      let resp = await axios.post('https://thamus.com.br/api/add_multiple_cards', payload, headers)
      return resp
    } catch (e) {
      return _.get(e, 'response', { data: { error: 'Houve um erro na sua requisição' } })
    }
  }

  function buttonFinish (cartoes, id, url) {
    swal({
      title: 'Podemos finalizar esse texto?',
      text: 'Seu vocabulário será atualizado com TODAS as palavras desse texto.',
      type: 'info',
      showCancelButton: true,
      confirmButtonColor: '#5cb85c',
      confirmButtonText: 'Finalizar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: async function() {
       let resp = await addMultipleCards(cartoes, id, url)
       if(resp.status == 200) {
          await swal({
            title: 'Pronto, vocabulário atualizado!',
            type: 'success',
            text: resp.data.message,
            allowOutsideClick: false,
          })
       } else {
          await swal({
            title: 'Houve um erro na sua requisição',
            type: 'error',
            text: resp.data.error,
            allowOutsideClick: false,
          })
       }
      }
    })
  }
})()