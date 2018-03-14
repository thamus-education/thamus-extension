import _ from 'lodash'
import Auth from './auth'
import axios from 'axios'
import swal from 'sweetalert2'
import Utils from './utils'
import Alert from './alert'

module.exports = new(function Later() {
  Utils.injectStyle('styles/sweetalert2.min.css')
  Utils.injectStyle('styles/custom.css')

  return {
    save: save,
    buttonSave: buttonSave,
    isSaved: isSaved
  }

  async function save(id, url, type, title, content, processed) {  
    let user = await Auth.currentUser()

    let payload = { id, url, type, title, content, processed }

    let headers = {
      'Authorization': 'Bearer ' + user.token
    }

    try {
      let resp = await axios.post('https://thamus.com.br/api/save_later', payload, headers)
      return resp
    } catch (e){
      return _.get(e, 'response', { data: { error: 'Houve um erro na sua requisição' } })
    }
  }

  function buttonSave (cartoes, nlp, id, url, type, title) {
    swal({
      title: 'Salvar para mais tarde?',
      text: 'Salvaremos seu progresso nesse texto para que você possa retomá-lo mais tarde.',
      type: 'info',
      showCancelButton: true,
      closeOnConfirm: false,
      confirmButtonColor: '#5cb85c',
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: async function() {
        var content = [];
        for (let key in nlp) {
          if(nlp[key].status == 'marked') {
            content.push(key);
          }
        }
        // for PDF case
        if (type == 'pdf' && PDFid == null) {
          return;
        } else if (type == 'text' || type == 'youtube') {
          // in case of text nlp is null
          nlp = null;
        }
        // checa se pode salvar
        let saved = await save(id, url, type, title, content, nlp)

        if(saved.status == 200) {
          await Alert.createSimpleSwal ('success', 'Pronto!', saved.data.message)
        } else {
          await Alert.createSimpleSwal ('error', 'Erro', saved.data.error)
        }
      }
    })
  }



  async function isSaved(type) {
    let isSaved = await getSavedInfo(type)

    if(isSaved.status == 200 && Object.keys(isSaved.data).length !== 0){
      return { status: true, words: isSaved.data }
    }

    return { status: false, words: [] }
  }

  function findUrl(type) {
    let url

    if(type === 'youtube') {
      url = 'https://www.youtube.com/watch?v=' + findGetParameter(document.location.href, 'v')
    } 
    else if(type === 'text') {
      url = document.location.href
    } 
    else if (type === 'netflix') {
      url = document.location.href
        .replace('watch/', '@TROQUE@')
        .split('@TROQUE@')[1]
        .split('?')[0]
    }

    return url
  }

  async function getSavedInfo (type) {
    let url = findUrl(type)
    
    if(!url) {
      return
    }

    let user = await Auth.currentUser()

    let payload = { id: user.id, url }

    let headers = {
      'Authorization': 'Bearer ' + user.token
    }

    try {
      let resp = await axios.post('https://thamus.com.br/api/get_later', payload, headers)
      return resp
    } catch (e) {
      return _.get(e, 'response', { data: { error: 'Houve um erro na sua requisição' } })
    }
  }

  // from stackoverflow
  function findGetParameter(url, parameterName) {
    let result = null
    let tmp = []
    var items = url.split('?')[1].split('&')
    for (var index = 0; index < items.length; index++) {
      tmp = items[index].split('=')
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1])
    }
    return result
  }
})