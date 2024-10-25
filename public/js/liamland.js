// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`, { mode: 'no-cors' });
const supabaseUrl = JSON.parse(await response1.text());
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = JSON.parse(await response2.text());
const supabase = createClient(supabaseUrl, supabaseKey);
console.log(supabase);
console.log(supabaseKey);

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
        const { data, error } = await supabase
            .from('limbucks')
            .upsert(
                { userID, amount: newAmount, games: updatedGames }, 
                { onConflict: ['userID'], returning: '*' } // This will return the updated row(s)
            );
        
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
            .select('games')
            .eq('userID', userID)
            .single();
    
        if (error && error.code === 'PGRST116') {
            console.warn('User data not found. Initializing with default values.');
            // Initialize data here if needed, or display a message
        } else if (error) {
            throw error;
        }
    
        // Process data if found
        const games = data ? data.games : {};
        
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
    try {
        // Ensure userID is present
        if (!localStorage.getItem("userID")) {
            localStorage.setItem("userID", generateRandomString(50));
        }
        const userID = localStorage.getItem("userID");

        // Fetch the current games owned by the user
        const { data, error } = await supabase
            .from('limbucks')
            .select('games')
            .eq('userID', userID)
            .single();

        if (error) {
            console.error('Error fetching user games data:', error);
            throw new Error('Error fetching user games data.');
        }

        const games = data?.games || {}; // Fallback to an empty object if no games are found

        // Iterate through the game list to update buttons accordingly
        gameList.forEach(game => {
            const button = document.getElementById(`${game.name}Button`);

            // Remove any previous event listeners by cloning the button
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            if (games[game.name] || game.cost === 0) {
                // If the user owns the game or it's free
                newButton.textContent = "play";
                newButton.addEventListener('click', () => {
                    window.location.href = `/projects/${game.name}`;
                });
            } else {
                // If the game costs Limbucks and hasn't been purchased
                newButton.textContent = `buy (${game.cost})`;
                newButton.addEventListener('click', () => buy(game.name));
            }
        });
    } catch (error) {
        console.error('Error displaying games:', error.message);
    }
}

async function buy(gameName) {
    try {
        // Ensure userID is present
        if (!localStorage.getItem("userID")) {
            localStorage.setItem("userID", generateRandomString(50));
        }
        const userID = localStorage.getItem("userID");

        // Fetch user's Limbucks and games
        const { data, error } = await supabase
            .from('limbucks')
            .select('amount, games')
            .eq('userID', userID)
            .single();

        if (error || !data) {
            throw new Error('Error fetching user Limbucks data.');
        }

        const userLimbucks = data.amount;
        console.log(userLimbucks);
        const userGames = data.games || {};

        const gameToBuy = gameList.find(item => item.name === gameName);
        if (!gameToBuy) {
            alert(`Game ${gameName} not found.`);
            return;
        }

        if (userGames[gameToBuy.name]) {
            alert(`You already own ${gameToBuy.name}.`);
            return;
        }

        if (userLimbucks >= gameToBuy.cost) {
            // Deduct the cost and update the user's games
            const newAmount = userLimbucks - gameToBuy.cost;
            const updatedGames = { ...userGames, [gameToBuy.name]: true };

            const { error: updateError } = await supabase
                .from('limbucks')
                .upsert({ userID: userID, amount: newAmount, games: updatedGames }, { onConflict: ['userID'] });

            if (updateError) {
                throw new Error('Error updating user Limbucks data.');
            }

            alert(`You bought ${gameToBuy.name}!`);
            await updateDisplay(); // Refresh display after buying
        } else {
            const deficit = gameToBuy.cost - userLimbucks;
            alert(`You are ${deficit} Limbucks short!`);
        }

    } catch (error) {
        console.error('Error during the buying process:', error.message);
    }
}

async function updateDisplay() {
    await showGames();
    await getLimbucks();
}

getLimbucks();
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
