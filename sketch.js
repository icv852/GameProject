var isStarted;
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;
var contactingPlatform;

var game_score;
var prev_game_score;
var lives;
var level;
var levelMusic;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isJumping;

var jumpSound;
var walkSound;
var collectableSound;
var winSound;
var loseSound;
var hurtSound;
var plummetSound;
var levelOneMusic;

var backgroundColor;
var grassColor;

function preload()
{
	soundFormats('mp3', 'wav');

	jumpSound = loadSound('assets/jump.wav');
	jumpSound.setVolume(0.1);
	walkSound = loadSound('assets/walk.wav');
	walkSound.setVolume(0.1);
	collectableSound = loadSound('assets/collectable.wav');
	collectableSound.setVolume(0.1);
	winSound = loadSound('assets/win.wav');
	winSound.setVolume(0.1);
	loseSound = loadSound('assets/lose.wav');
	loseSound.setVolume(0.1);
	hurtSound = loadSound('assets/hurt.wav');
	hurtSound.setVolume(0.1);
	plummetSound = loadSound('assets/plummet.wav');
	plummetSound.setVolume(0.2);
	levelOneMusic = loadSound('assets/levelOne.mp3');
	levelOneMusic.setVolume(0.1);
	levelTwoMusic = loadSound('assets/levelTwo.mp3');
	levelTwoMusic.setVolume(0.1);
	levelThreeMusic = loadSound('assets/levelThree.mp3');
	levelThreeMusic.setVolume(0.1);
}

function setup()
{
	createCanvas(1024, 576);
	isStarted = false;
	floorPos_y = height * 3/4;
	level = 1;

	// Ask player to press enter or C to start the game
	fill(0);
	textSize(20);
	text('Press Enter to play in normal mode. (4 lives)', 300, height / 3);
	text('Press C to play in cheat mode. (99 lives)', 300, height * 2 / 3);	

	// Print instructions
	text('Left arrow: move left, right arrow: move right, space bar: jump', 200, height * 4 / 5);
}

function draw()
{
if(isStarted)
{
	// Play background music

	if(!levelMusic.isPlaying() && levelMusic.buffer)
	{
		levelMusic.play();
	}

	// Fill the sky

	background(backgroundColor[0], backgroundColor[1], backgroundColor[2]); 

	// Draw snow in level 3

	if(level == 3)
	{
		for(var i = 0; i < snows.length; i++)
		{
			snows[i].draw();
			if(snows[i].checkHitGround())
			{
				snows.splice(i, 1);	

				var snowX = random(0, width);
				var snowSize = random(5, 10);
				var snowAlpha = random(0.1, 1);
				var snowInc = random(0.3, 0.5);		

				snows.push(new Snow(snowX, 0, snowSize, snowAlpha, snowInc));
			}
		}
	}
	
	// Check if player hits bottom

	checkHitBottom();

	// Fill the grass

	noStroke();
	fill(grassColor[0], grassColor[1], grassColor[2]);
	rect(0, floorPos_y, width, height / 4); 

	//PUSH & POP (START)======================================
	push();
	translate(scrollPos, 0);
	//========================================================

	// Draw clouds.

	drawClouds();

	// Draw mountains.

	drawMountains();

	// Draw trees.

	drawTrees();

	// Draw canyons.

	for(var i = 0; i < canyons.length; i++)
	{
		drawCanyon(canyons[i]);
		checkCanyon(canyons[i]);
	}

	// Draw collectable items.

	for(var i = 0; i < collectables.length; i++)
	{
		if(collectables[i].isFound == false)
		{
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
		}
	}

	// Draw platforms.

	for(var i = 0; i < platforms.length; i++)
	{
		drawPlatform(platforms[i]);
	}

	// Check contact to platform.

	checkPlatform();

	// Draw enemies and check if hurts.

	for(var i = 0; i < enemies.length; i++)
	{
		enemies[i].draw();
		enemies[i].checkHurt();
	}

	// Draw and check flagpole.

	renderFlagpole();
	if(flagpole.isReached == false)
	{
		checkFlagpole();
	}

	//PUSH & POP (END)========================================
	pop();
	//========================================================

	// Draw life tokens
	
	drawLifeTokens();

	// Print game score at top-left corner

	fill(153, 0, 153);
	text('Score: ' + game_score, 30, 50);

	// Draw game character.
	
	drawGameChar();
	
	// Show 'Game over'

	if(lives < 1)
	{
		// Stop background music
		levelMusic.stop();

		fill(230, 0, 0);
		text('Game over. Press space to try again.', 350, height / 2);
	}

	// Show 'Level complete'

	if(flagpole.isReached)
	{
		// Stop background music
		levelMusic.stop();

		fill(0, 230, 0);
		if(level < 3)
		{
			text('Level complete. Press space to continue.', 350, height / 2);
		}
		else
		{
			text('Congratulations! You have completed all levels. Press space to play again.', 150, height / 2);
		}
	}


	//----------------------------
	// Game character moving logic
	//----------------------------

	if(!flagpole.isReached && lives > 0)
	{

	// Logic to make the game character move or the background scroll.

	if(isLeft)
	{
		if(gameChar_x > width * 0.3)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.7)
		{
			gameChar_x += 5;
		}
		else
		{
			scrollPos -= 5;
		}
	}

	// Add walking sound.

	if((isLeft || isRight) && (gameChar_y == floorPos_y || contactingPlatform))
	{
		if(!walkSound.isPlaying() && walkSound.buffer)
		{
			walkSound.play();
		}
	}
	else
	{
		walkSound.stop();
	}

	// Logic to make the game character rise and fall.

	if(isJumping == true && (gameChar_y == floorPos_y || contactingPlatform))
	{
		gameChar_y -= 100;		
		if(jumpSound.buffer)
		{
			jumpSound.play();
		}
	}

	if(gameChar_y < floorPos_y && !contactingPlatform)
	{
		gameChar_y += 4;
		isFalling = true;
	}
	else
	{
		isFalling = false;
	}

	if(isPlummeting == true)
	{
		gameChar_y += 10;
	}
	}

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}	
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{	
	if(!isStarted)
	{
		if(keyCode == 13)
		{
			lives = 4;
			isStarted = true;
			startGame();
		}
		else if(keyCode == 67)
		{
			lives = 99;
			isStarted = true;
			startGame();
		}
	}

	if(isStarted)
	{
		if(!flagpole.isReached && lives > 0)
		{
			if(keyCode == 37)
			{
				isLeft = true;
			}
			else if(keyCode == 39)
			{
				isRight = true;
			}
			if(keyCode == 32)
			{
				isJumping = true;
			}
		}

		// Press space bar to enter next level or play again

		if(flagpole.isReached)
		{
			if(keyCode == 32)
			{
				if(level < 3)
				{
					level++;
					prev_game_score = game_score;
					startGame();
				}
				else
				{
					lives = 4;
					level = 1;
					startGame();
				}
			}		
		}

		// Press space bar to try again when game over

		if(lives < 1)
		{
			if(keyCode == 32)
			{
				lives = 4;
				level = 1;
				startGame();
			}
		}
	}
}


function keyReleased()
{

	if(keyCode == 37)
	{
		isLeft = false;
	}
	else if(keyCode == 39)
	{
		isRight = false;
	}
	if(keyCode == 32)
	{
		isJumping = false;
	}

}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	if(isLeft && (isFalling || isPlummeting))
	{
		//render character jumping-left
		stroke(0);
		//body
		fill(153, 76, 0);
		ellipse(gameChar_x, gameChar_y - 30, 37);
		//closed eyes
		strokeWeight(2);
		line(gameChar_x - 14, gameChar_y - 34, gameChar_x - 5, gameChar_y - 37);
		line(gameChar_x - 14, gameChar_y - 34, gameChar_x - 5, gameChar_y - 31);
		strokeWeight(1);	
		//jumping legs
		fill(102, 204, 0);
		ellipse(gameChar_x + 3, gameChar_y - 2, 9, 11);
		ellipse(gameChar_x - 7, gameChar_y - 5, 7, 9);
	}
	else if(isRight && (isFalling || isPlummeting))
	{
		//render character jumping-right
		stroke(0);
		//body
		fill(153, 76, 0);
		ellipse(gameChar_x, gameChar_y - 30, 37);
		//closed eyes
		strokeWeight(2);
		line(gameChar_x + 14, gameChar_y - 34, gameChar_x + 5, gameChar_y - 37);
		line(gameChar_x + 14, gameChar_y - 34, gameChar_x + 5, gameChar_y - 31);
		strokeWeight(1);	
		//jumping legs
		fill(102, 204, 0);
		ellipse(gameChar_x - 3, gameChar_y - 2, 9, 11);
		ellipse(gameChar_x + 7, gameChar_y - 5, 7, 9);
	}
	else if(isLeft && (gameChar_y == floorPos_y || contactingPlatform))
	{
		if(round(millis() / 500) % 2 == 0)
		{
			//render character walking left (ver 1)
			stroke(0);
			//back leg
			fill(102, 204, 0);
			ellipse(gameChar_x + 2, gameChar_y, 15, 6);
			//body
			fill(153 ,76, 0);
			ellipse(gameChar_x, gameChar_y - 18, 37);
			//open eye
			fill(255, 255, 153);
			ellipse(gameChar_x - 9, gameChar_y - 23, 10, 15);
			fill(51,0,102);
			ellipse(gameChar_x - 9, gameChar_y - 23, 6, 10);
			//front leg
			fill(102, 204, 0);
			ellipse(gameChar_x - 9, gameChar_y, 15, 6);
		}
		else if(round(millis() / 500) % 2 == 1)
		{
			//render character walking left (ver 2)
			stroke(0);
			//front leg
			fill(102, 204, 0);
			ellipse(gameChar_x - 9, gameChar_y, 15, 6);
			//body
			fill(153, 76, 0);
			ellipse(gameChar_x, gameChar_y - 18, 37);
			//open eye
			fill(255, 255, 153);
			ellipse(gameChar_x - 9, gameChar_y - 23, 10, 15);
			fill(51, 0, 102);
			ellipse(gameChar_x - 9, gameChar_y - 23, 6, 10);		
			//back leg
			fill(102, 204, 0);
			ellipse(gameChar_x + 2, gameChar_y, 15, 6);
		}	
	}
	else if(isRight && (gameChar_y == floorPos_y || contactingPlatform))
	{
		if(round(millis() / 500) % 2 == 0)
		{
			//render character walking right (ver 1)
			stroke(0);
			//back leg
			fill(102, 204, 0);
			ellipse(gameChar_x - 2, gameChar_y, 15, 6);
			//body
			fill(153, 76, 0);
			ellipse(gameChar_x, gameChar_y - 18, 37);
			//open eye
			fill(255, 255, 153);
			ellipse(gameChar_x + 9, gameChar_y - 23, 10, 15);
			fill(51, 0, 102);
			ellipse(gameChar_x + 9, gameChar_y - 23, 6, 10);
			//front leg
			fill(102, 204, 0);
			ellipse(gameChar_x + 9, gameChar_y, 15, 6);
		}
		else if(round(millis() / 500) % 2 == 1)
		{
			//render character walking right (ver 2)
			stroke(0);
			//front leg
			fill(102, 204, 0);
			ellipse(gameChar_x + 9, gameChar_y, 15, 6);		
			//body
			fill(153, 76, 0);
			ellipse(gameChar_x, gameChar_y - 18, 37);
			//open eye
			fill(255, 255, 153);
			ellipse(gameChar_x + 9, gameChar_y - 23, 10, 15);
			fill(51, 0, 102);
			ellipse(gameChar_x + 9, gameChar_y - 23, 6, 10);
			//back leg
			fill(102, 204, 0);
			ellipse(gameChar_x - 2, gameChar_y, 15, 6);
		}	
	}
	else if(isFalling || isPlummeting)
	{
		//render character jumping facing forwards
		stroke(0);
		//body
		fill(153, 76, 0);
		ellipse(gameChar_x, gameChar_y - 30, 37);
		//closed eyes
		strokeWeight(2);
		line(gameChar_x - 2, gameChar_y - 33, gameChar_x - 11, gameChar_y - 36);
		line(gameChar_x - 2, gameChar_y - 33, gameChar_x - 11, gameChar_y - 30);
		line(gameChar_x + 2, gameChar_y - 33, gameChar_x + 11, gameChar_y - 36);
		line(gameChar_x + 2, gameChar_y - 33, gameChar_x + 11, gameChar_y - 30);
		strokeWeight(1);	
		//jumping legs
		fill(102, 204, 0);
		ellipse(gameChar_x - 6, gameChar_y - 2, 9, 11);
		ellipse(gameChar_x + 6, gameChar_y - 2, 9, 11);
	}
	else
	{
		//render character standing front facing
		stroke(0);
		//body
		fill(153, 76, 0);
		ellipse(gameChar_x, gameChar_y - 18, 37);
		//open eyes
		fill(255, 255, 153);
		ellipse(gameChar_x - 6, gameChar_y - 23, 10, 15);
		ellipse(gameChar_x + 6, gameChar_y - 23, 10, 15);
		fill(51, 0, 102);
		ellipse(gameChar_x - 6, gameChar_y - 23, 6, 10);
		ellipse(gameChar_x + 6, gameChar_y - 23, 6, 10);
		//standing legs
		fill(102, 204, 0);
		ellipse(gameChar_x - 9, gameChar_y, 15, 6);
		ellipse(gameChar_x + 9, gameChar_y, 15, 6);
	}
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.

function drawClouds()
{
	for (var i = 0; i < clouds.length; i++)
	{
		fill(255);
		ellipse(
			clouds[i].x_pos,
			clouds[i].y_pos,
			clouds[i].size
		);
		ellipse(
			clouds[i].x_pos - clouds[i].size * 0.5,
			clouds[i].y_pos,
			clouds[i].size * 0.7
		);
		ellipse(
			clouds[i].x_pos + clouds[i].size * 0.5,
			clouds[i].y_pos, 
			clouds[i].size * 0.7
		);
	}
}

// Function to draw mountains objects.

function drawMountains()
{
	for (var i = 0; i < mountains.length; i++) 
	{
		fill(176, 196, 222);
		triangle(
			mountains[i].x_pos + mountains[i].size, mountains[i].y_pos - mountains[i].size * 1.05, 
			mountains[i].x_pos, mountains[i].y_pos, 
			mountains[i].x_pos + mountains[i].size * 2, mountains[i].y_pos
		);
		fill(119, 136, 153);
		triangle(
			mountains[i].x_pos + mountains[i].size, mountains[i].y_pos - mountains[i].size * 1.05, 
			mountains[i].x_pos + mountains[i].size * 2, mountains[i].y_pos, 
			mountains[i].x_pos + mountains[i].size * 1.65, mountains[i].y_pos
		);
	}
}

// Function to draw trees objects.

function drawTrees()
{
	for (var i = 0; i < trees_x.length; i++)
	{
		//tree trunk
		fill(109, 69, 19);
		rect(trees_x[i], floorPos_y - 102, 40, 102);
		//branches
		fill(34, 139, 34);
		triangle(
			trees_x[i] - 40, floorPos_y - 70, 
			trees_x[i] + 80, floorPos_y - 70, 
			trees_x[i] + 20, floorPos_y - 130
		);
		triangle(
			trees_x[i] - 30, floorPos_y - 100, 
			trees_x[i] + 70, floorPos_y - 100, 
			trees_x[i] + 20, floorPos_y - 140
		);
	}
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
	fill(35);
	rect(t_canyon.x_pos, floorPos_y, t_canyon.width, height - floorPos_y);
	fill(65);
	triangle(
		t_canyon.x_pos, floorPos_y, 
		t_canyon.x_pos, height, 
		t_canyon.x_pos - 8, height
	);
	triangle(
		t_canyon.x_pos + t_canyon.width, floorPos_y, 
		t_canyon.x_pos + t_canyon.width, height, 
		t_canyon.x_pos + t_canyon.width + 8, height
	);
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
	if(gameChar_world_x > t_canyon.x_pos && gameChar_world_x < t_canyon.x_pos + t_canyon.width && gameChar_y >= floorPos_y)
	{
		isPlummeting = true;
	}
}

// ------------------------------------
// Platforms render and check functions
// ------------------------------------

// Function to draw platform

function drawPlatform(t_platform)
{
	fill(255, 0, 255);
	rect(t_platform.x_pos, t_platform.y_pos, t_platform.size, 15);
}

// Function to check character has contacted with a platform.

function checkPlatform()
{
	if(!contactingPlatform)
	{
		for(var i = 0; i < platforms.length; i++)
		{
			if(gameChar_world_x + 15 > platforms[i].x_pos && gameChar_world_x - 15 < platforms[i].x_pos + platforms[i].size)
			{
				if(platforms[i].y_pos - gameChar_y >= 0 && platforms[i].y_pos - gameChar_y < 5)
				{
					contactingPlatform = platforms[i];
				}
			}
		}
	}
	else
	{
		if(!(gameChar_world_x + 15 > contactingPlatform.x_pos && gameChar_world_x - 15 < contactingPlatform.x_pos + contactingPlatform.size) || !(contactingPlatform.y_pos - gameChar_y >= 0 && contactingPlatform.y_pos - gameChar_y < 5))
		{
			contactingPlatform = null;
		}
	}
}

// --------------------------------------------
// Collectable items render and check functions
// --------------------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
	fill(184, 134, 11);
	ellipse(t_collectable.x_pos, t_collectable.y_pos, 20, 40);
	fill(255, 215, 0);
	ellipse(t_collectable.x_pos - 4, t_collectable.y_pos, 20, 40);
	fill(184, 134, 11);
	rect(t_collectable.x_pos - 5, t_collectable.y_pos - 10, 4, 20);
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
	if(dist(gameChar_world_x, gameChar_y - 20, t_collectable.x_pos - 3, t_collectable.y_pos) < 35)
	{
		t_collectable.isFound = true;
		game_score ++;
		if(collectableSound.buffer)
		{
			collectableSound.play();
		}
	}
}

// ----------------------------------
// Flagpole render and check functions
// ----------------------------------

// Function to render flagpole

function renderFlagpole()
{
	if(flagpole.isReached == false)
	{
		noStroke;
		fill(70);
		rect(flagpole.x_pos, flagpole.y_pos - 100, 3, 100);
		fill(220, 220, 0);
		rect(flagpole.x_pos + 3, flagpole.y_pos - 40, 50, 35);
	}
	else
	{
		noStroke;
		fill(70);
		rect(flagpole.x_pos, flagpole.y_pos - 100, 3, 100);
		fill(220, 220, 0);
		rect(flagpole.x_pos + 3, flagpole.y_pos - 100, 50, 35);
	}
}

// Function to check character has reach the flagpole.

function checkFlagpole()
{
	if(dist(gameChar_world_x, gameChar_y, flagpole.x_pos, flagpole.y_pos) < 20)
	{
		flagpole.isReached = true;
		if(winSound.buffer)
		{
			winSound.play();
		}
	}
}

// ----------------------------------
// Enemy render and check functions
// ----------------------------------

function Enemy(x, y, range)
{
	this.x = x;
	this.y = y;
	this.range = range;

	this.currentX = x;
	this.inc = 1;

	this.update = function()
	{
		this.currentX += this.inc;

		if(this.currentX >= this.x + this.range)
			{
				this.inc = -1;
			}
		else if(this.currentX < this.x)
			{
				this.inc = 1;
			}
	};
	
	this.draw = function()
	{
		if(lives > 0)
		{
			this.update();
		}

		stroke(0);
		fill(180);
		triangle(
			this.currentX, this.y - 26,
			this.currentX - 5, this.y - 10,
			this.currentX + 5, this.y - 10
		);
		triangle( 
			this.currentX - 24, this.y - 6,
			this.currentX - 5, this.y - 1,
			this.currentX - 5, this.y - 11
		);
		triangle(
			this.currentX + 24, this.y - 6,
			this.currentX + 5, this.y - 1,
			this.currentX + 5, this.y - 11
		);
		triangle(
			this.currentX - 16, this.y - 20,
			this.currentX - 8, this.y - 6,
			this.currentX - 2, this.y - 12
		);
		triangle(
			this.currentX + 16, this.y - 20,
			this.currentX + 8, this.y - 6,
			this.currentX + 2, this.y - 12
		);
		fill(80);
		arc(this.currentX, this.y, 35, 35, PI, 2*PI);
		noStroke();
	};

	this.checkHurt = function()
	{
		if(dist(gameChar_world_x, gameChar_y, this.currentX, this.y) < 35)
		{
			background('rgba(255, 0, 0, 0.5)');
			lives --;
			if(lives > 0)
			{
				if(hurtSound.buffer)
				{
					hurtSound.play();
				}
				startGame();
			}
			else
			{
				gameChar_y = gameChar_y + 9999;
				if(loseSound.buffer)
				{
					loseSound.play();
				}
			}
		}
	};
}

//--------------------------------
// Snow render and check functions
//--------------------------------

function Snow(x, y, size, alpha, inc)
{
	this.x = x;
	this.y = y;
	this.size = size;
	this.alpha = alpha;
	this.inc = inc;

	this.currentY = y;
	
	this.update = function()
	{
		this.currentY += this.inc;
	}

	this.draw = function()
	{
		this.update();

		noStroke;
		fill('rgba(255, 255, 255, ' + this.alpha + ')');

		ellipse(this.x, this.currentY, this.size);
	}

	this.checkHitGround = function()
	{
		if(this.currentY > floorPos_y)
		{
			return true;
		}
	}
}



//Function to check player hits bottom.

function checkHitBottom()
{
	if(gameChar_y > height - 13 && gameChar_y < height)
	{
		lives --;
		if(lives > 0)
		{
			if(plummetSound.buffer)
			{
				plummetSound.play();
			}
			startGame();
		}
		else
		{
			gameChar_y = gameChar_y + 999;
			if(loseSound.buffer)
			{
				loseSound.play();
			}
		}
	}
}

//Function to draw life tokens

function drawLifeTokens()
{
	var lifeTokenPos_x = width * 9/11;
	var lifeTokenPos_y = 80;

	//Print 'Lives:' texts
	fill(153, 0, 153);
	textSize(20);
	text('Lives:', lifeTokenPos_x - 90, lifeTokenPos_y - 20);
	
	//Draw life tokens
	for(var i = 0; i < lives; i++)
	{
		//body
		stroke(0);
		fill(153,76,0);
		ellipse(lifeTokenPos_x + i * 50, lifeTokenPos_y - 30, 37);
		//closed eye
		strokeWeight(2);
		line(lifeTokenPos_x + i * 50 - 2, lifeTokenPos_y - 33, lifeTokenPos_x + i * 50 - 11, lifeTokenPos_y - 36);
		line(lifeTokenPos_x + i * 50 - 2, lifeTokenPos_y - 33, lifeTokenPos_x + i * 50 - 11, lifeTokenPos_y - 30);
		//open eye
		strokeWeight(1);
		fill(255,255,153);
		ellipse(lifeTokenPos_x + i * 50 + 7, lifeTokenPos_y - 33, 10, 15);
		fill(51,0,102);
		ellipse(lifeTokenPos_x + i * 50 + 7, lifeTokenPos_y - 33, 6, 10);

		noStroke();
		strokeWeight(1);
	}
}

//Function to start new game

function startGame()
{
	if(level == 1)
	{
	levelMusic = levelOneMusic;
	gameChar_x = width / 2;
	gameChar_y = floorPos_y;
	game_score = 0;

	backgroundColor = [153, 204, 255];
	grassColor = [0, 200, 0];

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	isJumping = false;

	// Initialise arrays of scenery objects.
	trees_x = [400, 600, 1000, 1150, 1400, 1900, 2250, 3150];
	clouds = [
		{x_pos: 100, y_pos: 200, size: 70},
		{x_pos: 600, y_pos: 100, size: 80},
		{x_pos: 800, y_pos: 150, size: 76},
		{x_pos: 1000, y_pos: 210, size: 95},
		{x_pos: 1350, y_pos: 150, size: 68},
		{x_pos: 1700, y_pos: 110, size: 75},
		{x_pos: 2000, y_pos: 80, size: 82},
		{x_pos: 2300, y_pos: 72, size: 68},
		{x_pos: 2500, y_pos: 89, size: 75},
		{x_pos: 2800, y_pos: 76, size: 86},
		{x_pos: 3100, y_pos: 100, size: 80},
	];
	mountains = [
		{x_pos: 20, y_pos: floorPos_y, size: 250},
		{x_pos: 450, y_pos: floorPos_y, size: 160},
		{x_pos: 950, y_pos: floorPos_y, size: 200},
		{x_pos: 1600, y_pos: floorPos_y, size: 270},
	];
	
	canyons = [
		{x_pos: -3000, width: 2000},
		{x_pos: 865, width: 60},
		{x_pos: 1065, width: 60},
		{x_pos: 1800, width: 60},
		{x_pos: 2100, width: 60},
		{x_pos: 2400, width: 200},
		{x_pos: 2700, width: 200},
		{x_pos: 4000, width: 2000},
	];
	collectables = [
		{x_pos: 600, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 650, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 700, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 750, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 800, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 900, y_pos: floorPos_y - 80, isFound: false},
		{x_pos: 1000, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1100, y_pos: floorPos_y - 80, isFound: false},
		{x_pos: 1200, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1250, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1395, y_pos: floorPos_y - 80, isFound: false},
		{x_pos: 1750, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1840, y_pos: floorPos_y - 80, isFound: false},
		{x_pos: 1900, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1975, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 2050, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 2140, y_pos: floorPos_y - 80, isFound: false},
		{x_pos: 2200, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 2300, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 2440, y_pos: floorPos_y - 80, isFound: false},
		{x_pos: 2500, y_pos: floorPos_y - 80, isFound: false},
		{x_pos: 2560, y_pos: floorPos_y - 80, isFound: false},
		{x_pos: 2740, y_pos: floorPos_y - 80, isFound: false},
		{x_pos: 2800, y_pos: floorPos_y - 80, isFound: false},
		{x_pos: 2860, y_pos: floorPos_y - 80, isFound: false},
	];
	platforms = [
		{x_pos: 1350, y_pos: floorPos_y - 60, size: 80},
		{x_pos: 1500, y_pos: floorPos_y - 60, size: 80},
		{x_pos: 2400, y_pos: floorPos_y - 60, size: 200},
		{x_pos: 2700, y_pos: floorPos_y - 60, size: 200},
	];
	flagpole = {
		x_pos: 3000,
		y_pos: floorPos_y,
		isReached: false
	};
	enemies = [];
	enemies.push(new Enemy(1515, floorPos_y - 60, 48));
	enemies.push(new Enemy(2620, floorPos_y, 60));
	}

	else if(level == 2)
	{
	levelMusic = levelTwoMusic;
	gameChar_x = width / 2;
	gameChar_y = floorPos_y;
	game_score = prev_game_score;

	backgroundColor = [255, 153, 51];
	grassColor = [255, 255, 102];

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	isJumping = false;

	// Initialise arrays of scenery objects.
	trees_x = [170, 300, 550, 1000, 1200, 1800, 3000];
	clouds = [
		{x_pos: 100, y_pos: 100, size: 80},
		{x_pos: 600, y_pos: 170, size: 82},
		{x_pos: 800, y_pos: 130, size: 70},
		{x_pos: 1000, y_pos: 210, size: 73},
		{x_pos: 1350, y_pos: 150, size: 87},
		{x_pos: 1700, y_pos: 110, size: 72},
		{x_pos: 2000, y_pos: 90, size: 75},
		{x_pos: 2400, y_pos: 72, size: 95},
		{x_pos: 3250, y_pos: 89, size: 72}
	];
	mountains = [
		{x_pos: 10, y_pos: floorPos_y, size: 180},
		{x_pos: 340, y_pos: floorPos_y, size: 200},
		{x_pos: 950, y_pos: floorPos_y, size: 140},
		{x_pos: 1600, y_pos: floorPos_y, size: 270},
	];
	canyons = [
		{x_pos: -3000, width: 2000},
		{x_pos: 800, width: 60},
		{x_pos: 1300, width: 60},
		{x_pos: 2200, width: 620},
		{x_pos: 3200, width: 2000},
	];
	collectables = [
		{x_pos: 900, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 950, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1000, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1050, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1100, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1150, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1200, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1250, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1540, y_pos: floorPos_y - 75, isFound: false},
		{x_pos: 1640, y_pos: floorPos_y - 125, isFound: false},
		{x_pos: 1740, y_pos: floorPos_y - 175, isFound: false},
		{x_pos: 1840, y_pos: floorPos_y - 225, isFound: false},
		{x_pos: 1940, y_pos: floorPos_y - 175, isFound: false},
		{x_pos: 2040, y_pos: floorPos_y - 125, isFound: false},
		{x_pos: 2140, y_pos: floorPos_y - 75, isFound: false},
		{x_pos: 2900, y_pos: floorPos_y - 320, isFound: false},
		{x_pos: 2950, y_pos: floorPos_y - 320, isFound: false},
		{x_pos: 3000, y_pos: floorPos_y - 320, isFound: false},
		{x_pos: 3050, y_pos: floorPos_y - 320, isFound: false},
		{x_pos: 3100, y_pos: floorPos_y - 320, isFound: false},
		{x_pos: 3150, y_pos: floorPos_y - 320, isFound: false},
	];
	platforms = [
		{x_pos: 1500, y_pos: floorPos_y - 50, size: 80},
		{x_pos: 1600, y_pos: floorPos_y - 100, size: 80},
		{x_pos: 1700, y_pos: floorPos_y - 150, size: 80},
		{x_pos: 1800, y_pos: floorPos_y - 200, size: 80},
		{x_pos: 1900, y_pos: floorPos_y - 150, size: 80},
		{x_pos: 2000, y_pos: floorPos_y - 100, size: 80},
		{x_pos: 2100, y_pos: floorPos_y - 50, size: 80},
		{x_pos: 2200, y_pos: floorPos_y - 100, size: 80},
		{x_pos: 2300, y_pos: floorPos_y - 150, size: 80},
		{x_pos: 2400, y_pos: floorPos_y - 200, size: 80},
		{x_pos: 2500, y_pos: floorPos_y - 250, size: 80},
		{x_pos: 2600, y_pos: floorPos_y - 300, size: 580},
		{x_pos: 3100, y_pos: floorPos_y - 75, size: 80},
		{x_pos: 3100, y_pos: floorPos_y - 150, size: 80},
		{x_pos: 3100, y_pos: floorPos_y - 225, size: 80},
	];
	flagpole = {
		x_pos: 2800,
		y_pos: floorPos_y - 300,
		isReached: false
	};
	enemies = [];
	enemies.push(new Enemy(610, floorPos_y, 50));
	enemies.push(new Enemy(1550, floorPos_y, 150));
	enemies.push(new Enemy(1750, floorPos_y, 150));
	enemies.push(new Enemy(1950, floorPos_y, 150));
	enemies.push(new Enemy(2620, floorPos_y - 300, 60));
	enemies.push(new Enemy(2700, floorPos_y - 300, 60));
	}

	else if(level == 3)
	{
	levelMusic = levelThreeMusic;
	gameChar_x = width / 2;
	gameChar_y = floorPos_y;
	game_score = prev_game_score;

	backgroundColor = [0, 0, 0];
	grassColor = [255, 255, 255];

	// Draw snow.
	snows = [];

	for(var i = 0; i < 15; i++)
	{
		var snowX = random(0, width);
		var snowY = random(0, floorPos_y);
		var snowSize = random(5, 10);
		var snowAlpha = random(0.1, 1);
		var snowInc = random(0.2, 0.5);

		snows.push(new Snow(snowX, snowY, snowSize, snowAlpha, snowInc));
	}

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	isJumping = false;

	// Initialise arrays of scenery objects.
	trees_x = [-200, 1200];
	clouds = [];
	mountains = [];
	
	canyons = [
		{x_pos: -3000, width: 2000},
		{x_pos: 160, width: 270},
		{x_pos: 1280, width: 9999},
	];
	collectables = [
		{x_pos: -80, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: -30, y_pos: floorPos_y - 20, isFound: false},
		{x_pos: 1340, y_pos: floorPos_y - 57 - 20, isFound: false},
		{x_pos: 1300, y_pos: floorPos_y - 57 * 2 - 35, isFound: false},
		{x_pos: 1940, y_pos: floorPos_y - 57 * 4 - 20, isFound: false},
		{x_pos: 1900, y_pos: floorPos_y - 57 * 5 - 30, isFound: false},
		{x_pos: 2540, y_pos: floorPos_y - 57 * 7 - 20, isFound: false}
	];
	//highest invisible floor collectables
	for(var i = 160; i < 2501; i = i + 50)
	{
		collectables.push({x_pos: i, y_pos: floorPos_y - 57 * 8 - 40, isFound: false});
	}

	platforms = [
		{x_pos: 1300, y_pos: floorPos_y - 57, size: 80},
		{x_pos: 1300, y_pos: floorPos_y - 57 * 2, size: 80},
		{x_pos: 1400, y_pos: floorPos_y - 57 * 3, size: 480},
		{x_pos: 1900, y_pos: floorPos_y - 57 * 4, size: 80},
		{x_pos: 1900, y_pos: floorPos_y - 57 * 5, size: 80},
		{x_pos: 2000, y_pos: floorPos_y - 57 * 6, size: 480},
		{x_pos: 2500, y_pos: floorPos_y - 57 * 7, size: 80},
		//highest invisible floor
		{x_pos: 160, y_pos: floorPos_y - 57 * 8, size: 9999},
	];
	flagpole = {
		x_pos: 80,
		y_pos: floorPos_y,
		isReached: false
	};
	enemies = [];
	enemies.push(new Enemy(1630, floorPos_y - 57 * 3, 20));
	enemies.push(new Enemy(2110, floorPos_y - 57 * 6, 20));
	enemies.push(new Enemy(2360, floorPos_y - 57 * 6, 20));
	}
}
