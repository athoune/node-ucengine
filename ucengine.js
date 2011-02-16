var http = require('http');

var Ucengine = function(conf) {
	this.host = conf.host;
	this.port = conf.port;
};

exports.Ucengine = Ucengine;

Ucengine.prototype.auth = function(login, password) {
	
};

Ucengine.prototype.time = function(cb) {
	var req = http.request({host: this.host, port: this.port, path: '/api/0.3/time', method: 'GET'}, function(res) {
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		var response = "";
		res.on('data', function (chunk) {
			response += chunk;
		});
		res.on('end', function() {
			cb(JSON.parse(response));
		});
	}).end();
};

Ucengine.prototype.user = function() {
	var req = http.request({host: this.host, port: this.port, path: '/user/', method: 'GET'}, function(res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		var response = "";
		res.on('data', function (chunk) {
			response += chunk;
		});
		res.on('end', function() {
			console.log(response);
		});
	}).end();
	
}