const { app } = require('@azure/functions');
const { executeQuery } = require('../../shared/db');

app.http('getRecords', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'records',
  handler: async (request, context) => {
    try {
      const [rows] = await executeQuery('SELECT * FROM records ORDER BY createdAt DESC');
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: rows 
        })
      };
    } catch (error) {
      context.log.error('Error fetching records:', error);
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

app.http('createRecord', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'records',
  handler: async (request, context) => {
    try {
      const recordData = await request.json();
      
      const [result] = await executeQuery(
        `INSERT INTO records (recordType, customerName, partnerName, partcode, serial, renewalDue, status, licenses, dateOfOrder, dateOfIssue, helReference, resellerOrderNum, endUserRef, renewalEnabled, instructions, voucherCodes, claimedCount) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recordData.recordType, recordData.customerName, recordData.partnerName, 
          recordData.partcode, recordData.serial, recordData.renewalDue, 
          recordData.status, recordData.licenses, recordData.dateOfOrder, 
          recordData.dateOfIssue, recordData.helReference, recordData.resellerOrderNum, 
          recordData.endUserRef, recordData.renewalEnabled, recordData.instructions,
          JSON.stringify(recordData.voucherCodes || []), recordData.claimedCount || 0
        ]
      );
      
      return {
        status: 201,
        body: JSON.stringify({ 
          success: true,
          data: { id: result.insertId || result.lastInsertRowid, ...recordData }
        })
      };
    } catch (error) {
      context.log.error('Error creating record:', error);
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

app.http('updateRecord', {
  methods: ['PUT'],
  authLevel: 'function',
  route: 'records/{id}',
  handler: async (request, context) => {
    try {
      const recordId = request.params.id;
      const recordData = await request.json();
      
      const [result] = await executeQuery(
        `UPDATE records SET 
         recordType = ?, customerName = ?, partnerName = ?, partcode = ?, serial = ?, 
         renewalDue = ?, status = ?, licenses = ?, dateOfOrder = ?, dateOfIssue = ?, 
         helReference = ?, resellerOrderNum = ?, endUserRef = ?, renewalEnabled = ?, 
         instructions = ?, voucherCodes = ?, claimedCount = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          recordData.recordType, recordData.customerName, recordData.partnerName, 
          recordData.partcode, recordData.serial, recordData.renewalDue, 
          recordData.status, recordData.licenses, recordData.dateOfOrder, 
          recordData.dateOfIssue, recordData.helReference, recordData.resellerOrderNum, 
          recordData.endUserRef, recordData.renewalEnabled, recordData.instructions,
          JSON.stringify(recordData.voucherCodes || []), recordData.claimedCount || 0,
          recordId
        ]
      );
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          data: { id: recordId, ...recordData }
        })
      };
    } catch (error) {
      context.log.error('Error updating record:', error);
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

app.http('deleteRecord', {
  methods: ['DELETE'],
  authLevel: 'function',
  route: 'records/{id}',
  handler: async (request, context) => {
    try {
      const recordId = request.params.id;
      
      const [result] = await executeQuery('DELETE FROM records WHERE id = ?', [recordId]);
      
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true,
          message: 'Record deleted successfully'
        })
      };
    } catch (error) {
      context.log.error('Error deleting record:', error);
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
