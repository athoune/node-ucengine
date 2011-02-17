var conf = require('./conf').Conf,
	uce = require('../lib/ucengine'),
	Ucengine = uce.Ucengine,
	User = uce.User;

var uc = new Ucengine(conf);

uc.time(function(resp) {
	console.log('time: ', resp);
});

uc.infos(function(resp) {
	console.log('infos: ', resp);
});

uc.create(new User('popo@popo.com', 'popo'), function(resp, u) {
	u.presence(function(resp) {
		console.log('presence :', resp);
		this.user(function(resp) {
			console.log('other users', resp);
		});
	});
	
});

uc.meeting(function(resp) {
	console.log('meeting: ', resp);
});

uc.meeting('closed', function(resp) {
	console.log('meeting closed: ', resp);
});