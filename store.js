var fs = require('fs');

exports.setup = function(file) {
	var save = function(item, callback) {
		fs.writeFile(file, JSON.stringify(item, null, '\t'), callback);
	};
		
	var get = function() {
		var json = JSON.parse(fs.readFileSync(file,'utf-8') || "{}");
		return json;
	};

	return {
		save: save,
		get: get
	};
};

