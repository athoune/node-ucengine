var http = require('http'),
	querystring = require('querystring')
	Meeting = require('./ucengine/meeting').Meeting,
	User = require('./ucengine/user').User;

var Ucengine = function(conf) {
	this.host = conf.host;
	this.port = conf.port;
};

exports.Ucengine = Ucengine;
exports.Meeting = Meeting;
exports.User = User;

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
	});
	if(body != null) {
		//[FIXME] if object => querystring.stringify, String, Buffer => raw
		req.write(querystring.stringify(body));
	}
	req.end();
	
};

Ucengine.prototype.time = function(cb) {
	this._request('GET', '/time', null, cb);
};

Ucengine.prototype.infos = function(cb) {
	this._request('GET', '/infos', null, cb);
};

Ucengine.prototype.meeting = function(cb) {
	var status;
	if(arguments.length == 1) {
		status = 'opened';
	} else {
		status = arguments[0];
		cb = arguments[1];
	}
	this._request('GET', '/meeting/' + status, null, cb);
};

Ucengine.prototype.create = function(something, cb) {
	something._create(this, cb);
};


