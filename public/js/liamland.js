// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase configuration
const supabaseUrl = 'https://kjfnxynntottdbxjcree.supabase.co'; // Replace with your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZm54eW5udG90dGRieGpjcmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxNjE2MzIsImV4cCI6MjA0MzczNzYzMn0.ot3Wtv5RL8bBYOu0YRRZZotPJXBQ5a6c9kSFSmihgCI'; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

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
                
                // Add data to Supabase
                const { data, error } = await supabase
                    .from('feedback') // Assuming 'feedback' is the name of your table
                    .insert([
                        { ip: ipInfo, feedback: feedback }
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

// Function to add data to Supabase
async function addLimbucks(amount, userID) {
    try {
        // Add or update data in Supabase
        const { data, error } = await supabase
            .from('limbucks')
            .upsert({ amount, userID });
        
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
            await addLimbucks(10, userID);
            document.getElementById("limbucks").textContent = '10 limbucks';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

getLimbucks();
