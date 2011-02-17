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
};

exports.User = User;

User.prototype._create = function(ucengine, cb) {
	var u = this;
	this.ucengine = ucengine;
	ucengine._request('POST', '/user/', {uid: this.uid, auth:'password', credential: this.credential}, function(resp) {
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
			}
			cb.apply(u, [resp]);
		});
};

User.prototype.user = function(cb) {
	this.ucengine._request('GET', '/user/?' +querystring.stringify({uid:this.uid, sid:this.sid}), null, cb);
};

User.prototype.create = function(something, cb) {
	something._create(this.ucengine, this, cb);
};

User.prototype.join = function(meeting, cb) {
	this.ucengine._request('POST', '/meeting/all/' + meeting.meeting + '/roster/?'+querystring.stringify({uid:this.uid, sid:this.sid}), {uid: this.uid}, cb);
};
