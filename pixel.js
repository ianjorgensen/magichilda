var Canvas = require('canvas')
  , step = require('step')
  , common = require('common')
  , canvas = new Canvas(480,360)
  , ctx = canvas.getContext('2d')
  , palette = require('palette')
  , fs = require('fs')
  ,mkdirp = require('mkdirp');

var endsWith = function(str, suffix) {
  return str.toLowerCase().indexOf(suffix, str.length - suffix.length) !== -1;
};

var getPixelColor = function(id, width, height, _x, _y) {
  for(var x = 0; x < width; x++) {
    for(var y = 0; y < height; y++) {
      if (x == Math.round(_x) && y == Math.round(_y)) {
        var index = (x + y * id.width) * 4;  
        return {
          r:id.data[index+0],
          g:id.data[index+1],
          b:id.data[index+2]
        }
      }
    }  
  }
}; 

var crop = function(imagePath, croppedPath, x, y, width, height, callback) {
  var canvas = new Canvas(width, height);
  var context = canvas.getContext('2d');
  
  fs.readFile(__dirname + imagePath, function(err, src) {
    if(err) {
      callback(err);
      return;
    }

    var image = new Canvas.Image;
    image.src = new Buffer(src, 'binary');

    context.drawImage(image, x, y, width, height, 0, 0, width, height);

    setTimeout(function() {
      var size = 40;
      var id = context.getImageData(0, 0, width, height);
      var white = getPixelColor(id, width, height, 0, height-1);

      for(var x = 0; x < width; x++) {
        for(var y = 0; y < height; y++) {
          var index = (x + y * id.width) * 4;

          id.data[index+0] = (white.r ? 255/white.r : 1) * id.data[index+0];
          id.data[index+1] = (white.g ? 255/white.g : 1) * id.data[index+1];
          id.data[index+2] = (white.b ? 255/white.b : 1) * id.data[index+2];

          var t = 220;

          if (id.data[index+0] > t && id.data[index+1] > t && id.data[index+2] > t) {
            id.data[index+0] = 0;
            id.data[index+1] = 255;
            id.data[index+2] = 0;
            id.data[index+3] = 0;

            var size = 5;

            for(var w = -Math.floor(size/2); w <= Math.floor(size/2); w++) {
              for(var z = -Math.floor(size/2); z <= Math.floor(size/2); z++) {
                if ((x + w) < width || (y + z) < height) {
                  var i = ((x + w) + (y + z) * id.width) * 4;

                  id.data[i+0] = 0;
                  id.data[i+1] = 255;
                  id.data[i+2] = 0;
                  id.data[i+3] = 0;
                }
              }
            }
          }
        }
      }

      context.putImageData(id, 0, 0);  

      var colors = palette(canvas, 2);
      
      canvas.toBuffer(function(err, buf){
        fs.writeFile(__dirname +  croppedPath, buf, function() {
          callback(null, {
            path: croppedPath,
            sourcePath: imagePath,
            colors: colors
          });
        }); 

      });
    }, 10);
  });
};
exports.crop = crop;

var left = function(path, key, x, y, l, callback) {
    var outpath =  '/images/s/' + key + '/left.jpg';

    crop('/' + path, outpath, x - l/2, y - l/2, l, l, callback); 
};
exports.cropLeft = left;

var batch = function(folder, key, x, y, l, callback) {
  var paths = fs.readdirSync(__dirname + '/' + folder);


  common.step([
    function(next) {
      mkdirp(__dirname + '/images/s/' + key, next);
    },
    function(next) {
      for(var i in paths) {

        var filename = paths[i];
        
        if (endsWith(filename, '.jpg')) {
          var path = '/' + folder + '/' + filename;
          var outpath =  '/images/s/' + key + '/' + i*10 + '.jpg';

          crop(path, outpath, x - l/2, y - l/2, l, l, next.parallel());  
        }
      }
    },
    function(data, next) {
      callback(null, data);
    }
  ],callback);
}
exports.batchCrop = batch;

var whiteBalance = function(imagePath, croppedPath, callback) {
  fs.readFile(__dirname + imagePath, function(err, src) {
    if (err) {
      callback(err);
    }

    var image = new Canvas.Image;
    image.src = new Buffer(src, 'binary');

    var canvas = new Canvas(image.width, image.height);
    var context = canvas.getContext('2d');

    context.drawImage(image, 0, 0);

    var imageData = context.getImageData(0, 0, image.width, image.height);
    var c = context.getImageData(1, 1, 1, 1).data;
    var white = {
      r: c[0],
      g: c[1],
      b: c[2]
    };

    for(var x = 0; x < image.width; x++) {
      for(var y = 0; y < image.height; y++) {
        var index = (x + y * imageData.width) * 4;

        imageData.data[index+0] = (white.r ? 255/white.r : 1) * imageData.data[index+0];
        imageData.data[index+1] = (white.g ? 255/white.g : 1) * imageData.data[index+1];
        imageData.data[index+2] = (white.b ? 255/white.b : 1) * imageData.data[index+2];
        imageData.data[index+3] = 255;
      }
    }
    context.putImageData(imageData, 0, 0);

    canvas.toBuffer(function(err, buf){
      fs.writeFile(__dirname +  croppedPath, buf, callback); 
    });
  });
};
exports.whiteBalance = whiteBalance;