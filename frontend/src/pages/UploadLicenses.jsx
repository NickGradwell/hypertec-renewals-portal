import React, { useState, useRef } from 'react';
import { UserRole, RecordType, RecordStatus } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const UploadLicenses = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const isAuthorized = user.role === UserRole.HYPERTEC_ADMIN || user.role === UserRole.PARTNER;

  if (!isAuthorized) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">
          Your current role does not have permission to access the "Upload Licenses" section.
        </p>
      </div>
    );
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setUploadStatus({ type: 'error', message: 'Please select an Excel (.xlsx) file.' });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setUploadStatus({ type: 'error', message: 'File size must be less than 10MB.' });
        return;
      }

      setSelectedFile(file);
      setUploadStatus(null);
      generatePreviewData(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const generatePreviewData = (file) => {
    // Mock preview data - in real implementation, this would parse the Excel file
    const mockPreview = [
      {
        customerName: "New Customer A",
        partnerName: "Partner X",
        partcode: "HYP-SFW-1Y",
        serial: "SN99999999",
        renewalDue: "2025-12-31",
        status: "active",
        licenses: 5,
        recordType: "software"
      },
      {
        customerName: "New Customer B", 
        partnerName: "Partner Y",
        partcode: "HYP-SVC-STD",
        serial: null,
        renewalDue: "2025-11-30",
        status: "active",
        licenses: 10,
        recordType: "voucher"
      }
    ];
    setPreviewData(mockPreview);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: 'Uploading file...' });

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful upload
      setUploadStatus({ 
        type: 'success', 
        message: `Successfully uploaded ${selectedFile.name}. ${previewData?.length || 0} records processed.` 
      });
      
      // Reset form
      setSelectedFile(null);
      setPreviewData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setUploadStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Upload Section */}
      <Card className="max-w-4xl mx-auto">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Upload Renewals File</h3>
            <p className="text-sm text-gray-600">
              Upload an Excel (.xlsx) file containing renewal data (Licenses & Vouchers).
            </p>
          </div>
          
          {/* File Upload Area */}
          <div 
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-gray-400 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mb-4">XLSX files only (max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Choose File
            </Button>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              uploadStatus.type === 'success' ? 'bg-green-50 border border-green-200' :
              uploadStatus.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {uploadStatus.type === 'success' && (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {uploadStatus.type === 'error' && (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {uploadStatus.type === 'info' && (
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    uploadStatus.type === 'success' ? 'text-green-800' :
                    uploadStatus.type === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {uploadStatus.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && (
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleUpload}
                disabled={isUploading}
                className="min-w-[120px]"
              >
                {isUploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Preview Section */}
      {previewData && (
        <Card className="max-w-6xl mx-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Preview Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Preview of data that will be imported ({previewData.length} records):
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partcode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Licenses</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((record, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.customerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.partnerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.recordType === 'software' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {record.recordType === 'software' ? 'Software' : 'Voucher'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.partcode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.serial || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.renewalDue}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.licenses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UploadLicenses;
