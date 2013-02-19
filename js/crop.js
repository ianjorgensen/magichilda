var cropdata;

var format = function (str, col) {
  col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);

  return str.replace(/\{([^{}]+)\}/gm, function () {
    return col[arguments[1]] === undefined ? arguments[0] : col[arguments[1]];
  });
};

var clickifyImages = function(fn) {
	$('img').click(function() {
    $('#tip').show();
		fn($(this).attr('src'));
	})
};

var loadImageToCanvas = function(src) {
	var canvas = $('#canvas');
	var context = canvas[0].getContext('2d');
  var image = new Image();

  image.onload = function(){
    canvas[0].width = image.width;
    canvas[0].height = image.height;
    
    context.drawImage(image, 0, 0, image.width, image.height);
    whiteBalance(context, image);

    canvas.unbind();
    canvas.mousemove(function(e) { mousemove(e, context, image) });
    canvas.click(function(e) { click(e, context, image) });
  }

  console.log(src);
  image.src = src;  
};

var whiteBalance = function(context, image) {
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

var save = function() {
  

  var data = $('#key').val();
  data = data.trim();
  var r = data.split('\t');


  var info = {
    key: r[0],
    spiking : {
      ldh: r[1],
      bili: r[2],
      hb: r[3]
    },
    actual : {
      'ldh-ukat': r[4],
      ldh: r[5],
      bili: r[6],
      'hb-index': r[7],
      hb: r[8]
    }
  };

  info.data = cropdata;

  console.log('saving data...');
  $.get(window.location.href + '/save?info=' + JSON.stringify(info), function(response) {
    console.log('got save data back', response);
  });
};

var click = function(e, context, image) {
  var x = e.offsetX;
  var y = e.offsetY;
  var c = context.getImageData(x, y, 1, 1).data;

  console.log('click', x, y, 'color: ', c[0], c[1], c[2]);

  if (e.altKey) {
    white = {
      r: c[0],
      g: c[1],
      b: c[2]
    };

    whiteBalance(context, image);
  } else {
    var key = $('#key').val();
    $.get(window.location.href + '/' + key + '?x=' +  x + '&y=' + y, function(response) {

      // array of color and image name.
      cropdata = response;

      $('#cuts').html('');
      setTimeout(function() {
        for(var i in images) {
          if (i == 0) {
            continue;
          }
          $('#cuts').append('<li><img src="/images/s/' + key + '/' + i*10 + '.jpg"></li>');
        }
      }, 300);
    });
  }
};

var crop = function(x,y) {
  var canvas = $('<canvas></canvas>');
  var ctxcut = canvas[0].getContext('2d');

  var sourceWidth = 40;
  var sourceHeight = 40;
  var destWidth = sourceWidth;
  var destHeight = sourceHeight;
  var destX = canvas.width / 2 - destWidth / 2;
  var destY = canvas.height / 2 - destHeight / 2;

  ctxcut.drawImage(img, x - 20, y - 20, sourceWidth, sourceHeight, 0, 0, destWidth, destHeight);

  $('body').append(canvas);
};

var mousemove = function(e, context, image) {
  var x = e.offsetX;
  var y = e.offsetY;
  var c = context.getImageData(e.offsetX, e.offsetY, 1, 1).data;

  pixel = $.color('rgb(' + c[0]+','+c[1]+','+c[2] + ')');

  $('#tip').css({'left':e.clientX + 15 + 'px', 'top':e.clientY + 15 + 'px', 'background': pixel.hex()}).html(c[0]+'<br>'+c[1]+'<br>'+c[2]);

  var radius = 20;

  context.drawImage(image, 0, 0, image.width, image.height);
  whiteBalance(context, image);

  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.lineWidth = 2;
  context.strokeStyle = pixel.hex();
  context.stroke();
};

$(function() {
	clickifyImages(loadImageToCanvas);
});