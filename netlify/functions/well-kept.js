const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZm54eW5udG90dGRieGpjcmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODE2MTYzMiwiZXhwIjoyMDQzNzM3NjMyfQ.NLNoMifNOv4seeTLCCV_ZiUmR-YGS7MJnm1bUqZ2B8g';  // Replace with your actual Supabase key
const supabaseUrl = 'https://kjfnxynntottdbxjcree.supabase.co';  // Replace with your actual Supabase URL
const screenshotKey = '7cf226';  // Replace with your actual screenshot service key

exports.handler = async (event) => {
    // Access the 'name' parameter from the query string
    const name = event.queryStringParameters ? event.queryStringParameters.name : null;

    // Define a mapping for the available keys
    const keys = {
        supabaseKey: supabaseKey,
        supabaseUrl: supabaseUrl,
        screenshotKey: screenshotKey
    };

    // Check if the requested 'name' exists in the keys object
    if (name && keys[name]) {
        // Return the corresponding key value
        return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
            body: keys[name]
        };
    } else {
        // If the key is not found, return an error message
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Invalid key name. Available keys are: supabaseKey, supabaseUrl, screenshotKey'
            })
        };
    }
};