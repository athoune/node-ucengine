/*
This test used data provided from ucengine demo data
*/
var uce = require('../lib/ucengine'),
	Ucengine = uce.Ucengine,
	User = uce.User,
	Meeting = uce.Meeting;

var uc = new Ucengine({host: 'localhost', port:5280});

var agoroom = new Meeting("demo");

var users = {};
var logins = [
	["thierry.bomandouki@af83.com", 'pwd'],
	["victor.goya@af83.com", "pwd"],
	["louis.ameline@af83.com", "pwd"],
	["alexandre.eisenchteter@af83.com", "pwd"],
	["romain.gauthier@af83.com", "pwd"],
	["participant", "pwd"]
];
console.log(logins.map(function(l) {return l[0];}));

uc.asyncUsers(logins, function(user) {
		users[user.uid] = user;
	},
	function() {
		var oneMoreTime = function(ls) {
			var lp = ls.pop();
			lp.join(agoroom, function() {
				console.log("meeting for " + lp.uid);
				if(ls.length) {
					oneMoreTime(ls);
				} else {
					console.log("everybody are in the meeting");//, uc.users);
					uc.users["romain.gauthier@af83.com"].meetings.demo.chat('beuha!',
						'fr', function(resp) {
							console.log(resp);
						});
				}
			});
		};
		oneMoreTime(Object.keys(users).map(function(e) { return users[e];}));
	}
);
