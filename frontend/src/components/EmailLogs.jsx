import React, { useState, useMemo } from 'react';
import { mockEmailLogs } from '../types';
import { formatTimestamp } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Table from './ui/Table';

const EmailLogs = () => {
  const [logs] = useState(mockEmailLogs);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterText, setFilterText] = useState('');

  const filteredLogs = useMemo(() => {
    if (!filterText) return logs;
    const searchTerm = filterText.toLowerCase();
    return logs.filter(log => 
      log.recipient?.toLowerCase().includes(searchTerm) ||
      log.subject?.toLowerCase().includes(searchTerm) ||
      log.status?.toLowerCase().includes(searchTerm) ||
      formatTimestamp(log.timestamp)?.toLowerCase().includes(searchTerm)
    );
  }, [logs, filterText]);

  const getLogStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Placeholder for resend action
  const handleResend = (logId) => {
    alert(`Resend functionality for log ${logId} needs to be implemented.`);
    console.log("Resend requested for log:", logId);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Email Send Logs</h3>
              <p className="text-sm text-gray-600">
                History of automated emails sent by the system.
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Filter logs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Table>
            <thead>
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Timestamp</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Recipient</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Subject</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 align-middle">{formatTimestamp(log.timestamp)}</td>
                    <td className="p-4 align-middle">{log.recipient}</td>
                    <td className="p-4 align-middle max-w-xs truncate" title={log.subject}>
                      {log.subject}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLogStatusColor(log.status)}`}>
                        {log.status || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedLog(log)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleResend(log.id)}
                      >
                        Resend
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8">
                    No email logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {selectedLog && (
        <Card className="border-l-4 border-blue-500">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Email Details</h3>
                <p className="text-sm text-gray-600">
                  To: {selectedLog.recipient} | Sent: {formatTimestamp(selectedLog.timestamp)} | Status: {selectedLog.status}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedLog(null)}
              >
                X
              </Button>
            </div>
            
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Subject:</span> {selectedLog.subject}
              </p>
              <div>
                <p className="font-semibold mb-1">Body:</p>
                <pre className="text-sm whitespace-pre-wrap p-3 bg-gray-50 rounded border font-sans">
                  {selectedLog.body}
                </pre>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EmailLogs;
