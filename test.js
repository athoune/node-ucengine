var conf = require('./conf').Conf,
	Ucengine = require('./ucengine').Ucengine;

var uc = new Ucengine(conf);

uc.time(function(resp) {
	console.log(resp);
});