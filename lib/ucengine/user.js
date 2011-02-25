var querystring = require('querystring'),
	events = require('events'),
	sys = require('sys'),
	Meeting = require('./meeting').Meeting;

var User = function() {
	this.uid = null;
	this.credential = null;
	this.sid = null;
	if(arguments.length > 0) {
		this.uid = arguments[0];
	}
	if(arguments.length > 1) {
		this.credential = arguments[1];
	}
	this.meetings = {};
};

sys.inherits(User, events.EventEmitter);
exports.User = User;

User.prototype._listen = function() {
	var u = this;
	this.ucengine._request('GET', '/event?' +
		querystring.stringify({
		"_async": "lp",
		uid     :this.uid,
		sid     :this.sid,
		start   :Date.now()
	}), null, function(resp) {
		if(resp.result != undefined) {
			resp.result.forEach(function(evt) {
				console.log("evt user", u.uid, evt);
				u.emit(evt.type, evt);
			});
		}
		u._listen();
	});
};

User.prototype._add = function(ucengine, cb) {
	var u = this;
	this.ucengine = ucengine;
	ucengine._request('POST', '/user/', {
		uid: this.uid,
		auth:'password',
		credential: this.credential},
	function(resp) {
		cb.apply(ucengine, [resp, u]);
	});
};

User.prototype.presence = function(cb) {
	var u = this;
	this.ucengine._request('POST', '/presence/', {
		uid: this.uid,
		credential: this.credential,
		"metadata[nickname]": this.uid }, function(resp) {
			if(resp.result != undefined) {
				u.sid = resp.result;
				u.ucengine.users[u.uid] = u;
				u._listen();
			}
			cb.apply(u, [resp]);
		});
};

User.prototype.disconnect = function(cb) {
	//[TODO]
};

User.prototype.user = function(cb) {
	this.ucengine._request('GET', '/user/?' +querystring.stringify({
		uid:this.uid,
		sid:this.sid}), null, cb);
};

User.prototype.create = function(something, cb) {
	something._create(this.ucengine, this, cb);
};

User.prototype.join = function(meeting, cb) {
	var u = this;
	this.ucengine._request('POST', '/meeting/all/' + meeting.meeting +
		'/roster/?'+querystring.stringify({uid:this.uid, sid:this.sid}),
		{uid: this.uid}, function(resp) {
			var m = new Meeting(meeting.meeting);
			m.user = u;
			m._listen();
			u.meetings[m.meeting] = m;
			cb.call(u.ucengine);
		});
};

User.prototype.suscribe = function(cb) {
	
};
