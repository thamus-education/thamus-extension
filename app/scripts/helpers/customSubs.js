  const hold = document.createElement;
  if(document.createElement) {
    document.createElement = function(evt) {
      var ele = hold.apply(this, arguments);
      if(arguments[0] == 'INPUT') {
        $.get('https://ipv4-c001-cgh001-claro-br-net-isp.1.oca.nflxvideo.net/?o=AQHFlSUHejWE291drA4Dzqij-2UZF5cUyasIlGdPXC_ABmfmCxIIx26lqgN8MbUmRRWkb4gj-FgjMJj-MQhr8XjmbkEnjpaAz-tfGzwDx6HEbH0UL5BG2073SwmkzzHWsthGhA6rDFbyAYSuDPV3uRofTLK7KFurpHsqz4NRNnjK3JJ4yTRY26_woMRTvAPOOp3JxIS_nzE&v=3&e=1519617612&t=CrBjJDAXNoxr46f_2TgHp8IPdx4')
          .then(a => {
            var oMyBlob = new Blob([a])
            var file = new File([oMyBlob], "Gooo")

            Object.defineProperty(ele, "files", {
              get: function () { return [file] } 
            });

            ele.dispatchEvent(new Event('change'))
          })

        //ele.click = function () {}
      }

      return ele;
    }
  }

      function makeAction(keyCode) {
        let element = document['createEvent']('KeyboardEvent');
        Object['defineProperty'](element, 'keyCode', {
            get: function() {
                return this['keyCodeVal']
            }
        });
        Object['defineProperty'](element, 'which', {
            get: function() {
                return this['keyCodeVal']
            }
        });
        element['initKeyboardEvent']('keydown', true, true, document['defaultView'], false, true, true, true, keyCode, keyCode)
        element['keyCodeVal'] = keyCode;
        document['activeElement']['dispatchEvent'](element)
    }

    makeAction(84)