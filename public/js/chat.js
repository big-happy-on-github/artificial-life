import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kjfnxynntottdbxjcree.supabase.co'; // Replace with your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZm54eW5udG90dGRieGpjcmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODE2MTYzMiwiZXhwIjoyMDQzNzM3NjMyfQ.NLNoMifNOv4seeTLCCV_ZiUmR-YGS7MJnm1bUqZ2B8g'; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDisplay() {
    const messages = await getMessages();
    const messageDiv = document.getElementById("messageDiv");

    if (messages) {
        // Clear the current messages first
        messageDiv.innerHTML = "";

        // Limit the messages to the last 5
        const limitedMessages = messages.slice(0, 5);

        limitedMessages.forEach(message => {
            let p = document.createElement("p");
            p.textContent = message;
            messageDiv.append(p); // Prepend new messages to the top
        });
    }
}

async function updateVisits() {
    const { data, error: selectError } = await supabase
        .from('visits')
        .select('*')
        .eq('project_name', 'chat');

    if (selectError) throw selectError;

    if (data.length === 0) {
        const { error: insertError } = await supabase
            .from('visits')
            .insert([{ project_name: 'chat', num_visits: 1 }]);

        if (insertError) throw insertError;

        console.log('Created new row with project_name "chat" and num_visits set to 1');
    } else {
        const currentVisits = data[0].num_visits || 0;

        const { error: updateError } = await supabase
            .from('visits')
            .update({ num_visits: currentVisits + 1 })
            .eq('project_name', 'chat');

        if (updateError) throw updateError;

        console.log(`Updated num_visits to ${currentVisits + 1} for project_name "chat"`);
    }
}

async function getMessages() {
    try {
        const { data, error } = await supabase
            .from('Chat messages') // Adjust if needed
            .select('message')
            .order('id', { ascending: false }); // Newest first

        if (error) throw error;

        return data.map(entry => entry.message);
    } catch (error) {
        console.error('Error fetching messages: ', error);
        return [];
    }
}

async function submitMessage(message) {
    if (message.length > 20) {
        alert('Message cannot be longer than 20 characters.');
        return;
    }

    const response = await fetch('https://ipinfo.io/json?token=ca3a9249251d12');
    if (!response.ok) throw new Error('Network response was not ok');

    const ipInfo = await response.json();
    console.log('IP info:', ipInfo);

    try {
        const { data, error } = await supabase
            .from('Chat messages')
            .insert({ message: message, ip: ipInfo }); // Adjust fields as necessary

        if (error) {
            console.error('Supabase Insert Error:', error);
        } else {
            console.log('Supabase Insert Success:', data);
        }
    } catch (error) {
        console.error('Error submitting message:', error);
    }
    updateDisplay();
}

document.getElementById("sendButton").addEventListener('click', () => {
    const messageInput = document.getElementById("messageInput");
    submitMessage(messageInput.value);
    messageInput.value = "";  // Clear input after sending
});

updateDisplay();
updateVisits();
