var express = require('express')
  , engine = require('ejs-locals')
  , app = express()
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
  , fs = require('fs')
  , csv = require('./csv')
  , store = require('./store.js').setup('./store.json')
  , debugStore = require('./store.js').setup('./debugStore.json')
  , matrix = require('./matrix.js')
  ,	pixel = require('./pixel');  


io.set('log level', 1); // hide debug output

// setup ejs as express view engine
app.engine('ejs', engine);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');

app.get('/csv/:property', function(request, response) {
	response.setHeader('Content-disposition', 'attachment; filename=' + request.params.property);
  response.setHeader('Content-type', 'text/csv');

  response.end(csv(store.get(), request.params.property));
});

app.get('/degubStore', function(request, response) {
	response.json(debugStore.get());
	response.end();
});

/* routes */
app.get('/', function(request, response) {response.end('ok');});

app.get('/matrix', function(request, response) {	
	var data = store.get();
	
	data.page = {title: 'Matrix'};

	response.render('matrix', data);
});

app.get('/rows', function(request, response) {
	var json = JSON.parse(request.query.json);
	response.json(json.rows);
	response.end();
});

app.post('/postimage', express.bodyParser({uploadDir:"./tmp"}), function(request, response) {
  console.log('posted image');
  var imageData = {
  	points: JSON.parse(request.body.points || "[]"),
  	image: request.files.image.path,
  	subset: request.files.subset.path
  };

  var data = debugStore.get();

	if(!data) {
		data = {};
	}
	if(!data.rows) {
		data.rows = [];
	}

	data.rows.push(imageData);

	debugStore.save(data);

	response.end();
/*
  io.sockets.emit('postimage', imageData);
	io.sockets.on('connection', function (socket) {
		console.log('connected');
  	socket.on('dataready', function (imageData) {
  		console.log('dataready', imageData);
    	response.json(imageData.str);
    	response.end();
  	});
	});*/
});

app.get('/crop/:folder/left/save', function(request, response) {
	var info = JSON.parse(request.query.info);
	var data = store.get();

	if(!data) {
		data = {};
	}
	if(!data.rows) {
		data.rows = {};
	}

	if(data.rows[info.key]) {
		data.rows[info.key].left = info.left;
	} else {
		data.rows[info.key] = info;
	};

	store.save(data);
	response.end();
});

app.get('/matrix/remove/:key', function(request, response) {
	var key = request.params.key;
	var data = store.get();

	if(!data) {
		data = {};
	}

	if(!data.rows) {
		data.rows = {};
	}

	delete data.rows[key];
	
	store.save(data);
	response.end();
});

// save crop info
app.get('/crop/:folder/save', function(request, response) {
	var info = JSON.parse(request.query.info);
	var data = store.get();

	if(!data) {
		data = {};
	}
	if(!data.rows) {
		data.rows = {};
	}

	if(data.rows[info.key] && data.rows[info.key].left) {
		info.left = data.rows[info.key].left;
	}

	data.rows[info.key] = info;
	store.save(data);
	response.end();
});

app.get('/finder', function(request, response) {
	response.render('finder', { page: {title: 'finder'}});
});

app.get('/find', function(request, response) {
	var data = debugStore.get();
	response.render('find', { page: {title: 'find'}, rows: data.rows});
});

// crop al images in folder
app.get('/crop/:folder', function(request, response) {
	response.render('crop', {
		page: {title: 'Crop'}, 
		path: '/images/' + request.params.folder,
		images: fs.readdirSync(__dirname + '/images/' + request.params.folder)
	});
});

// crop left image in folder
app.get('/crop/:folder/:file/:key/left', function(request, response) {
	var path = 'images/' + request.params.folder + '/' + request.params.file;

	console.log('left path', path);

	var key = request.params.key;
	var x = request.query.x;
	var y = request.query.y;

	console.log('starting left crop');

	pixel.cropLeft(path, key, x, y, 40, function(err, data) {
	  if(err) {
	  	response.end('error');
	    return;
	  }
	  response.json(data);
	  response.end();
	});
});

// crop all images in folder
app.get('/crop/:folder/:key', function(request, response) {
	var folder = 'images/' + request.params.folder;
	var key = request.params.key;
	var x = request.query.x;
	var y = request.query.y;

	console.log('starting batch crop');

	pixel.batchCrop(folder, key, x, y, 40, function(err, data) {
		
	  if(err) {
	  	response.end('error');
	    return;
	  }
	  response.json(data);
	  response.end();
	});
});

// get images from ./tmp
app.get('/tmp/:file', function (request, response) {
	fs.readFile('./tmp/' + request.params.file, function(err, data) {
    response.writeHead(200, {"Content-Type": "image/png"});
    response.write(data, "binary");
    response.end();
	});
});

app.use(express.static(__dirname));

var port = 9090;
server.listen(port);

console.log('Listening on port ' + port);