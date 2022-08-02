class Sun {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Enemy {
  constructor ([x,y], style, speed) {
    this.x = x;
    this.y = y;
    this.style = style;
    this.speed = speed;
    this.tactic = this.chasePlayer;
  }

  checkPos() {
    if (this.y < screenLimit.height[0]) {
      this.y = screenLimit.height[0] + 1;
    }
    if (this.x < screenLimit.width[0]) {
      this.x = screenLimit.width[0] + 1;
    }
  
    if (this.y > screenLimit.height[1]) {
      this.y = screenLimit.height[1] - 1;
    }
    if (this.x > screenLimit.width[1]) {
      this.x = screenLimit.width[1] - 1;
    }
  }

  chasePlayer() {
    let dirsPref = {
      'up': this.y - player.y,
      'down': player.y - this.y,
      'left': this.x - player.x,
      'right': player.x - this.x,
    }

    let preferredNewDir;
    let minNum = -1000;
    for (let dir in dirsPref) {
      if (minNum < dirsPref[dir]) {
        minNum = dirsPref[dir];
        preferredNewDir = dir;
      }
    }
    this.displace(preferredNewDir);
  }

  flank() {
    let dirsPref = {
      'left': this.x - player.x,
      'right': player.x - this.x,
    }

    let preferredNewDir;
    let minNum = -1000;
    for (let dir in dirsPref) {
      if (minNum < dirsPref[dir]) {
        minNum = dirsPref[dir];
        preferredNewDir = dir;
      }
    }
    this.displace(preferredNewDir);
  }


  displace(direction) {
    if (direction === 'up') { this.y = this.y - this.speed}
    if (direction === 'down') { this.y = this.y + this.speed}
    if (direction === 'left') { this.x = this.x - this.speed}
    if (direction === 'right') { this.x = this.x + this.speed}
  }

  move() {
    let newRandomNum345 = getRandomNum(10);
    if (newRandomNum345 % 3 === 0) {
      this.chasePlayer();
    } else {
      this.flank();
    }
    this.checkPos();
  }

  update = function(dt) {
    this.move()
  };
}



class Player {
  constructor([x, y], lives, speed) {
    this.x = x;
    this.y = y;
    this.lives = lives;
    this.speed = speed;
    this.directions = [];
  }

  checkPos() {
    if (this.y < screenLimit.height[0]) {
      this.y = screenLimit.height[0] + 1;
      return false;
    }
    if (this.x < screenLimit.width[0]) {
      this.x = screenLimit.width[0] + 1;
      return false;
    }
  
    if (this.y > screenLimit.height[1]) {
      this.y = screenLimit.height[1] - 1;
      return false;
    }
    if (this.x > screenLimit.width[1]) {
      this.x = screenLimit.width[1] - 1;
      return false;
    }
    return true;
  }

  update() {
    checkLoss()
    checkWin()
    this.displace();
  }

  handleInput(direction) {
    this.directionHandler(direction);
  }

  directionHandler(direction) {
    const opposites = {
      'up': 'down',
      'down': 'up',
      'left': 'right',
      'right': 'left'
    }

    if (direction === undefined) {
      this.directions = [];
    } else {
      this.directions = this.directions.filter(dir => dir !== opposites[direction])
      if (!this.directions.includes(direction)) {
        this.directions.push(direction);
      }
    }
  }

  displace() {
    if (this.checkPos()) {
      if (this.directions.includes('up')) { this.y = this.y - this.speed}
      if (this.directions.includes('down')) { this.y = this.y + this.speed}
      if (this.directions.includes('left')) { this.x = this.x - this.speed}
      if (this.directions.includes('right')) { this.x = this.x + this.speed}
    }
  }
  
}


function getRandomNum(max) {
  return Math.floor(Math.random() * max);
}

const html = {
  score: document.getElementById('score'),
  lives: document.getElementById('lives')
}

let level = 0;

const PlayerProps = {
  speed: 5,
  lives: 4,
  startingPos: [450, 450],
}


function createEnemyProps(howMany) {

  let enemyProps = [];
  for (let i = 0; i < howMany; i++) {
    enemyProps.push({
      coords: [getRandomNum(800), getRandomNum(100)],
      image: `enemy${i}`,
      pace: getRandomNum(3)
    })
  }

  return enemyProps;
}

let allEnemies = [];

function initEnemies(props) {
  
  for (let enemy of props) {
    allEnemies.push(new Enemy(enemy.coords, enemy.image, enemy.pace))
  }
}

const screenLimit = {
  width: [0, 800],
  height: [0, 450],
}

const sun = new Sun(400, 10);
const player = new Player(PlayerProps.startingPos, PlayerProps.lives, PlayerProps.speed);

html.lives.innerHTML = `Lives: ${player.lives}`


function newLevel() {
  level++
  resetEnemyLocations()
  alert(`level ${level}.`)
  player.x = startingPos[0];
  player.y = startingPos[1];
  player.speed = (playerSpeed - level);
  for (let enemy of allEnemies) {
    enemy.pace = (enemy.pace * (1 + ((level + 1)/30)));
  }
  html.score.innerHTML = `Level: ${level}`
  html.lives.innerHTML = `Lives: ${player.lives}`
}

function checkWin() {
  const goal = {
    width: [(sun.x - 50), (sun.x + 50)],
    height: (sun.y + 25),
  }
  if (player.y < goal.height) {
    if (player.x > goal.width[0] && player.x < goal.width[1]) {
      newLevel()
    } 
  }
}

function checkLoss() {
  if (player.lives < 0) {
    resetGame();
  }

  for (let enemy of allEnemies) {
    const killzone = {
      width: [(enemy.x - 50), (enemy.x + 50)],
      height: [(enemy.y - 50), (enemy.y + 50)]
    }

    if (player.y < killzone.height[1] && player.y > killzone.height[0]) {
      if (player.x > killzone.width[0] && player.x < killzone.width[1]) {
        if (player.lives > 0) {
          alert(`Ouch! You were annihilated, ${player.lives} lives left.`)
          player.x = startingPos[0];
          player.y = startingPos[1];
        } else if (player.lives === 0) {
          alert('No more lives left. Game over.')
          player.x = 2000;
          player.y = 2000;
        }
        player.lives--
        if (player.lives >= 0) {
          html.lives.innerHTML = `Lives: ${player.lives}`
        }
        resetEnemyLocations();
      }
    }
  }
}

function resetLocations() {
  for (let i = 0; i < allEnemies.length; i++) {
    allEnemies[i].x = (screenLimit.width[1] / allEnemies.length) * i;
    allEnemies[i].y = getRandomNum(screenLimit.height[1] / 6)
  }
  player.x = PlayerProps.startingPos[0];
  player.y = PlayerProps.startingPos[1];
}

function resetGame() {
  sun = null;
  player = null;
  allEnemies = [];

  return
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
  const allowedKeys = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});
