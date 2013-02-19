var jform = function(data) {
	var add = function(i) {
		return $(i).val();
	};

	var iterate = function(data, fn) {
		for(var i in data) {
			if(typeof data[i] === 'object') {
				iterate(data[i], fn);
			} else {
				data[i] = fn(data[i]);
			}
		}

		return data;
	}

	return iterate(data, add);
};