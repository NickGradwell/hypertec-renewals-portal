const { app } = require('@azure/functions');
const { executeQuery } = require('../../../shared/db');

app.http('updateCompany', {
  methods: ['PUT'],
  authLevel: 'function',
  route: 'companies/{id}',
  handler: async (request, context) => {
    try {
      const companyId = request.params.id;
      const companyData = await request.json();
      
      await executeQuery(
        'UPDATE companies SET name = ?, contactEmail = ?, contactPhone = ?, address = ? WHERE id = ?',
        [companyData.name, companyData.contactEmail, companyData.contactPhone, companyData.address, companyId]
      );
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: { id: companyId, ...companyData }
        })
      };
    } catch (error) {
      context.log.error('Error updating company:', error);
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
