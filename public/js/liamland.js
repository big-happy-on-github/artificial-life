// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`, { mode: 'no-cors' });
const supabaseUrl = JSON.parse(await response1.text());
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`, { mode: 'no-cors' });
const supabaseKey = JSON.parse(await response2.text());
const supabase = createClient(supabaseUrl, supabaseKey);

const gameList = [{ name: "liamstd", cost: 0 }, { name: "chat", cost: 0 }, { name: "wheel", cost: 0 }, { name: "shadowboxing", cost: 5 }, { name: "admin", cost: 1/0 }];

// Function to add data to Supabase
async function addData(feedback) {
        try {
                // Fetch IP information
                const response = await fetch('https://ipinfo.io/json?token=ca3a9249251d12');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const ipInfo = await response.json();
                console.log(ipInfo); // Logs the IP information
                alert("thank you!")
                document.getElementById("feedbackInput").value = "";

                if (!localStorage.getItem("userID")) {
                    localStorage.setItem("userID", generateRandomString(50));
                }
                const userID = localStorage.getItem("userID");
                // Add data to Supabase
                const { data, error } = await supabase
                    .from('feedback') // Assuming 'feedback' is the name of your table
                    .insert([
                        { ip: ipInfo, feedback: feedback, userID: userID }
                    ]);
                
                if (error) {
                    throw error;
                }
                
                console.log('Data inserted:', data);
        } catch (error) {
                console.error('Error:', error);
        }
}

// Function to get data from Supabase
async function getData() {
        try {
                const { data, error } = await supabase
                    .from('feedback')
                    .select('*');
                
                if (error) {
                    throw error;
                }
                
                data.forEach((feedback) => {
                    console.log(feedback);
                });
        } catch (error) {
                console.error('Error fetching data:', error);
        }
}

window.getData = getData;
window.addData = addData;

// Function to add data to Supabase
async function addLimbucks(amount, userID, games) {
    try {
        // Add or update data in Supabase
        const { data, error } = await supabase
            .from('limbucks')
            .upsert({ amount, userID, games });
        
        if (error) {
            throw error;
        }
        
        console.log('Data inserted or updated:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Function to get data from Supabase
async function getLimbucks() {
    if (!localStorage.getItem("userID")) {
        localStorage.setItem("userID", generateRandomString(50));
    }
    const userID = localStorage.getItem("userID");
    try {
        const { data, error } = await supabase
            .from('limbucks')
            .select('amount')
            .eq("userID", userID);
        
        if (error) {
            throw error;
        }
        
        if (data && data.length > 0) {
            // Data exists, display the amount
            document.getElementById("limbucks").textContent = `${data[0].amount} limbucks`;
        } else {
            // No data found, start with 10 Limbucks
            console.warn('No data found for this user. Starting with 10 Limbucks.');
            await addLimbucks(10, userID, {});
            document.getElementById("limbucks").textContent = '10 limbucks';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function showGames() {
    if (!localStorage.getItem("userID")) {
        localStorage.setItem("userID", generateRandomString(50));
    }
    const userID = localStorage.getItem("userID");
    const { data, error } = await supabase
        .from('limbucks')
        .select('games')
        .eq("userID", userID);

    const games = data[0].games;
    gameList.forEach(game => {
        let yn = false;
        for (let userGame in games) {
            if (userGame == game.name) {
                yn = true
            }
        }
        if (yn || game.cost == 0) {
            document.getElementById(`${game.name}Button`).textContent = "play";
            document.getElementById(`${game.name}Button`).addEventListener('click', () => window.location.href=`/projects/${game.name}`);
            document.getElementById(`${game.name}Button`).removeEventListener('click', () => buy(game.name));
        } else {
            document.getElementById(`${game.name}Button`).textContent = `buy (${game.cost})`;
            document.getElementById(`${game.name}Button`).addEventListener('click', () => buy(game.name));
        }
    });
}

async function buy(game) {
    if (!localStorage.getItem("userID")) {
        localStorage.setItem("userID", generateRandomString(50));
    }
    const userID = localStorage.getItem("userID");

    // Fetch current Limbucks and purchased games
    const { data, error } = await supabase
        .from('limbucks')
        .select('*')
        .eq("userID", userID);
    
    if (error || !data || data.length === 0) {
        console.error('Error fetching Limbucks or no user data found:', error);
        return;
    }

    const userLimbucks = data[0].amount;
    const userGames = data[0].games || {};

    // Find the game details from the game list
    const gameToBuy = gameList.find(item => item.name === game);
    if (!gameToBuy) {
        alert(`Game ${game} not found.`);
        return;
    }

    // Check if the user can afford the game
    if (userLimbucks >= gameToBuy.cost) {
        // Update the user's games and reduce the amount of Limbucks
        const newAmount = userLimbucks - gameToBuy.cost;
        const updatedGames = { ...userGames, [gameToBuy.name]: true };

        // Update the Limbucks table with the new amount and games
        const { error: updateError } = await supabase
            .from('limbucks')
            .upsert({ userID, amount: newAmount, games: updatedGames });

        if (updateError) {
            console.error('Error updating Limbucks:', updateError);
            return;
        }

        alert(`You bought ${gameToBuy.name}!`);
        updateDisplay();  // Refresh the display with updated values
    } else {
        alert(`You are ${gameToBuy.cost - userLimbucks} Limbucks short!`);
    }
}

async function updateDisplay() {
    await getLimbucks();
    await showGames();
}

updateDisplay();
if (!localStorage.getItem("userID")) {
    localStorage.setItem("userID", generateRandomString(50));
}
const userID = localStorage.getItem("userID");
const { data, error } = await supabase
    .from('limbucks')
    .select('games')
    .eq("userID", userID);

const games = data[0].games;
const url = window.location.pathname;
const lastPart = url.substring(url.lastIndexOf('/')); // Output: "/d"
let free = false;
if (window.location.href.includes("projects")) {
    gameList.forEach(game => {
        if (`/${game.name}` == lastPart) {
            if (game.cost < 1) {
                free = true;
            }
        }
    });
    if (games && !games[lastPart.substring(1)] && !free) {
        window.location.href = "/";
    }
}
