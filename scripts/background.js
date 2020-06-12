// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});

// Listen for GET and POST requests
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {    
  if (request.contentScriptQuery == "getData") {
      var url = request.url;
      fetch(url)
          .then(response => response.json())
          .then(response => sendResponse(response))
          .catch()
      return true;
  };
  // if (request.contentScriptQuery == "postData") {
  //     fetch(request.url, {
  //         method: 'POST',
  //         headers: {
  //             'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
  //             'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
  //         },
  //         body: 'result=' + request.data
  //     })
  //         .then(response => response.json())
  //         .then(response => sendResponse(response))
  //         .catch(error => console.log('Error:', error));
  //     return true;
  // }
});