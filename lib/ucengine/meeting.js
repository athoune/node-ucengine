var Meeting = function() {
	this.meeting = null;
	if(arguments.length > 0) {
		this.meeting = arguments[0];
	}
};

exports.Meeting = Meeting;

Meeting.prototype._create = function(ucengine, user, cb) {
	var m = this;
	ucengine._request('POST', '/meeting/all', {uid:user.uid, sid:user.sid, name: this.meeting, start:0}, function(resp) {
		cb.call(m, [resp]);
		});
};