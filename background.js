var godocHostname = 'godoc.org';

function parseURL(url) {
	var parser = document.createElement('a');
	parser.href = url;
	return parser;
}

function transformGitHubURL(parsedURL) {
	var pathname = parsedURL.pathname;
	var pos;
	if ((pos = pathname.indexOf('/tree/master/')) !== -1) {
		pathname = pathname.substring(0, pos) + '/' + pathname.substring(pos + '/tree/master/'.length);
	} else if ((pos = pathname.indexOf('/blob/master/')) !== -1) {
		pathname = pathname.substring(0, pos) + '/' + pathname.substring(pos + '/blob/master/'.length, pathname.lastIndexOf('/'));
	}
	return 'http://' + godocHostname + '/' + parsedURL.hostname + pathname;
}

function transformBitBucketURL(parsedURL) {
	var pathname = parsedURL.pathname;
	var pos;
	if (pathname.substring(pathname.length - 4) == '/src') {
		pathname = pathname.substr(0, pathname.length - 4);
	} else if ((pos = pathname.indexOf('/src/')) !== -1) {
		var nextSlash = pathname.substr(pos + '/src/'.length).indexOf('/');
		if (nextSlash == -1) {
			nextSlash = pathname.substr(pos + '/src/'.length).length;
		}
		pathname = pathname.substr(0, pos) + pathname.substr(pos + '/src/'.length + nextSlash);
	}
	return 'http://' + godocHostname + '/' + parsedURL.hostname + pathname;
}

chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.getSelected(null, function(tab) {
		var newURL;
		var parsedURL = parseURL(tab.url);
		if (parsedURL.hostname == godocHostname) {
			newURL = 'http:/' + parsedURL.pathname;
		} else {
			if (parsedURL.hostname == 'github.com' || parsedURL.hostname == 'www.github.com') {
				newURL = transformGitHubURL(parsedURL)
			} else if (parsedURL.hostname == 'bitbucket.org' || parsedURL.hostname == 'wwww.bitbucket.org') {
				newURL = transformBitBucketURL(parsedURL);
			} else {
				newURL = 'http://' + godocHostname + '/' + parsedURL.hostname + parsedURL.pathname;
			}
		}
		chrome.tabs.create({ 'url': newURL });
	});
});
