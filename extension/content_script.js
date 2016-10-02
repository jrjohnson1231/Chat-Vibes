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
    var popup_emoji = {
      "anger": "em em-anger",
      "disgust": "em em-unamused",
      "fear": "em em-fearful",
      "joy": "em em-blush",
      "sadness": "em em-cry",
      "analytical": "",
      "confident": "em em-muscle",
      "tentative": "em em-no_mouth",
      "openness": "em em-grinning"
    }
    var people = {};
    $(function()  {
      $('.message_content').each(function(index) {
        var sender = $(this).children('a.message_sender').attr('href').split('/').slice(-1)[0];
        var message = $(this).children('span.message_body').text().replace(/:[a-zA-Z0-9|+|_|-]+:/ig, '');

        if(!people[sender]) {
          people[sender] = message;
        } else {
          people[sender] += (' ' + message);
        }
      });

      for (let person in people) {
        makeRequest(people[person]).then(function(data) {
          data = handleData(data);
          // console.log(person, data);
        });
        //sendMessage({person})
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
        if (tone.category == 'social') {
          tone.score *= .72;
        }
        return +tone.score > .7 && tone.tone_name != 'emotional range';
      });
      if (!data.length) return;
      var r = Math.floor(Math.random() * data.length);
      var tone = emoji_map[data[r].tone_name];
      if (!tone) return;
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

// this tab should have a page-action
  chrome.runtime.sendMessage({
    from:    'content',
    subject: 'showPageAction'
  });

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    // First, validate the message's structure
    if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
      // Collect the necessary data 
      // (For your specific requirements `document.querySelectorAll(...)`
      //  should be equivalent to jquery's `$(...)`)
      var domInfo = {
        mood:   'em em-peach',
      };
      // Directly respond to the sender (popup), 
      // through the specified callback */
      response(domInfo);
    }
  });
}(chrome));
