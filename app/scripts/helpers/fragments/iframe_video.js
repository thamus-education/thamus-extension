import $ from 'jquery'
import swal from 'sweetalert2'
import iframe from '../iframe'

$(function() { 
	swal(
		{title: 'Selecione um video:', input: 'file', inputAttributes: {
	    accept: '.mp4,.mkv,.avi'
	  }})
		.then(function (file) {
			iframe.callIframe('video', file);
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		}, function (dismiss) {
			var el = window.parent.document.getElementById('swalFrame');
			el.parentNode.removeChild(el);
		});
});

