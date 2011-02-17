var conf = require('./conf').Conf,
	uce = require('../lib/ucengine'),
	Ucengine = uce.Ucengine,
	User = uce.User,
	Meeting = uce.Meeting;
	

var uc = new Ucengine(conf);

uc.create(new User('the@boss.com', 'toto'), function(resp, the_boss) {
	the_boss.presence(function(resp){
		this.create(new Meeting('the_meeting'), function(resp){
			console.log('new meeting', resp);
			/*var the_meeting = this;
			for(var i=0; i < 5; i++) {
				uc.create(new User("popo" + i + "@popo.com", 'toto' + i), function(resp, user) {
					console.log('create user', user.uid, resp);
					user.join(the_meeting, function(resp) {
						console.log('join meeting', resp);
					});
				});
			}*/
		});
	});
});
