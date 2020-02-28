import Vue from 'vue';
import App from './popup/App.vue';

new Vue({
  el: '#app',
  data:{
    name:'popup-thamus-extension'
  },
  render: h =>h(App)
})