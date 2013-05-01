#!/usr/bin/env node
var async = require('async');
var http = require('http');
var urlParser = require('url');
var $u = require('util');
var fs = require('fs');

if (process.argv.length < 4) {
	console.log('usage: webstress <method> <url> <seconds> <requests per second> <optional payload filename>');
	process.exit(1);
	return;
}

var agent = new http.Agent({
        maxSockets: 10240
    });

http.globalAgent = agent;


var method = process.argv[2];
var target = urlParser.parse(process.argv[3]);
target.method = method;

var seconds = parseInt(process.argv[4] || 1)
var requestPerSecond = parseInt(process.argv[5]) || 1;
var payloadFilename = process.argv[6];

console.log('about to send %s %s requests to url %s over %s seconds', requestPerSecond * seconds, method.toUpperCase(), process.argv[3], seconds);

if (payloadFilename)
	console.log('using payload at %s', payloadFilename);

if (requestPerSecond > 10000) {
	console.log('cannot do more than 10k requests per second');
	process.exit(1);
	return;
}

var payload = fs.readFileSync(payloadFilename);

function sendRequest(callback) {
	var start;

	var request = http.request(target, function(response) {
		
		if (response.statusCode === 200) {			

			if (requestPerSecond === 1 && seconds === 1) {
				var data = '';
				
				response.setEncoding('utf8');

				response.on('data', function(chunk) {
					data += chunk;
				});

				response.on('end', function () {
					console.log(data);
					console.log($u.inspect(response.headers));					
				});
			} else {
				response.resume();
			}

	 		callback(null, Date.now() - start);		 	

		} else {
			callback(response.statusCode);
		}
	});

	request.on('socket', function () {		
		start = Date.now();
	});

	if (payload) {
		request.end(payload);
	} else {
		request.end();
	}
}

function sendRequestsPerSecond(howmany) {
	var work = [];
	for (var i = 0; i < howmany; i++) {
		work.push(sendRequest);
	}

	async.parallel(work, sendDone);
}

function sendDone (err, results) {
	if (err) {
		console.log($u.inspect(err));				
	} else if ($u.isArray(results) && results.length > 0 ) {
		var time = 0;

		for (var i = 0; i < results.length; i++) {
			time += results[i];
		}

		console.log("done, took total over: %s, avg response time: %s", time, time / results.length);
	} else {
		console.log('done');
	}		
	
}


if (requestPerSecond === 1 && seconds === 1) {
	sendRequest(sendDone)
} else {
	for (var i = 0 ; i < seconds; i++)
		setTimeout(sendRequestsPerSecond, i * 1000, requestPerSecond);
}

