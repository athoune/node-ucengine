/*
This test used data provided from ucengine demo data
*/
var uce = require('../lib/ucengine'),
	Ucengine = uce.Ucengine,
	User = uce.User,
	Meeting = uce.Meeting;

var uc = new Ucengine({host: 'localhost', port:5280});

var agoroom = new Meeting("demo");

var logins = [
	["thierry.bomandouki@af83.com", 'pwd'],
	["victor.goya@af83.com", "pwd"],
	["louis.ameline@af83.com", "pwd"],
	["alexandre.eisenchteter@af83.com", "pwd"],
	["romain.gauthier@af83.com", "pwd"],
	["participant", "pwd"]
].map(function(login) {
	return new User(login[0], login[1]);
});

uc.logger.log(logins.map(function(u) {return u.uid;}));

uc.attachAll(logins,
	function() {
		var oneMoreTime = function(ls) {
			var lp = ls.pop();
			lp.join(agoroom, function() {
				uc.logger.log("meeting for " + lp.uid);
				if(ls.length) {
					oneMoreTime(ls);
				} else {
					uc.logger.log("everybody are in the meeting");//, uc.users);
					var SIZE = 50;
					var received = 0;
					for(user in uc.users) {
						uc.users[user].meetings.demo.addListener(
							'chat.message.new',
							function(msg) {
								received ++;
								if(received % 50 == 0) {
									uc.logger.log('r', this.user.uid, received);
								}
								if(received == SIZE * Math.pow(logins.length, 2)) {
									uc.logger.log("message receveid");
									process.exit();
								}
							});
					}
					var cpt = 0;
					for(var i=0; i < SIZE; i++) {
						for(user in uc.users) {
							uc.users[user].meetings.demo.chat('beuha!',
								'fr', function(resp) {
									cpt ++;
									if(cpt % 50 == 0) {
										uc.logger.log('e', cpt);
									}
									if(cpt == logins.length * SIZE) {
										uc.logger.log("messages sent");
									}
								});
						}
					}
				}
			});
		};
		oneMoreTime(Object.keys(this.users).map(function(e) { return uc.users[e];}));
	}
);
