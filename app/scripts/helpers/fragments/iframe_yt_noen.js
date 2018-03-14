import $ from 'jquery'
import swal from 'sweetalert2'

$(function() { 
	swal(
		{title: 'Oops!!', text: 'Esse vídeo não possuí nenhuma legenda (CC) em inglês.', type: 'error'})
		.then(function (file) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		}, function (dismiss) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		});
});
