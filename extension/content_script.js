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
      "openness": [":hugging_face:"],
      "conscientiousness": [":sleuth_or_spy:"],
      "extraversion": [":v:", ":hugging_face:"],
      "agreeableness": [":+1:", ":fist:", ":hearts:"]
    }
    var people = {};
    $(function()  {
      $('.message_content').each(function(index) {
        var sender = $(this).children('a.message_sender').attr('href').split('/').slice(-1)[0];
        var message = $(this).children('span.message_body').text().replace(/:[a-zA-Z0-9|+|_|-]+:/ig, '');
        console.log(sender, message);

        if(!people[sender]) {
          people[sender] = message;
        } else {
          people[sender] += (' ' + message);
        }
      });

      for (let person in people) {
        makeRequest(people[person]).then(function(data) {
          data = handleData(data);
          console.log(person, data);
        });
      }
    })
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
        return +tone.score > .7 && tone.tone_name != 'emotional range';
      });
      console.log(data);
      if (!data.length) return;
      var r = Math.floor(Math.random() * data.length);
      console.log(r);
      var tone = emoji_map[data[r].tone_name];
      if (!tone) return;
      console.log(tone);
      var r2 = Math.floor(Math.random() * tone.length);

      
      textInput.value += (" " + tone[r2]);
    },
    function (e) {
        console.log(e);
    });

    function handleData(data) {
      return data.document_tone.tone_categories.map(function(category) {
        return category.tones.map(function(tone) {
          tone.category = category.category_name.split(' ')[0].toLowerCase();
          tone.tone_name = tone.tone_name.toLowerCase();
          delete tone.tone_id;
          return tone;
        });
      }).reduce(function(res, cur) {
        Array.prototype.push.apply(res, cur);
        return res;
      });
    }

    var port = chrome.runtime.connect({name: "knockknock"});
    port.postMessage({joke: "Knock knock"});
    port.onMessage.addListener(function(msg) {
      if (msg.question == "Who's there?")
        port.postMessage({answer: "Madame"});
      else if (msg.question == "Madame who?")
        port.postMessage({answer: "Madame... Bovary"});
      console.log(msg.question);
    });

}(chrome));
