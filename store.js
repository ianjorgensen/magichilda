var fs = require('fs');
var file = './store.json';

exports.save = function(item, callback) {
	fs.writeFile(file, JSON.stringify(item, null, '\t'), callback);
};
	
exports.get = function() {
	var json = JSON.parse(fs.readFileSync(file,'utf-8') || "{}");
	return json;
}