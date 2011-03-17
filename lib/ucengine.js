var http = require('http'),
	querystring = require('querystring'),
	Meeting = require('./ucengine/meeting').Meeting,
	User = require('./ucengine/user').User;

var Ucengine = function(conf) {
	this.host = conf.host;
	this.port = conf.port;
	this.users = {};
	this.logger = console;
};

exports.Ucengine = Ucengine;
exports.Meeting = Meeting;
exports.User = User;

Ucengine.prototype._request_opts = function(method, path) {
	//console.log('path: ', '/api/0.3' + path);
	return {
		host: this.host,
		port: this.port,
		path: '/api/0.4' + path,
		method: method};
};

Ucengine.prototype._request = function(method, path, body, cb) {
	var req = http.request(this._request_opts(method, path), function(res) {
	if([404, 403, 500].indexOf(res.statusCode) != -1 ) {
		throw new Error("HttpError : " + res.statusCode);
	}
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

/**
 * Server time
 */
Ucengine.prototype.time = function(cb) {
	this._request('GET', '/time', null, cb);
};

/**
 * Server infos
 */
Ucengine.prototype.infos = function(cb) {
	this._request('GET', '/infos', null, cb);
};

Ucengine.prototype.add = function(something, cb) {
	something._add(this, cb);
};

/**
 * The user is already registered
 */
Ucengine.prototype.attach = function(user, cb) {
	user.ucengine = this;
	this.users[user.uid] = user;
	user.presence(cb);
};

/**
 * Chained users add
 * logins : [user1, user2 ...]
 * cb     : function()
 */
Ucengine.prototype.attachAll = function(users, cb) {
	var uc = this;
	var oneMore = function(ls) {
		var user = ls.pop();
		uc.attach(user, function() {
			if(ls.length > 0) {
				oneMore(ls);
			} else {
				cb.call(uc);
			}
		});
	};
	oneMore(users);
};
