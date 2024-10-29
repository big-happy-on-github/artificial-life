// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`, { mode: 'no-cors' });
const supabaseUrl = JSON.parse(await response1.text());
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = JSON.parse(await response2.text());
const supabase = createClient(supabaseUrl, supabaseKey);

if (!localStorage.getItem("purchases")) {
    localStorage.setItem("purchases", JSON.stringify({}));
}
if (!localStorage.getItem("using")) {
    localStorage.setItem("using", JSON.stringify({}));
}
const purchases = JSON.parse(localStorage.getItem("purchases"));
const using = JSON.parse(localStorage.getItem("using"));

const list = [{
    name: "mitch_LiamsTD",
    cost: 10
}, {
    name: "declan_LiamsTD",
    cost: 10
}];

// Function to add data to Supabase
async function addLimbucks(amount, userID, games) {
    try {
        const { data, error } = await supabase
            .from('limbucks')
            .upsert(
                { userID, amount: amount, games: games },
                { onConflict: ['userID'], returning: '*' }
            );

        if (error) {
            throw error;
        }

        console.log('Data inserted or updated:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getLimbucks() {
    const userID = localStorage.getItem("userID") || generateRandomString(50);
    localStorage.setItem("userID", userID);

    try {
        const { data, error } = await supabase
            .from('limbucks')
            .select('*')
            .eq('userID', userID)
            .single();

        if (error && error.code === 'PGRST116') {
            await addLimbucks(10, userID, {});
            return { amount: 10, userID, games: {} };
        } else if (data) {
            return data;
        }
    } catch (error) {
        console.error('Error fetching Limbucks:', error);
    }
}

function update() {
    list.forEach(item => {
        const button = document.getElementById(`${item.name}Button`);

        // Clear any existing event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.textContent = purchases[item.name]
            ? (using[item.name] ? "Stop Using" : "Use")
            : "Purchase";

        newButton.addEventListener('click', () => {
            if (!purchases[item.name]) {
                purchase(item);
            } else {
                if (using[item.name]) {
                    stop_using(item);
                } else {
                    use(item);
                }
            }
        });
    });
}

async function purchase(item) {
    const user = await getLimbucks();
    if (user.amount >= item.cost) {
        if (confirm("Are you sure?")) {
            await addLimbucks(user.amount - item.cost, user.userID, user.games);
            alert("Successfully bought the item");
            purchases[item.name] = true;
            localStorage.setItem("purchases", JSON.stringify(purchases));
            update();
        }
    } else {
        alert("You don't have enough money");
    }
}

function use(item) {
    using[item.name] = true;
    localStorage.setItem("using", JSON.stringify(using));
    update();
}

function stop_using(item) {
    using[item.name] = false;
    localStorage.setItem("using", JSON.stringify(using));
    update();
}

update();
