import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { 
  Table, 
  Card, 
  Button, 
  Badge, 
  Modal, 
  Form, 
  Alert,
  Spinner,
  Row,
  Col,
  InputGroup
} from 'react-bootstrap';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCompanies();
      setCompanies(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCompany) {
        await apiService.updateCompany(selectedCompany.id, formData);
      } else {
        await apiService.createCompany(formData);
      }
      await fetchCompanies();
      setShowModal(false);
      setSelectedCompany(null);
      setFormData({ name: '', contactEmail: '', contactPhone: '', address: '' });
    } catch (err) {
      setError(err.message || `Failed to ${selectedCompany ? 'update' : 'create'} company`);
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteCompany(selectedCompany.id);
      await fetchCompanies();
      setShowDeleteModal(false);
      setSelectedCompany(null);
    } catch (err) {
      setError(err.message || 'Failed to delete company');
    }
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      contactEmail: company.resellerEmail || ''
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setSelectedCompany(null);
    setFormData({ name: '', contactEmail: '' });
    setShowModal(true);
  };

  const getContactBadge = (company) => {
    const hasEmail = company.resellerEmail;

    if (hasEmail) {
      return <Badge bg="success">Complete</Badge>;
    } else {
      return <Badge bg="danger">Missing</Badge>;
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.resellerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
            <Building2 className="me-2" size={28} />
            Company Management
          </h2>
          <p className="text-muted mb-0">Manage partner companies and their contact information</p>
        </div>
        <Button variant="primary" onClick={handleAddNew}>
          <Plus size={16} className="me-1" />
          Add Company
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={16} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4} className="text-end">
              <Badge bg="secondary" className="fs-6">
                {filteredCompanies.length} companies
              </Badge>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
                     <tr>
                       <th>Company</th>
                       <th>Contact Email</th>
                       <th>Contact Info</th>
                       <th>Created</th>
                       <th>Actions</th>
                     </tr>
            </thead>
            <tbody>
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No companies found
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-2">
                          <Building2 size={16} className="text-primary" />
                        </div>
                        <div className="fw-medium">{company.name}</div>
                      </div>
                    </td>
                    <td>
                      {company.resellerEmail ? (
                        <div className="d-flex align-items-center">
                          <Mail size={14} className="text-muted me-1" />
                          {company.resellerEmail}
                        </div>
                      ) : (
                        <span className="text-muted">Not provided</span>
                      )}
                    </td>
                    <td>{getContactBadge(company)}</td>
                    <td>
                      <div className="d-flex align-items-center text-muted">
                        <Calendar size={14} className="me-1" />
                        {new Date(company.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(company)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Company Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedCompany ? 'Edit Company' : 'Add New Company'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
                <Modal.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter company name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter contact email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    />
                  </Form.Group>
                </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedCompany ? 'Update Company' : 'Create Company'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Company</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this company?</p>
                <div className="bg-light p-3 rounded">
                  <strong>Name:</strong> {selectedCompany?.name}<br />
                  <strong>Email:</strong> {selectedCompany?.resellerEmail || 'Not provided'}
                </div>
          <Alert variant="warning" className="mt-3">
            <strong>Warning:</strong> This action cannot be undone and may affect related renewal records.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Company
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CompanyManagement;


