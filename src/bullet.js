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
function Bullet(position, velocity, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.position = {
    x: position.x,
    y: position.y
  };
  
  this.velocity = {
    x: velocity.x,
    y: velocity.y
  }
  this.radius = 8;
  this.color="white";
  this.id="bullet";
  this.index=0;
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