/**
 * Vows based test of UCEvent
 * vows test/test_events.js --spec
 */

var vows = require('vows'),
    assert = require('assert');

var uce = require('../lib/ucengine'),
    Ucengine = uce.Ucengine,
    User = uce.User,
    UCEvent = uce.UCEvent;

var conf = {
    host: 'localhost',
    port: 5280
};

var participant = {
    uid: 'participant',
    credential: 'pwd'
};

var root = {
    uid: 'root',
    credential: 'root'
};

function AttachUser(cb) {
    var uc = new Ucengine(conf);
    var u = new User(conf.uid, conf.credential);
    uc.attach(u, cb);
}

var publishdata = {
    'type': "chat.message.new",
    'metadata': {
	'content': "echo"
    }
};

vows.describe('Events publish & suscribe tests').addBatch({
    'suscribe': {
	topic: function() {
	    //console.log("suscribing with user "+root.uid);
	    var uc = new Ucengine(conf);
	    rootuser = new User(root.uid, root.credential);
	    var evts = new UCEvent(uc, rootuser, undefined);
	    evts.addListener('internal.presence.add', function(event) {
		console.log(event);
		assert.isObject(event);
		assert.equal(event.type, 'internal.presence.add');
	    });
	    for(var i=0; i<=5; i++){
		var anyuser = new User(participant.uid, participant.credential);
		uc.attach(anyuser, function() {
		    console.log("fired the presence event");
		});
	    }
	    return evts;
	},
        'internal presence add event': function (topic) {
	    assert.isObject(topic);
        },
	teardown: function(topic){
	    console.log("This is the end");
	}
    },
    'publish': {
	topic: function() {
	    //console.log("suscribing with user "+root.uid);
	    var uc = new Ucengine(conf);
	    rootuser = new User(root.uid, root.credential);
	    var evts = new UCEvent(uc, rootuser, '');
	    evts.publish( publishdata, function(err, response){
		if(err == null) {
		    console.log("callback from published !");
		    assert.isObject(response);
		}
		else {
		    throw err;
		}

	    });
	    //return evts;
	},
        'publish an event': function (topic) {
	    assert.isObject(topic);
	},
	teardown: function(topic){
	    console.log("This is the end");
	}
    }
}).exportTo(module);
