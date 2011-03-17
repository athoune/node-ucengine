var conf = require('./conf').Conf,
	uce = require('../lib/ucengine'),
	Ucengine = uce.Ucengine,
	User = uce.User;

function UCcontext(cb) {
	var uc = new Ucengine(conf);
	var u = new User(conf.uid, conf.credential);
	uc.attach(u, cb);
}

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