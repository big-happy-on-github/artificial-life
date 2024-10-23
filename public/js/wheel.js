const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

const wheelData = [
    { segment: '+1 limbuck', prize: 1, weight: 40 },
    { segment: '+2 limbucks', prize: 2, weight: 30 },
    { segment: '+3 limbucks', prize: 3, weight: 20 },
    { segment: '+4 limbucks', prize: 4, weight: 5 },
    { segment: '+5 limbucks', prize: 5, weight: 4 },
    { segment: '+Infinity limbucks', prize: Infinity, weight: 1 },
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
        await supabase
            .from('wheel')
            .insert({ userID: userID, time: new Date().toISOString() });
        return true;
    } else if (error) {
        console.error('Error fetching data:', error);
        return false;
    }

    if (data) {
        const lastSpinTime = new Date(data.time);
        const currentTime = new Date();
        const timeDiff = currentTime - lastSpinTime;

        if (timeDiff < 86400000) {
            const timeRemaining = 86400000 - timeDiff;
            const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const secondsLeft = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            alert(`you can spin again in ${hoursLeft} hours, ${minutesLeft} minutes, and ${secondsLeft} seconds`);
            return false;
        }
    }

    return true;
}

async function updateSpinTime() {
    const currentTime = new Date().toISOString();

    const { data: existingData, error: selectError } = await supabase
        .from('wheel')
        .select('userID')
        .eq('userID', userID);

    if (selectError) {
        console.error('Error fetching user:', selectError);
        return;
    }

    if (existingData && existingData.length > 0) {
        const { error: updateError } = await supabase
            .from('wheel')
            .update({ time: currentTime })
            .eq('userID', userID);

        if (updateError) {
            console.error('Error during update:', updateError);
        } else {
            console.log('Update successful');
        }
    } else {
        const { error: insertError } = await supabase
            .from('wheel')
            .insert({ userID: userID, time: currentTime });

        if (insertError) {
            console.error('Error during insert:', insertError);
        } else {
            console.log('Insert successful');
        }
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

function selectSegmentWithWeight() {
    const totalWeight = wheelData.reduce((sum, segment) => sum + segment.weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < wheelData.length; i++) {
        if (random < wheelData[i].weight) {
            return i; // Return the index of the selected segment
        }
        random -= wheelData[i].weight;
    }
    return 0;
}

async function spinWheel() {
    const canSpin = await checkCooldown();
    if (!canSpin) return;

    const deceleration = 0.97;
    let initialSpinSpeed = Math.random() * 0.5 + 0.5;

    let selectedSegmentIndex = selectSegmentWithWeight();
    const selectedPrize = wheelData[selectedSegmentIndex].prize;

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
    const { data, error } = await supabase
        .from('limbucks')
        .select('*')
        .eq("userID", userID);
    const newAmount = data[0].amount + amount;
    const { data: data2, error: error2 } = await supabase
        .from('limbucks')
        .update({ "amount": newAmount })
        .eq("userID", userID);
}

drawWheel();
drawArrow();

canvas.addEventListener('click', spinWheel);
