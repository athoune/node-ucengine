var conf = require('./conf').Conf,
	uce = require('./ucengine'),
	Ucengine = uce.Ucengine,
	User = uce.User;

var uc = new Ucengine(conf);

for(var i=0; i < 5000; i++) {
	uc.create(new User("popo" + i + "@popo.com", 'toto' + i), function(resp, user) {
		console.log('create user', user.uid, resp);
	});
}