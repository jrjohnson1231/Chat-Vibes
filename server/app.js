var express = require('express');
var app = express();
var cors = require('cors');

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(cors());


var watson = require('watson-developer-cloud');

var tone_analyzer = watson.tone_analyzer({
  username: '4811b04b-3f32-40e9-920c-a2296672c885',
  password: 'QTKYnXzxwB1R',
  version: 'v3',
  version_date: '2016-05-19'
});


app.use(express.static(__dirname ))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.listen(8080);

app.post('/tone', function(req, res) {
  console.log(req.body);
  tone_analyzer.tone({ text: req.body.text },
    function(err, tone) {
      if (err)
        console.log(err);
      else
        var data = JSON.stringify(tone, null, 2);
        console.log(data)
        res.json(tone);
  });
})

app.get('/tone', function(req, res) {
  res.send('hello world')
})
