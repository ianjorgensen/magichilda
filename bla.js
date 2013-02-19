var pixel = require('./pixel');


pixel.whiteBalance('/images/s/S130252/100.jpg', '/images/s/S130252/w100.jpg', function() {
	console.log(arguments);
});