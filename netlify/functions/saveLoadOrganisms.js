// saveLoadOrganisms.js
savedData = []

exports.handler = async event => {
    if (event.httpMethod === 'POST') {
        savedData = JSON.parse(event.body);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Organisms data saved successfully' })
        };
    } else if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            body: JSON.stringify(savedData)
        };
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }
};
