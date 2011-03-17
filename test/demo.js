/*
This test used data provided from ucengine demo data
*/
var Chainsaw = require('chainsaw'),
	uce = require('../lib/ucengine'),
	conf = require('./conf').Conf,
	Ucengine = uce.Ucengine,
	User = uce.User,
	Meeting = uce.Meeting;


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

function BigTest() {
	var uc = new Ucengine(conf);
	return Chainsaw(function(saw) {
		var logins, meeting;
		var SIZE = 50;
		this.addUsers = function(loginz) {
			logins = loginz;
			uc.attachAll(logins, function() {
				console.log("attached");
				saw.next();
			});
		};
		this.joinMeeting = function(m) {
			meeting = m;
			var cpt = logins.length;
			var received_messages = 0;
			logins.forEach(function(login) {
				login.join(meeting, function() {
					login.meetings[meeting.meeting].addListener('chat.message.new', function(msg) {
						received_messages++;
						console.log('r ' + received_messages + " " + login.uid + " : " + msg);
					});
					cpt--;
					if(cpt == 0) {
						console.log(login.uid +" join");
						saw.next();
					}
				});
			});
		};
		this.everybodytalk = function(msg) {
			var cpt = logins.length * SIZE;
			for(i=0; i < SIZE; i++) {
				logins.forEach(function(login) {
					//console.log("everybodytalk", meeting.meeting, login.meetings[meeting.meeting].chat);
					login.meetings[meeting.meeting].chat(msg, 'fr', function() {
						console.log(login.uid+ " chat");
						cpt--;
						if(cpt == 0) {
							console.log("en tchat");
							saw.next();
						}
					});
				});
			}
		};
	});
}

console.log(logins.map(function(u) {return u.uid;}));
var agoroom = new Meeting("demo");
BigTest()
	.addUsers(logins)
	.joinMeeting(agoroom)
	.everybodytalk("beuha!");
	
// uc.attachAll(logins,
// 	function() {
// 		var oneMoreTime = function(ls) {
// 			var lp = ls.pop();
// 			lp.join(agoroom, function() {
// 				uc.logger.log("meeting for " + lp.uid);
// 				if(ls.length) {
// 					oneMoreTime(ls);
// 				} else {
// 					uc.logger.log("everybody are in the meeting");//, uc.users);
// 					var SIZE = 50;
// 					var received = 0;
// 					for(user in uc.users) {
// 						uc.users[user].meetings.demo.addListener(
// 							'chat.message.new',
// 							function(msg) {
// 								received ++;
// 								if(received % 50 == 0) {
// 									uc.logger.log('r', this.user.uid, received);
// 								}
// 								if(received == SIZE * Math.pow(logins.length, 2)) {
// 									uc.logger.log("message receveid");
// 									process.exit();
// 								}
// 							});
// 					}
// 					var cpt = 0;
// 					for(var i=0; i < SIZE; i++) {
// 						for(user in uc.users) {
// 							uc.users[user].meetings.demo.chat('beuha!',
// 								'fr', function(resp) {
// 									cpt ++;
// 									if(cpt % 50 == 0) {
// 										uc.logger.log('e', cpt);
// 									}
// 									if(cpt == logins.length * SIZE) {
// 										uc.logger.log("messages sent");
// 									}
// 								});
// 						}
// 					}
// 				}
// 			});
// 		};
// 		oneMoreTime(Object.keys(this.users).map(function(e) { return uc.users[e];}));
// 	}
// );
