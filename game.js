// ===============================
// ELEMENT POPUP
// ===============================
const popupWelcome = document.getElementById("popupWelcome");
const openFormBtn = document.getElementById("openFormBtn");

// ===============================
// ELEMENT FORM
// ===============================
const formScreen = document.getElementById("formScreen");
const playerFormName = document.getElementById("playerFormName");
const startGameBtn = document.getElementById("startGameBtn");

// ===============================
// GAME UI
// ===============================
const gameUI = document.getElementById("gameUI");
const playerNameDisplay = document.getElementById("playerNameDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const highScoreDisplay = document.getElementById("highScoreDisplay");
const timeDisplay = document.getElementById("timeDisplay");

// ===============================
// REWIND
// ===============================
const rewindSlider = document.getElementById("rewindSlider");
const rewindBtn = document.getElementById("rewindBtn");

// ===============================
// GAME OVER POPUP
// ===============================
const gameOverPopup = document.getElementById("gameOverPopup");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

// ===============================
// CANVAS
// ===============================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ===============================
// HIGH SCORE SYSTEM
// ===============================
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
highScoreDisplay.textContent = "High Score: " + highScore;

// ===============================
// POPUP / FORM HANDLERS
// ===============================
openFormBtn.addEventListener("click", () => {
    popupWelcome.classList.add("hidden");
    formScreen.classList.remove("hidden");
});

playerFormName.addEventListener("input", () => {
    startGameBtn.disabled = playerFormName.value.trim() === "";
});

// ENTER → OPEN POPUP
document.addEventListener("keydown", (e) => {
    if (!popupWelcome.classList.contains("hidden") && e.key === "Enter") {
        openFormBtn.click();
    }
});

// ENTER → START GAME
playerFormName.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !startGameBtn.disabled) {
        startGameBtn.click();
    }
});

// ===============================
// GAME VARIABLES
// ===============================
const GRID = 20;
const COLS = 48;
const ROWS = 30;

let snake = [];
let direction = { x: 1, y: 0 };
let pellets = [];
let score = 0;
let timer = 0;

let gameLoop = null;
let timerLoop = null;

// REWIND
let historyFrames = [];
const MAX_REWIND = 20;
let rewinding = false;

// ===============================
// START GAME
// ===============================
startGameBtn.addEventListener("click", () => {
    formScreen.classList.add("hidden");
    startGame();
});

function startGame() {
    gameUI.classList.remove("hidden");
    canvas.classList.remove("hidden");

    // Tampilkan nama player
    const name = playerFormName.value.trim();
    playerNameDisplay.textContent = "Player: " + name;

    // Reset variabel game
    snake = [];
    score = 0;
    timer = 0;
    pellets = []; // Reset array pellet
    direction = { x: 1, y: 0 };
    historyFrames = [];
    rewinding = false;
    rewindSlider.value = 0;

    // Inisialisasi snake
    const startX = Math.floor(COLS / 2);
    const startY = Math.floor(ROWS / 2);

    for (let i = 0; i < 3; i++) {
        snake.push({ x: startX - i, y: startY });
    }

    // SPAWN 3 PELLET DI AWAL
    for (let i = 0; i < 3; i++) {
        spawnPellet();
    }

    // Start loop game
    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, 200);

    clearInterval(timerLoop);
    timerLoop = setInterval(() => {
        if (!rewinding) {
            timer++;
            timeDisplay.textContent = "Time: " + timer + "s";
        }
    }, 1000);

    scoreDisplay.textContent = "Score: " + score;
}

// ===============================
// GAME OVER
// ===============================
function gameOver() {
    clearInterval(gameLoop);
    clearInterval(timerLoop);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highScoreDisplay.textContent = "High Score: " + highScore;
    }

    finalScore.textContent = "Your Score: " + score;
    gameOverPopup.classList.remove("hidden");
}

restartBtn.addEventListener("click", () => {
    gameOverPopup.classList.add("hidden");
    startGame();
});

// ===============================
// SPAWN PELLET (RANDOM & CEK TABRAKAN)
// ===============================
function spawnPellet() {
    let x, y;
    let isOnSnake;

    // Cari posisi random yang tidak menimpa ular
    do {
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
        // Pastikan tidak muncul di badan ular
        isOnSnake = snake.some(segment => segment.x === x && segment.y === y);
    } while (isOnSnake);

    pellets.push({ x, y });
}

// ===============================
// MAIN LOOP
// ===============================
function updateGame() {
    if (rewinding) return;

    saveHistory();

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Wrap around
    if (head.x < 0) head.x = COLS - 1;
    if (head.x >= COLS) head.x = 0;
    if (head.y < 0) head.y = ROWS - 1;
    if (head.y >= ROWS) head.y = 0;

    // Collide own body
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }

    // Eat pellet
    let ate = false;
    for (let i = 0; i < pellets.length; i++) {
        if (pellets[i].x === head.x && pellets[i].y === head.y) {
            ate = true;
            pellets.splice(i, 1); // Hapus pellet yang dimakan
            spawnPellet();        // Munculkan 1 yang baru sebagai pengganti
            break;
        }
    }

    snake.unshift(head);
    if (!ate) {
        snake.pop();
    } else {
        score++;
    }

    scoreDisplay.textContent = "Score: " + score;
    drawGame();
}

// ===============================
// DRAW GAME
// ===============================
function drawGame() {
    // Background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pellets (Iterasi array pellets)
    ctx.fillStyle = "red";
    pellets.forEach(p => {
        ctx.fillRect(p.x * GRID, p.y * GRID, GRID, GRID);
    });

    // Snake
    snake.forEach((s, i) => {
        ctx.fillStyle = (i === 0 ? "#006b3c" : "#22cc88");
        ctx.fillRect(s.x * GRID, s.y * GRID, GRID, GRID);
    });
}

// ===============================
// CONTROLS (Arrow / WASD)
// ===============================
document.addEventListener("keydown", (e) => {
    if (rewinding) return;

    if ((e.key === "ArrowUp" || e.key === "w") && direction.y === 0) direction = { x: 0, y: -1 };
    if ((e.key === "ArrowDown" || e.key === "s") && direction.y === 0) direction = { x: 0, y: 1 };
    if ((e.key === "ArrowLeft" || e.key === "a") && direction.x === 0) direction = { x: -1, y: 0 };
    if ((e.key === "ArrowRight" || e.key === "d") && direction.x === 0) direction = { x: 1, y: 0 };
});

// ===============================
// SAVE HISTORY
// ===============================
function saveHistory() {
    historyFrames.unshift({
        snake: JSON.parse(JSON.stringify(snake)),
        pellets: JSON.parse(JSON.stringify(pellets)),
        score,
        timer
    });

    if (historyFrames.length > MAX_REWIND) {
        historyFrames.pop();
    }
}

// ===============================
// REWIND SLIDER
// ===============================
rewindSlider.addEventListener("input", () => {
    rewinding = true; // Set rewinding ke true saat slider digeser
    const sec = Number(rewindSlider.value);
    const frameIndex = Math.min(sec * 3, historyFrames.length - 1); 

    if (frameIndex < 0 || !historyFrames[frameIndex]) return;

    const snap = historyFrames[frameIndex];

    snake = JSON.parse(JSON.stringify(snap.snake));
    pellets = JSON.parse(JSON.stringify(snap.pellets));
    score = snap.score;
    timer = snap.timer;

    scoreDisplay.textContent = "Score: " + score;
    timeDisplay.textContent = "Time: " + timer + "s";

    drawGame();
});

// ===============================
// REWIND BUTTON (Resume Play)
// ===============================
rewindBtn.addEventListener("click", () => {
    rewinding = false;
});