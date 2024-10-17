const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

const segments = ['+1 limbuck', '+2 limbucks', '+3 limbucks', '+4 limbucks', '+10 limbucks', '+1000000 limbucks'];
const prizes = [1, 2, 3, 4, 10, 1000000];
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
            const timeRemaining = 86400000 - timeDiff;
            const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const secondsLeft = Math.floor((timeRemaining % (1000 * 60)) / 1000);
            
            alert(`you can spin again in ${hoursLeft} hours, ${minutesLeft} minutes, and ${secondsLeft} seconds`);
            return false;
        }
    } else if (error.code === "PGRST116") {
        const { data, error: insertError } = await supabase
            .from('wheel')
            .insert({ userID: userID, time: new Date().toISOString() });
    
        if (insertError) {
            console.error('Error inserting new spin record:', insertError);
        } else {
            console.log('Spin time recorded successfully:', data);
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

    const initialSpinSpeed = Math.random() * 0.3 + 0.5; // Higher initial speed
    const deceleration = 0.99; // Deceleration factor (slightly less than 1)
    let spinAngle = initialSpinSpeed;
    let isSpinning = true;

    function animate() {
        if (isSpinning) {
            // Apply the deceleration factor to reduce the speed gradually
            spinAngle *= deceleration;

            if (spinAngle < 0.002) { // Stop condition
                isSpinning = false;
                const index = getSegmentUnderArrow();
                const result = segments[index];
                const prize = prizes[index];
                alert(`you got ${result}!`);
                
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