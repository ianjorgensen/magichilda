var socket = require('socket.io-client').connect('http://joule.local:9191');

socket.on('connect', function(){
	console.log('connected');
	//socket.broadcast.emit('respondPost', { response: 'never going to give you up, never going to let you down' });	
});