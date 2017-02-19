/*References
1)http://blog.sklambert.com/html5-canvas-game-panning-a-background
2)http://formulas.tutorvista.com/physics/projectile-motion-formula.html
3)http://www.physicsclassroom.com/class/vectors/Lesson-2/Horizontally-Launched-Projectiles-Problem-Solving
*/

var Game = function() {
	this.gameOver = false;
	this.gameWin = false;
	this.gamePause = false;
};

var laserim = 'images/shot.png';

var obstructionHeight = 200;

var TO_RADIANS = Math.PI / 180; // use this to multiply an object to radians
var playerinfo = new ImageInfo(0, 0, 99, 99, 40);

var angleToVector = function(angle){	// Converts angle to vector to be used for velocity
	return [Math.cos(angle), Math.sin(angle)];
};

function ImageInfo(centerX, centerY, width, height, radius, lifespan) {	// gathers info for images so it's easier to reference data
	this.centerX = centerX;
	this.centerY = centerY;
	this.width = width;
	this.height = height;
	this.radius = radius;
}

var Target = function(x1,x2,y) {

	// Set the image for the target
	this.sprite = 'images/Target-Bin.png';
	this.direction = 'right';
	this.x1 = x1;
	this.x2 = x2;

	// Set the enemy position
	this.x = x1 + 20;
	this.y = y;
};

Target.prototype.update = function(dt) {
    this.location();
    this.move(dt);
};

Target.prototype.location = function() {
    if (this.x > this.x2) {
        this.direction = "left";
    } else if ((this.x - 8) < this.x1) {
        this.direction = "right";
    }
};

Target.prototype.move = function(dt) {
    if (this.direction === "left") {
        this.x = this.x - (dt * 30);
    } else if (this.direction === "right") {
        this.x = this.x + (dt * 30);
    }
	return this.x;
};


Target.prototype.render = function(now) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 90, 90);
};


var CannonMuzzle = function(angle,angleV,data){
	this.x = 115;//this is the xcenter of the rotation
	this.y = 337;//this is the ycenter of the rotation
	this.angle = TO_RADIANS * angle;
	this.angleV = TO_RADIANS * angleV;
	this.radius = 30;
	this.targetPosition = data;
	this.score = 0;
};

CannonMuzzle.prototype.render = function(){ // render the player ship 
	ctx.lineWidth = 7;
	ctx.beginPath();
	ctx.moveTo(this.x, this.y);
	ctx.lineTo(this.x + 90 * Math.cos(this.angle), this.y + 90 * Math.sin(this.angle));
	ctx.stroke();
	ctx.closePath();
};

CannonMuzzle.prototype.update = function(){
	if (37 == pressedKey) { // left rotation updated via angular rotation
		//console.log('uu');
		this.angleV += TO_RADIANS * -1;
		pressedKey=0;
	} else if (39 == pressedKey) { // right rotation
		this.angleV += TO_RADIANS * 1;
		pressedKey=0;
	} else {
		this.angleV = 0;
	}
	this.angle += this.angleV; 	// update ang
};


//Ignore the comments, i need it to control my thought process
//I need cannonmuzzle x and y axis and the angle location
CannonMuzzle.prototype.shoot = function(){ 	// Cannon shoots lasers based on of the user input details
	var vangle = this.angle * TO_RADIANS;//ex:angle = 45degree returns pi/4 
	var forwardDir = angleToVector(vangle);//returns an array [cos of that radian(pi/4), sin of that radian(pi/4)] in ex, it returns [-0.25, 0]
	var laserX = this.x + (this.radius) * forwardDir[0];//ex: this.x = 100 and this.radius = 30 returns 92.5
	var laserY = this.y + (this.radius) * forwardDir[1];//ex: this.y = 300 and this.radius = 30 returns 300
	var laser = new Laser(laserX, laserY, vangle, laserim, this.targetPosition); // make the new laser
	lasers.push(laser); // push the laser into an array of lasers to be used for collision detection
};

var lasers = [];
var Laser = function(x, y, angle, image, targetPosition){ // Laser class
	this.sprite = image;
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.velocity = 20;
	this.lives = 3;
	this.targetPosition = targetPosition;
};

Laser.prototype.render = function(){
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.angle * TO_RADIANS);
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	ctx.restore();
};

Laser.prototype.update = function(dt){
	this.vx = this.velocity * Math.cos(TO_RADIANS(this.angle));
	this.vy = this.velocity * Math.sin(TO_RADIANS(this.angle));
	this.x += this.vx*dt;
	this.y += this.vy*dt - 4.9*dt*dt;//0.5*9.8
	this.angle += this.angleV; 

    if (this.y <= obstruction.height) {
		this.lives--; 
		document.getElementsByClassName('lives')[0].innerHTML = 'lives: ' + this.lives;
	} else if(this.x == this.targetPosition){
		cannonMuzzle.score += 10;
		document.getElementsByClassName('Score')[0].innerHTML = 'Score: ' + cannonMuzzle.score;
	}
};

var keysDown = {};
var checkTime = 0;
var pressedKey = 0;

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
	pressedKey = e.keyCode;
	var currentTime = new Date();
	switch(e.keyCode){
		case 37: case 39: case 38:  case 40: // arrow keys
		case 32: e.preventDefault(); break; // space
		default: break; // do not block other keys
	}
	if (e.keyCode == 32) {
		if ((currentTime.getTime() - checkTime) > 200){ //add time delay to prevent spamming
			player.shoot();
			checkTime = currentTime.getTime();
		}
	}
}, false);

//Target instantiation
var target = new Target(400, 500, 250);
var cannonmuzzle = new CannonMuzzle(0,0,target.move);

var game = new Game();
