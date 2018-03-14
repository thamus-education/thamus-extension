/// this deservs ALL the credit
// http://stackoverflow.com/questions/3596583/javascript-detect-an-ajax-event

var s_ajaxListener = new Object();
s_ajaxListener.tempOpen = XMLHttpRequest.prototype.open;
s_ajaxListener.tempSend = XMLHttpRequest.prototype.send;
s_ajaxListener.callback = function () {
  var url = this.url;
  if(url.indexOf("/?o=") !== -1 && url.indexOf("nflxvideo") !== -1) {
    console.log(url);
    var s = document.createElement('div');
    // TODO: add "script.js" to web_accessible_resources in manifest.json
    s.id = url;
    s.className = "netflixSubs";
    s.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
  };
}

XMLHttpRequest.prototype.open = function(a,b) {
  if (!a) var a='';
  if (!b) var b='';
  s_ajaxListener.tempOpen.apply(this, arguments);
  s_ajaxListener.method = a;  
  s_ajaxListener.url = b;
  if (a.toLowerCase() == 'get') {
    s_ajaxListener.data = b.split('?');
    s_ajaxListener.data = s_ajaxListener.data[1];
  }
}

XMLHttpRequest.prototype.send = function(a,b) {
  if (!a) var a='';
  if (!b) var b='';
  s_ajaxListener.tempSend.apply(this, arguments);
  if(s_ajaxListener.method.toLowerCase() == 'post')s_ajaxListener.data = a;
  s_ajaxListener.callback();
}