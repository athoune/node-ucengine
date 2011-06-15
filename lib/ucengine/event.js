var events = require('events'),
	querystring = require('querystring'),
	sys = require('sys');

var UCEvent = function(ucengine, user, meeting) {
	this.ucengine = ucengine;
	this.meeting = meeting || "";
	this.user = user;
};

sys.inherits(UCEvent, events.EventEmitter);
exports.UCEvent = UCEvent;

/*
* Suscribes to an event, optionally within a meeting
*/
UCEvent.prototype._listen = function(start) {
	if(start == undefined) start = Date.now();
	var m = this;
	this.ucengine._request('GET', '/event/' + this.meeting + '?' +
		querystring.stringify({
		"_async": "lp",
		uid     :this.user.uid,
		sid     :this.user.sid,
		start   :start
	}), null, function(err, resp) {
		if(err == null) {
			resp.result.forEach(function(evt) {
				//console.log("evt meeting", m.meeting, m.user.uid, evt);
				m.emit(evt.type, evt);
				m.user.ucengine.stats.events.addOne(evt.type);
				
			});
		}
		var d = Date.now();
		//m._listen(d);
		process.nextTick(function(){m._listen(d);});
		//m.timeout = setTimeout(function(){m._listen(d);}, 50);
	});
};

/**
* Publishes any Event optionally within a meeting
*/
UCEvent.prototype.publish = function(pubevent, cb) {
	var params = {};
	params['type'] = pubevent['type'];
	if (pubevent['parent']!==undefined)
		params['parent'] = pubevent['parent'];
	if (pubevent['metadata']!==undefined) {
		pubevent['metadata'].forEach(function(md){
			params['metadata['+md+']']=pubevent['metadata'][md];
		});
	}
	params['uid']=this.user.uid;
        params['sid']=this.user.sid;
	var m = this;
	this.ucengine._request('POST', '/event/' + this.meeting, params,
		function(err, resp) {
			cb.call(m, err, resp);
	});
};
