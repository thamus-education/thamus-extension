import $ from 'jquery'
import swal from 'sweetalert2'
import iframe from '../iframe'

$(function() { 
	swal({
      title: 'Podemos salvar esse texto?',
      text: 'Seu vocabulário será atualizado com as palavras desse texto.',
      type: 'info',
      showCancelButton: true,
      closeOnConfirm: false,
      confirmButtonColor: '#5cb85c',
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true })
    .then(function (file) {
      iframe.callIframe('save');
      var el = window.parent.document.getElementById('swalFrame');
      el.parentNode.removeChild(el);
    }, function (dismiss) {
      var el = window.parent.document.getElementById('swalFrame');
      el.parentNode.removeChild(el);
    });
});

