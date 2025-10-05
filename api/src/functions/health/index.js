import { app } from '@azure/functions';

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: async (request, context) => {
    return {
      status: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
      })
    };
  }
});
