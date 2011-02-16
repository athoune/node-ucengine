var conf = require('./conf').Conf,
	Ucengine = require('./ucengine').Ucengine;

var uc = new Ucengine(conf);

uc.time(function(resp) {
	console.log('time: ', resp);
});

uc.meeting(function(resp) {
	console.log('meeting: ', resp);
});

uc.presence(conf.uid, conf.credential, function(resp) {
	console.log('presence :', resp);
});