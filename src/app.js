//The collision code was made my Nathan H Bean at: https://github.com/zombiepaladin/pool


"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');
const Bullet = require('./bullet.js');
const Vector = require('./vector');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
var laserShoot = new Audio("assets/Laser_Shoot.wav");
var asteroidHit = new Audio("assets/Asteroid_Hit.wav");
var playerHit = new Audio("assets/Player_Hit.wav");
var objects = [];
var count = 0;
var playerIndex = 0;
var nextLevelCheck = false;
var lives = 3;
var level = 1;
var score = 0;
var canWarp = "";
var numberOfAsteroids=5;
var GameOver=false;
var Invulnerabletime = 150;
objects.push(player);
createAsteroids(numberOfAsteroids);


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

function startNewLevel(playerIndex){
	numberOfAsteroids+=3;
	createAsteroids(numberOfAsteroids);
	playerObject = objects[playerIndex];
	playerObject.position={x: canvas.width/2, y: canvas.height/2};
	playerObject.velocity={x: 0, y: 0}
	playerObject.invulnerable = true;
	playerObject.invulnerableCounter = Invulnerabletime;
}
function gameOver(){
	GameOver=true;
	
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
	if(GameOver==true)return;
	
	objects.sort(function(a,b){return a.position.x - b.position.x});
	var active = [];
	var potentiallyColliding = [];
	
	nextLevelCheck=true;
	var playerIndex;
	objects.forEach(function(object, index){
		if(object.id=="asteroid")nextLevelCheck=false;
		if(object.id=="player") {
			playerIndex = index;
			if(object.warpCounter<=0)canWarp="Operational";
			else{canWarp="On Cooldown";}
		}
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
	if(nextLevelCheck==true) startNewLevel(playerIndex);
	
	var collisions = [];
	potentiallyColliding.forEach(function(pair){
		var distSquared =
		Math.pow(pair.a.position.x - pair.b.position.x, 2) +
		Math.pow(pair.a.position.y - pair.b.position.y, 2);
		// (15 + 15)^2 = 900 -> sum of two balls' raidius squared
		if(distSquared < Math.pow(pair.a.radius + pair.b.radius,2)) {
			// Push the colliding pair into our collisions array
			collisions.push(pair);
		}
	});
	collisions.forEach(function(pair){
		
		if((pair.a.id=="bullet" || pair.b.id=="bullet") && (pair.a.id=="asteroid" || pair.b.id=="asteroid")){
			score++;
			var bulletObject = (pair.a.id=="bullet")?pair.a:pair.b;
			var asteroidObject = (pair.a.id=="asteroid")?pair.a:pair.b;
			if(asteroidObject.index==0)asteroidObject.index=1;
			var asteroidRadius=asteroidObject.radius;
			if(asteroidRadius>13){
				
				var newRadius = asteroidRadius/2;
				var asteroid = new Asteroid({x: asteroidObject.position.x+newRadius + 1 , y: asteroidObject.position.y}, canvas);
				asteroid.radius=newRadius;
				var asteroid2 = new Asteroid({x: asteroidObject.position.x-newRadius + 1 , y: asteroidObject.position.y}, canvas);
				asteroid2.radius=newRadius;
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
		else if(pair.a.id=="asteroid" && pair.b.id=="asteroid"){
			var collisionNormal = {
				x: pair.a.position.x - pair.b.position.x,
				y: pair.a.position.y - pair.b.position.y
			}
			// calculate the overlap between balls
			var overlap = pair.a.radius+pair.b.radius + 2 - Vector.magnitude(collisionNormal);
			var collisionNormal = Vector.normalize(collisionNormal);
			pair.a.position.x += collisionNormal.x * overlap;
			pair.a.position.y += collisionNormal.y * overlap;
			pair.b.position.x -= collisionNormal.x * overlap;
			pair.b.position.y -= collisionNormal.y * overlap;
			// Rotate the problem space so that the normal
			// of collision lies along the x-axis
			var angle = Math.atan2(collisionNormal.y, collisionNormal.x);
			var a = Vector.rotate(pair.a.velocity, angle);
			var b = Vector.rotate(pair.b.velocity, angle);
			// Solve the collision along the x-axis
			var s = a.x;
			a.x = b.x;
			b.x = s;
			// Rotate the problem space back to world space
			a = Vector.rotate(a, -angle);
			b = Vector.rotate(b, -angle);
			pair.a.velocity.x = a.x;
			pair.a.velocity.y = a.y;
			pair.b.velocity.x = b.x;
			pair.b.velocity.y = b.y;
			
			asteroidHit.play();
		}
		else if((pair.a.id=="player" || pair.b.id=="player") && (pair.a.id=="asteroid" || pair.b.id=="asteroid")){
			
			var playerObject = (pair.a.id=="player")?pair.a:pair.b;
			var asteroidObject = (pair.a.id=="asteroid")?pair.a:pair.b;
			if(playerObject.invulnerable==true)return;
			lives-=1;
			if(lives<1)gameOver();
			playerObject.position={x: canvas.width/2, y: canvas.height/2};
			playerObject.velocity={x: 0, y: 0}
			playerObject.invulnerable = true;
			playerObject.invulnerableCounter = Invulnerabletime;
			playerHit.play();
		}
		

	});
  
  player.update(elapsedTime);
  var objectsToSpliceIndexes = [];
  objects.forEach(function(object, index) {
	  //delete bullet if out of bounds
	  if(object.id=="bullet"){
		  if(object.outOfBounds()){
			  objectsToSpliceIndexes.push(index);
			  return;
		  }
	  }
	  else if(object.id=="player"){
		  playerIndex=index;
	  }
	  object.update(elapsedTime);
  });
 
  var playerObject = objects[playerIndex];
	  if(playerObject.fire==true){
		  objects.push(new Bullet({x: playerObject.position.x, y: playerObject.position.y},{ x:2,y: 2},playerObject.angle + (5*Math.PI/4),canvas));
		  laserShoot.play();
	  }
  objectsToSpliceIndexes.forEach(function(object,index){
	 objects.splice(object,1);
 });
  count=0;
  playerObject.fire=false;

  
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
	
	
	if(GameOver==true){
		ctx.font = "75px Arial";
		ctx.fillText("GAME OVER", 250,250);
		ctx.font = "50px Arial";
		ctx.fillText("REFRESH BROWSER TO RESTART",100,350);
		return;
	}
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);
  objects.forEach(function(object, index) {
	  object.render(elapsedTime,ctx);
  });
  ctx.fillStyle = "red";
	ctx.font = "25px Arial";
	ctx.fillText("Level: " +level, 10,30);
	ctx.fillText("Lives: " +lives, 10,60);
	ctx.fillText("Score: " +score, 10,90);
	ctx.fillText("Warp Drive:" +canWarp, 400,30);
}