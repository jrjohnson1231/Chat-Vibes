// Update the relevant fields with the new data
function setDOMInfo(input) {
  var info = input.people;
  document.getElementById('my_mood').className = input.current_user;
  for (person in info) {
    var node = document.getElementById('moods');
    var str =  '<td>' + person + '</td><td class="' + 
                info[person].mood + '"></td>'
    var child = document.createElement('tr');
    child.innerHTML = str;
    node.appendChild(child);
  }

}

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {
  // ...query for the active tab...
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    // ...and send a request for the DOM info...
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        // ...also specifying a callback to be called 
        //    from the receiving end (content script)
        setDOMInfo);
  });
});