(function (chrome) {
    var emoji_map = {
      "anger": [":anger:", ":triumph:", ":angry:"],
      "disgust": [":mask:", ":face_with_rolling_eyes:"],
      "fear": [":fearful:", ":cold_sweat:", ":skull:"],
      "joy": [":grinning:", ":smile:", ":blush:"],
      "sadness": [":slightly_frowning_face:"],
      "analytical": [":thinking_face:", ":sleuth_or_spy:"],
      "confident": [":muscle:", ":sunglasses:"],
      "tentative": [":sweat_smile:", ":zipper_mouth_face:", ":no_mouth:"],
      "openness": [":hugging_face:", ":openness:"],
      "conscientiousness": [":sleuth_or_spy:"],
      "extraversion": [":v:", ":joy:", ":hugging_face:"],
      "agreeableness": [":+1:", ":fist:"],
      "emotional range": [":worried:", ":confounded:"],
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
          tone.category = category.category_name.split(' ')[0].toLowerCase();
          tone.tone_name = tone.tone_name.toLowerCase();
          delete tone.tone_id;
          return tone;
        });
      }).reduce(function(res, cur) {
        Array.prototype.push.apply(res, cur);
        return res;
      }).filter(function(tone) {
        console.log(tone.tone_name, tone.score);
        if (tone.category == 'social') {
          tone.score *= .72;
        }
        return +tone.score > .7;
      });
      console.log(data);
      if (!data.length) return;
      var r = Math.floor(Math.random() * data.length);
      console.log(r);
      var tone = emoji_map[data[r].tone_name];
      console.log(tone);
      var r2 = Math.floor(Math.random() * tone.length);
      textInput.value += (" " + tone[r2]);
    },
    function (e) {
        console.log(e);
    });

}(chrome));
