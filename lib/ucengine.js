var http = require('http'),
	querystring = require('querystring'),
	Meeting = require('./ucengine/meeting').Meeting,
	User = require('./ucengine/user').User;

var Ucengine = function(conf) {
	this.host = conf.host;
	this.port = conf.port;
	this.users = {};
	this.logger = console;
	this.stats = {
		events: {},
		addOne: function(key) {
			if(this.events[key] == null) {
				this.events[key] = 0;
			}
			this.events[key] += 1;
		}
	};
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
Ucengine.prototype.attachAll = function(userz, cb) {
	var users = userz.slice(0);
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
