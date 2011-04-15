var querystring = require('querystring'),
	events = require('events'),
	sys = require('sys'),
	Meeting = require('./meeting').Meeting;

var User = function() {
	this.uid = null;
	this.name = null;
	this.credential = null;
	this.sid = null;
	this.connected = false;
	if(arguments.length > 0) {
		this.name = arguments[0];
	}
	if(arguments.length > 1) {
		this.credential = arguments[1];
	}
	this.meetings = {};
	this.addListener('error', function(error) {
		console.error(error);
		throw error;
	});
};

sys.inherits(User, events.EventEmitter);
exports.User = User;

/*
 * The loop for events from the server
 */
User.prototype._listen = function(start) {
	if(start == undefined) start = Date.now();
	var u = this;
	this.event_pid = this.ucengine._request('GET', '/event?' +
		querystring.stringify({
		"_async": "lp",
		uid     :this.uid,
		sid     :this.sid,
		start   :start
	}), null, function(err, resp) {
		if(err == null) {
			resp.result.forEach(function(evt) {
				//console.log("evt user", u.uid, evt);
				u.emit(evt.type, evt);
				u.ucengine.stats.events.addOne(evt.type);
			});
		}
		if(u.connected) {
			var d = Date.now();
			process.nextTick(function(){u._listen(d);});
		}
	});
};

User.prototype._add = function(ucengine, cb) {
	var u = this;
	this.ucengine = ucengine;
	ucengine._request('POST', '/user/', {
		uid: this.uid,
		auth:'password',
		credential: this.credential},
	function(err, resp) {
		if(err == null) {
			u.presence(cb);
		} else {
			console.error('auth failed', u.uid, resp);
			cb.call(u, resp);
		}
	});
};

/**
 * Sending presence
 */
User.prototype.presence = function(cb) {
	var u = this;
	this.ucengine._request('POST', '/presence/', {
		name: this.name,
		credential: this.credential,
		"metadata[nickname]": this.name }, function(err, resp) {
			if(err == null) {
				u.sid = resp.result.sid;
				u.uid = resp.result.uid;
				u.ucengine.users[u.uid] = u;
				setTimeout(function() {
					u.connected = true;
					u._listen();
				}, 100);
			}
			cb.call(u, err, resp);
		});
};

User.prototype.disconnect = function(cb) {
	var u = this;
	this.ucengine._request('DELETE', '/presence/' + this.uid, {
		uid: this.uid,
		sid: this.sid}, function(err, resp) {
			u.emit('disconnect');
			u.connected = false;
			delete u.ucengine.users[u.uid];
			if(u.event_pid != undefined) {
				u.event_pid.abort();
			}
			cb.call(u, err, resp);
		});
};

/**
 * Server time
 */
User.prototype.time = function(cb) {
	var u = this;
	this.ucengine._request('GET', '/time?' +querystring.stringify({
		uid:this.uid,
		sid:this.sid}), null, function(err, resp) {
			cb.call(u, err, resp);
		});
};

/**
 * Server infos
 */
User.prototype.infos = function(cb) {
	var u = this;
	this.ucengine._request('GET', '/infos?' +querystring.stringify({
		uid:this.uid,
		sid:this.sid}), null, function(err, resp) {
			cb.call(u, err, resp);
		});
};

User.prototype.user = function(cb) {
	this.ucengine._request('GET', '/user/?' +querystring.stringify({
		uid:this.uid,
		sid:this.sid}), null, cb);
};

User.prototype.create = function(something, cb) {
	something._create(this.ucengine, this, cb);
};

/**
 * Join a meeting
 */
User.prototype.join = function(meeting, cb) {
	var u = this;
	this.ucengine._request('POST', '/meeting/all/' + meeting.meeting +
		'/roster/?'+querystring.stringify({uid:this.uid, sid:this.sid}),
		{uid: this.uid}, function(err, resp) {
			if(err == null) {
				var m = new Meeting(meeting.meeting);
				m.user = u;
				u.meetings[m.meeting] = m;
				setTimeout(function() {
					m._listen();
					cb.call(meeting, err, resp);
				}, 10);
			} else {
				console.error("can't join", meeting.meeting, u.uid, resp);
				cb.call(meeting, err, resp);
			}
		});
};

User.prototype.suscribe = function(cb) {
	
};
