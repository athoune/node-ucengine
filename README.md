Node-UCEngine
=============

Nodejs client for [UC Engine](http://www.ucengine.org).

Requisites
----------

 * nodejs >= 0.4

Test
----

Build your own conf file named _conf.js_ with something like that :

	exports.Conf = {
		host: "192.168.1.142",
		port: 5280,
		uid: "popo@popo.com",
		credential: "spam"
	};
	
Then you can play with test.js and flood.js. Flood need a clean database.