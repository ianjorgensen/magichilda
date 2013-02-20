var one = require('onecolor');

var csv = function(data, property) {
	var csv = "key , spike ldh , spike bili , spike hb , actual ldh-ukat , actual ldh , actual bili , actual hb-index , actual hb\n";

	for(var j in data.rows) {
		var row = data.rows[j];	


		if(!row || !row.spiking || !row.actual ) {
			continue;
		}

		var hb = row.actual.hb || '';
		csv += row.key + ',' + row.spiking.ldh + ',' + row.spiking.bili + ',' + row.spiking.hb + ',' + row.actual["ldh-ukat"] + ',' + row.actual.ldh + ',' + row.actual.bili + ',' + row.actual['hb-index'] + ',' + hb.replace(',','.');

		for(var i in row.data) {
			var d = row.data[i];
			
			if (d && d.colors && d.colors.length) {
				var c = one("rgb(" + d.colors[0][0] + ',' +  d.colors[0][1] + ',' +  d.colors[0][2] + ')')[property]();
				csv += c;
			}

			csv += ',';
		}

		csv += '\n';
	}

	return csv;
};

module.exports = csv;