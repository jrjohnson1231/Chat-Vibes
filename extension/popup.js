(function (chrome) {
  function changeMood(mood) {
    document.getElementById('mood').textContent = mood;
  }
	chrome.runtime.onConnect.addListener(function(port) {
		console.assert(port.name == "knockknock");
		port.onMessage.addListener(function(msg) {
			if (msg.joke == "Knock knock") {
        changeMood('changed');
				port.postMessage({question: "Who's there?"});
			}
			else if (msg.answer == "Madame")
				port.postMessage({question: "Madame who?"});
			else if (msg.answer == "Madame... Bovary")
				port.postMessage({question: "I don't get it."});
		});
	});

}(chrome));