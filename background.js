var godocPrefix = 'http://godoc.org';

chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.getSelected(null, function(tab) {
		var newUrl;
		if (tab.url.substring(0, godocPrefix.length + 1) == godocPrefix + '/') {
			newUrl = 'http://' + tab.url.substr(godocPrefix.length + 1, tab.url.length - godocPrefix.length - 1);
		} else {
			var slashPos = tab.url.indexOf('/');
			newUrl = 'http://godoc.org' + tab.url.substr(slashPos + 1, tab.url.length - slashPos - 1);
		}
		chrome.tabs.create({ 'url': newUrl });
	});
});
