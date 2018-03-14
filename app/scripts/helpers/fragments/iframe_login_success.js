import $ from 'jquery'
import swal from 'sweetalert2'

$(function() {
  swal(
    {title: 'OK!', text: 'Login efetuado com sucesso!', type: 'success'})
    .then(function (file) {
      var el = window.parent.document.getElementById('swalFrame');
      el.parentNode.removeChild(el);
    }, function (dismiss) {
      var el = window.parent.document.getElementById('swalFrame');
      el.parentNode.removeChild(el);
    });
});