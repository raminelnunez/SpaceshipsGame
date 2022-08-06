function getRandomNum(max) {
  return Math.floor(Math.random() * (max +1))
}


function chance(percentage) {
  return getRandomNum(100) < percentage; 
}

function difference(a, b) {
  return Math.abs(a - b);
}

function between(a, b) {
  if (a < b) {
    return a + (b/2);
  } else {
    return  a - (b/2);
  }
}

function isCloseTo(a, b, margin) {
  if (difference(a.x, b.x) <= margin) {
    if (difference(a.y, b.y) <= margin) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

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
    this.move = this.flank;
    this.id = getRandomNum(9999);
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
    for(let enemy of allEnemies) {
      if (enemy.id !== this.id) {
        if (isCloseTo(this, enemy, 50)) {
          this.goAway(enemy.x, enemy.y, 5);
        } 
      }
    }
  }

  chasePlayer() {
    this.goTo(player.x, player.y, 1);
  }

  jockey() {
    this.goTo(player.x, this.y, 2);
  }

  runBack() {
    const center = screenLimit.width[1]/2;
    let targetX = between(center, player.x);

    const back = screenLimit.height[1] /3;
    if (player.y < back) {
      this.goTo(targetX, player.y, 1.2); 
    } else if (player.y > back) {
      this.goTo(targetX, back, 1.2);
    }
  }

  flank() {
    const center = screenLimit.width[1]/2;
    const rightFlank = center*1.67;
    const leftFlank = center*0.33;
    if (this.x >= center && this.x < rightFlank) {
      this.goTo(rightFlank, this.y, 2);
    } else if (this.x < center && this.x > leftFlank) {
      this.goTo(leftFlank, this.y, 2);
    }

    if (this.x >= rightFlank || this.x <= leftFlank) {
      this.goTo(this.x, player.y, 2);
      if (difference(this.y, player.y) < 100) {
        this.move = this.chasePlayer;
      }
    }
  }

  displace(dir, speed) {
    if (dir === 'up') { this.y = this.y - speed}
    if (dir === 'down') { this.y = this.y + speed}
    if (dir === 'left') { this.x = this.x - speed}
    if (dir === 'right') { this.x = this.x + speed}
  }

  goTo(x, y, speedMultiplier) {
    if (this.x < x) {
      this.displace('right', this.speed*speedMultiplier)
    } else if (this.x > x) {
      this.displace('left', this.speed*speedMultiplier)
    }
    if (this.y < y) {
      this.displace('down', this.speed*speedMultiplier)
    } else if (this.y > y) {
      this.displace('up', this.speed*speedMultiplier)
    }
  }

  goAway(x, y, speedMultiplier) {
    if (this.x > x) {
      this.displace('right', this.speed*speedMultiplier)
    } else if (this.x < x) {
      this.displace('left', this.speed*speedMultiplier)
    }
    if (this.y > y) {
      this.displace('down', this.speed*speedMultiplier)
    } else if (this.y < y) {
      this.displace('up', this.speed*speedMultiplier)
    }
  }

  changeMove() {
    let moves = [this.chasePlayer, this.jockey, this.runBack, this.flank];
    for (let enemy of allEnemies) {
      moves = moves.filter(move => move !== enemy.move)
    }
    if (moves.length > 0) {
      this.move = moves[getRandomNum(moves.length-1)];
    }
  }

  isMoveTaken(move) {
    let isMoveTaken = false;
    for(let enemy of allEnemies) {
      if (enemy.move === move) {
        isMoveTaken = true;
      }
    }
    return isMoveTaken
  }

  isAnyCloseToPlayer() {
    let is = false;
    for(let enemy of allEnemies) {
      if (isCloseTo(enemy, player, 150) && enemy.id !== this.id) {
        is = true;
      }
    }
    return is
  }

  pickMove() {
    if (isCloseTo(this, player, 150)) {
      if (this.isAnyCloseToPlayer()) {
        if (chance(50)) {
          this.move = this.runBack;
        } else {
          this.move = this.flank;
        }
      } else if (!this.isMoveTaken(this.chasePlayer)) {
        this.move = this.chasePlayer;
      }
    } else {
      this.changeMove();
    }
  }

  brain() {
    if (chance(1)) {
      this.changeMove();
    }
    this.move();
    this.checkPos();
  }

  update = function(dt) {
    this.brain()
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

  letGo(key) {
    this.directions = this.directions.filter(dir => dir !== key)
  }

  pressed(key) {
    const opposites = {
      'up': 'down',
      'down': 'up',
      'left': 'right',
      'right': 'left'
    }

    if (key === undefined) {
      this.directions = [];
    } else {
      this.directions = this.directions.filter(dir => dir !== opposites[key])
      if (!this.directions.includes(key)) {
        this.directions.push(key);
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

let sun = new Sun(400, 10);
let player = new Player(PlayerProps.startingPos, PlayerProps.lives, PlayerProps.speed);
let allEnemies = [];

function createEnemyProps(howMany) {

  let enemyProps = [];
  for (let i = 0; i < howMany; i++) {
    enemyProps.push({
      coords: [getRandomNum(800), getRandomNum(100)],
      image: `enemy${i+1}`,
      speed: 3,
    })
  }

  return enemyProps;
}

function initEnemies(props) {
  
  for (let enemy of props) {
    allEnemies.push(new Enemy(enemy.coords, enemy.image, enemy.speed))
  }
}

const screenLimit = {
  width: [0, 800],
  height: [0, 450],
}


html.lives.innerHTML = `Lives: ${player.lives}`


function newLevel() {
  level++
  resetLocations()
  alert(`level ${level}.`)
  player.x = PlayerProps.startingPos[0];
  player.y = PlayerProps.startingPos[1];
  for (let enemy of allEnemies) {
    enemy.pace = (enemy.pace * (1 + ((level + 1)/30)));
  }
  html.score.innerHTML = `Level: ${level}`
  html.lives.innerHTML = `Lives: ${player.lives}`
}

function loss() {
  
}

function checkWin() {
  if (isCloseTo(player, sun, 50)) {
    newLevel();
  }
}

function checkLoss() {
  if (player.lives < 0) {
    resetGame();
  }
  for (let enemy of allEnemies) {
    if (isCloseTo(player, enemy, 50)) {

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

  sun = new Sun(400, 10);
  player = new Player(PlayerProps.startingPos, PlayerProps.lives, PlayerProps.speed);
  allEnemies = [];
  initEnemies(createEnemyProps(3));
  return
}

resetGame();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
  const allowedKeys = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
  };

  player.pressed(allowedKeys[e.keyCode]);
});

document.addEventListener('keyup', function(e) {
  const allowedKeys = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
  };

  player.letGo(allowedKeys[e.keyCode]);
});
