const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = 400;
canvas.height = 600;

// Rocket properties
const rocket = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 60,
    width: 30,
    height: 60,
    speed: 5,
    dx: 0
};

// Meteor properties
const meteors = [];
const meteorFrequency = 60; // Frames between new meteor spawn
let frame = 0;
let score = 0;
let gameOver = false;

// Event listeners for rocket movement
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        rocket.dx = -rocket.speed;
    } else if (e.key === "ArrowRight") {
        rocket.dx = rocket.speed;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        rocket.dx = 0;
    }
});

// Update game elements
function update() {
    if (gameOver) return;

    // Move rocket
    rocket.x += rocket.dx;

    // Prevent rocket from going out of bounds
    if (rocket.x < 0) rocket.x = 0;
    if (rocket.x + rocket.width > canvas.width) rocket.x = canvas.width - rocket.width;

    // Add new meteors
    if (frame % meteorFrequency === 0) {
        const meteor = {
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 3 + Math.random() * 3
        };
        meteors.push(meteor);
    }

    // Move and remove meteors
    for (let i = 0; i < meteors.length; i++) {
        const meteor = meteors[i];
        meteor.y += meteor.speed;

        // Check for collision
        if (
            rocket.x < meteor.x + meteor.width &&
            rocket.x + rocket.width > meteor.x &&
            rocket.y < meteor.y + meteor.height &&
            rocket.y + rocket.height > meteor.y
        ) {
            gameOver = true;
            alert(`Game Over! Your Score: ${score}`);
            document.location.reload();
        }

        // Remove meteor if it goes off screen
        if (meteor.y > canvas.height) {
            meteors.splice(i, 1);
            score++;
        }
    }

    // Update score display
    document.getElementById("score").textContent = `Score: ${score}`;

    // Increment frame counter
    frame++;
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rocket
    ctx.fillStyle = "white";
    ctx.fillRect(rocket.x, rocket.y, rocket.width, rocket.height);

    // Draw meteors
    ctx.fillStyle = "gray";
    meteors.forEach((meteor) => {
        ctx.fillRect(meteor.x, meteor.y, meteor.width, meteor.height);
    });
}

// Main game loop
function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Start game
gameLoop();
