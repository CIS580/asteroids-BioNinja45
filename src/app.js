"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);

var asteroids = [];
createAsteroids(10);
console.log(asteroids.length);

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
	console.log("okay");
	for(i=0;i<total;i++){
		var asteroid = new Asteroid({x: Math.random() * i*50 , y: Math.random() * i*50}, canvas);
		asteroids.push(asteroid);
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
	
	asteroids.sort(function(a,b){return a.position.x - b.position.x});
	var active = [];
	var potentiallyColliding = [];
	asteroids.forEach(function(asteroid, aindex){
		asteroid.color="white";
		active = active.filter(function(asteroid2){
			return asteroid.position.x - asteroid2.position.x  < asteroid.radius + asteroid2.radius;
		});
		active.forEach(function(asteroid2, bindex){
			potentiallyColliding.push({a: asteroid2, b: asteroid});
		});
		active.push(asteroid);
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
	
  player.update(elapsedTime);
  asteroids.forEach(function(asteroid, index) {
	  asteroid.update(elapsedTime);
  });
  
  // TODO: Update the game objects
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
  asteroids.forEach(function(asteroid, index) {
	  asteroid.render(elapsedTime,ctx);
  });
}
