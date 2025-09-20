import { app } from '@azure/functions';
import { executeQuery } from '../../shared/db.js';

app.http('getEmailLogs', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'email-logs',
  handler: async (request, context) => {
    try {
      const [rows] = await executeQuery(`
        SELECT el.*, et.name as templateName 
        FROM email_logs el 
        LEFT JOIN email_templates et ON el.templateId = et.id 
        ORDER BY el.sentAt DESC
      `);
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: rows 
        })
      };
    } catch (error) {
      context.log.error('Error fetching email logs:', error);
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

app.http('resendEmail', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'email-logs/{id}/resend',
  handler: async (request, context) => {
    try {
      const logId = request.params.id;
      
      await executeQuery(
        'UPDATE email_logs SET status = ? WHERE id = ?',
        ['Resent', logId]
      );
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          message: 'Email resent successfully'
        })
      };
    } catch (error) {
      context.log.error('Error resending email:', error);
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


