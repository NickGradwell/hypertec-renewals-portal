const { app } = require('@azure/functions');
const { executeQuery } = require('../../shared/db');

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


