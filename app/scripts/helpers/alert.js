import Utils from './utils'
import swal from 'sweetalert2'

module.exports = new(function Alert() {
  Utils.injectStyle('styles/sweetalert2.min.css')
  Utils.injectStyle('styles/custom.css')

  return {
    createSimpleSwal: createSimpleSwal,
  }

  function createSimpleSwal (type, title, message) {
    return swal({
      title: title,
      type: type,
      text: message,
      allowOutsideClick: false,
    })
    .then(function() {
      
    })
    .catch(function() {

    })
  }
})