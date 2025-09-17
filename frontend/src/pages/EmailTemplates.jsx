import React, { useState } from 'react';
import { UserRole } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Label from '../components/ui/Label';
import Switch from '../components/ui/Switch';

const EmailTemplates = ({ user }) => {
  // Software reminder intervals
  const softwareReminderIntervals = [
    { id: 'software_90day', label: '90 Days Before Expiry', defaultEnabled: true },
    { id: 'software_60day', label: '60 Days Before Expiry (If Unrenewed)', defaultEnabled: true },
    { id: 'software_expiry', label: 'On Expiry Day (If Unrenewed)', defaultEnabled: true },
  ];

  // Voucher reminder intervals
  const voucherReminderIntervals = [
    { id: 'voucher_initial', label: '300 Days Before Expiry (Approx 2 months after issue)', defaultEnabled: true },
    { id: 'voucher_monthly', label: 'Monthly Reminder (Until Claimed/Expiry Month)', defaultEnabled: true },
  ];

  // Separate state for software and voucher configs
  const [softwareConfigs, setSoftwareConfigs] = useState(() => {
    const initialState = {};
    softwareReminderIntervals.forEach(interval => {
      initialState[interval.id] = { 
        enabled: interval.defaultEnabled, 
        subject: `Reminder: Your Hypertec Renewal for {{productName}}`, 
        body: `Dear {{customerName}},\n\nThis is a reminder that your Hypertec license for {{productName}} (Serial: {{serialNumber}}) is due for renewal on {{expiryDate}}.\n\nPlease contact us or your partner {{partnerName}} to arrange your renewal.\n\nInstructions: {{instructions}}\n\nThanks,\nThe Hypertec Team` 
      };
    });
    return initialState;
  });

  const [voucherConfigs, setVoucherConfigs] = useState(() => {
    const initialState = {};
    voucherReminderIntervals.forEach(interval => {
      initialState[interval.id] = { 
        enabled: interval.defaultEnabled, 
        subject: `Reminder: Unused Hypertec Service Vouchers`, 
        body: `Dear {{customerName}},\n\nYou have {{unclaimedCount}} unused service voucher(s) associated with HEL ref {{helReference}} (Your ref: {{endUserRef}}) expiring on {{expiryDate}}.\n\n{{callToAction}}\n\nThanks,\nThe Hypertec Team` 
      };
    });
    return initialState;
  });

  const isAuthorized = user.role === UserRole.HYPERTEC_ADMIN || user.role === UserRole.PARTNER;

  // Generic toggle handler
  const handleToggle = (id, checked, configSetter) => {
    configSetter(prevConfigs => ({
      ...prevConfigs,
      [id]: { ...prevConfigs[id], enabled: checked }
    }));
    console.log(`Toggled ${id} to ${checked}`);
  };

  // Generic template change handler
  const handleTemplateChange = (id, field, value, configSetter) => {
    configSetter(prevConfigs => ({
      ...prevConfigs,
      [id]: { ...prevConfigs[id], [field]: value }
    }));
  };

  if (!isAuthorized) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">
          Your current role does not have permission to access the "Email Templates" section.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Software Templates */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Software License Reminders</h3>
          <div className="space-y-4">
            {/* Schedule Toggles */}
            {softwareReminderIntervals.map(interval => (
              <div key={interval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                <Label htmlFor={`switch-${interval.id}`} className="cursor-pointer">{interval.label}</Label>
                <Switch 
                  id={`switch-${interval.id}`} 
                  checked={softwareConfigs[interval.id]?.enabled || false} 
                  onCheckedChange={(checked) => handleToggle(interval.id, checked, setSoftwareConfigs)} 
                />
              </div>
            ))}
            
            {/* Template Editors */}
            {softwareReminderIntervals.filter(i => softwareConfigs[i.id]?.enabled).map(interval => (
              <div key={`${interval.id}-editor`} className="p-4 border rounded-md bg-white shadow-sm mt-4">
                <h4 className="font-medium mb-3 text-gray-700">{interval.label} Template</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`subject-${interval.id}`}>Subject</Label>
                    <Input 
                      id={`subject-${interval.id}`} 
                      value={softwareConfigs[interval.id]?.subject || ''} 
                      onChange={(e) => handleTemplateChange(interval.id, 'subject', e.target.value, setSoftwareConfigs)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor={`body-${interval.id}`}>Body</Label>
                    <Textarea 
                      id={`body-${interval.id}`} 
                      value={softwareConfigs[interval.id]?.body || ''} 
                      onChange={(e) => handleTemplateChange(interval.id, 'body', e.target.value, setSoftwareConfigs)} 
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Placeholders: {'{{customerName}}'}, {'{{partnerName}}'}, {'{{productName}}'}, {'{{serialNumber}}'}, {'{{expiryDate}}'}, {'{{instructions}}'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end mt-4">
              <Button onClick={() => alert('Save Software Templates functionality needed.')}>
                Save Software Templates
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Service Voucher Templates */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Service Voucher Reminders</h3>
          <div className="space-y-4">
            {/* Schedule Toggles */}
            {voucherReminderIntervals.map(interval => (
              <div key={interval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                <Label htmlFor={`switch-${interval.id}`} className="cursor-pointer">{interval.label}</Label>
                <Switch 
                  id={`switch-${interval.id}`} 
                  checked={voucherConfigs[interval.id]?.enabled || false} 
                  onCheckedChange={(checked) => handleToggle(interval.id, checked, setVoucherConfigs)} 
                />
              </div>
            ))}
            
            {/* Template Editors */}
            {voucherReminderIntervals.filter(i => voucherConfigs[i.id]?.enabled).map(interval => (
              <div key={`${interval.id}-editor`} className="p-4 border rounded-md bg-white shadow-sm mt-4">
                <h4 className="font-medium mb-3 text-gray-700">{interval.label} Template</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`subject-${interval.id}`}>Subject</Label>
                    <Input 
                      id={`subject-${interval.id}`} 
                      value={voucherConfigs[interval.id]?.subject || ''} 
                      onChange={(e) => handleTemplateChange(interval.id, 'subject', e.target.value, setVoucherConfigs)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor={`body-${interval.id}`}>Body</Label>
                    <Textarea 
                      id={`body-${interval.id}`} 
                      value={voucherConfigs[interval.id]?.body || ''} 
                      onChange={(e) => handleTemplateChange(interval.id, 'body', e.target.value, setVoucherConfigs)} 
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Placeholders: {'{{customerName}}'}, {'{{helReference}}'}, {'{{endUserRef}}'}, {'{{unclaimedCount}}'}, {'{{expiryDate}}'}, {'{{callToAction}}'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end mt-4">
              <Button onClick={() => alert('Save Voucher Templates functionality needed.')}>
                Save Voucher Templates
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailTemplates;