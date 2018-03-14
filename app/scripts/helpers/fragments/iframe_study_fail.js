import $ from 'jquery'
import swal from 'sweetalert2'

$(function() { 
	swal(
		{title: 'ERRO!', text: 'Nossos operários não encontraram nenhum texto nessa página, e eles sentem muito por isso.', type: 'error'})
		.then(function (file) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		}, function (dismiss) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		});
});
