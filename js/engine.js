var Engine = (function (global) {
  var doc = global.document,
    win = global.window,
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    lastTime = 0,
    accumulator = 0,
    step = 1 / 60;

  canvas.width = 1100;
  canvas.height = 800;

  function main() {
    var now = Date.now(),
      frameTime = Math.min(0.25, (now - lastTime) / 1000.0);

    accumulator += frameTime;

    while (accumulator >= step) {
      update(step);
      accumulator -= step;
    }

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
    allEnemies.forEach(function (enemy) {
      enemy.update(dt);
    });
    player.update();
    updateMines(dt);
    updateAnimations();
  }

  function updateAnimations() {
    player.tickCount++;

    if (player.tickCount > player.ticksPerFrame) {
      player.tickCount = 0;
      player.frameIndex++;
    }

    if (player.frameIndex >= player.numberOfFrames) {
      player.frameIndex = 0;
    }

    allEnemies.forEach(function (enemy) {
      enemy.tickCount++;

      if (enemy.tickCount > enemy.ticksPerFrame) {
        enemy.tickCount = 0;
        enemy.frameIndex++;
      }

      if (enemy.frameIndex >= enemy.numberOfFrames) {
        enemy.frameIndex = 0;
      }
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(Resources.get("images/background.png"), 0, 0);

    renderEntities();
  }

  function renderEntities() {
    ctx.drawImage(Resources.get("images/sun.png"), sun.x, sun.y);

    const playerImage = Resources.get("images/player.png");

    ctx.drawImage(
      playerImage,
      0,
      (player.frameIndex * playerImage.naturalHeight) / player.numberOfFrames,
      playerImage.naturalWidth,
      playerImage.naturalHeight / player.numberOfFrames,
      player.x,
      player.y,
      playerImage.naturalWidth,
      playerImage.naturalHeight / player.numberOfFrames,
    );

    allEnemies.forEach(function (enemy) {
      const image = Resources.get(
        `images/${enemy.style}-${enemy.direction}.png`,
      );

      ctx.drawImage(
        image,
        0,
        (enemy.frameIndex * image.naturalHeight) / enemy.numberOfFrames,
        image.naturalWidth,
        image.naturalHeight / enemy.numberOfFrames,
        enemy.x,
        enemy.y,
        image.naturalWidth,
        image.naturalHeight / enemy.numberOfFrames,
      );
    });

    activeMines.forEach(function (mine) {
      if (mine.exploded) {
        const progress = Math.max(0, mine.explosionTimer / 0.35);
        const radius = 18 + (1 - progress) * mine.explosionRadius;

        ctx.save();
        ctx.globalAlpha = progress;
        ctx.strokeStyle = "#ffe082";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(mine.x, mine.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#ff5722";
        ctx.beginPath();
        ctx.arc(mine.x, mine.y, 12 + (1 - progress) * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      const pulse = 0.7 + 0.25 * Math.sin(Date.now() / 180);

      ctx.save();
      ctx.strokeStyle = "rgba(255, 213, 79, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(mine.x, mine.y, mine.triggerRadius * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = "#ff3d00";
      ctx.beginPath();
      ctx.arc(mine.x, mine.y, 10 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(mine.x, mine.y, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#ffd54f";
      ctx.beginPath();
      ctx.moveTo(mine.x - 4, mine.y);
      ctx.lineTo(mine.x + 4, mine.y);
      ctx.moveTo(mine.x, mine.y - 4);
      ctx.lineTo(mine.x, mine.y + 4);
      ctx.stroke();
      ctx.restore();
    });
  }

  function reset() {
    allEnemies.forEach(function (enemy) {
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
    "images/background.png",
    "images/enemy1-right.png",
    "images/enemy2-right.png",
    "images/enemy3-right.png",
    "images/enemy1-left.png",
    "images/enemy2-left.png",
    "images/enemy3-left.png",
    "images/enemy4-left.png",
    "images/enemy4-right.png",
    "images/sun.png",
    "images/player.png",
  ]);

  Resources.onReady(init);

  global.ctx = ctx;
})(this);
