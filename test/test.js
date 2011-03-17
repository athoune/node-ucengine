var conf = require('./conf').Conf,
	uce = require('../lib/ucengine'),
	Ucengine = uce.Ucengine,
	User = uce.User;

function UCcontext(cb) {
	var uc = new Ucengine(conf);
	var u = new User("participant", "pwd");
	uc.attach(u, cb);
}

// UCcontext(, function() {
// 	var uc = this.ucengine;
// 	this.time(function(resp) {
// 		uc.logger.log('time: ', resp);
// 	});
// 	this.infos(function(resp) {
// 		uc.logger.log('infos: ', resp);
// 	});
// });

exports.testTime = function(test) {
	test.expect(1);
	UCcontext(function() {
		this.time(function(resp) {
			test.ok(resp.result != null);
			test.done();
		});
	});
};

exports.testInfos = function(test) {
	test.expect(1);
	UCcontext(function() {
		this.infos(function(resp) {
			test.equal("localhost", resp.result.domain);
			test.done();
		});
	});
};