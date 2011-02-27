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
