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

function transformGoogleCodeURL(parsedURL) {
	var pathname = parsedURL.pathname;

	var elems = pathname.substring(1).split('/');

	if (elems.length >= 2) {
		if (parsedURL.hash == null || parsedURL.hash.length == 0) {
			pathname = '/p/' + elems[1];
		} else {
			var pos;
			parsedURL.hash = parsedURL.hash.split('%2F').join('/');
			if ((pos = parsedURL.hash.indexOf('/')) !== -1) {
				var additional = parsedURL.hash.substring(pos);
				pathname = '/p/' + elems[1] + additional;
			} else {
				pathname = '/p/' + elems[1];
			}
		}
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
			} else if (parsedURL.hostname == 'code.google.com') {
				newURL = transformGoogleCodeURL(parsedURL);
			} else {
				newURL = 'http://' + godocHostname + '/' + parsedURL.hostname + parsedURL.pathname;
			}
		}
		chrome.tabs.create({ 'url': newURL });
	});
});
