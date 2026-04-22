const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const rows = 10;
const cols = 13;
const tileSize = 40;

canvas.width = cols * tileSize;
canvas.height = rows * tileSize;

// Load images
const wallImage = new Image();
wallImage.src = "https://imgur.com/2wxq3od.png";

const walkwayImage = new Image();
walkwayImage.src = "https://i.imgur.com/3henhoR.png";

const playerImage = new Image();
playerImage.src = "sealpfp.png"; // Player character

const whiteHeartImage = new Image();
whiteHeartImage.src = "heart.png"; // White heart (win condition)

const blackHeartImage = new Image();
blackHeartImage.src = "brokenheart.png"; // Black heart (obstacle)

// Easter egg heart
const secretHeartImage = new Image();
secretHeartImage.src = "heart.png"; // Second white heart

let secretUnlocked = false; // Easter egg flag

// Sound effects
const moveSound = new Audio("move.mp3"); // Movement sound
const surpriseSound = new Audio("surprise.mp3"); // Easter egg sound
const loseSound = new Audio("lose.mp3"); // Lose sound

moveSound.volume = 0.5;
moveSound.preload = "auto";

surpriseSound.volume = 0.7;
surpriseSound.preload = "auto";

loseSound.volume = 0.7;
loseSound.preload = "auto";

// Maze definition (1 = wall, 0 = walkway)
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];


// // Secret path maze that unlocks when the Easter Egg is activated
// const secretMaze = [
//     [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
//     [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
//     [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
//     [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
//     [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1]
// ];

// // Player & object positions
// const player = { x: 1, y: 9 };
// const whiteHeartPos = { x: 11, y: 1 };
// const blackHeartPos = { x: 6, y: 5 };
// const secretHeartPos = { x: 2, y: 0 };

// // **Start Game (Fixes Button)**
// function startGame() {
//     document.getElementById("start-screen").style.display = "none";
//     document.getElementById("game-over-screen").style.display = "none";
//     gameStarted = true;
//     secretUnlocked = false;
//     player.x = 1;
//     player.y = 9;
//     inputSequence = "";
//     drawMaze();
// }

// Initial positions
const player = { x: 1, y: 9 };       // Player starting position
const whiteHeartPos = { x: 11, y: 1 }; // Winning point
const blackHeartPos = { x: 6, y: 5 };  // Obstacle

const secretHeartPos = { x: 1, y: 1 }; // Easter egg heart position
let inputSequence = ""; // Store entered numbers

let gameStarted = false;

function startGame() {
    gameStarted = true;
    drawMaze();
}

// Draw the maze function
function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x] === 1) {
                ctx.drawImage(wallImage, x * tileSize, y * tileSize, tileSize, tileSize);
            } else {
                ctx.drawImage(walkwayImage, x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }

    // Draw hearts
    ctx.drawImage(whiteHeartImage, whiteHeartPos.x * tileSize, whiteHeartPos.y * tileSize, tileSize, tileSize);
    ctx.drawImage(blackHeartImage, blackHeartPos.x * tileSize, blackHeartPos.y * tileSize, tileSize, tileSize);

    // Draw secret heart if unlocked
    if (secretUnlocked) {
        ctx.drawImage(secretHeartImage, secretHeartPos.x * tileSize, secretHeartPos.y * tileSize, tileSize, tileSize);
    }

    // Draw the player
    ctx.drawImage(playerImage, player.x * tileSize, player.y * tileSize, tileSize, tileSize);
}

// Move player
function movePlayer(dx, dy) {
    if (!gameStarted) return;

    let newX = player.x + dx;
    let newY = player.y + dy;

    // Check within boundaries and not a wall
    if (
        newX >= 0 &&
        newX < cols &&
        newY >= 0 &&
        newY < rows &&
        maze[newY][newX] === 0
    ) {
        player.x = newX;
        player.y = newY;

        // Play move sound
        moveSound.currentTime = 0; // Reset sound for quick replay
        moveSound.play().catch(error => console.log("Autoplay blocked:", error));

        // Win condition
        if (player.x === whiteHeartPos.x && player.y === whiteHeartPos.y) {
            showWinContent();
        }

        // Obstacle condition
        if (player.x === blackHeartPos.x && player.y === blackHeartPos.y) {
            showGameOver();
        }

        // Easter egg heart condition
        if (secretUnlocked && player.x === secretHeartPos.x && player.y === secretHeartPos.y) {
            showSecretEnding();
        }

        drawMaze();
    }
}

// Show win content
function showWinContent() {
    window.location.href = "https://clarie.neocities.org/Pink%2520Envelope";
}

// Show game over screen
function showGameOver() {
    loseSound.play().catch(error => console.log("Autoplay blocked:", error)); // Play lose sound
    document.getElementById("game-over-screen").style.display = "block";
    gameStarted = false;
}

// Easter egg function (redirects to chris.html)
function showSecretEnding() {
    window.location.href = "chris.html";
}

// Start game
function startGame() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-over-screen").style.display = "none";
    gameStarted = true;
    player.x = 1;
    player.y = 9;
    inputSequence = ""; // Reset input
    drawMaze();
}

// Restart game
function restartGame() {
    document.getElementById("game-over-screen").style.display = "none";
    startGame();
}

// Listen for key inputs
window.addEventListener("keydown", function (event) {
    switch (event.key) {
        case "ArrowUp":    movePlayer(0, -1); break;
        case "ArrowDown":  movePlayer(0,  1); break;
        case "ArrowLeft":  movePlayer(-1, 0); break;
        case "ArrowRight": movePlayer(1,  0); break;
        default:
            // Store number input for Easter egg
            if (!isNaN(event.key)) {
                inputSequence += event.key;

                // Check if sequence is "177013"
                if (inputSequence === "177013" && !secretUnlocked) {
                    secretUnlocked = true;
                    alert("Easter Egg Unlocked! A new heart appeared!");
                    surpriseSound.play().catch(error => console.log("Autoplay blocked:", error)); // Play surprise sound
                    drawMaze();
                }

                // Limit input length to prevent overflow
                if (inputSequence.length > 6) {
                    inputSequence = inputSequence.slice(1);
                }
            }
    }
});

// Draw maze when images are loaded
wallImage.onload = drawMaze;
walkwayImage.onload = drawMaze;
playerImage.onload = drawMaze;
whiteHeartImage.onload = drawMaze;
blackHeartImage.onload = drawMaze;
secretHeartImage.onload = drawMaze;
