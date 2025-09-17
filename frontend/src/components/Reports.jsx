import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Alert,
  Spinner,
  Table,
  Badge,
  ProgressBar
} from 'react-bootstrap';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp,
  Users,
  Mail,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState({
    renewalStats: {},
    emailStats: {},
    companyStats: {},
    userStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data needed for reports
      const [recordsRes, emailsRes, companiesRes, usersRes] = await Promise.all([
        fetch('/api/records'),
        fetch('/api/email-logs'),
        fetch('/api/companies'),
        fetch('/api/users')
      ]);

      const [records, emails, companies, users] = await Promise.all([
        recordsRes.json(),
        emailsRes.json(),
        companiesRes.json(),
        usersRes.json()
      ]);

      // Process renewal statistics
      const renewalStats = processRenewalStats(records.data || []);
      const emailStats = processEmailStats(emails.data || []);
      const companyStats = processCompanyStats(companies.data || []);
      const userStats = processUserStats(users.data || []);

      setReports({
        renewalStats,
        emailStats,
        companyStats,
        userStats
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processRenewalStats = (records) => {
    const total = records.length;
    const active = records.filter(r => r.status === 'Active').length;
    const pending = records.filter(r => r.status === 'Pending').length;
    const expired = records.filter(r => r.status === 'Expired').length;
    
    const totalLicenses = records.reduce((sum, r) => sum + (r.licenses || 0), 0);
    const activeLicenses = records
      .filter(r => r.status === 'Active')
      .reduce((sum, r) => sum + (r.licenses || 0), 0);

    const upcomingRenewals = records.filter(r => {
      const dueDate = new Date(r.renewalDue);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return dueDate <= thirtyDaysFromNow && r.status === 'Active';
    }).length;

    return {
      total,
      active,
      pending,
      expired,
      totalLicenses,
      activeLicenses,
      upcomingRenewals,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    };
  };

  const processEmailStats = (emails) => {
    const total = emails.length;
    const sent = emails.filter(e => e.status === 'Sent').length;
    const failed = emails.filter(e => e.status === 'Failed').length;
    const pending = emails.filter(e => e.status === 'Pending').length;
    
    return {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? Math.round((sent / total) * 100) : 0
    };
  };

  const processCompanyStats = (companies) => {
    return {
      total: companies.length,
      withEmail: companies.filter(c => c.contactEmail).length,
      withPhone: companies.filter(c => c.contactPhone).length
    };
  };

  const processUserStats = (users) => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    
    return {
      total,
      admins,
      regularUsers
    };
  };

  const exportReport = (format) => {
    // Mock export functionality
    alert(`Exporting report as ${format}...`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <BarChart3 className="me-2" size={28} />
            Reports & Analytics
          </h2>
          <p className="text-muted mb-0">Comprehensive insights into your renewal operations</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </Form.Select>
          <Button variant="outline-primary" onClick={() => exportReport('PDF')}>
            <Download size={16} className="me-1" />
            Export PDF
          </Button>
          <Button variant="outline-success" onClick={() => exportReport('Excel')}>
            <Download size={16} className="me-1" />
            Export Excel
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center mb-2">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                  <CheckCircle className="text-primary" size={24} />
                </div>
              </div>
              <h4 className="mb-1">{reports.renewalStats.total}</h4>
              <p className="text-muted mb-0">Total Renewals</p>
              <Badge bg="success" className="mt-2">
                {reports.renewalStats.activePercentage}% Active
              </Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center mb-2">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                  <AlertTriangle className="text-warning" size={24} />
                </div>
              </div>
              <h4 className="mb-1">{reports.renewalStats.upcomingRenewals}</h4>
              <p className="text-muted mb-0">Upcoming Renewals</p>
              <Badge bg="warning" className="mt-2">
                Next 30 days
              </Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center mb-2">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                  <Mail className="text-info" size={24} />
                </div>
              </div>
              <h4 className="mb-1">{reports.emailStats.total}</h4>
              <p className="text-muted mb-0">Emails Sent</p>
              <Badge bg="info" className="mt-2">
                {reports.emailStats.successRate}% Success
              </Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center mb-2">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <Users className="text-success" size={24} />
                </div>
              </div>
              <h4 className="mb-1">{reports.companyStats.total}</h4>
              <p className="text-muted mb-0">Companies</p>
              <Badge bg="success" className="mt-2">
                {reports.companyStats.withEmail} with email
              </Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Reports */}
      <Row>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Renewal Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Active</span>
                  <span>{reports.renewalStats.active}</span>
                </div>
                <ProgressBar 
                  variant="success" 
                  now={reports.renewalStats.activePercentage} 
                  className="mb-2"
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Pending</span>
                  <span>{reports.renewalStats.pending}</span>
                </div>
                <ProgressBar 
                  variant="warning" 
                  now={reports.renewalStats.pending > 0 ? (reports.renewalStats.pending / reports.renewalStats.total) * 100 : 0} 
                  className="mb-2"
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Expired</span>
                  <span>{reports.renewalStats.expired}</span>
                </div>
                <ProgressBar 
                  variant="danger" 
                  now={reports.renewalStats.expired > 0 ? (reports.renewalStats.expired / reports.renewalStats.total) * 100 : 0} 
                  className="mb-2"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">License Statistics</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <h3 className="text-primary">{reports.renewalStats.totalLicenses.toLocaleString()}</h3>
                <p className="text-muted mb-0">Total Licenses</p>
              </div>
              <div className="text-center mb-4">
                <h3 className="text-success">{reports.renewalStats.activeLicenses.toLocaleString()}</h3>
                <p className="text-muted mb-0">Active Licenses</p>
              </div>
              <div className="text-center">
                <h3 className="text-info">
                  {reports.renewalStats.totalLicenses > 0 
                    ? Math.round((reports.renewalStats.activeLicenses / reports.renewalStats.totalLicenses) * 100)
                    : 0}%
                </h3>
                <p className="text-muted mb-0">Active Rate</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Email Performance */}
      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Email Performance</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Emails</td>
                    <td>{reports.emailStats.total}</td>
                    <td>100%</td>
                  </tr>
                  <tr>
                    <td>Successfully Sent</td>
                    <td>{reports.emailStats.sent}</td>
                    <td>{reports.emailStats.total > 0 ? Math.round((reports.emailStats.sent / reports.emailStats.total) * 100) : 0}%</td>
                  </tr>
                  <tr>
                    <td>Failed</td>
                    <td>{reports.emailStats.failed}</td>
                    <td>{reports.emailStats.total > 0 ? Math.round((reports.emailStats.failed / reports.emailStats.total) * 100) : 0}%</td>
                  </tr>
                  <tr>
                    <td>Pending</td>
                    <td>{reports.emailStats.pending}</td>
                    <td>{reports.emailStats.total > 0 ? Math.round((reports.emailStats.pending / reports.emailStats.total) * 100) : 0}%</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;


