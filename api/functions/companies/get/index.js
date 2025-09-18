const { app } = require('@azure/functions');
const { executeQuery } = require('../../../shared/db');

app.http('getCompanies', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'companies',
  handler: async (request, context) => {
    try {
      const [rows] = await executeQuery('SELECT * FROM companies ORDER BY createdAt DESC');
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: rows 
        })
      };
    } catch (error) {
      context.log.error('Error fetching companies:', error);
      return {
        status: 500,
        body: JSON.stringify({ 
          success: false,
          error: 'Internal server error' 
        })
      };
    }
  }
});
