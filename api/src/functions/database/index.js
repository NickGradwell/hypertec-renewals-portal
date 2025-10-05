import { app } from '@azure/functions';
import { getDatabaseInfo, testConnection } from '../../shared/db.js';

app.http('getDatabaseInfo', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'database/info',
  handler: async (request, context) => {
    try {
      const dbInfo = getDatabaseInfo();
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: dbInfo
        })
      };
    } catch (error) {
      context.log.error('Error getting database info:', error);
      return {
        status: 500,
        body: JSON.stringify({ 
          success: false,
          error: 'Failed to get database info' 
        })
      };
    }
  }
});

app.http('testDatabaseConnection', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'database/test',
  handler: async (request, context) => {
    try {
      const testResult = await testConnection();
      return {
        status: testResult.success ? 200 : 500,
        body: JSON.stringify({ 
          success: testResult.success,
          data: testResult
        })
      };
    } catch (error) {
      context.log.error('Error testing database connection:', error);
      return {
        status: 500,
        body: JSON.stringify({ 
          success: false,
          error: 'Failed to test database connection' 
        })
      };
    }
  }
});
