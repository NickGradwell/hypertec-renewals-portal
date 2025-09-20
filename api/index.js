import { app } from '@azure/functions';

// Health check function
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

// Import other functions
import './src/functions/auth/index.js';
import './src/functions/companies/index.js';
import './src/functions/users/index.js';
import './src/functions/records/index.js';
import './src/functions/emails/index.js';
import './src/functions/email-logs/index.js';
