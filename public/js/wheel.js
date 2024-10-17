const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

const segments = ['Prize 1', 'Prize 2', 'Prize 3', 'Prize 4', 'Prize 5', 'Prize 6'];
const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#A6FF33', '#33FFF5'];

let currentAngle = 0;
let spinTimeout = null;

function drawWheel() {
    const arcSize = (2 * Math.PI) / segments.length;

    segments.forEach((segment, i) => {
        const angle = i * arcSize;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            200, // Radius of the wheel
            angle,
            angle + arcSize
        );
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.stroke();
        
        // Draw text
        ctx.save();
        ctx.translate(
            canvas.width / 2 + Math.cos(angle + arcSize / 2) * 150,
            canvas.height / 2 + Math.sin(angle + arcSize / 2) * 150
        );
        ctx.rotate(angle + arcSize / 2 + Math.PI / 2);
        ctx.fillStyle = '#000';
        ctx.font = '18px Arial';
        ctx.fillText(segment, -ctx.measureText(segment).width / 2, 0);
        ctx.restore();
    });
}

function drawArrow() {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 10); // Arrow tip position
    ctx.lineTo(canvas.width / 2 - 20, 40); // Left side of the arrow
    ctx.lineTo(canvas.width / 2 + 20, 40); // Right side of the arrow
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.fill();
}

function getSegmentUnderArrow() {
    const arcSize = (2 * Math.PI) / segments.length;
    // Adjust the currentAngle to match the arrow pointing upwards
    const adjustedAngle = (currentAngle + Math.PI / 2) % (2 * Math.PI);
    const index = Math.floor(adjustedAngle / arcSize);
    return (segments.length - 1 - index + segments.length) % segments.length;
}

function spinWheel() {
    const spinSpeed = Math.random() * 0.2 + 0.3; // Random initial speed
    const deceleration = 0.99; // Rate at which the wheel slows down
    let spinAngle = spinSpeed;
    let isSpinning = true;

    function animate() {
        if (isSpinning) {
            spinAngle *= deceleration;

            if (spinAngle < 0.002) {
                isSpinning = false;
                const index = getSegmentUnderArrow();
                console.log('Result:', segments[index]);
                return;
            }

            currentAngle += spinAngle;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(currentAngle);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            drawWheel();
            ctx.restore();

            drawArrow();

            spinTimeout = requestAnimationFrame(animate);
        }
    }

    if (spinTimeout) {
        cancelAnimationFrame(spinTimeout);
    }
    animate();
}

drawWheel();
drawArrow();
canvas.addEventListener('click', spinWheel);
