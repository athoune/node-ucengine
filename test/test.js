var conf = require('./conf').Conf,
	uce = require('../lib/ucengine'),
	Ucengine = uce.Ucengine,
	User = uce.User;

function UCcontext(cb) {
	var uc = new Ucengine(conf);
	var u = new User(conf.uid, conf.credential);
	uc.attach(u, cb);
}

exports['presence'] = function(test) {
	test.expect(3);
	var u = new User(conf.uid, conf.credential);
	u.ucengine = new Ucengine(conf);
	u.presence(function(err, repl) {
		test.ok(err == null);
		test.ok(this instanceof User);
		test.ok(this.sid != null);
		test.done();
	});
};

exports['attach'] = function(test) {
	test.expect(2);
	UCcontext(function(err, resp) {
		test.ok(err == null);
		test.ok(this.sid != null);
		test.done();
	});
};

exports['wrong presence'] = function(test) {
	test.expect(2);
	var u = new User(conf.uid, '#!@?$');
	u.ucengine = new Ucengine(conf);
	u.presence(function(err, resp) {
		test.ok(err != null);
		test.equal("bad_credentials", err.message);
		test.done();
	});
};

exports['time'] = function(test) {
	test.expect(1);
	UCcontext(function() {
		this.time(function(err, resp) {
			test.ok(resp.result != null);
			test.done();
		});
	});
};

exports['infos'] = function(test) {
	test.expect(1);
	UCcontext(function() {
		this.infos(function(err, resp) {
			test.equal("localhost", resp.result.domain);
			test.done();
		});
	});
};