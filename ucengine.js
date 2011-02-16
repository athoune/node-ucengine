var http = require('http'),
	querystring = require('querystring');

var Ucengine = function(conf) {
	this.host = conf.host;
	this.port = conf.port;
	this.sid = null;
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

Ucengine.prototype.presence = function(uid, credential, cb) {
	var uc = this;
	this.uid = uid;
	this._request('POST', '/presence/', {
		uid: uid,
		credential:credential,
		"metadata[nickname]": uid }, function(resp) {
			if(resp.result != undefined) {
				uc.sid = resp.result;
			}
			cb.apply(uc, [resp]);
		});
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

Ucengine.prototype.user = function(cb) {
	this._request('GET', '/user/?' +querystring.stringify({uid:this.uid, sid:this.sid}), null, cb);
};

var User = function() {
	this.uid = null;
	this.credential = null;
	if(arguments.length > 0) {
		this.uid = arguments[0];
	}
	if(arguments.length > 1) {
		this.credential = arguments[1];
	}
};

exports.User = User;

User.prototype.create = function(ucengine, cb) {
	var u = this;
	ucengine._request('POST', '/user/', {uid: this.uid, auth:'password', credential: this.credential}, function(resp) {
		cb.apply(ucengine, [resp, u]);
	});
};

Ucengine.prototype.create = function(something, cb) {
	something.create(this, cb);
};
