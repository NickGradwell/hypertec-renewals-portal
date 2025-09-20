import { app } from '@azure/functions';
import { executeQuery } from '../../shared/db.js';

app.http('companies', {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  authLevel: 'function',
  route: 'companies/{id?}',
  handler: async (request, context) => {
    try {
      const method = request.method;
      const companyId = request.params.id;

      switch (method) {
        case 'GET':
          if (companyId) {
            // Get single company
            const [rows] = await executeQuery('SELECT * FROM companies WHERE id = ?', [companyId]);
            return {
              status: 200,
              body: JSON.stringify({ 
                success: true,
                data: rows[0] || null
              })
            };
          } else {
            // Get all companies
            const [rows] = await executeQuery('SELECT * FROM companies ORDER BY createdAt DESC');
            return {
              status: 200,
              body: JSON.stringify({ 
                success: true,
                data: rows 
              })
            };
          }

        case 'POST':
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

        case 'PUT':
          if (!companyId) {
            return {
              status: 400,
              body: JSON.stringify({ 
                success: false,
                error: 'Company ID is required for update'
              })
            };
          }
          
          const updateData = await request.json();
          await executeQuery(
            'UPDATE companies SET name = ?, contactEmail = ?, contactPhone = ?, address = ? WHERE id = ?',
            [updateData.name, updateData.contactEmail, updateData.contactPhone, updateData.address, companyId]
          );
          
          return {
            status: 200,
            body: JSON.stringify({ 
              success: true,
              data: { id: companyId, ...updateData }
            })
          };

        case 'DELETE':
          if (!companyId) {
            return {
              status: 400,
              body: JSON.stringify({ 
                success: false,
                error: 'Company ID is required for deletion'
              })
            };
          }
          
          await executeQuery('DELETE FROM companies WHERE id = ?', [companyId]);
          
          return {
            status: 200,
            body: JSON.stringify({ 
              success: true,
              message: 'Company deleted successfully'
            })
          };

        default:
          return {
            status: 405,
            body: JSON.stringify({ 
              success: false,
              error: 'Method not allowed'
            })
          };
      }
    } catch (error) {
      context.log.error('Error in companies function:', error);
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
