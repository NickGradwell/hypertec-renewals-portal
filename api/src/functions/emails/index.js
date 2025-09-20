import { app } from '@azure/functions';
import { executeQuery } from '../../shared/db.js';

app.http('getEmailTemplates', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'email-templates',
  handler: async (request, context) => {
    try {
      const [rows] = await executeQuery('SELECT * FROM email_templates ORDER BY createdAt DESC');
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: rows 
        })
      };
    } catch (error) {
      context.log.error('Error fetching email templates:', error);
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

app.http('updateEmailTemplate', {
  methods: ['PUT'],
  authLevel: 'function',
  route: 'email-templates/{id}',
  handler: async (request, context) => {
    try {
      const templateId = request.params.id;
      const templateData = await request.json();
      
      await executeQuery(
        'UPDATE email_templates SET name = ?, subject = ?, body = ?, isActive = ? WHERE id = ?',
        [templateData.name, templateData.subject, templateData.body, templateData.isActive, templateId]
      );
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: { id: templateId, ...templateData }
        })
      };
    } catch (error) {
      context.log.error('Error updating email template:', error);
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


