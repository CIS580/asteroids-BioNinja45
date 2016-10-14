(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');
const Bullet = require('./bullet.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);

var objects = [];
var count = 0;
var playerIndex = 0;
objects.push(player);
createAsteroids(10);

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
	
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

function createAsteroids(total){
	for(i=0;i<total;i++){
		var asteroid = new Asteroid({x: Math.random() *50 + 100*i , y: (i%2==0)?50:500}, canvas);
		objects.push(asteroid);
	}
}
/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
	
	objects.sort(function(a,b){return a.position.x - b.position.x});
	var active = [];
	var potentiallyColliding = [];
	objects.forEach(function(object, index){
		object.color="white";
		object.index=index;
		active = active.filter(function(object2){
			return object.position.x - object2.position.x  < object.radius + object2.radius;
		});
		active.forEach(function(object2, bindex){
			potentiallyColliding.push({a: object2, b: object});
		});
		active.push(object);
	});
	
	var collisions = [];
	potentiallyColliding.forEach(function(pair){
		var distSquared =
		Math.pow(pair.a.position.x - pair.b.position.x, 2) +
		Math.pow(pair.a.position.y - pair.b.position.y, 2);
		// (15 + 15)^2 = 900 -> sum of two balls' raidius squared
		if(distSquared < Math.pow(pair.a.radius + pair.b.radius,2)) {
			// Color the collision pair for visual debugging
			pair.a.color = 'red';
			pair.b.color = 'green';
			// Push the colliding pair into our collisions array
			collisions.push(pair);
		}
	});
	collisions.forEach(function(pair){
		if(pair.a.id=="player"||pair.b.id=="player"){
			pair.a.color="orange";
			pair.b.color="orange";
		}
		else if((pair.a.id=="bullet" || pair.b.id=="bullet") && (pair.a.id=="asteroid" || pair.b.id=="asteroid")){
			var bulletObject = (pair.a.id=="bullet")?pair.a:pair.b;
			var asteroidObject = (pair.a.id=="asteroid")?pair.a:pair.b;
			if(asteroidObject.index==0)asteroidObject.index=1;
			var asteroidRadius=asteroidObject.radius;
			if(asteroidRadius>20){
				var newRadius = asteroidRadius/2;
				var asteroid = new Asteroid({x: asteroidObject.position.x+newRadius + 1 , y: asteroidObject.position.y}, canvas);
				asteroid.radius=newRadius+5;
				var asteroid2 = new Asteroid({x: asteroidObject.position.x-newRadius + 1 , y: asteroidObject.position.y}, canvas);
				asteroid2.radius=newRadius+5;
				objects.push(asteroid);
				objects.push(asteroid2);
			}
			if(pair.a.id=="bullet"){
				objects.splice(bulletObject.index,1);
				objects.splice(asteroidObject.index-1,1);
			}
			else{
				objects.splice(asteroidObject.index,1);
				objects.splice(bulletObject.index-1,1);
			}
			
		}
	});
	if(player.fire==true){
		console.log(player.fire);
	}
  player.update(elapsedTime);
  objects.forEach(function(object, index) {
	  //delete bullet if out of bounds
	  if(object.id=="bullet"){
		  if(object.outOfBounds()){
			  objects.splice(index,1);
			  return;
		  }
	  }
	  else if(object.id=="player"){
		  playerIndex=index;
	  }
	  object.update(elapsedTime);
  });
  
  if(count>5){
	  var playerObject = objects[playerIndex];
	  if(playerObject.fire==true){
		  objects.push(new Bullet({x: playerObject.position.x, y: playerObject.position.y},{ x:2,y: 2},playerObject.angle + (5*Math.PI/4),canvas));
	  }
	  console.log(playerObject.fire);
	  count=0;
	  playerObject.fire=false;
  }
  count++;
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);
  objects.forEach(function(object, index) {
	  object.render(elapsedTime,ctx);
  });
}

},{"./asteroid.js":2,"./bullet.js":3,"./game.js":4,"./player.js":5}],2:[function(require,module,exports){
"use strict";


/**
 * @module exports the Asteroid class
 */
module.exports = exports = Asteroid;

/**
 * @constructor Asteroid
 * Creates a new Asteroid object
 * @param {Postition} position object specifying an x and y
 */
function Asteroid(position, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.position = {
    x: position.x,
    y: position.y
  };
  
  this.velocity = {
    x: Math.random()  * (Math.random() < 0.5 ? -1 : 1),
    y: Math.random()  * (Math.random() < 0.5 ? -1 : 1)
  }
  this.radius = Math.random() * 10 + 35;
  this.color="white";
  this.id="asteroid";
  this.index=0;
}



/**
 * @function updates the Asteroid object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Asteroid.prototype.update = function(time) {
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
}

/**
 * @function renders the Asteroid into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Asteroid.prototype.render = function(time, ctx) {
  ctx.save();

  // Draw Asteroid's ship
  ctx.beginPath();
  ctx.arc(this.position.x,this.position.y,this.radius,0,2*Math.PI);
  ctx.strokeStyle = this.color;
  ctx.stroke();

  ctx.restore();
}

},{}],3:[function(require,module,exports){
"use strict";


/**
 * @module exports the Bullet class
 */
module.exports = exports = Bullet;

/**
 * @constructor Bullet
 * Creates a new Bullet object
 * @param {Postition} position object specifying an x and y
 */
function Bullet(position, velocity, angle, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.position = {
    x: position.x,
    y: position.y
  };
  
  this.velocity = {
    x: velocity.y*Math.sin(angle)-velocity.x * Math.cos(angle),
    y: velocity.y * Math.cos(angle) + velocity.x*Math.sin(angle)
  }
  this.radius = 8;
  this.color="white";
  this.id="bullet";
  this.index=0;
  this.angle = angle;
}



/**
 * @function updates the Bullet object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Bullet.prototype.update = function(time) {
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  
}

Bullet.prototype.outOfBounds = function(){
  if(this.position.x < 0 || this.position.x > this.worldWidth ||
	this.position.y < 0 || this.position.y > this.worldHeight) {
		return true;
	}
	return false;
}

/**
 * @function renders the Bullet into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Bullet.prototype.render = function(time, ctx) {
  ctx.save();

  // Draw Bullet's ship
  ctx.beginPath();
  ctx.arc(this.position.x,this.position.y,this.radius,0,2*Math.PI);
  ctx.strokeStyle = this.color;
  ctx.stroke();

  ctx.restore();
}

},{}],4:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],5:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.id="player";
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.radius  = 12;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;
  this.fire = false;
  this.color="white";
  this.index=0;

  var self = this;
  window.onkeydown = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = true;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = true;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = true;
        break;
	  case ' ':
		self.fire = true;
		break;
    }
  }

  window.onkeyup = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = false;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = false;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = false;
        break;
	  
    }
  }
}



/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
  // Apply angular velocity
  if(this.steerLeft) {
    this.angle += time * 0.005;
  }
  if(this.steerRight) {
    this.angle -= 0.1;
  }
  // Apply acceleration
  if(this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle),
      y: Math.cos(this.angle)
    }
    this.velocity.x -= acceleration.x;
    this.velocity.y -= acceleration.y;
  }
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
  ctx.save();

  // Draw player's ship
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.strokeStyle = this.color;
  ctx.stroke();

  // Draw engine thrust
  if(this.thrusting) {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(5, 10);
    ctx.arc(0, 10, 5, 0, Math.PI, true);
    ctx.closePath();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }
  ctx.restore();
}

},{}]},{},[1]);
