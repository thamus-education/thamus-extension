import $ from 'jquery'
import swal from 'sweetalert2'

$(function() { 
	swal(
		{title: 'Pronto!', text: 'Seu texto já está pronto para ser estudado. Quanto terminar, não se esqueça de salvá-lo para atualizarmos seu vocabulário!', type: 'success', timer:2500})
		.then(function (file) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		}, function (dismiss) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		});
});
