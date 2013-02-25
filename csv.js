var one = require('onecolor');

var csv = function(data, property) {
	var csv = '';
	var header = 'key , spike ldh , spike bili , spike hb , actual ldh-ukat , actual ldh , actual bili , actual hb-index , actual hb, left well,'; 
	var count = 0;

	for(var j in data.rows) {
		var thisCount = 0;
		count = 0;
		var row = data.rows[j];	


		if(!row || !row.spiking || !row.actual ) {
			continue;
		}

		csv += row.key || 'Nan';
		csv += ',';
		csv += row.spiking.ldh || 'Nan';
		csv += ',';
		csv += row.spiking.bili || 'Nan'; 
		csv += ',';
		csv += row.spiking.hb || 'Nan';
		csv += ',';
		csv += row.actual["ldh-ukat"] || 'Nan';
		csv += ',';
		csv += row.actual.ldh || 'Nan';
		csv += ',';
		csv += row.actual.bili || 'Nan'; 
		csv += ',';
		csv += row.actual['hb-index'] || 'Nan';
		csv += ',';
		csv += (row.actual.hb || 'Nan').replace(/\,/g,'.');
		csv += ',';

		var leftc = 'Nan';
		if(data.left) {
			leftc = one("rgb(" + data.left.colors[0][0] + ',' +  data.left.colors[0][1] + ',' +  data.left.colors[0][2] + ')')[property]();
		}

		csv += c;
		csv += ',';

		for(var i in row.data) {
			var d = row.data[i];
			thisCount++;
			
			if (d && d.colors && d.colors.length) {
				var c = one("rgb(" + d.colors[0][0] + ',' +  d.colors[0][1] + ',' +  d.colors[0][2] + ')')[property]();
				
				csv += c;
			}
			csv += ',';
		}

		if(thisCount >= count) {
			count = thisCount;
		}

		csv += '\n';
	}

	console.log(count);

	for(var i = 0; i < count; i++) {
		header += secondsToMinutes(i*10) + ',';
	}

	csv = header + '\n' + csv;

	return csv;
};

var secondsToMinutes = function(seconds) {
	var min = Math.floor(seconds/60);
	var sec = seconds % 60;


	if(min < 10) min = '0' + min;
	if(sec < 10) sec = '0' + sec;

	return min + ':' + sec;
};


module.exports = csv;