var conf = require('./conf').Conf,
	uce = require('./ucengine'),
	Ucengine = uce.Ucengine,
	User = uce.User;

var uc = new Ucengine(conf);

uc.time(function(resp) {
	console.log('time: ', resp);
});

uc.meeting(function(resp) {
	console.log('meeting: ', resp);
});

uc.meeting('closed', function(resp) {
	console.log('meeting closed: ', resp);
});

uc.presence(conf.uid, conf.credential, function(resp) {
	console.log('presence :', resp);
	this.user(function(resp) {
		console.log('user: ', resp);
	});
});


uc.infos(function(resp) {
	console.log('infos: ', resp);
});

