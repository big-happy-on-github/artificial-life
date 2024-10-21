const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

const wheelData = [
    { segment: '+1 limbuck', prize: 1 },
    { segment: '+2 limbucks', prize: 2 },
    { segment: '+3 limbucks', prize: 3 },
    { segment: '+4 limbucks', prize: 4 },
    { segment: '+5 limbucks', prize: 5 },
    { segment: '+1 limbuck', prize: 1 },
    { segment: '+Infinity limbucks', prize: Infinity },
];

let currentAngle = 0;
let spinTimeout = null;
if (!localStorage.getItem("userID")) {
    localStorage.setItem("userID", generateRandomString(50));
}
const userID = localStorage.getItem("userID");

// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`, { mode: 'no-cors' });
const supabaseUrl = JSON.parse(await response1.text());
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`, { mode: 'no-cors' });
const supabaseKey = JSON.parse(await response2.text());
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
    const arcSize = (2 * Math.PI) / wheelData.length;

    wheelData.forEach((data, i) => {
        const angle = i * arcSize;
        const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Random color
        
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
        ctx.fillStyle = color;
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
        ctx.fillText(data.segment, -ctx.measureText(data.segment).width / 2, 0);
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
    const arcSize = (2 * Math.PI) / wheelData.length;
    const adjustedAngle = (currentAngle + Math.PI / 2) % (2 * Math.PI);
    const index = Math.floor(adjustedAngle / arcSize);
    return (wheelData.length - 1 - index + wheelData.length) % wheelData.length;
}

function predictFinalSegment(initialSpinSpeed, deceleration) {
    let totalAngle = 0;
    let speed = initialSpinSpeed;

    // Sum up the angles until the speed drops below a small threshold
    while (speed > 0.002) {
        totalAngle += speed;
        speed *= deceleration;
    }

    // Add the total spin angle to the current angle
    const finalAngle = (currentAngle + totalAngle) % (2 * Math.PI);

    // Calculate the final segment based on the final angle
    const arcSize = (2 * Math.PI) / wheelData.length;
    const adjustedAngle = (finalAngle + Math.PI / 2) % (2 * Math.PI);
    const index = Math.floor(adjustedAngle / arcSize);

    // Return the segment the wheel will land on
    return (wheelData.length - 1 - index + wheelData.length) % wheelData.length;
}

async function spinWheel() {
    const canSpin = await checkCooldown();
    if (!canSpin) return;

    const deceleration = 0.999;
    let initialSpinSpeed = Math.random() * 0.8 + 0.5;

    // Ensuring not to land on "+Infinity limbucks" repeatedly
    while (predictFinalSegment(initialSpinSpeed, deceleration) == wheelData.findIndex(data => data.prize === Infinity)) {
        initialSpinSpeed = Math.random() * 0.8 + 0.5;
    }

    let spinAngle = initialSpinSpeed;
    let isSpinning = true;

    async function animate() {
        if (isSpinning) {
            spinAngle *= deceleration;

            if (spinAngle < 0.002) {
                isSpinning = false;
                const index = getSegmentUnderArrow();
                const result = wheelData[index].segment;
                const prize = wheelData[index].prize;
                alert(`you got ${result}!`);

                updateSpinTime();
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
