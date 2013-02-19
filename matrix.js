var fs = require('fs');

var matrix = function() {
	var txt = fs.readFileSync('matrix.txt', 'utf8');
	var rows = txt.split('\n');
	var matrix = {};

	for(var i in rows) {
		var cells = rows[i].split('\t');

		matrix[cells[0]] = {
			ldh: cells[1],
			bili: cells[2],
			hb: cells[3],
			actualLDHukat: cells[4],
			actualLDH: cells[5],
			actualBili: cells[6],
			leftimage:'',
			rightimages: fs.readdirSync(__dirname + '/images/s/' + cells[0])
		};
	}

	return matrix;
}

exports.rows = matrix();