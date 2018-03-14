import $ from 'jquery'
import swal from 'sweetalert2'

$(function() {
	var stats = JSON.parse(window.parent.document.getElementById('thamusStats').innerText);
	
	var html = 'Palavras novas ' + stats[0] + ' ' + stats[1];

	html = '<div>' +
			  '<table class="table table-striped text-center">' +
			    '<tbody>'+
			      '<tr>'+
			        '<th>Palavras Novas</th>'+
			        '<td>'+ stats[0] +'</td>' +
			      '</tr>' +
			      '<tr>'+
			        '<th>Numero de palavras</th>' +
			        '<td>'+ stats[1] +'</td>' +
			      '</tr>'+
			      '<tr>'+
			        '<th>Porcentagem conhecida</th>' +
			        '<td>'+ (stats[2] * 100).toFixed(2) +'%</td>' +
			      '</tr>'+
			    '</tbody>'+
			  '</table>'+
			'</div>'

	swal({type: 'info', html: html})
		.then(function (file) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		}, function (dismiss) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		});
});

