import $ from 'jquery'
import swal from 'sweetalert2'
import iframe from '../iframe'

$(function() { 
	swal(
		{title: 'Selecione um PDF:', input: 'file'})
		.then(function (file) {
			iframe.callIframe('pdf', file);
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		}, function (dismiss) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		});
});

