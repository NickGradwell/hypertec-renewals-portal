const { app } = require('@azure/functions');
const { executeQuery } = require('../../../shared/db');

app.http('createCompany', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'companies',
  handler: async (request, context) => {
    try {
      const companyData = await request.json();
      
      const [result] = await executeQuery(
        'INSERT INTO companies (name, contactEmail, contactPhone, address) VALUES (?, ?, ?, ?)',
        [companyData.name, companyData.contactEmail, companyData.contactPhone, companyData.address]
      );
      
      return {
        status: 201,
        body: JSON.stringify({ 
          success: true,
          data: { id: result.insertId || result.lastInsertRowid, ...companyData }
        })
      };
    } catch (error) {
      context.log.error('Error creating company:', error);
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
