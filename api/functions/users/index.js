const { app } = require('@azure/functions');
const { executeQuery } = require('../../shared/db');

app.http('getUsers', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'users',
  handler: async (request, context) => {
    try {
      const [rows] = await executeQuery('SELECT * FROM users ORDER BY createdAt DESC');
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: rows 
        })
      };
    } catch (error) {
      context.log.error('Error fetching users:', error);
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

app.http('createUser', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'users',
  handler: async (request, context) => {
    try {
      const userData = await request.json();
      
      const [result] = await executeQuery(
        'INSERT INTO users (email, name, role) VALUES (?, ?, ?)',
        [userData.email, userData.name, userData.role || 'user']
      );
      
      return {
        status: 201,
        body: JSON.stringify({ 
          success: true,
          data: { id: result.insertId || result.lastInsertRowid, ...userData }
        })
      };
    } catch (error) {
      context.log.error('Error creating user:', error);
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

app.http('updateUser', {
  methods: ['PUT'],
  authLevel: 'function',
  route: 'users/{id}',
  handler: async (request, context) => {
    try {
      const userId = request.params.id;
      const userData = await request.json();
      
      await executeQuery(
        'UPDATE users SET email = ?, name = ?, role = ? WHERE id = ?',
        [userData.email, userData.name, userData.role, userId]
      );
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: { id: userId, ...userData }
        })
      };
    } catch (error) {
      context.log.error('Error updating user:', error);
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

app.http('deleteUser', {
  methods: ['DELETE'],
  authLevel: 'function',
  route: 'users/{id}',
  handler: async (request, context) => {
    try {
      const userId = request.params.id;
      
      await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          message: 'User deleted successfully'
        })
      };
    } catch (error) {
      context.log.error('Error deleting user:', error);
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
