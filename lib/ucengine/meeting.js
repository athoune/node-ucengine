var events = require('events'),
	querystring = require('querystring'),
	sys = require('sys');

var Meeting = function() {
	this.meeting = null;
	if(arguments.length > 0) {
		this.meeting = arguments[0];
	}
	this.user = null;
};

sys.inherits(Meeting, events.EventEmitter);
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

Meeting.prototype._listen = function(start) {
	if(start == undefined) start = Date.now();
	var m = this;
	this.user.ucengine._request('GET', '/event/' + this.meeting + '?' +
		querystring.stringify({
		"_async": "lp",
		uid     :this.user.uid,
		sid     :this.user.sid,
		start   :start
	}), null, function(resp) {
		if(resp.result != undefined) {
			resp.result.forEach(function(evt) {
				//console.log("evt meeting", m.meeting, m.user.uid, evt);
				m.emit(evt.type, evt);
				m.user.ucengine.stats.addOne(evt.type);
				
			});
		}
		var d = Date.now();
		//m._listen(d);
		process.nextTick(function(){m._listen(d);});
		//m.timeout = setTimeout(function(){m._listen(d);}, 50);
	});
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