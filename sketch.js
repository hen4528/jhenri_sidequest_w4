/*
Week 4 — Example 5: Example 5: Blob Platformer (JSON + Classes)
Course: GBDA302
Instructors: Dr. Karen Cochrane and David Han
Date: Feb. 5, 2026

This file orchestrates everything:
- load JSON in preload()
- create WorldLevel from JSON
- create BlobPlayer
- update + draw each frame
- handle input events (jump, optional next level)

This matches the structure of the original blob sketch from Week 2 but moves
details into classes.
*/

let data; // raw JSON data
let levelIndex = 0;

let world; // WorldLevel instance (current level)
let player; // BlobPlayer instance

function preload() {
  // Load the level data from disk before setup runs.
  data = loadJSON("levels.json");
}

function setup() {
  // Create the player once (it will be respawned per level).
  player = new BlobPlayer();

  // Load the first level.
  loadLevel(0);

  // Simple shared style setup.
  noStroke();
  textFont("sans-serif");
  textSize(14);
}

function draw() {
  // 1) Draw the world (background + platforms)
  world.drawWorld();

  // 2) Update and draw the player on top of the world
  player.update(world.platforms);
  player.draw(world.theme.blob);

  // 3) Draw the door
  const lastPlatform = world.platforms[world.platforms.length - 1];
  drawDoor(lastPlatform);

  // 4) Check if player reached the door
  if (checkDoorCollision(player, lastPlatform)) {
    // If we're on level 0 and hit the door, explicitly go to level 2 (index 1).
    if (levelIndex === 0) {
      loadLevel(1);
    } else {
      const next = (levelIndex + 1) % data.levels.length;
      loadLevel(next);
    }
  }

  // 5) HUD
  fill(0);
  textSize(12);
  text("Move: A/D or ←/→ • Jump: Space/W/↑ • Next: N", 140, 20);

  textAlign(CENTER);
  textSize(24);
  text(world.name, width / 2, height / 2 - 100);
}

function drawDoor(platform) {
  // Position door based on platform
  let doorWidth = 40;
  let doorHeight = 80;
  let doorX = platform.x + platform.w / 2 - doorWidth / 2;
  let doorY = platform.y - doorHeight;

  // Draw door rectangle
  fill("brown"); // Door Colour
  rect(doorX, doorY, doorWidth, doorHeight);

  // Draw door knob
  fill("gold");
  let knobX = doorX + doorWidth - 10;
  let knobY = doorY + doorHeight / 2;
  ellipse(knobX, knobY, 10, 10);
}

/*
Return true when the player's bounding box overlaps the door on the
given platform. Uses the same door geometry as drawDoor().
*/
function checkDoorCollision(player, platform) {
  if (!platform) return false;

  const doorWidth = 40;
  const doorHeight = 80;
  const doorX = platform.x + platform.w / 2 - doorWidth / 2;
  const doorY = platform.y - doorHeight;

  const playerBox = {
    x: player.x - player.r,
    y: player.y - player.r,
    w: player.r * 2,
    h: player.r * 2,
  };

  const doorBox = { x: doorX, y: doorY, w: doorWidth, h: doorHeight };

  return overlapAABB(playerBox, doorBox);
}

function keyPressed() {
  // Jump keys
  if (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) {
    player.jump();
  }

  // Optional: cycle levels with N (as with the earlier examples)
  if (key === "n" || key === "N") {
    const next = (levelIndex + 1) % data.levels.length;
    loadLevel(next);
  }
}

/*
Load a level by index:
- create a WorldLevel instance from JSON
- resize canvas based on inferred geometry
- spawn player using level start + physics
*/
function loadLevel(i) {
  levelIndex = i;

  // Create the world object from the JSON level object.
  world = new WorldLevel(data.levels[levelIndex]);

  // Fit canvas to world geometry (or defaults if needed).
  const W = world.inferWidth(640);
  const H = world.inferHeight(360);
  resizeCanvas(W, H);

  // Apply level settings + respawn.
  player.spawnFromLevel(world);
}
