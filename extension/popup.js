(function (chrome) {
  var js = document.createElement('script');
  js.type = 'text/javascript';
  // js.src = chrome.extension.getURL('inject.js');
  // document.getElementsByTagName('head')[0].appendChild(js);

    function makeRequest (data) {
      document.querySelector('#message-input') += 😀;
      return $.ajax({
        url: '//0.0.0.0:8080/tone', 
        type: 'POST', 
        contentType: 'application/json', 
        data: JSON.stringify({text: data}),
      }).promise();
    }

    function handler(data) {
      return Rx.Observable.fromPromise(makeRequest(data));
    }

    var textInput = document.querySelector('#message-input');
    console.log(textInput);
    var throttledInput = Rx.DOM.keyup(textInput)
      .pluck('target','value')
      .filter( function (text) {
        return text.length > 2;
      })
      .debounce(500)
      .distinctUntilChanged();
    var output = throttledInput.flatMapLatest(handler);

    output.subscribe(
    function (data) {
      console.log("DATA: ");
      console.log(data);
    },
    function (e) {
        console.log(e);
    });

}(chrome));