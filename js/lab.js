var pallete = function(context, image, xx, yy, _w, n) {
  var imageData = context.getImageData(0, 0, image.width, image.height);
  var arr = [];

  for(var x = 0; x < image.width; x++) {
    for(var y = 0; y < image.height; y++) {
      if ((x >= xx && x <= (xx + _w)) && (y >= yy && y <= (yy  + _w))) {
        var index = (x + y * imageData.width) * 4;  
        console.log(1); 
        arr.push([imageData.data[index+0], imageData.data[index+1], imageData.data[index+2]]);
      }
    }  
  }

  return quantize(arr, n).palette();
};

var getPixelColor = function(context, image, _x, _y) {
  var imageData = context.getImageData(0, 0, image.width, image.height);

  for(var x = 0; x < image.width; x++) {
    for(var y = 0; y < image.height; y++) {
      if (x == Math.round(_x) && y == Math.round(_y)) {
        var index = (x + y * imageData.width) * 4;  
        return {
          r:imageData.data[index+0],
          g:imageData.data[index+1],
          b:imageData.data[index+2]
        }
      }
    }  
  }
};

var whiteBalance = function(context, image, white) {
  if(typeof white === 'undefined') {
    return;
  }

  var imageData = context.getImageData(0, 0, image.width, image.height);

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
};