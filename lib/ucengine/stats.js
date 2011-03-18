var Stats = function() {
	this.data = {};
};

Stats.prototype.addOne = function(key) {
	if(this.data[key] == null) {
		this.data[key] = 0;
	}
	this.data[key] += 1;
};

exports.Stats = Stats;