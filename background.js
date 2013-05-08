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

	var suffix = "";

	if (parsedURL.search !== null && parsedURL.search.length > 0) {
		if (parsedURL.search.substr(0, '?repo='.length) == '?repo=') {
			suffix = '.' + parsedURL.search.substr('?repo='.length);
		}
	}

	if (elems.length >= 2) {
		if (parsedURL.hash === null || parsedURL.hash.length === 0) {
			pathname = '/p/' + elems[1] + suffix;
		} else {
			var pos;
			parsedURL.hash = parsedURL.hash.split('%2F').join('/');
			if ((pos = parsedURL.hash.indexOf('/')) !== -1) {
				var additional = parsedURL.hash.substring(pos);
				pathname = '/p/' + elems[1] + suffix + additional;
			} else {
				pathname = '/p/' + elems[1] + suffix;
			}
		}
	}

	return 'http://' + godocHostname + '/' + parsedURL.hostname + pathname;
}

function transformLaunchpadURL(parsedURL) {
	return 'http://' + godocHostname + '/' + parsedURL.hostname + parsedURL.pathname;
}

function transformGolangURL(parsedURL) {
	return 'http://' + godocHostname + '/' + parsedURL.pathname.substr(1).split('/').slice(1).join('/');
}

function transformGoDoc(parsedURL) {
	var elems = parsedURL.pathname.substring(1).split('/');
	switch (elems[0]) {
	case 'github.com':
		var githubURL = 'https://github.com/' + elems[1] + '/' + elems[2];
		if (elems.length > 3) {
			githubURL += '/tree/master/' + elems.slice(3).join('/');
		}
		return githubURL;
	case 'bitbucket.org':
		var bbURL = 'https://bitbucket.org/' + elems[2] + '/' + elems[2];
		if (elems.length > 3) {
			// in order to build the URL for a subpackage, we'd need to know a revision
			// number, which we can't guess. So we're out of luck. :-(
		}
		return bbURL;
	case 'code.google.com':
		var gcURL = 'https://code.google.com/p/';
		var repo = null;
		if (elems[2].indexOf('.') !== -1) {
			repo = elems[2].split('.');
			gcURL += repo[0];
		}
		if (elems.length > 3) {
			gcURL += '/source/browse/';
			if (repo !== null) {
				gcURL += '?repo=' + repo[1];
			}
			// this assumes that it's a mercurial repository. Unfortunately, this is
			// again something that we need to guess and can't derive from the URL.
			gcURL += '#hg%2F' + elems.slice(3).join('%2F');
		} else {
			if (repo !== null) {
				gcURL += '?repo=' + repo[1];
			}
		}
		return gcURL;
	case 'launchpad.net':
	default:
		return 'http:/' + parsedURL.pathname;
	}
}

function transformOthers(parsedURL) {
	return 'http://' + godocHostname + '/' + parsedURL.hostname + parsedURL.pathname;
}

var transformers = {
	'code.google.com': transformGoogleCodeURL,
	'github.com': transformGitHubURL,
	'www.github.com': transformGitHubURL,
	'bitbucket.org': transformBitBucketURL,
	'www.bitbucket.org': transformBitBucketURL,
	'launchpad.net': transformLaunchpadURL,
	'code.launchpad.net': transformLaunchpadURL,
	'golang.org': transformGolangURL,
	'godoc.org': transformGoDoc
};

var defaultHostnames = {
	'www.bitbucket.org': 'bitbucket.org',
	'code.launchpad.net': 'launchpad.net',
	'www.github.com': 'github.com',
	'tip.golang.org': 'golang.org'
};

chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.getSelected(null, function(tab) {
		var parsedURL = parseURL(tab.url);
		var transformFunc = transformers[parsedURL.hostname] || transformOthers;
		var hostname = defaultHostnames[parsedURL.hostname];
		if (hostname !== undefined) {
			parsedURL.hostname = hostname;
		}

		var newURL = transformFunc(parsedURL);
		chrome.tabs.create({ 'url': newURL });
	});
});
