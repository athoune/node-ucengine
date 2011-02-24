var http = require('http'),
	querystring = require('querystring'),
	Meeting = require('./ucengine/meeting').Meeting,
	User = require('./ucengine/user').User;

var Ucengine = function(conf) {
	this.host = conf.host;
	this.port = conf.port;
	this.users = {};
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

Ucengine.prototype.add = function(something, cb) {
	something._add(this, cb);
};

Ucengine.prototype.chain = function(objects, method, cb) {
	var uc = this;
	var oneMoreTime = function(ls) {
		var lp = ls.pop();
		method.apply(uc, lp, function() {
			if(ls.length) { oneMoreTime(ls); }
			else { cb.apply(); }
		});
	};
	oneMoreTime(objects);
};

Ucengine.prototype.blunderer = function(objects, method, cb) {
	var uc = this;
	var cpt = objects.length;
	objects.forEach(function(object) {
		method.call(uc, object, function() {
			cpt--;
			if(cpt == 0) {
				cb.call(uc);
			}
		});
	});
};

/**
 * Async users adding
 * logins   : [[login, password]]
 * cb_login : function(user)
 * cb       : function()
 */
Ucengine.prototype.asyncUsers = function(logins, cb_login, cb) {
	var uc = this;
	this.blunderer(logins, function(login, cbb) {
		uc.add(new User(login[0], login[1]), function(resp, u) {
			u.presence(function() {
				cb_login.call(uc, u);
				cbb.call(uc);
			});
		});
	}, cb);
};

/**
 * Chained users add
 */
Ucengine.prototype.addUsers = function(logins, cb) {
	var uc = this;
	var users = {};
	var oneMore = function(ls) {
		var lp = ls.pop();
		uc.add(new User(lp[0], lp[1]), function(resp, u) {
			u.presence(function() {
				users[u.uid] = u;
				if(ls.length) { oneMore(ls); }
				else { cb.apply(u, [users]); }
			});
		});
	};
	oneMore(logins);
};