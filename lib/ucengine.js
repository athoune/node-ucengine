var http = require('http'),
	sys = require('sys'),
	querystring = require('querystring'),
	Stats = require('./ucengine/stats').Stats,
	Meeting = require('./ucengine/meeting').Meeting,
	User = require('./ucengine/user').User;

var Ucengine = function(conf) {
	this.host = conf.host;
	this.port = conf.port;
	this.timeout = 30;
	this.users = {};
	this.logger = console;
	this.stats = {
		events: new Stats(),
		http: new Stats()
	};
};

exports.Ucengine = Ucengine;
exports.Meeting = Meeting;
exports.User = User;

UCError = function(msg) {
	this.message = msg;
};
sys.inherits(UCError, Error);
exports.UCError = UCError;

Ucengine.prototype._request_opts = function(method, path) {
	//console.log('path: ', '/api/0.3' + path);
	return {
		host: this.host,
		port: this.port,
		path: '/api/0.4' + path,
		method: method};
};

Ucengine.prototype._request = function(method, path, body, cb) {
	var u = this;
	var req = http.request(this._request_opts(method, path), function(res) {
		var err = null;
		u.stats.http.addOne(method);
		var watchdog = setTimeout(function() {
			req.abort();
			u.stats.http.addOne('timeout');
			u._request(method, path, body, cb);
		}, u.timeout * 1000);
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		var response = "";
		res.on('data', function (chunk) {
			response += chunk;
		});
		res.on('end', function() {
			clearTimeout(watchdog);
			var resp = JSON.parse(response);
			if([401, 404, 403, 500].indexOf(res.statusCode) != -1) {
				u.stats.http.addOne('error');
				u.logger.error("HttpError " + res.statusCode + " [" + resp.error + "] " + path);
				err = new UCError(resp.error);
			}
			cb.call(u, err, resp);
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
