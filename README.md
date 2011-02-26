Node-UCEngine
=============

Nodejs client for [UC Engine](http://www.ucengine.org).

Requisites
----------

 * nodejs >= 0.4

Test
----

Launch the demo datas on the server

_test/demo.js_ use this data and do :

 * √ Everybody connect
 * √ Everybody join the meeting
 * √ Events

Features
--------

 * √ REST client with auth
 * √ Basic method : _time_, _info_
 * √ User : _presence_, join _meeting_
 * √ Batch creation of users
 * √ Event
 * _ Multicore for more violence

Model
-----

A _UCEngine_ connect to a server. It contains _User_ wich join _Meeting_.
You handle something like that :

	var uc = new Ucengine({host:'localhost', port:5280});
	// [...] connecting users and meetings
	uc.users["robert@demo.com"].meetings["demo"].addListener(
		'chat.message.new', function(msg) {
			console.log("Robert got a message in the demo meeting", msg);
		});
	uc.users["robert@demo.com"].meetings["demo"].chat("Bonjour monde", "fr");

