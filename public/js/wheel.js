const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

const segments = ['Prize 1', 'Prize 2', 'Prize 3', 'Prize 4', 'Prize 5', 'Prize 6'];
const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#A6FF33', '#33FFF5'];

let currentAngle = 0;
let spinTimeout = null;
if (!localStorage.getItem("userID")) {
    localStorage.setItem("userID", generateRandomString(50));
}
const userID = localStorage.getItem("userID");

// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase configuration
const supabaseUrl = 'https://kjfnxynntottdbxjcree.supabase.co'; // Replace with your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZm54eW5udG90dGRieGpjcmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxNjE2MzIsImV4cCI6MjA0MzczNzYzMn0.ot3Wtv5RL8bBYOu0YRRZZotPJXBQ5a6c9kSFSmihgCI'; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCooldown() {
    const { data, error } = await supabase
        .from('wheel')
        .select('time')
        .eq('userID', userID)
        .single();

    if (error) {
        console.error('Error fetching data:', error);
        return true; // Allow spin if there's an error fetching
    }

    if (data) {
        const lastSpinTime = new Date(data.time);
        const currentTime = new Date();
        const timeDiff = currentTime - lastSpinTime;

        // Check if 24 hours (86400000 milliseconds) have passed
        if (timeDiff < 86400000) {
            const hoursLeft = Math.floor((86400000 - timeDiff) / (1000 * 60 * 60));
            alert(`you can spin again in ${hoursLeft} hours`);
            return false;
        }
    }

    return true; // Allow spin if 24 hours have passed or no record found
}

async function updateSpinTime() {
    const currentTime = new Date().toISOString();
    const { data, error } = await supabase
        .from('wheel')
        .upsert({ userID: userID, time: currentTime });

    if (error) {
        console.error('Error updating spin time:', error);
    } else {
        console.log('Spin time updated:', data);
    }
}

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
    ctx.moveTo(canvas.width / 2, -10);
    ctx.lineTo(canvas.width / 2 - 20, 40);
    ctx.lineTo(canvas.width / 2 + 20, 40);
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.fill();
}

function getSegmentUnderArrow() {
    const arcSize = (2 * Math.PI) / segments.length;
    const adjustedAngle = (currentAngle + Math.PI / 2) % (2 * Math.PI);
    const index = Math.floor(adjustedAngle / arcSize);
    return (segments.length - 1 - index + segments.length) % segments.length;
}

async function spinWheel() {
    const canSpin = await checkCooldown();
    if (!canSpin) return;

    const spinSpeed = Math.random() * 0.2 + 0.3;
    const deceleration = Math.random() * 0.4 + 0.8;
    let spinAngle = spinSpeed;
    let isSpinning = true;

    function animate() {
        if (isSpinning) {
            spinAngle *= deceleration;

            if (spinAngle < 0.002) {
                isSpinning = false;
                const index = getSegmentUnderArrow();
                console.log('Result:', segments[index]);

                updateSpinTime(); // Update the spin time once the wheel stops
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
