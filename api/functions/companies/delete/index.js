const { app } = require('@azure/functions');
const { executeQuery } = require('../../../shared/db');

app.http('deleteCompany', {
  methods: ['DELETE'],
  authLevel: 'function',
  route: 'companies/{id}',
  handler: async (request, context) => {
    try {
      const companyId = request.params.id;
      
      await executeQuery('DELETE FROM companies WHERE id = ?', [companyId]);
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          message: 'Company deleted successfully'
        })
      };
    } catch (error) {
      context.log.error('Error deleting company:', error);
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
