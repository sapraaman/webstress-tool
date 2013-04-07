WebStress tool
==============

##Install

```
npm install -g webstress-tool
```

##usage

```
	webstress GET http://www.test.com 
```
will fire 1 get request to test.com and print the result and the headers


```
	webstress GET http://www.test.com 10 5
```
will fire 5 GET requests every second for 10 seconds to test.com, printing the average time and total time per batch

#####Sending a payload

Using a file:
```
	webstress POST http://www.test.com 10 5 payload.txt
```
Using the payload api:
```
	// payload.js:
	
	var api = function() {
	  //do something...precalcie
	}
	api.prototype.body = function() {
	  //called every time data is required.
	  //can use the stream object if you want to.
	  return JSON.stringify({fonz: "Aaayyy!"});
	}
	
	module.exports = api;
```

```	
	webstress POST http://www.test.com 10 5 payload.js
```

will fire 5 GET requests every second for 10 seconds to test.com sending the content of payload.txt every request, 
printing the average time and total time per batch.
