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


// console.log(logins.map(function(u) {return u.uid;}));

exports.testDemo = function(test) {
	test.expect(4);
	var uc = new Ucengine(conf);
	function BigTest() {
		return Chainsaw(function(saw) {
			var SIZE = 3; // number of messages
			var logins, meeting;
			//adding users
			this.addUsers = function(loginz) {
				logins = loginz;
				uc.attachAll(logins, function() {
					console.log("- attached");
					test.ok(true);
					saw.next();
				});
			};
			//users joining
			this.joinMeeting = function(m) {
				meeting = m;
				var cpt = logins.length;
				logins.forEach(function(login) {
					login.join(meeting, function() {
						cpt--;
						if(cpt == 0) {
							console.log("- meeting joined");
							test.ok(true);
							saw.next();
						}
					});
				});
			};
			this.everybodylisten = function() {
				var received_messages = SIZE * Math.pow(logins.length, 2);
				logins.forEach(function(login) {
					var cpt = 0;
					login.meetings[meeting.meeting].addListener('chat.message.new', function(msg) {
						received_messages--;
						cpt++;
						//[FIXME] I loose some messages
						// console.log('r ' + cpt + ' ' + login.uid + ' ' + received_messages + ' ' + msg.metadata.text);
						if(received_messages == 0) {
							test.ok(true);
							saw.next();
						}
					});
				});
				console.log("- listening");
				saw.next();
			};
			//everybody talk then receive every messages
			this.everybodytalk = function(msg) {
				var cpt = logins.length * SIZE;
				for(i=0; i < SIZE; i++) {
					logins.forEach(function(login) {
						//console.log("everybodytalk", meeting.meeting, login.meetings[meeting.meeting].chat);
						login.meetings[meeting.meeting].chat(msg + login.uid, 'fr', function() {
							// console.log('e ' + cpt + ' ' + login.uid + " chat");
							cpt--;
							if(cpt == 0) {
								console.log("- tchats sent");
								test.ok(true);
							}
						});
					});
				}
			};
			this.done = function() {
				test.done();
			};
		});
	}
	setInterval(function() {
		console.log('events : ', uc.stats.events.data);
		console.log('http : ', uc.stats.http.data);
	}, 10 * 1000);
	BigTest()
		.addUsers(logins)
		.joinMeeting(new Meeting("demo"))
		.everybodylisten()
		.everybodytalk("Hello, I am ")
		.done();
};