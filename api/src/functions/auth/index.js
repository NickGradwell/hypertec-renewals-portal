import { app } from '@azure/functions';
const jwt = require('jsonwebtoken');

// Middleware to validate Azure AD B2C tokens
const validateToken = async (request, context) => {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      status: 401,
      body: JSON.stringify({ 
        success: false,
        error: 'No token provided' 
      })
    };
  }

  const token = authHeader.substring(7);
  
  try {
    // In production, you would validate the token against Azure AD B2C
    // For now, we'll do basic JWT validation
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      throw new Error('Invalid token');
    }

    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }

    // Return user information from token
    return {
      user: {
        id: decoded.sub || decoded.oid,
        email: decoded.email || decoded.preferred_username,
        name: decoded.name,
        roles: decoded.roles || ['Customer'] // Default role
      }
    };
  } catch (error) {
    context.log.error('Token validation error:', error);
    return {
      status: 401,
      body: JSON.stringify({ 
        success: false,
        error: 'Invalid token' 
      })
    };
  }
};

// Protected route example
app.http('getProtectedData', {
  methods: ['GET'],
  authLevel: 'anonymous', // We handle auth manually
  route: 'protected',
  handler: async (request, context) => {
    // Validate token
    const tokenValidation = await validateToken(request, context);
    
    if (tokenValidation.status) {
      return tokenValidation; // Return error response
    }

    const user = tokenValidation.user;
    
    try {
      // Your protected logic here
      const data = {
        message: 'This is protected data',
        user: user,
        timestamp: new Date().toISOString()
      };

      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: data 
        })
      };
    } catch (error) {
      context.log.error('Error in protected route:', error);
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

// User profile endpoint
app.http('getUserProfile', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'user/profile',
  handler: async (request, context) => {
    const tokenValidation = await validateToken(request, context);
    
    if (tokenValidation.status) {
      return tokenValidation;
    }

    const user = tokenValidation.user;
    
    try {
      // In production, you would fetch user details from your database
      const userProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        lastLogin: new Date().toISOString()
      };

      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: userProfile 
        })
      };
    } catch (error) {
      context.log.error('Error fetching user profile:', error);
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
