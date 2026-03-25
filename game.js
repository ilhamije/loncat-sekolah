/**
 * School Jump - Chrome Dino Clone
 * Replicates standard runner mechanics using HTML5 Canvas & vanilla JS
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game UI Elements
const scoreElement = document.getElementById('score');
const hiScoreElement = document.getElementById('hi-score');
const gameOverScreen = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const finalScoreElement = document.getElementById('final-score');

// Sound Effects
const duckSound = new Audio('assets/whosh.mov');
const jumpSound = new Audio('assets/tick.mov');
const gameOverSound = new Audio('assets/buzz.mov');

const soundAssets = [duckSound, jumpSound, gameOverSound];
let soundsLoadedCount = 0;
const totalSounds = soundAssets.length;

function playSound(audioEl) {
    if (audioEl.currentTime > 0) {
        audioEl.currentTime = 0;
    }
    audioEl.play().catch(err => console.log('Audio playback prevented:', err));
}

// Game Constants and Settings
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const GROUND_LEVEL = 210; // Y coordinate where feet touch the ground

// State variables
let isPlaying = false;
let isGameOver = false;
let score = 0;
let highScore = localStorage.getItem('schoolJumpHighScore') || 0;
let gameSpeed = 7.2;        // Speed of the background scroll and obstacles
let animationFrameId;    // to cancel rAF
let frameCount = 0;      // Universal frame timer

// Initialize high score display
hiScoreElement.innerText = highScore.toString().padStart(5, '0');

// Asset Tracking
const spritePaths = {
    crawling1: 'assets/crawling1.png',
    crawling2: 'assets/crawling2.png',
    happy: 'assets/happy.png',
    jumping1: 'assets/jumping1.png',
    jumping2: 'assets/jumping2.png',
    running1: 'assets/running1.png',
    running2: 'assets/running2.png',
    sad: 'assets/sad.png',
    walking1: 'assets/walking1.png',
    walking2: 'assets/walking2.png',
    school: 'assets/school.png',
    chair: 'assets/chair.png',
    stackedChair: 'assets/stacked-chair.png',
    table: 'assets/table.png',
    stackedTable: 'assets/stacked-table.png',
    whiteboard: 'assets/whiteboard.png',
    chalk: 'assets/chalk.png'
};

const sprites = {};
let spritesLoadedCount = 0;
const totalSprites = Object.keys(spritePaths).length;
let allAssetsLoaded = false;

function checkAllAssetsLoaded() {
    if (spritesLoadedCount === totalSprites && soundsLoadedCount === totalSounds) {
        allAssetsLoaded = true;
    }
}

for (let key in spritePaths) {
    sprites[key] = new Image();
    sprites[key].onload = () => {
        spritesLoadedCount++;
        checkAllAssetsLoaded();
    };
    sprites[key].src = spritePaths[key];
}

soundAssets.forEach(sound => {
    sound.oncanplaythrough = () => {
        // Increment count only once per sound
        if (!sound.hasLoadedFlag) {
            sound.hasLoadedFlag = true;
            soundsLoadedCount++;
            checkAllAssetsLoaded();
        }
    };
    // Force load for some browsers
    sound.load();
});

// --- Entity Definitions ---

/**
 * Player Object definition
 * Handles player physics, state, and rendering
 */
const player = {
    x: 60,                // Fixed X position
    y: GROUND_LEVEL - 80, // Height is ~80px
    width: 70,
    normalWidth: 70,
    crawlingWidth: 100,
    height: 80,
    normalHeight: 80,
    crawlingHeight: 50,
    dy: 0,                // Vertical velocity
    jumpForce: -14,       // Stronger initial burst upward
    gravity: 1.1,         // Heavier pull down each frame to be snappy
    isJumping: false,
    jumpsCount: 0,        // Track amount of jumps (for double jump)
    isCrawling: false,
    state: 'standing',    // 'standing', 'running', 'jumping', 'dead', 'crawling'
    runFrame: 0,          // Toggles between 0 and 1 for animation

    draw() {
        if (allAssetsLoaded) {
            let currentSprite;

            if (this.state === 'dead') {
                // If they attained a high score during the run, they are 'happy', else 'sad'
                if (score > 0 && score >= highScore) {
                    currentSprite = sprites.happy;
                } else {
                    currentSprite = sprites.sad;
                }
            } else if (this.isCrawling) {
                // Combine crawling sprites
                currentSprite = this.runFrame === 0 ? sprites.crawling1 : sprites.crawling2;
            } else if (this.isJumping) {
                // Single jump vs Double jump
                if (this.jumpsCount === 2) {
                    currentSprite = this.runFrame === 0 ? sprites.jumping1 : sprites.jumping2;
                } else {
                    currentSprite = sprites.jumping1;
                }
            } else {
                // Walking vs Running based on game speed thresholds
                if (gameSpeed < 7.5) {
                    currentSprite = this.runFrame === 0 ? sprites.walking1 : sprites.walking2;
                } else {
                    currentSprite = this.runFrame === 0 ? sprites.running1 : sprites.running2;
                }
            }

            ctx.drawImage(currentSprite, this.x, this.y, this.width, this.height);
        } else {
            // --- Fallback procedural drawing (Faceless Indonesian kid) ---
            if (this.state === 'dead') {
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height);
                ctx.rotate(Math.PI / 2); // Rotate lying back
                this.renderChildProcedurally(-this.width / 2, -this.height);

                // Draw 'X' eyes for death
                ctx.fillStyle = '#000';
                ctx.font = '8px "Press Start 2P"';
                ctx.fillText('X X', -this.width / 2 + 5, -this.height + 15);
                ctx.restore();
            } else {
                this.renderChildProcedurally(this.x, this.y);
            }
        }
    },

    // A helper to draw the kid without sprite assets
    renderChildProcedurally(dx, dy) {
        // Red trousers/skirt (Seragam Merah)
        ctx.fillStyle = '#c0392b';
        if (this.state === 'running' || this.state === 'crawling') {
            // Legs alternating
            let stride = this.runFrame === 0 ? 5 : -5;
            ctx.fillRect(dx + 5 + stride, dy + 25, 10, 15);
            ctx.fillRect(dx + 15 - stride, dy + 25, 10, 15);
        } else if (this.state === 'jumping') {
            // Legs tucked
            ctx.fillRect(dx + 8, dy + 25, 16, 10);
        } else {
            // Standing
            ctx.fillRect(dx + 5, dy + 25, 22, 15);
        }

        // White shirt (Putih)
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(dx + 4, dy + 10, 24, 15);

        // Small Red Tie
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(dx + 16, dy + 10);
        ctx.lineTo(dx + 14, dy + 20);
        ctx.lineTo(dx + 18, dy + 20);
        ctx.fill();

        // Head (Skin tone placeholder)
        ctx.fillStyle = '#f1c40f'; // simplistic skin tone
        ctx.fillRect(dx + 6, dy - 5, 20, 15);

        // Red Cap
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(dx + 16, dy - 5, 10, Math.PI, 0); // Hat top
        ctx.fill();
        ctx.fillRect(dx + 16, dy - 7, 12, 3);    // Hat peak
    },

    update() {
        if (this.isJumping) {
            this.dy += this.gravity;
            this.y += this.dy;

            // Check landing
            if (this.y >= GROUND_LEVEL - this.height) {
                this.y = GROUND_LEVEL - this.height;
                this.isJumping = false;
                this.dy = 0;
                this.jumpsCount = 0;
            }
            this.state = 'jumping';

            // Allow animation cycling during jump for double jump frames
            if (frameCount % 6 === 0) {
                this.runFrame = this.runFrame === 0 ? 1 : 0;
            }
        } else if (this.isCrawling) {
            if (frameCount % 6 === 0) {
                this.runFrame = this.runFrame === 0 ? 1 : 0;
            }
            this.state = 'crawling';
        } else {
            // Running/Walking animation cycle
            if (frameCount % 6 === 0) {
                this.runFrame = this.runFrame === 0 ? 1 : 0;
            }
            this.state = 'running';
        }
    },

    jump() {
        if (this.state !== 'dead' && !this.isCrawling) {
            if (!this.isJumping) {
                playSound(jumpSound);
                this.dy = this.jumpForce;
                this.isJumping = true;
                this.jumpsCount = 1;
                this.state = 'jumping';
            } else if (this.jumpsCount < 2) {
                playSound(jumpSound);
                // Secondary jump is slightly weaker or equal
                this.dy = this.jumpForce * 0.9;
                this.jumpsCount++;
            }
        }
    },

    crawl() {
        if (!this.isJumping && this.state !== 'dead') {
            if (!this.isCrawling) {
                playSound(duckSound);
                this.isCrawling = true;
                this.height = this.crawlingHeight;
                this.width = this.crawlingWidth;
                this.y = GROUND_LEVEL - this.height;
                this.state = 'crawling';
            }
        }
    },

    stand() {
        // Stop crawling
        if (this.isCrawling) {
            this.isCrawling = false;
            this.height = this.normalHeight;
            this.width = this.normalWidth;
            this.y = GROUND_LEVEL - this.height;
            this.state = 'running';
        }
    }
};

// --- Obstacles ---
let obstacles = [];

/**
 * Spawns a new table/chair obstacle off-screen
 */
function spawnObstacle() {
    // Gap dynamic calculation based on speed
    const minGap = 200;
    const maxGap = 500;
    const gap = minGap + Math.random() * (maxGap - minGap + gameSpeed * 20);

    // School obstacles types: 1=chair, 2=stacked-chair, 3=table, 4=stacked-table, 5=whiteboard, 6=chalk
    const type = Math.floor(Math.random() * 6) + 1;

    let width = 40;
    let height = 50;
    let sprite = 'chair';
    let isSpinning = false;
    let yOffset = 0;

    if (type === 1) { width = 40; height = 50; sprite = 'chair'; }
    else if (type === 2) { width = 45; height = 80; sprite = 'stackedChair'; }
    else if (type === 3) { width = 60; height = 45; sprite = 'table'; }
    else if (type === 4) { width = 65; height = 80; sprite = 'stackedTable'; }
    else if (type === 5) {
        width = 50; height = 90; sprite = 'whiteboard'; isSpinning = true;
        const heights = [10, 55, 85];
        yOffset = heights[Math.floor(Math.random() * heights.length)];
    }
    else if (type === 6) {
        width = 60; height = 60; sprite = 'chalk'; isSpinning = true;
        const heights = [10, 55, 85];
        yOffset = heights[Math.floor(Math.random() * heights.length)];
    }

    obstacles.push({
        x: GAME_WIDTH + gap,
        y: GROUND_LEVEL - height - yOffset,
        width: width,
        height: height,
        type: type,
        spriteName: sprite,
        isSpinning: isSpinning,
        rotation: 0,
        passed: false
    });
}

function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];

        // Move left based on game speed
        obs.x -= gameSpeed;

        if (obs.isSpinning) {
            obs.rotation -= 0.05 * gameSpeed; // spin backwards towards player
        }

        if (allAssetsLoaded && sprites[obs.spriteName]) {
            if (obs.isSpinning) {
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(obs.rotation);
                ctx.drawImage(sprites[obs.spriteName], -obs.width / 2, -obs.height / 2, obs.width, obs.height);
                ctx.restore();
            } else {
                ctx.drawImage(sprites[obs.spriteName], obs.x, obs.y, obs.width, obs.height);
            }
        } else {
            ctx.fillStyle = '#d35400';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }

        // --- Collision Detection ---
        // Basic AABB bounding box collision algorithm with a slight forgiveness inset (shrink)
        const hitMargin = 5;
        if (
            player.x + hitMargin < obs.x + obs.width - hitMargin &&
            player.x + player.width - hitMargin > obs.x + hitMargin &&
            player.y + hitMargin < obs.y + obs.height - hitMargin &&
            player.height + player.y - hitMargin > obs.y + hitMargin
        ) {
            handleGameOver();
        }
    }

    // Remove obstacles that have moved off screen (left side)
    if (obstacles.length > 0 && obstacles[0].x < -100) {
        obstacles.shift();
    }

    // Ensure there is always a next obstacle spawning
    if (obstacles.length === 0 || GAME_WIDTH - obstacles[obstacles.length - 1].x > 300) {
        // 1 in 50 frames chance to spawn if distance is long enough, keeping it random
        if (Math.random() < 0.05) {
            spawnObstacle();
        }
    }
}

// --- Environment ---
let bgOffset = 0;

/**
 * Draws the looping background and the ground line
 */
function drawBackground() {
    // Scroll background Leftwards
    bgOffset -= (gameSpeed * 0.5); // Parallax effect

    // Normalize bgOffset to always be between -GAME_WIDTH and 0
    bgOffset %= GAME_WIDTH;
    if (bgOffset > 0) bgOffset -= GAME_WIDTH; // Just in case

    if (allAssetsLoaded && sprites.school) {
        // Use exact floating point math to prevent subpixel gaps
        // Or if using integer, ensure gapless placement:
        let drawX = Math.floor(bgOffset);

        // Draw multiple copies seamlessly adjacent
        ctx.drawImage(sprites.school, drawX, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.drawImage(sprites.school, drawX + GAME_WIDTH, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.drawImage(sprites.school, drawX + GAME_WIDTH * 2, 0, GAME_WIDTH, GAME_HEIGHT);
    } else {
        // Simple loading info replacing procedural logic
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = '#ecf0f1';
        ctx.font = '20px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('LOADING ASSETS...', GAME_WIDTH / 2, GAME_HEIGHT / 2);
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('PRESS SPACE TO START WHEN READY', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
        ctx.textAlign = 'left';
    }
}



// --- Game Logic ---

function updateScore() {
    frameCount++;
    if (frameCount % 4 === 0) { // Slower score increment so it doesn't inflate impossibly fast
        score++;
        scoreElement.innerText = score.toString().padStart(5, '0');

        // Gradually increase the difficulty/speed of the game over time
        if (score > 0 && score % 100 === 0) {
            gameSpeed += 0.3; // Speed ramp up
        }
    }
}

function handleGameOver() {
    playSound(gameOverSound);
    isPlaying = false;
    isGameOver = true;
    player.state = 'dead';

    // UI Update
    canvas.classList.add('blurred');
    finalScoreElement.innerText = score.toString().padStart(5, '0');

    // High Score Persistence & Happy State Handling
    if (score > highScore && score > 0) {
        highScore = score;
        localStorage.setItem('schoolJumpHighScore', highScore);
        hiScoreElement.innerText = highScore.toString().padStart(5, '0');
    }

    // Draw the final frame immediately (with the dead kid / happy kid)
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawBackground();
    for (let obs of obstacles) {
        if (allAssetsLoaded && sprites[obs.spriteName]) {
            if (obs.isSpinning) {
                ctx.save();
                ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
                ctx.rotate(obs.rotation);
                ctx.drawImage(sprites[obs.spriteName], -obs.width / 2, -obs.height / 2, obs.width, obs.height);
                ctx.restore();
            } else {
                ctx.drawImage(sprites[obs.spriteName], obs.x, obs.y, obs.width, obs.height);
            }
        } else {
            ctx.fillStyle = '#d35400';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
    }
    player.draw();

    gameOverScreen.classList.remove('hidden');

    cancelAnimationFrame(animationFrameId); // Stop Game Loop
}

/**
 * Reset game entities and state to play again
 */
function resetGame() {
    canvas.classList.remove('blurred');
    // Reset Player
    player.width = player.normalWidth;
    player.height = player.normalHeight;
    player.y = GROUND_LEVEL - player.height;
    player.dy = 0;
    player.isJumping = false;
    player.jumpsCount = 0;
    player.isCrawling = false;
    player.state = 'running';
    player.runFrame = 0;

    // Reset Game State
    obstacles = [];
    score = 0;
    frameCount = 0;
    gameSpeed = 7.2; // Initial speed
    bgOffset = 0;

    scoreElement.innerText = '00000';
    gameOverScreen.classList.add('hidden');
    startScreen.classList.add('hidden');

    isPlaying = true;
    isGameOver = false;
    
    // Request fullscreen on mobile/play start if supported
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen().catch(() => {});
    } else if (docElm.webkitRequestFullscreen) {
        docElm.webkitRequestFullscreen().catch(() => {});
    }

    // Kick off loop
    spawnObstacle(); // initial obstacle
    animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Main Game Loop
 */
function gameLoop() {
    if (!isPlaying) return;

    // 1. Clear Canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 2. Update & Draw Environment
    drawBackground();

    // 3. Update & Draw Player
    player.update();
    player.draw();

    // 4. Update & Draw Obstacles (Including collision detection)
    updateObstacles();

    // 5. Update UI Logic
    if (isPlaying) { // Could have been changed in updateObstacles due to collision
        updateScore();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// --- Input Handling ---

function handleInput() {
    if (!isPlaying && !isGameOver) {
        resetGame();    // Start initially
    } else if (isGameOver) {
        resetGame();    // Restart after crash
    } else {
        player.jump();  // Jump while playing
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ') {
        handleInput();
        e.preventDefault(); // Stop spacebar page scroll
    } else if (e.code === 'ArrowDown' || e.key === 's') {
        player.crawl();
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown' || e.key === 's') {
        player.stand();
        e.preventDefault();
    }
});

let touchTimer;
let jumpTriggered = false;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Stop touch scroll
    if (!isPlaying && !isGameOver) {
        return;
    } else if (isGameOver) {
        resetGame();    // Restart after crash
        return;
    }

    jumpTriggered = false;
    // Tap and hold for duck
    touchTimer = setTimeout(() => {
        if (!jumpTriggered && isPlaying) {
            player.crawl();
        }
    }, 120); 
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    clearTimeout(touchTimer);

    if (player.isCrawling) {
        player.stand();
    } else if (!jumpTriggered && isPlaying) {
        jumpTriggered = true;
        player.jump();
    }
}, { passive: false });

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    clearTimeout(touchTimer);
    if (player.isCrawling) player.stand();
}, { passive: false });

if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (!isPlaying && !isGameOver) {
            resetGame();
        }
    });
    startBtn.addEventListener('touchstart', (e) => {
        if (!isPlaying && !isGameOver) {
            resetGame();
        }
        e.preventDefault();
    }, { passive: false });
}

// Initial render to show starting frame behind the "Start" text
ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
drawBackground();
player.state = 'standing';
player.draw();
