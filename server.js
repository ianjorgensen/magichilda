var express = require('express')
  , engine = require('ejs-locals')
  , app = express()
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
  , fs = require('fs')
  , store = require('./store.js')
  , matrix = require('./matrix.js')
  ,	pixel = require('./pixel');  

io.set('log level', 1); // hide debug output

// setup ejs as express view engine
app.engine('ejs', engine);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');

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

app.post('/postimage', express.bodyParser(), function(request, response) {
  var data = {
  	points: JSON.parse(request.body.points || "[]"),
  	image: request.files.image.path,
  	subset: request.files.subset.path
  };

  io.sockets.emit('postimage', data);
	io.sockets.on('connection', function (socket) {
		console.log('connected');
  	socket.on('dataready', function (data) {
  		console.log('dataready', data);
    	response.json(data.str);
    	response.end();
  	});
	});
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

	data.rows[info.key] = info;
	store.save(data);
	response.end();
});

// crop al images in folder
app.get('/crop/:folder', function(request, response) {
	response.render('crop', {
		page: {title: 'Crop'}, 
		path: '/images/' + request.params.folder,
		images: fs.readdirSync(__dirname + '/images/' + request.params.folder)
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
	fs.readFile('/tmp/' + request.params.file, function(err, data) {
    response.writeHead(200, {"Content-Type": "image/png"});
    response.write(data, "binary");
    response.end();
	});
});

app.use(express.static(__dirname));

var port = 9090;
server.listen(port);

console.log('Listening on port ' + port);