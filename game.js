const tg = window.Telegram.WebApp;
tg.expand(); // Развернуть на весь экран

const canvas = document.getElementById('gameCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const player = {
    x: 100,
    y: 200,
    width: 40,
    height: 40,
    speed: 5,
    jumpForce: -15,
    maxJumpForce: -25,
    minJumpForce: -15,
    jumpTime: 0,
    maxJumpTime: 25,
    velocityY: 0,
    isJumping: false,
    isHoldingJump: false,
    doubleJumps: 0, // Counter for double jumps
    maxDoubleJumps: 3 // Maximum number of double jumps
};

const gravity = 0.5;
let platforms = [];
let score = 0;
let highScore = 0;
let cameraOffset = 0;
let gameTime = 0;
let isGameOver = false;

// Load high score
fetch('highscore.txt')
    .then(response => response.text())
    .then(data => {
        highScore = parseInt(data) || 0;
    })
    .catch(() => {
        highScore = 0;
    });

// Generate initial platforms
function generatePlatform() {
    const minGap = 150;
    const maxGap = 300;
    const lastPlatform = platforms[platforms.length - 1] || { x: 0, width: 0 };
    const x = lastPlatform.x + lastPlatform.width + minGap + Math.random() * (maxGap - minGap);
    const width = 100 + Math.random() * 200;
    const height = 20;
    
    const baseHeight = canvas.height - 150;
    const amplitude = 200;
    const y = baseHeight - Math.random() * amplitude;
    
    const type = Math.random() < 0.2 ? 'moving' : 'normal';
    const movingSpeed = type === 'moving' ? 2 : 0;
    const movingRange = 100;
    const startY = y;

    // Add double jump powerup with 10% chance
    const hasDoubleJump = Math.random() < 0.3;
    const powerupX = x + width / 2 - 15; // Center the powerup on the platform
    const powerupY = y - 30; // Position above the platform
    
    platforms.push({ 
        x, y, width, height, 
        type,
        movingSpeed,
        movingRange,
        startY,
        moveDirection: 1,
        hasDoubleJump,
        powerupX,
        powerupY,
        powerupCollected: false
    });
}

// Generate initial set of platforms
for (let i = 0; i < 5; i++) {
    generatePlatform();
}

function update() {
    if (isGameOver) return;

    gameTime++;
    player.speed = 5 + Math.floor(gameTime / 500);

    if (player.isHoldingJump && player.jumpTime < player.maxJumpTime) {
        player.jumpTime++;
        const jumpProgress = player.jumpTime / player.maxJumpTime;
        player.jumpForce = player.minJumpForce + (player.maxJumpForce - player.minJumpForce) * jumpProgress;
    }

    player.velocityY += gravity;
    player.y += player.velocityY;

    player.x += player.speed;
    cameraOffset = player.x - 200;

    platforms.forEach(platform => {
        if (platform.type === 'moving') {
            platform.y = platform.startY + Math.sin(gameTime * 0.05) * platform.movingRange;
        }

        // Check platform collisions
        if (player.y + player.height > platform.y &&
            player.y < platform.y + platform.height &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
            if (player.velocityY > 0) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                player.jumpTime = 0;
            }
        }

        // Check powerup collisions
        if (platform.hasDoubleJump && !platform.powerupCollected &&
            player.x + player.width > platform.powerupX &&
            player.x < platform.powerupX + 30 &&
            player.y + player.height > platform.powerupY &&
            player.y < platform.powerupY + 30) {
            platform.powerupCollected = true;
            if (player.doubleJumps < player.maxDoubleJumps) {
                player.doubleJumps++;
            }
        }
    });

    if (platforms[platforms.length - 1].x - cameraOffset < canvas.width) {
        generatePlatform();
    }

    platforms = platforms.filter(platform => platform.x - cameraOffset > -200);

    if (player.y > canvas.height) {
        gameOver();
    }

    score = Math.floor(player.x / 100);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background elements (stars)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 567.89 + gameTime * 0.001) * 10000) % canvas.width;
        const y = (Math.cos(i * 123.45 + gameTime * 0.001) * 10000) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }

    // Draw player with glow effect
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x - cameraOffset, player.y, player.width, player.height);
    
    // Draw double jump indicators
    for (let i = 0; i < player.doubleJumps; i++) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(player.x - cameraOffset + 10 + i * 12, player.y - 10, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.shadowBlur = 0;

    // Draw platforms and powerups
    platforms.forEach(platform => {
        if (platform.type === 'moving') {
            ctx.shadowColor = '#4a4aff';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#6a6aff';
        } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#4a4aff';
        }
        ctx.fillRect(platform.x - cameraOffset, platform.y, platform.width, platform.height);

        // Draw double jump powerup
        if (platform.hasDoubleJump && !platform.powerupCollected) {
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(platform.powerupX - cameraOffset + 15, platform.powerupY + 15, 10, 0, Math.PI * 2);
            ctx.fill();
            // Draw wings
            ctx.beginPath();
            ctx.moveTo(platform.powerupX - cameraOffset, platform.powerupY + 15);
            ctx.lineTo(platform.powerupX - cameraOffset + 30, platform.powerupY + 15);
            ctx.stroke();
        }
    });
    ctx.shadowBlur = 0;

    // Draw score and info
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 20, 40);
    ctx.fillText('Speed: ' + player.speed + 'x', 20, 70);
    ctx.fillText('High Score: ' + highScore, canvas.width - 200, 40);

    // Draw jump power meter
    if (player.isHoldingJump && !player.isJumping) {
        const jumpPower = (player.jumpTime / player.maxJumpTime) * 100;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(player.x - cameraOffset, player.y - 20, 40, 5);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(player.x - cameraOffset, player.y - 20, jumpPower / 100 * 40, 5);
    }

    // Draw game over screen
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '64px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 60);
        
        ctx.font = '32px Arial';
        ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2);
        ctx.fillText('High Score: ' + highScore, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 100);
        
        ctx.textAlign = 'left';
    }
}

function gameOver() {
    isGameOver = true;
    if (score > highScore) {
        highScore = score;
        tg.sendData(JSON.stringify({
            action: 'saveScore',
            score: highScore
        }));
    }
}

function resetGame() {
    player.x = 100;
    player.y = 200;
    player.velocityY = 0;
    player.speed = 5;
    player.jumpTime = 0;
    player.isHoldingJump = false;
    player.doubleJumps = 0; // Reset double jumps
    platforms = [];
    cameraOffset = 0;
    score = 0;
    gameTime = 0;
    isGameOver = false;
    for (let i = 0; i < 5; i++) {
        generatePlatform();
    }
}

// Handle jumping and game restart
document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isGameOver) {
        resetGame();
    } else if (!player.isJumping) {
        player.isHoldingJump = true;
    } else if (player.doubleJumps > 0) {
        // Use double jump
        player.velocityY = player.jumpForce;
        player.doubleJumps--;
    }
});

document.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (player.isHoldingJump && !player.isJumping) {
        player.velocityY = player.jumpForce;
        player.isJumping = true;
    }
    player.isHoldingJump = false;
    player.jumpTime = 0;
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

// Добавим обработчик изменения размера окна
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});