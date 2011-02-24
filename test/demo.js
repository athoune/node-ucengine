var uce = require('../lib/ucengine'),
	Ucengine = uce.Ucengine,
	User = uce.User;

var uc = new Ucengine({host: 'localhost', port:5280});

var logins = [
	"thierry.bomandouki@af83.com",
	"victor.goya@af83.com",
	"louis.ameline@af83.com",
	"alexandre.eisenchteter@af83.com",
	"romain.gauthier@af83.com",
	"participant"
];

var users = {};


function moreUser(i, cb) {
	uc.create(new User(logins[i], 'pwd'), function(resp, u) {
		u.presence(function(resp) {
			users[u.uid] = u;
			if(i <= logins.length - 2) {
				moreUser(i+1, cb);
			} else {
				cb.call();
			}
		});
	});
};

moreUser(0, function() {
	console.log(users);
});
