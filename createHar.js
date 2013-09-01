exports.resources = [];
exports.start=function(){
	console.log('Loaded createHar module!');
}

exports.loadStarted = function () {
	exports.startTime = new Date();
};

exports.resourceRequested = function (req) {
	exports.resources[req.id] = {
		request: req,
		startReply: null,
		endReply: null
	};
};

exports.resourceReceived = function (res) {
	if (res.stage === 'start') {
		exports.resources[res.id].startReply = res;
	}
	if (res.stage === 'end') {
		exports.resources[res.id].endReply = res;
	}
};
/*
exports.pageOpen=function(page.address, function (status) {
	var har, harp;
	if (status !== 'success') {
		console.log('FAIL to load the address');
		phantom.exit(1);
	} else {
		page.endTime = new Date();
		page.title = page.evaluate(function () {
			return document.title;
		});
		har = exports.createHAR(page.address, page.title, page.startTime, page.resources);
		harp='onInputData('+JSON.stringify(har, undefined, 4)+');';
		console.log(harp);
		phantom.exit();
	}
});
*/
exports.createHAR= function(address, title, startTime, resources)
{
    var entries = [];

    resources.forEach(function (resource) {
        var request = resource.request,
            startReply = resource.startReply,
            endReply = resource.endReply;

        if (!request || !startReply || !endReply) {
            return;
        }

        // Exclude Data URI from HAR file because
        // they aren't included in specification
        if (request.url.match(/(^data:image\/.*)/i)) {
            return;
	}

        entries.push({
            startedDateTime: request.time.toISOString(),
            time: endReply.time - request.time,
            request: {
                method: request.method,
                url: request.url,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: request.headers,
                queryString: [],
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: endReply.status,
                statusText: endReply.statusText,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: endReply.headers,
                redirectURL: "",
                headersSize: -1,
                bodySize: startReply.bodySize,
                content: {
                    size: startReply.bodySize,
                    mimeType: endReply.contentType
                }
            },
            cache: {},
            timings: {
                blocked: 0,
                dns: -1,
                connect: -1,
                send: 0,
                wait: startReply.time - request.time,
                receive: endReply.time - startReply.time,
                ssl: -1
            },
            pageref: address
        });
    });

    return {
        log: {
            version: '1.2',
            creator: {
                name: "PhantomJS",
                version: phantom.version.major + '.' + phantom.version.minor +
                    '.' + phantom.version.patch
            },
            pages: [{
                startedDateTime: startTime.toISOString(),
                id: address,
                title: title,
                pageTimings: {
                    onLoad: page.endTime - page.startTime
                }
            }],
            entries: entries
        }
    };
}