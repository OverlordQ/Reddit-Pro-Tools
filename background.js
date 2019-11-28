chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({
        url: "popup.html"
    });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("Got Message! " + request.contentScriptQuery);
        if (request.contentScriptQuery == "queryAbout") {
            var url = "https://www.reddit.com/user/" + request.user.name + "/about.json";
            fetch(url)
                .then(response => response.json())
                .then(res => sendResponse({
                    'json': res,
                    'user': request.user
                }))
                .catch(error => console.log(error));
            return true; // Will respond asynchronously.
        } else if (request.contentScriptQuery == "queryComment") {
            var url = request.url;
            fetch(url)
                .then(response => response.json())
                .then(res => sendResponse({
                    'json': res,
                    'user': request.user,
                    'type': request.type
                }))
                .catch(error => console.log(error));
            return true;
        }
    });