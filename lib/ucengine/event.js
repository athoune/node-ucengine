var EventEmitter = require('events').EventEmitter,
	querystring = require('querystring'),
	sys = require('sys');

var UCEvent = function(ucengine, user, meeting) {
    this.ucengine = ucengine;
    this.user = user;
    this.meeting = meeting || "";
    var that = this;
    ucengine.attach(user, function(){
	that._listen();
    });
};

sys.inherits(UCEvent, EventEmitter);
exports.UCEvent = UCEvent;

/*
* Suscribes to an UCE event, optionally within a meeting
*/
UCEvent.prototype._listen = function(start) {
    if(start == undefined) start = Date.now();
    var m = this;
    this.ucengine._request(
	'GET',
	'/event/' + this.meeting + '?' + querystring.stringify({
		"_async": "lp",
		uid     :m.user.uid,
		sid     :m.user.sid,
		start   :start
	}),
	null,
	function(err, resp) {
		if(err == null) {
		    resp.result.forEach(function(evt) {
			m.emit(evt.type, evt);
			m.user.ucengine.stats.events.addOne(evt.type);
		    });
		}
		var d = Date.now();
		process.nextTick(function(){m._listen(d);});
	}
    );
};

/**
* Publishes any UCE event optionally within a meeting
*/
UCEvent.prototype.publish = function(pubevent, cb) {
    // prepares the parameters to send an event of 'type'
    var params = {};
    params['type'] = pubevent['type'];
    // optional parent
    if (pubevent['parent'] !== undefined)
	params['parent'] = pubevent['parent'];
    // optionally attach any metadata
    if (pubevent['metadata'] !== undefined) {
	for(var md in pubevent['metadata']) {
		params['metadata['+md+']'] = pubevent['metadata'][md];
	}
    }
    // required uid an sid
    params['uid']=this.user.uid;
    params['sid']=this.user.sid;
    var m = this;
    // go !
    this.ucengine._request('POST', '/event/' + this.meeting, params,
	function(err, resp) {
		console.log("posted");
		cb.call(err, resp);
    });
};
