var context = new webkitAudioContext();
var particleCount = 4;
var W, H, ctx, p,
  canvas, shouldSpawn = false,
  particles = [];

 var throttledSpawning =  _.throttle(function () {
    particleCount++;
    shouldSpawn = true;
 }, 2000);

function processAudio(e) {
  var buffer = e.inputBuffer.getChannelData(0);
  var out = e.outputBuffer.getChannelData(0);
  var amp = 0;
  var type = "midtone";
  // Iterate through buffer to get max amplitude
  for (var i = 0; i < buffer.length; i++) {
    var loud = Math.abs(buffer[i]);
    if(loud > amp) {
      amp = loud;
    }
    // write input samples to output unchanged
    out[i] = buffer[i];
  }
  if (amp != 0) {

    if ( amp < .1) {
      // console.log("0 to .1");
    }
    else if ( amp < .2) {
      // console.log(".1 to .2");
    } else if ( amp < .3) {
      // console.log(".2 to .3");
    } else if ( amp < .4) {
      // console.log(".3 to .4");
    } else if ( amp < .5) {
      type = "bass";
      // console.log(".4 to .5");
    } else if ( amp < .6) {
      // console.log(".5 to .6");
    } else if ( amp < .7) {
      type = "midtone";
      // console.log(".6 to .7");
    } else if ( amp < .8) {
      // console.log(".7 to .8");
    } else if ( amp < .9) {
      type = "highhat";
      // console.log(".8 to .9");
    } else if ( amp < 1) {
      // console.log(".9 to 1");
    } else if ( amp < 1.1) {
      // console.log("amplitude is more than 1?");
    }
    if (type ==="bass") {
      particleCount++
      shouldSpawn = true;
      animateParticles(type);
    }
    else {
      animateParticles(type);
      throttledSpawning(type);
    }
  }

  shouldSpawn = false;
}

window.addEventListener('load',function() {

  // Add an audio element
  var audio = document.createElement('video');
  audio.src = 'sandcastles.mp3';
  audio.controls = true;
  audio.preload = 'auto';
  document.body.appendChild(audio);

  audio.addEventListener('canplaythrough',function() {
    var node = context.createMediaElementSource(audio);
    var processor = context.createJavaScriptNode(2048,1,1);
    processor.onaudioprocess = processAudio;
    node.connect(processor);
    processor.connect(context.destination);
    audio.play();
    startParticles();
    var mousedown = false;
    canvas.addEventListener('mousedown', function(e) {
      mousedown = true;
      var x = Math.floor(e.pageX);
      var y = Math.floor(e.pageY);
      for (var i =0; i< particles.length; i++) {
        var width = particles[i].radius;
        var particleX = Math.floor(particles[i].x);
        var particleY = Math.floor(particles[i].y) + 30;
        if ((particleX + width >= x  || x <= particleX - width) && (particleY + width <= y || y >= particleY - width)) {
          selectItem(particles[i])
         }
      }
    }, true);

    canvas.addEventListener('mouseup', function (e) {
      mousedown = false;
      var toRemove = _.where(particles, {'selected': true});
      for (var i=0; i<toRemove.length; i++) {
        // particles.splice()
      }
      console.log(toRemove)
      // particles.splice()
    })

    canvas.addEventListener('mousemove', function(e) {
      if (mousedown) {
        var x = Math.floor(e.pageX);
        var y = Math.floor(e.pageY);
        for (var i =0; i< particles.length; i++) {
          var width = particles[i].radius;
          var particleX = Math.floor(particles[i].x);
          var particleY = Math.floor(particles[i].y) + 30;
          if ((particleX + width >= x  || x <= particleX - width) && (particleY + width <= y || y >= particleY - width)) {
            selectItem(particles[i])
           }
        }
      }
    }, true);
  });
});

function startParticles () {

  W = window.innerWidth * .9;
  H = window.innerHeight * .9;
  canvas = document.getElementById('canvas');//this "get(0) will pull the underlying non-jquery wrapped dom element from our selection
  canvas.width = W;
  canvas.height = H;
  ctx = canvas.getContext("2d");// settng the context to 2d rather than the 3d WEBGL

  initParticleSystem();
}
//Setup particle class
function Particle(type){
  this.x = Math.random() > .5 ? W: 0;
  this.y = Math.random() * H;
  this.direction ={"x": -1 + Math.random()*2, "y": -1 + Math.random()*2};
  this.vx = 2 * Math.random() + 4 ;
  this.vy = 2 * Math.random() + 4;
  this.radius = 15 * Math.random() + 10;
  this.type = type || "midtone";
  this.selected = false;
  this.move = function(){
    this.x += this.vx * this.direction.x;
    this.y += this.vy * this.direction.y;
  };
  this.changeDirection = function(axis){
    this.direction[axis] *= -1;
  };
  this.draw = function() {
    ctx.beginPath();
    ctx.fillStyle = type === "midtone" ? "red": type === "bass" ? "blue": "green";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    if (this.selected) {
      this.select();
    }
    ctx.fill();
  };
  this.select = function() {
    this.selected = true;
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
    ctx.fill();
  }
  this.boundaryCheck = function(){
    if(this.x >= W){
      this.x = W;
      this.changeDirection("x");
    }
    else if(this.x <= 0){
      this.x = 0;
      this.changeDirection("x");
    }
    if(this.y >= H){
      this.y = H;
      this.changeDirection("y");
    }
    else if(this.y <= 0){
      this.y = 0;
      this.changeDirection("y");
    }
  };
} //end particle class

function clearCanvas(){
  ctx && ctx.clearRect(0,0, W, H);
} //end clear canvas

function createParticles(type) {
    p = new Particle(type);
    particles.push(p);
}// end createParticles

function drawParticles(){
  for (var i = particleCount-1; i >= 0; i--){
    p = particles[i];
    if (p) {
      p.draw();
    }
  }
} //end drawParticles

function selectItem(particle) {
  particle.select();
}

function updateParticles(){
  for(var i = particles.length - 1; i >=0; i--){
    p = particles[i];
    p.move();
    p.boundaryCheck();
  }
}//end updateParticles

function initParticleSystem(){
  createParticles();
  drawParticles();
}

function animateParticles(type){
  clearCanvas();
  if(shouldSpawn) {
    createParticles(type);
  }
  drawParticles();
  updateParticles();
}

