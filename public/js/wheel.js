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

function drawArrow() {
    ctx.beginPath();
    ctx.moveTo(250, 0); // Starting point at the top center of the canvas
    ctx.lineTo(240, 30); // Left edge of the arrow
    ctx.lineTo(260, 30); // Right edge of the arrow
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.fill();
}

// Function to find the segment that the arrow intersects with when the wheel stops
function getSegmentUnderArrow() {
    const arcSize = (2 * Math.PI) / segments.length;
    const arrowX = 250;
    const arrowY = 0; // Arrow tip is at the top center of the canvas

    for (let i = 0; i < segments.length; i++) {
        const startAngle = (i * arcSize - currentAngle + 2 * Math.PI) % (2 * Math.PI);
        const endAngle = ((i + 1) * arcSize - currentAngle + 2 * Math.PI) % (2 * Math.PI);

        // Check if the arrow's coordinates fall within this segment's angular range
        if (startAngle < endAngle) {
            // Regular case where segment doesn't wrap around 0 degrees
            if (Math.atan2(arrowY - 250, arrowX - 250) >= startAngle && 
                Math.atan2(arrowY - 250, arrowX - 250) < endAngle) {
                return i;
            }
        } else {
            // Case where the segment wraps around 0 degrees
            if (Math.atan2(arrowY - 250, arrowX - 250) >= startAngle || 
                Math.atan2(arrowY - 250, arrowX - 250) < endAngle) {
                return i;
            }
        }
    }

    return -1; // Should never happen if the segments cover the entire wheel
}

function spinWheel() {
    const spinSpeed = 0.2; // Initial speed
    const deceleration = 0.99; // Rate at which the wheel slows down
    let spinAngle = spinSpeed;
    let isSpinning = true;

    function animate() {
        if (isSpinning) {
            // Gradually decrease the spin speed
            spinAngle *= deceleration;

            // Stop the wheel when the spin speed is very low
            if (spinAngle < 0.002) {
                isSpinning = false;

                // Find the segment under the arrow
                const index = getSegmentUnderArrow();
                console.log('Result:', segments[index]);
                return;
            }

            // Update the angle based on the current spin speed
            currentAngle += spinAngle;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(250, 250);
            ctx.rotate(currentAngle);
            ctx.translate(-250, -250);
            drawWheel();
            ctx.restore();

            // Draw the arrow after the wheel to ensure it's always on top
            drawArrow();

            requestAnimationFrame(animate);
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
