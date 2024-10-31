import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`);
const supabaseUrl = await response1.json();
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = await response2.json();
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Canvas and Context
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const wheelRadius = 200;

// Wheel Data
const wheelData = [
    { segment: '+1 limbuck', prize: 1, weight: 40 },
    { segment: '+2 limbucks', prize: 2, weight: 30 },
    { segment: '+3 limbucks', prize: 3, weight: 20 },
    { segment: '+4 limbucks', prize: 4, weight: 5 },
    { segment: '+5 limbucks', prize: 5, weight: 4 },
];

// Setup User ID in LocalStorage
if (!localStorage.getItem("userID")) {
    localStorage.setItem("userID", generateRandomString(50));
}
const userID = localStorage.getItem("userID");

// Cooldown Check
async function checkCooldown() {
    try {
        const { data, error } = await supabase
            .from('wheel')
            .select('time')
            .eq('userID', userID)
            .single();

        if (error && error.code === "PGRST116") {
            await supabase.from('wheel').insert({ userID, time: new Date().toISOString() });
            return true;
        }
        const lastSpinTime = new Date(data.time);
        const timeRemaining = 86400000 - (new Date() - lastSpinTime);
        if (timeRemaining > 0) {
            alert(`Next spin in ${Math.floor(timeRemaining / 3600000)}h ${Math.floor((timeRemaining % 3600000) / 60000)}m`);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Error checking cooldown:', err);
        return false;
    }
}

// Update Spin Time in Supabase
async function updateSpinTime() {
    try {
        const { data: existingData, error } = await supabase
            .from('wheel')
            .select('userID')
            .eq('userID', userID);

        const currentTime = new Date().toISOString();
        if (existingData && existingData.length > 0) {
            await supabase.from('wheel').update({ time: currentTime }).eq('userID', userID);
        } else {
            await supabase.from('wheel').insert({ userID, time: currentTime });
        }
    } catch (error) {
        console.error('Error updating spin time:', error);
    }
}

// Draw Wheel
function drawWheel() {
    const arcSize = (2 * Math.PI) / wheelData.length;

    wheelData.forEach((data, i) => {
        const angle = i * arcSize;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, wheelRadius, angle, angle + arcSize);
        ctx.closePath();
        ctx.fillStyle = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Random color
        ctx.fill();
        ctx.stroke();
        drawText(data.segment, angle + arcSize / 2);
    });
}

// Draw Text on Wheel Segments
function drawText(text, angle) {
    ctx.save();
    ctx.translate(
        canvas.width / 2 + Math.cos(angle) * (wheelRadius - 50),
        canvas.height / 2 + Math.sin(angle) * (wheelRadius - 50)
    );
    ctx.rotate(angle + Math.PI / 2);
    ctx.font = '18px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
    ctx.restore();
}

// Draw Arrow
function drawArrow() {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2 - 20, 40);
    ctx.lineTo(canvas.width / 2 + 20, 40);
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.fill();
}

// Spin Wheel Animation
async function spinWheel() {
    if (!(await checkCooldown())) return;
    const selectedSegmentIndex = selectSegmentWithWeight();
    const arcSize = (2 * Math.PI) / wheelData.length;
    const targetAngle = ((wheelData.length - 1 - selectedSegmentIndex) * arcSize) + Math.PI * 8;

    let rotation = 0;
    const spinSpeed = Math.random() * 0.5 + 2;
    let spinInterval = setInterval(() => {
        if (rotation < targetAngle) {
            rotation += spinSpeed;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            drawWheel();
            ctx.restore();
            drawArrow();
        } else {
            clearInterval(spinInterval);
            alert(`You won ${wheelData[selectedSegmentIndex].segment}`);
            updateSpinTime();
            addLimbucks(wheelData[selectedSegmentIndex].prize);
        }
    }, 16);
}

// Select Segment Based on Weight
function selectSegmentWithWeight() {
    const totalWeight = wheelData.reduce((acc, seg) => acc + seg.weight, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < wheelData.length; i++) {
        if (random < wheelData[i].weight) return i;
        random -= wheelData[i].weight;
    }
    return 0;
}

// Update Limbucks
async function addLimbucks(amount) {
    try {
        const { data, error } = await supabase.from('limbucks').select('amount').eq("userID", userID).single();
        const newAmount = data.amount + amount;
        await supabase.from('limbucks').update({ amount: newAmount }).eq("userID", userID);
    } catch (error) {
        console.error('Error updating Limbucks:', error);
    }
}

// Draw initial wheel and set click event
drawWheel();
drawArrow();
canvas.addEventListener('click', spinWheel);

const { data, error: selectError } = await supabase
    .from('visits')
    .select('*')
    .eq('project_name', 'wheel');

if (selectError) throw selectError;

if (data.length === 0) {
    const { error: insertError } = await supabase
        .from('visits')
        .insert([{ project_name: 'wheel', num_visits: 1 }]);

    if (insertError) throw insertError;

    console.log('Created new row with project_name "wheel" and num_visits set to 1');
} else {
    const currentVisits = data[0].num_visits || 0;

    const { error: updateError } = await supabase
        .from('visits')
        .update({ num_visits: currentVisits + 1 })
        .eq('project_name', 'wheel');

    if (updateError) throw updateError;

    console.log(`Updated num_visits to ${currentVisits + 1} for project_name "wheel"`);
}
