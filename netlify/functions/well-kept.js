const supabaseKey = 'your_supabase_key';  // Replace with your actual Supabase key
const supabaseUrl = 'your_supabase_url';  // Replace with your actual Supabase URL
const screenshotKey = 'your_screenshot_key';  // Replace with your actual screenshot service key

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
            body: JSON.stringify({
                keyName: name,
                keyValue: keys[name]
            })
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
