(function (chrome) {
    var emoji_map = {
      "anger": " :anger:",
      "disgust": "",
      "fear": "",
      "joy": "",
      "sadness": "",
      "analytical": "",
      "confident": "",
      "tenative": "",
      "openness": "",
      "conscientiousness": "",
      "extraversion": "",
      "agreeableness": "",
      "emotional Range": "",
    }
    function makeRequest (data) {
      return $.ajax({
        url: '//ndhacks2016.herokuapp.com/tone', 
        type: 'POST', 
        contentType: 'application/json', 
        data: JSON.stringify({text: data}),
      }).promise()
    }

    function handler(data) {
      return Rx.Observable.fromPromise(makeRequest(data));
    }

    var textInput = document.querySelector('#message-input');
    var throttledInput = Rx.DOM.keyup(textInput)
    .pluck('target','value')
    .filter( function (text) {
      return text.length > 2;
    })
    .debounce(500)
    .distinctUntilChanged();

    var output = throttledInput.flatMapLatest(handler)

    output.subscribe(
    function (data) {
      data = data.document_tone.tone_categories.map(function(category) {
        return category.tones.map(function(tone) {
          tone.category = category.category_name;
          delete tone.tone_id;
          return tone;
        });
      }).reduce(function(res, cur) {
        Array.prototype.push.apply(res, cur);
        return res;
      }).filter(function(tone) {
        return +tone.score > .8;
      });
      for (var i = 0; i < data.size; i++) {
        if (data[i].)
      }
      console.log(data);
    },
    function (e) {
        console.log(e);
    })

}(chrome));
