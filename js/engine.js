var Engine = (function(global) {

  var doc = global.document,
      win = global.window,
      canvas = document.getElementById('canvas'),
      ctx = canvas.getContext('2d'),
      lastTime;

      canvas.width = 1100;
      canvas.height = 800;

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

      ctx.drawImage(Resources.get('images/sun.png'), sun.x, sun.y);


      player.tickCount++;

      if (player.tickCount > player.ticksPerFrame) {
        player.tickCount = 0;
        player.frameIndex++;
      }

      if(player.frameIndex >= player.numberOfFrames) {
        player.frameIndex = 0;
      }

      const playerImage = Resources.get('images/player.png');

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

        const image = Resources.get(`images/${enemy.style}-${enemy.direction}.png`);

        ctx.drawImage(
          image,
          0,
          enemy.frameIndex * image.naturalHeight / enemy.numberOfFrames,
          image.naturalWidth,
          image.naturalHeight / enemy.numberOfFrames,
          enemy.x,
          enemy.y,
          image.naturalWidth,
          (image.naturalHeight) / enemy.numberOfFrames
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
      'images/enemy1-right.png',
      'images/enemy2-right.png',
      'images/enemy3-right.png',
      'images/enemy1-left.png',
      'images/enemy2-left.png',
      'images/enemy3-left.png',
      'images/enemy4-left.png',
      'images/enemy4-right.png',
      'images/sun.png',
      'images/player.png',
  ]);

  Resources.onReady(init);

  global.ctx = ctx;
})(this);
