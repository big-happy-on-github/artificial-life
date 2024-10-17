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
        ctx.arc(250, 250, 250, angle, angle + arcSize);
        ctx.lineTo(250, 250);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.stroke();
        ctx.save();
        ctx.translate(
            250 + Math.cos(angle + arcSize / 2) * 150,
            250 + Math.sin(angle + arcSize / 2) * 150
        );
        ctx.rotate(angle + arcSize / 2 + Math.PI / 2);
        ctx.fillStyle = '#000';
        ctx.font = '18px Arial';
        ctx.fillText(segment, -ctx.measureText(segment).width / 2, 0);
        ctx.restore();
    });
}

function spinWheel() {
    const spinAngle = Math.random() * 10 + 15;
    const duration = 3000;
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutProgress = Math.pow(progress - 1, 3) + 1;

        currentAngle += spinAngle * easeOutProgress;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(currentAngle);
        ctx.translate(-250, -250);
        drawWheel();
        ctx.restore();

        if (progress < 1) {
            spinTimeout = requestAnimationFrame(animate);
        } else {
            const resultIndex = Math.floor((segments.length - (currentAngle / (2 * Math.PI)) % 1 * segments.length)) % segments.length;
            console.log('Result:', segments[resultIndex]);
        }
    }

    if (spinTimeout) {
        cancelAnimationFrame(spinTimeout);
    }
    animate();
}

drawWheel();
canvas.addEventListener('click', spinWheel);
