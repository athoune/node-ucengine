var http = require('http'),
	querystring = require('querystring');

var Ucengine = function(conf) {
	this.host = conf.host;
	this.port = conf.port;
};

exports.Ucengine = Ucengine;

Ucengine.prototype._request_opts = function(method, path) {
	//console.log('path: ', '/api/0.3' + path);
	return {
		host: this.host,
		port: this.port,
		path: '/api/0.3' + path,
		method: method};
};

Ucengine.prototype._request = function(method, path, body, cb) {
	var req = http.request(this._request_opts(method, path), function(res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		var response = "";
		res.on('data', function (chunk) {
			response += chunk;
		});
		res.on('end', function() {
			cb(JSON.parse(response));
		});
	});
	if(body != null) {
		//[FIXME] if object => querystring.stringify, String, Buffer => raw
		req.write(querystring.stringify(body));
	}
	req.end();
	
};

Ucengine.prototype.presence = function(uid, credential, cb) {
	this._request('POST', '/presence/', {uid: uid, credential:credential, "metadata[nickname]": uid }, cb);
};

Ucengine.prototype.time = function(cb) {
	this._request('GET', '/time', null, cb);
};

Ucengine.prototype.meeting = function(cb) {
	this._request('GET', '/meeting/opened', null, cb);
}

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