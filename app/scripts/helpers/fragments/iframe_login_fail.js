import $ from 'jquery'
import swal from 'sweetalert2'

$(function() { 
	swal(
		{title: 'Oops!!', text: 'Parece que alguma coisa deu errado. Tente novamente.', type: 'error'})
		.then(function (file) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		}, function (dismiss) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		});
});
