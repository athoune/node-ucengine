var Meeting = function() {
	this.meeting = null;
	if(arguments.length > 0) {
		this.meeting = arguments[0];
	}
	this.user = null;
};

exports.Meeting = Meeting;

Meeting.prototype._create = function(ucengine, user, cb) {
	var m = this;
	ucengine._request('POST', '/meeting/all', {
		uid:user.uid,
		sid:user.sid,
		name: this.meeting,
		start:0},
	function(resp) {
		cb.call(m, [resp]);
	});
};

Meeting.prototype.quit = function(cb) {
	//[TODO]
};

Meeting.prototype.roster = function(cb) {
	//[TODO]
};

Meeting.prototype.chat = function(text, lang, cb) {
	var m = this;
	this.user.ucengine._request('POST', '/event/' + this.meeting, {
		uid              :this.user.uid,
		sid              :this.user.sid,
		type             :'chat.message.new',
		'metadata[lang]' :lang,
		'metadata[text]' :text
	}, function(resp) {
		cb.call(m, [resp]);
	});
};