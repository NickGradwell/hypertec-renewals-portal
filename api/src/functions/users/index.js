import { app } from '@azure/functions';
import { executeQuery } from '../../shared/db.js';

app.http('users', {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  authLevel: 'function',
  route: 'users/{id?}',
  handler: async (request, context) => {
    try {
      const method = request.method;
      const userId = request.params.id;

      switch (method) {
        case 'GET':
          if (userId) {
            // Get single user
            const [rows] = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]);
            return {
              status: 200,
              body: JSON.stringify({ 
                success: true,
                data: rows[0] || null
              })
            };
          } else {
            // Get all users
            const [rows] = await executeQuery('SELECT * FROM users ORDER BY createdAt DESC');
            return {
              status: 200,
              body: JSON.stringify({ 
                success: true,
                data: rows 
              })
            };
          }

        case 'POST':
          const userData = await request.json();
          const [result] = await executeQuery(
            'INSERT INTO users (email, firstName, lastName, role, companyId) VALUES (?, ?, ?, ?, ?)',
            [userData.email, userData.firstName, userData.lastName, userData.role, userData.companyId]
          );
          
          return {
            status: 201,
            body: JSON.stringify({ 
              success: true,
              data: { id: result.insertId || result.lastInsertRowid, ...userData }
            })
          };

        case 'PUT':
          if (!userId) {
            return {
              status: 400,
              body: JSON.stringify({ 
                success: false,
                error: 'User ID is required for update'
              })
            };
          }
          
          const updateData = await request.json();
          await executeQuery(
            'UPDATE users SET email = ?, firstName = ?, lastName = ?, role = ?, companyId = ? WHERE id = ?',
            [updateData.email, updateData.firstName, updateData.lastName, updateData.role, updateData.companyId, userId]
          );
          
          return {
            status: 200,
            body: JSON.stringify({ 
              success: true,
              data: { id: userId, ...updateData }
            })
          };

        case 'DELETE':
          if (!userId) {
            return {
              status: 400,
              body: JSON.stringify({ 
                success: false,
                error: 'User ID is required for deletion'
              })
            };
          }
          
          await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
          
          return {
            status: 200,
            body: JSON.stringify({ 
              success: true,
              message: 'User deleted successfully'
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
      context.log.error('Error in users function:', error);
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