import $ from 'jquery'
import swal from 'sweetalert2'

$(function() { 
	swal(
		{title: 'Oops!!', text: 'Você estourou seu limite mensal.', type: 'error'})
		.then(function (file) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		}, function (dismiss) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		});
});
