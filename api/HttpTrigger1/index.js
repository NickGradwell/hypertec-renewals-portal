module.exports = async function (context, req) {
    context.log('Test function called');
    context.log('Request method:', req.method);
    context.log('Request URL:', req.url);

    try {
        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                success: true,
                message: 'Test function working!',
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.url
            }
        };
    } catch (error) {
        context.log.error('Error in test function:', error);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                success: false,
                error: error.message
            }
        };
    }
};