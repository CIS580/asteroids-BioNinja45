"use strict";

const MS_PER_FRAME = 1000/25;

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
  this.tick=0;
  this.invulnerable = false;
  this.invulnerableCounter = 0;
  this.warpCounter = 0;

  var self = this;
  window.onkeydown = function(event) {
	  console.log(event.key);
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
	  case 'r':
		if(self.warpCounter<=0){
			
			self.invulnerable=true;
			self.invulnerableCounter=150;
			self.warpCounter=1000;
			self.position={x: Math.random() *self.worldWidth, y: Math.random() *self.worldHeight};
		}
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
	this.warpCounter--;
	if(this.invulnerableCounter>0){
		this.invulnerableCounter--;
		this.color="green";
	}
	else{
		this.invulnerable=false;
		this.color="white";
	}
	if(this.tick > 0 && this.tick<20){
		this.fire=false;
		this.tick++;
	}
	else if(this.tick>=20 && this.fire==true)
	{		
		this.tick=0;
	}
	else if(this.tick==0){
		this.tick++;
	}
	
  // Apply angular velocity
  if(this.steerLeft) {
    this.angle += time * 0.003;
  }
  if(this.steerRight) {
    this.angle -= time * 0.003;
  }
  // Apply acceleration
  if(this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle),
      y: Math.cos(this.angle)
    }
    this.velocity.x -= acceleration.x/20;
    this.velocity.y -= acceleration.y/20;
  }
  if(this.velocity.x > 6)this.velocity.x=6;
  if(this.velocity.x < -6)this.velocity.x=-6;
  if(this.velocity.y > 6)this.velocity.y=6;
  if(this.velocity.y < -6)this.velocity.y=-6;
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
