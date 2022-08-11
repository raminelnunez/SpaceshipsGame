/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook. When your player moves across the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

let unlockedWojaks = [];

function renderWojaks() {
  let wojakDisplay = document.getElementById('wojaks');
  wojakDisplay.innerHTML = "";
  for(let wojak of unlockedWojaks) {
    wojakDisplay.insertAdjacentHTML('beforeend', `
      <div class="wojak">
        <img src="${wojak}" alt="">
      </div>
    `)
  }
  if (unlockedWojaks.length > 0) {
    let wojaks = document.getElementsByClassName('wojak');
    for (let wojak of wojaks) {
      wojak.style.clip = "rect(0px,50px,50px,0px)";
    }
  }
}

function unlockWojak(wojak) {
  if (!unlockedWojaks.includes(wojak)) {
    unlockedWojaks.push(wojak);
    renderWojaks();
  }
}

var Engine = (function(global) {
    var doc = global.document,
        win = global.window,
        canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

        canvas.width = 1100; //900
        canvas.height = 800; //534

    function main() {
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;
        update(dt);
        render();
        lastTime = now;
        win.requestAnimationFrame(main);
    }
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }
    function update(dt) {
        updateEntities(dt);
    }
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }
    function render() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(Resources.get('images/background.png'), 0, 0);
        renderEntities();
    }

    function renderEntities() {

        ctx.drawImage(Resources.get('images/goal.png'), goal.x, goal.y);

        player.tickCount++;

        if (player.tickCount > player.ticksPerFrame) {
          player.tickCount = 0;
          player.frameIndex++;
        }

        if(player.frameIndex >= player.numberOfFrames) {
          player.frameIndex = 0;
        }

        let playerImage = Resources.get('images/player.png')
        let wojakToUnlock;

        if (level < 3) {
          if (player.lives <= (PlayerProps.lives/2)-1) {
            playerImage = Resources.get('images/player_stressed.png')
            wojakToUnlock = 'images/player_stressed.png'
          }
        }
        if (level >= 3) {
          if (player.lives === PlayerProps.lives) {
            playerImage = Resources.get('images/player_smug.png')
            wojakToUnlock = 'images/player_smug.png'
          }
          if (player.lives <= (PlayerProps.lives/2)-1) {
            playerImage = Resources.get('images/player_coping.png')
            wojakToUnlock = 'images/player_coping.png'
          }
        }
        if (level >= 4) {
          if (player.lives <= (PlayerProps.lives/2)-1) {
            playerImage = Resources.get('images/player_focused.png')
            wojakToUnlock = 'images/player_focused.png'
          }
        }
        if (level >= 5) {
          playerImage = Resources.get('images/player_hardened.png')
          wojakToUnlock = 'images/player_hardened.png'
        }
        if (level >= 7) {
          if (player.lives === PlayerProps.lives) {
            playerImage = Resources.get('images/player_gigachad.png')
            wojakToUnlock = 'images/player_gigachad.png'
          }
          if (player.lives <= (PlayerProps.lives/2)-1) {
            playerImage = Resources.get('images/player_vicious.png')
            wojakToUnlock = 'images/player_vicious.png'
          }
        }
        if (wojakToUnlock !== undefined) {
          unlockWojak(wojakToUnlock.substring(0, wojakToUnlock.length-4) + "_trophy.png");
        }

        ctx.drawImage(
          playerImage,
          0,
          player.frameIndex * playerImage.naturalHeight / player.numberOfFrames,
          playerImage.naturalWidth,
          playerImage.naturalHeight / player.numberOfFrames,
          player.x,
          player.y,
          playerImage.naturalWidth,
          (playerImage.naturalHeight) / player.numberOfFrames
        );

        allEnemies.forEach(function(enemy) {
          enemy.tickCount++;

          if (enemy.tickCount > enemy.ticksPerFrame) {
            enemy.tickCount = 0;
            enemy.frameIndex++;
          }

          if(enemy.frameIndex >= enemy.numberOfFrames) {
            enemy.frameIndex = 0;
          }

          const image = Resources.get(`images/${enemy.style}.png`);

          ctx.drawImage(
            image,
            0,
            enemy.frameIndex * image.naturalHeight / enemy.numberOfFrames,
            image.naturalWidth,
            image.naturalHeight / enemy.numberOfFrames,
            enemy.x,
            enemy.y,
            image.naturalWidth,
            image.naturalHeight / enemy.numberOfFrames
          );

        });

    }

    function reset() {
      allEnemies.forEach(function(enemy) {
        enemy.tickCount = 0;
        enemy.ticksPerFrame = 5;
        enemy.frameIndex = 0;
        enemy.numberOfFrames = 3;
      });

      player.tickCount = 0;
      player.ticksPerFrame = 5;
      player.frameIndex = 0;
      player.numberOfFrames = 2;
    }

    Resources.load([
        'images/background.png',
        'images/enemy1.png',
        'images/enemy2.png',
        'images/enemy3.png',
        'images/enemy4.png',
        'images/goal.png',
        'images/player.png',
        'images/player_focused.png',
        'images/player_gigachad.png',
        'images/player_smug.png',
        'images/player_stressed.png',
        'images/player_coping.png',
        'images/player_vicious.png',
        'images/player_hardened.png'
    ]);

    Resources.onReady(init);
    global.ctx = ctx;
})(this);
