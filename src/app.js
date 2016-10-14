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
			if(asteroidRadius>30){
				var newRadius = asteroidRadius/2;
				var asteroid = new Asteroid({x: asteroidObject.position.x+newRadius + 1 , y: asteroidObject.position.y}, canvas);
				asteroid.radius=newRadius+5;
				var asteroid2 = new Asteroid({x: asteroidObject.position.x-newRadius + 1 , y: asteroidObject.position.y}, canvas);
				asteroid2.radius=newRadius+5;
				objects.push(asteroid);
				objects.push(asteroid2);
			}
			objects.splice(bulletObject.index,1);
			objects.splice(asteroidObject.index-1,1);
			
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
		  objects.push(new Bullet({x: playerObject.position.x, y: playerObject.position.y},{ x:2,y: 2},canvas));
	  }
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
