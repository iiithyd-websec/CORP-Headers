var har=require('./createHar.js');
var page = require('webpage').create();
var fs = require('fs');

if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
        function pad(n) { return n < 10 ? '0' + n : n; }
        function ms(n) { return n < 10 ? '00'+ n : n < 100 ? '0' + n : n }
        return this.getFullYear() + '-' +
            pad(this.getMonth() + 1) + '-' +
            pad(this.getDate()) + 'T' +
            pad(this.getHours()) + ':' +
            pad(this.getMinutes()) + ':' +
            pad(this.getSeconds()) + '.' +
            ms(this.getMilliseconds()) + 'Z';
    }
}

exports.httpGet = function(urlArray){
	var i=0;
	var len=urlArray.length;
	
	writeHarToFile(0);
	
	function writeHarToFile(i){
		if(i===len) {
			phantom.exit();
		};
		
		page.address = 'http://www.'+urlArray[i];
		page.resources = [];

		page.onLoadStarted = function () {
			page.startTime = new Date();
			console.log('Working on '+ page.address);
		};

		page.onResourceRequested = function (req) {
			page.resources[req.id] = {
				request: req,
				startReply: null,
				endReply: null
			};
		};

		page.onResourceReceived = function (res) {
			if (res.stage === 'start') {
				page.resources[res.id].startReply = res;
			}
			if (res.stage === 'end') {
				page.resources[res.id].endReply = res;
			}
		};

		page.open(page.address, function (status) {
			var harData, harDataJsonString;
			if (status !== 'success') {
				console.log('FAIL to load the address');
				//phantom.exit(1);
			} else {
				page.endTime = new Date();
				page.title = page.evaluate(function () {
					return document.title;
				});
				harData = har.createHAR(page.address, page.title, page.startTime, page.endTime, page.resources);
				harDataJsonString='onInputData('+JSON.stringify(harData, undefined, 4)+');';
				//console.log(harDataJsonString);
				
				var filename='phantom-har-data/'+page.address.split('//')[1].split('/')[0]+'.har';
				try {
					fs.write(filename,harDataJsonString,'w');
				} catch (e) {
					console.log('\n*** File write exception in httpTrans.js ***\n', e);
				}
				i=i+1;
				setTimeout(writeHarToFile(i), 500);
			}
		});	
	}
}