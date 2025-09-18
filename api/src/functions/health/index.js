const { app } = require('@azure/functions');

app.http('health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'health',
    handler: async (request, context) => {
        context.log('Health check function called');
        
        return {
            status: 200,
            body: JSON.stringify({
                success: true,
                message: 'API is healthy!',
                timestamp: new Date().toISOString()
            })
        };
    }
});
