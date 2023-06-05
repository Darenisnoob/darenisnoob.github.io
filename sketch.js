let player;
let bullets = [];
let enemies = [];
let enemyImage, playerImage, bulletSound, explosionSound, hitSound, gameOverSound;
let score = 0;
let lives = 3;
let gameStarted = false;
let gameOver = false;
let gameWon = false;
let x = 40
let y = 40
function preload() {
  enemyImage = loadImage("bowser.png");
  playerImage = loadImage("legee.png");
  bulletSound = loadSound("shoot.wav");
  explosionSound = loadSound("explosion.wav");
  hitSound = loadSound("killedinvader.wav");
  gameOverSound = loadSound("gameover.wav");
  castle = loadImage("bowsercasgtle.png");
}

function setup() {
  createCanvas(800, 600);
  player = new Player();
  initializeEnemies();
}

function draw() {
  background(0);

  if (!gameStarted) {
    displayStartScreen();
    return;
  }

  if (gameOver) {
    displayGameOver();
    return;
  }

  player.display();
  player.move();

  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].display();
    bullets[i].move();
    if (bullets[i].y < 0 || bullets[i].y > height) {
      bullets.splice(i, 1);
    } else {
      if (bullets[i].isPlayerBullet) {
        for (let j = enemies.length - 1; j >= 0; j--) {
          if (bullets[i].hits(enemies[j])) {
            bullets.splice(i, 1);
            enemies.splice(j, 1);
            explosionSound.play();
            score += 100;
            if (enemies.length === 0) {
              gameWon = true;
            }
            break;
          }
        }
      } else {
        if (bullets[i].hits(player)) {
          bullets.splice(i, 1);
          loseLife();
        }
      }
    }
  }

  for (let enemy of enemies) {
    enemy.display();
    enemy.move();
    if (enemy.y + enemy.h > height) {
      // Game over
      loseLife();
      break;
    } else if (enemy.hits(player)) {
      // Player hit
      enemies.splice(0, enemies.length);
      loseLife();
      break;
    } else if (random() < 0.001) {
      let enemyBullet = new Bullet(enemy.x + enemy.w / 2, enemy.y + enemy.h, false);
      bullets.push(enemyBullet);
    }
  }

  displayScore();
  displayLives();

  if (gameWon) {
    displayVictory();
  } else if (gameOver) {
    displayGameOver();
  }
}

function displayStartScreen() {
  textAlign(CENTER);
  textSize(32);
  fill(255);
  text("Please Press Enter to Start", width / 2, height / 2);
}

function displayGameOver() {
  textAlign(CENTER);
  textSize(32);
  fill(255);
  text("Game Over", width / 2, height / 2);
  textSize(24);
  text("Please press Enter to Restart", width / 2, height / 2 + 40);
}

function displayScore() {
  textAlign(RIGHT);
  textSize(24);
  fill(255);
  text("Score: " + score, width - 20, 40);
}

function displayLives() {
  textAlign(LEFT);
  textSize(24);
  fill(255);
  text("Lives: " + lives, 20, 40);
}

function keyPressed() {
  if (!gameStarted) {
    if (keyCode === ENTER) {
      if (gameOver || gameWon) {
        restartGame();
      } else {
        gameStarted = true;
      }
    }
  } else {
    if (keyCode === LEFT_ARROW || key === 'a' || key === 'A') {
      player.setDirection(-1);
    } else if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') {
      player.setDirection(1);
    } else if (key === " ") {
      let bullet = new Bullet(player.x, height - 80, true);
      bullets.push(bullet);
      bulletSound.play();
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || key === 'a' || key === 'A' || key === 'd' || key === 'D') {
    player.setDirection(0);
  }
}

function restartGame() {
  lives = 3;
  score = 0;
  initializeEnemies();
  gameStarted = true;
  gameOver = false;
  gameWon = false;
  loop();
}

function loseLife() {
  lives--;
  hitSound.play();
  if (lives === 0) {
    gameOver = true;
    gameStarted = false;
    gameOverSound.play();
    noLoop();
  }
}

function initializeEnemies() {
  enemies = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
      enemies.push(new Enemy(50 + i * 120, 50 + j * 70));
    }
  }
}

function displayVictory() {
  textAlign(CENTER);
  textSize(32);
  fill(255);
  text("Congrats, You won!", width / 2, height / 2);
  textSize(24);
  text("Please Reload the page to Restart", width / 2, height / 2 + 40);
}

class Player {
  constructor() {
    this.x = width / 2;
    this.y = height - 50;
    this.w = 50;
    this.h = 30;
    this.direction = 0;
  }

  display() {
    image(playerImage, this.x, this.y, this.w, this.h);
  }

  move() {
    this.x += this.direction * 5;
    this.x = constrain(this.x, 0, width - this.w);
  }

  setDirection(direction) {
    this.direction = direction;
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 40;
    this.h = 30;
    this.speed = 1;
    this.direction = 1; // Initial direction: right
  }

  display() {
    image(enemyImage, this.x, this.y, this.w, this.h);
  }

  move() {
    this.x += this.speed * this.direction;
    if (this.x + this.w >= width || this.x <= 0) {
      // Change direction when reaching the edge
      this.direction *= -1;
      this.y += 10;
    }
  }

  hits(player) {
    if (
      this.x + this.w > player.x &&
      this.x < player.x + player.w &&
      this.y + this.h > player.y &&
      this.y < player.y + player.h
    ) {
      hitSound.play();
      return true;
    }
    return false;
  }
}

class Bullet {
  constructor(x, y, isPlayerBullet) {
    this.x = x + 20;
    this.y = y;
    this.w = 10;
    this.h = 20;
    this.speed = 5;
    this.isPlayerBullet = isPlayerBullet;
  }

  display() {
    fill(255, 0, 0);
    rect(this.x, this.y, this.w, this.h);
  }

  move() {
    if (this.isPlayerBullet) {
      this.y -= this.speed;
    } else {
      this.y += this.speed;
    }
  }

  hits(target) {
    if (
      this.x + this.w > target.x &&
      this.x < target.x + target.w &&
      this.y + this.h > target.y &&
      this.y < target.y + target.h
    ) {
      hitSound.play();
      return true;
    }
    return false;
  }
}
