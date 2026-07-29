const screenLimit = {
  width: [0, 1000],
  height: [0, 700],
};
function getRandomNum(max) {
  return Math.floor(Math.random() * (max + 1));
}

function chance(percentage) {
  return getRandomNum(100) < percentage;
}

function difference(a, b) {
  return Math.abs(a - b);
}

function distance(a, b, c, d) {
  return Math.hypot(a - c, b - d);
}

function between(a, b) {
  return (a + b) / 2;
}

function isCloseTo(a, b, margin) {
  if (difference(a.x, b.x) <= margin) {
    if (difference(a.y, b.y) <= margin) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

class Sun {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Mine {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.triggerRadius = 70;
    this.explosionRadius = 135;
    this.timeLeft = 2.25;
    this.active = true;
    this.exploded = false;
    this.explosionTimer = 0.35;
    this.state = "armed";
  }

  update(dt) {
    if (this.exploded) {
      this.explosionTimer -= dt;
      return;
    }

    if (!this.active) {
      return;
    }

    if (this.isTriggered()) {
      this.explode();
      return;
    }

    this.timeLeft -= dt;

    if (this.timeLeft <= 0) {
      this.explode();
    }
  }

  isTriggered() {
    const playerDistance = distance(player.x, player.y, this.x, this.y);
    if (playerDistance <= this.triggerRadius) {
      return false;
    }

    return allEnemies.some((enemy) => {
      return distance(enemy.x, enemy.y, this.x, this.y) <= this.triggerRadius;
    });
  }

  explode() {
    this.active = false;
    this.exploded = true;
    this.state = "exploding";
    stunNearbyEnemies(this);
    playMineExplodedSound();
  }
}

class Enemy {
  constructor([x, y], style, speed) {
    this.x = x;
    this.y = y;
    this.style = style;
    this.speed = speed;
    this.direction = "right";
    this.move = this.chasePlayer;
    this.id = getRandomNum(9999);
    this.stunnedUntil = 0;
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
    if (isCloseTo(this, sun, 100)) {
      this.goAway(sun.x, sun.y, 1);
    }
    for (let enemy of allEnemies) {
      if (enemy.id !== this.id) {
        if (isCloseTo(this, enemy, 50)) {
          this.goAway(enemy.x, enemy.y, 1);
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
    const center = screenLimit.width[1] / 2;
    let targetX = between(center, player.x);

    const back = screenLimit.height[1] / 3;
    if (player.y < back) {
      this.goTo(targetX, player.y, 1.2);
    } else if (player.y > back) {
      this.goTo(targetX, back, 1.2);
    }
  }

  flank() {
    const center = screenLimit.width[1] / 2;
    const rightFlank = center * 1.67;
    const leftFlank = center * 0.33;
    if (this.x >= center && this.x < rightFlank) {
      this.goTo(rightFlank, this.y, 2);
    } else if (this.x < center && this.x > leftFlank) {
      this.goTo(leftFlank, this.y, 2);
    }

    if (this.x >= rightFlank || this.x <= leftFlank) {
      this.goTo(this.x, player.y, 2);
      if (difference(this.y, player.y) < (screenLimit.height[1] / 5) * 4) {
        this.move = this.chasePlayer;
      }
    }
  }

  displace(dir, speed) {
    if (dir === "up") {
      this.y = this.y - speed;
    }
    if (dir === "down") {
      this.y = this.y + speed;
    }
    if (dir === "left") {
      this.x = this.x - speed;
      this.direction = "left";
    }
    if (dir === "right") {
      this.x = this.x + speed;
      this.direction = "right";
    }
  }

  goTo(x, y, speedMultiplier) {
    if (this.x < x) {
      this.displace("right", this.speed * speedMultiplier);
    } else if (this.x > x) {
      this.displace("left", this.speed * speedMultiplier);
    }
    if (this.y < y) {
      this.displace("down", this.speed * speedMultiplier);
    } else if (this.y > y) {
      this.displace("up", this.speed * speedMultiplier);
    }
  }

  goAway(x, y, speedMultiplier) {
    if (this.x > x) {
      this.displace("right", this.speed * speedMultiplier);
    } else if (this.x < x) {
      this.displace("left", this.speed * speedMultiplier);
    }
    if (this.y > y) {
      this.displace("down", this.speed * speedMultiplier);
    } else if (this.y < y) {
      this.displace("up", this.speed * speedMultiplier);
    }
  }

  changeMove() {
    let moves = [this.chasePlayer, this.jockey, this.runBack, this.flank];
    for (let enemy of allEnemies) {
      moves = moves.filter((move) => move !== enemy.move);
    }
    if (moves.length > 0) {
      this.move = moves[getRandomNum(moves.length - 1)];
    }
  }

  isMoveTaken(move) {
    let isMoveTaken = false;
    for (let enemy of allEnemies) {
      if (enemy.move === move) {
        isMoveTaken = true;
      }
    }
    return isMoveTaken;
  }

  isAnyCloseToPlayer() {
    let is = false;
    for (let enemy of allEnemies) {
      if (isCloseTo(enemy, player, 150) && enemy.id !== this.id) {
        is = true;
      }
    }
    return is;
  }

  pickMove() {
    if (player.y <= this.y) {
      if (chance(50)) {
        this.move = this.runBack;
      } else {
        this.move = this.chasePlayer;
      }
    }
    if (isCloseTo(this, player, 200)) {
      if (this.isAnyCloseToPlayer()) {
        if (chance(50)) {
          this.move = this.runBack;
        } else if (
          player.y > this.y &&
          difference(player.y, this.y) >
            difference(this.x, screenLimit.width[1] / 2)
        ) {
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
      this.pickMove();
    }
    this.move();
    this.checkPos();
  }

  update = function (dt) {
    if (!isGamePaused) {
      if (this.stunnedUntil > Date.now()) {
        return;
      }
      this.brain();
    }
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
    if (!isGamePaused) {
      checkLoss();
      checkWin();
      this.displace();
    }
  }

  letGo(key) {
    this.directions = this.directions.filter((dir) => dir !== key);
  }

  pressed(key) {
    const opposites = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };

    if (key === undefined) {
      this.directions = [];
    } else {
      this.directions = this.directions.filter((dir) => dir !== opposites[key]);
      if (!this.directions.includes(key)) {
        this.directions.push(key);
      }
    }
  }

  handleBoost() {}

  displace() {
    if (this.checkPos()) {
      if (this.directions.includes("up")) {
        this.y = this.y - this.speed;
      }
      if (this.directions.includes("down")) {
        this.y = this.y + this.speed;
      }
      if (this.directions.includes("left")) {
        this.x = this.x - this.speed;
      }
      if (this.directions.includes("right")) {
        this.x = this.x + this.speed;
      }
    }
  }
}

const html = {
  level: document.getElementById("level"),
  lives: document.getElementById("lives"),
  canvas: document.getElementById("canvas"),
  score: document.getElementById("score"),
  seconds: document.getElementById("seconds"),
  message_to_player: document.getElementById("message_to_player"),
  music_button: document.getElementById("music-button"),
  pause: document.getElementById("pause"),
};

const audio = {
  gameOver: new Audio("./audio/game_over.mp3"),
  win: new Audio("./audio/win.mp3"),
  youDied: new Audio("./audio/you_died.mp3"),
  music: new Audio("./audio/background_music.mp3"),
  minePlace: new Audio("./audio/boop.mp3"),
  mineExplode: new Audio("./audio/boom.mp3"),
};

function playMinePlacedSound() {
  if (audio.minePlace) {
    audio.minePlace.currentTime = 0;
    audio.minePlace.play().catch(() => {});
  }
}

function playMineExplodedSound() {
  if (audio.mineExplode) {
    audio.mineExplode.currentTime = 0;
    audio.mineExplode.play().catch(() => {});
  }
}

function clearMessage() {
  html.message_to_player.innerText = "";
  html.message_to_player.style.visibility = "hidden";
  clearTimeout(timeout);
}

let timeout;
function displayMessage(message, seconds) {
  html.message_to_player.innerHTML = `<h1>${message.toUpperCase()}</h1>`;
  html.message_to_player.style.visibility = "visible";
  timeout = setTimeout(clearMessage, seconds * 1000);
}

let timer;
let isMusic = true;
let level = 0;
let seconds = 0;
let score = 0;

const PlayerProps = {
  speed: 7,
  lives: 3,
  startingPos: [screenLimit.width[1] / 2, (screenLimit.height[1] / 5) * 4],
};

let sun = new Sun(screenLimit.width[1] / 2, 10);
let player = new Player(
  PlayerProps.startingPos,
  PlayerProps.lives,
  PlayerProps.speed,
);
let allEnemies = [];
let activeMines = [];
let mineCooldown = 0;
const mineConfig = {
  cooldown: 2.5,
  stunDuration: 2200,
};

function stunNearbyEnemies(mine) {
  const now = Date.now();

  allEnemies.forEach((enemy) => {
    if (distance(enemy.x, enemy.y, mine.x, mine.y) <= mine.explosionRadius) {
      enemy.stunnedUntil = now + mineConfig.stunDuration;
    }
  });
}

function updateMines(dt) {
  mineCooldown = Math.max(0, mineCooldown - dt);

  activeMines.forEach((mine) => {
    mine.update(dt);
  });

  activeMines = activeMines.filter((mine) => {
    return !(mine.exploded && mine.explosionTimer <= 0);
  });
}

function dropMine() {
  if (isGamePaused || mineCooldown > 0) {
    return;
  }

  activeMines.push(new Mine(player.x, player.y));
  mineCooldown = mineConfig.cooldown;
  playMinePlacedSound();
}

function createEnemyProps(howMany) {
  let enemyProps = [];
  for (let i = 0; i < howMany; i++) {
    enemyProps.push({
      coords: [
        getRandomNum(screenLimit.width[1]),
        getRandomNum(screenLimit.height[1] / 5),
      ],
      image: `enemy${i + 1}`,
      speed: 2.4,
    });
  }

  return enemyProps;
}

function initEnemies(props) {
  for (let enemy of props) {
    allEnemies.push(new Enemy(enemy.coords, enemy.image, enemy.speed));
  }
}

function resetEnemies(props) {
  for (let i = 0; i < allEnemies.length; i++) {
    allEnemies[i].x = props[i].coords[0];
    allEnemies[i].y = props[i].coords[1];
    allEnemies[i].speed = props[i].speed;
  }
}

function incrementSeconds() {
  if (!isGamePaused) {
    seconds++;
    html.seconds.innerText = `TIME: ${seconds}`;
  }
}

function addScore() {
  score += (level + 1) * 10 - seconds;
  html.score.innerText = `SCORE: ${score}`;
}

function removeScore() {
  score -= 50 / (level + 1) + seconds;
  score = Math.round(score);
  if (score < 0) {
    score = 0;
  }
  html.score.innerText = `SCORE: ${score}`;
}

function newLevel() {
  seconds = 0;
  html.seconds.innerText = `TIME: ${seconds}`;
  audio.win.play();
  level++;
  resetLocations();
  for (let enemy of allEnemies) {
    enemy.speed *= 1.05;
  }
  html.level.innerText = `LEVEL: ${level}`;
  addScore();
}

function loss() {
  if (player.lives <= 0) {
    audio.gameOver.play();
    displayMessage("GAME OVER", 0.5);
    resetGame();
  } else {
    audio.youDied.play();
    resetLocations();
    player.lives += -1;
    html.lives.innerText = `LIVES: ${player.lives}`;
  }
  removeScore();
}

function checkWin() {
  if (isCloseTo(player, sun, 50)) {
    newLevel();
  }
}

function checkLoss() {
  for (let enemy of allEnemies) {
    if (isCloseTo(player, enemy, 50)) {
      loss();
    }
  }
}

function resetLocations() {
  for (let i = 0; i < allEnemies.length; i++) {
    allEnemies[i].x = (screenLimit.width[1] / allEnemies.length) * i;
    allEnemies[i].y = getRandomNum(screenLimit.height[1] / 6);
  }
  player.x = PlayerProps.startingPos[0];
  player.y = PlayerProps.startingPos[1];
  player.directions = [];
}

function resetGame() {
  seconds = 0;
  level = 0;
  player.lives = PlayerProps.lives;
  player.speed = PlayerProps.speed;
  player.x = PlayerProps.startingPos[0];
  player.y = PlayerProps.startingPos[1];
  resetEnemies(createEnemyProps(3));
  activeMines = [];
  mineCooldown = 0;

  html.level.innerText = `LEVEL: ${level}`;
  html.lives.innerText = `LIVES: ${player.lives}`;
  return;
}

function initGame() {
  timer = setInterval(incrementSeconds, 1000);
  level = 0;
  sun = new Sun(screenLimit.width[1] / 2, 10);
  player = new Player(
    PlayerProps.startingPos,
    PlayerProps.lives,
    PlayerProps.speed,
  );
  initEnemies(createEnemyProps(3));
  activeMines = [];
  mineCooldown = 0;

  html.level.innerText = `LEVEL: ${level}`;
  html.lives.innerText = `LIVES: ${player.lives}`;
  html.score.innerText = `SCORE: ${score}`;
  html.seconds.innerText = `TIME: ${seconds}`;
  displayMessage("Reach The Sun", 2);
  setTimeout(handlePause, 2200);
  return;
}

initGame();

let isGamePaused = true;
function handlePause() {
  if (isGamePaused) {
    isGamePaused = false;
    html.pause.innerText = "Pause";
  } else {
    isGamePaused = true;
    html.pause.innerText = "Unpause";
  }
}

function handleMusic() {
  if (isMusic) {
    isMusic = false;
    audio.music.pause();
    html.music_button.innerText = "Turn Music ON";
  } else {
    isMusic = true;
    audio.music.play();
    html.music_button.innerText = "Turn Music OFF";
  }
}

const allowedKeys = {
  37: "left",
  38: "up",
  39: "right",
  40: "down",
  65: "left",
  87: "up",
  68: "right",
  83: "down",
};

document.addEventListener("keydown", function (e) {
  const action = allowedKeys[e.keyCode];

  if (action) {
    e.preventDefault();
    player.pressed(action);
    return;
  }

  if (e.code === "Space" || e.key.toLowerCase() === "m") {
    e.preventDefault();
    dropMine();
  }
});

document.addEventListener("keyup", function (e) {
  const action = allowedKeys[e.keyCode];
  if (action) {
    e.preventDefault();
    player.letGo(action);
  }
});

html.music_button.addEventListener("click", handleMusic);

html.pause.addEventListener("click", handlePause);
