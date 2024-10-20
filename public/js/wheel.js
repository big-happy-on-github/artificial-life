const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

const segments = ['+1 limbuck', '+2 limbucks', '+3 limbucks', '+4 limbucks', '+1 limbuck', '+5 limbucks'];
const prizes = [1, 2, 3, 4, 1, 5];
const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#A6FF33', '#33FFF5'];

let currentAngle = 0;
let spinTimeout = null;
if (!localStorage.getItem("userID")) {
    localStorage.setItem("userID", generateRandomString(50));
}
const userID = localStorage.getItem("userID");

// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`, { mode: 'no-cors' });
const supabaseUrl = response1.text();
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`, { mode: 'no-cors' });
const supabaseKey = response2.text();
console.log(supabaseUrl);
console.log(supabaseKey);
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCooldown() {
    const { data, error } = await supabase
        .from('wheel')
        .select('time')
        .eq('userID', userID)
        .single();

    if (error && error.code === "PGRST116") {
        // If there's no record for this user, allow the spin and insert the new record
        await supabase
            .from('wheel')
            .insert({ userID: userID, time: new Date().toISOString() });
        return true;
    } else if (error) {
        console.error('Error fetching data:', error);
        return false; // Disallow spin if there's a different error
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
            
            alert(`You can spin again in ${hoursLeft} hours, ${minutesLeft} minutes, and ${secondsLeft} seconds`);
            return false; // Don't allow spin
        }
    }

    return true; // Allow spin if 24 hours have passed
}

async function updateSpinTime() {
    const currentTime = new Date().toISOString();
    const { data, error } = await supabase
        .from('wheel')
        .upsert({ userID: userID, time: currentTime })
        .onConflict('userID'); // Ensures conflict resolution by userID
    
    if (error) {
        console.error('Error during upsert:', error);
    } else {
        console.log('Upsert successful:', data);
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

    async function animate() {
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
                await addLimbucks(prize);
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

async function addLimbucks(amount) {
    if (!localStorage.getItem("userID")) {
        localStorage.setItem("userID", generateRandomString(50));
    }
    const userID = localStorage.getItem("userID");
    const { data, error } = await supabase
        .from('limbucks')
        .select('*')
        .eq("userID", userID);
    const newAmount = data[0].amount+amount;
    const { data: data2, error: error2 } = await supabase
        .from('limbucks')
        .update({ "amount": newAmount })
        .eq("userID", userID);
}

drawWheel();
drawArrow();

canvas.addEventListener('click', spinWheel);


// Check if there is a row with project_name 'liamstd'
const { data, error: selectError } = await supabase
    .from('visits')
    .select('*')
    .eq('project_name', 'wheel');

// Handle any select errors
if (selectError) {
    throw selectError;
}

// If the row doesn't exist, insert it with num_visits initialized to 1
if (data.length === 0) {
    const { error: insertError } = await supabase
        .from('visits')
        .insert([{ project_name: 'wheel', num_visits: 1 }]);

    if (insertError) {
        throw insertError;
    }

    console.log('Created new row with project_name "wheel" and num_visits set to 1');
} else {
    // If the row exists, update the num_visits by incrementing its value
    const currentVisits = data[0].num_visits || 0; // Default to 0 if num_visits is not found

    const { error: updateError } = await supabase
        .from('visits')
        .update({ num_visits: currentVisits + 1 })
        .eq('project_name', 'wheel');

    if (updateError) {
        throw updateError;
    }

    console.log(`Updated num_visits to ${currentVisits + 1} for project_name "wheel"`);
}
