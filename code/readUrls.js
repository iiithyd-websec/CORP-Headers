var httpTrans=require('./httpTrans');
//httpTrans.httpGet(['http://www.microsoft.com', 'http://google.com', 'https://www.facebook.com']);

var fs = require('fs'),
    system = require('system');

if (system.args.length < 2) {
    console.log("Usage: readUrls.js urls.txt");
    phantom.exit(1);
}

var content = '',
    f = null,
    urls = null,
    eol = system.os.name == 'windows' ? "\r\n" : "\n";

try {
    f = fs.open(system.args[1], "r");
    content = f.read();
} catch (e) {
    console.log('Error opening file: ', e);
}

if (f) {
    f.close();
}

if (content) {
	urls = content.split(eol);
	httpTrans.httpGet(urls);
	/*for (var i = 0, len = lines.length; i < len; i++) {
		console.log(lines[i]);
	}*/
}