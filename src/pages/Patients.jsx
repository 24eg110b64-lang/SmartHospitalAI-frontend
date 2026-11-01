import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Calendar,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { patientService } from '../services/patientService';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';

const initialForm = {
  firstName: '',
  lastName: '',
  age: '',
  gender: 'Male',
  bloodGroup: 'O+',
  phone: '',
  email: '',
  address: '',
  disease: '',
};

export const Patients = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('All');
  const [filterBlood, setFilterBlood] = useState('All');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // View Details Modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Delete Confirm
  const [deleteId, setDeleteId] = useState(null);
  const [deletePatientName, setDeletePatientName] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load patients
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve patients from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Filter & Search
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
    const disease = (patient.disease || '').toLowerCase();
    const phone = (patient.phone || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      fullName.includes(query) || disease.includes(query) || phone.includes(query);

    const matchesGender = filterGender === 'All' || patient.gender === filterGender;
    const matchesBlood = filterBlood === 'All' || patient.bloodGroup === filterBlood;

    return matchesSearch && matchesGender && matchesBlood;
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData(initialForm);
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (patient) => {
    setIsEditing(true);
    setEditId(patient.id);
    setFormData({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      age: patient.age || '',
      gender: patient.gender || 'Male',
      bloodGroup: patient.bloodGroup || 'O+',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      disease: patient.disease || '',
    });
    setIsAddEditOpen(true);
  };

  // Submit Add / Edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('First name and last name are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      if (isEditing) {
        await patientService.updatePatient(editId, formData);
      } else {
        await patientService.createPatient(formData);
      }
      setIsAddEditOpen(false);
      await loadPatients();
    } catch (err) {
      alert(err.message || 'Error saving patient record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // View details
  const handleOpenView = (patient) => {
    setSelectedPatient(patient);
    setIsViewOpen(true);
  };

  // Trigger Delete confirmation
  const handleOpenDelete = (patient) => {
    setDeleteId(patient.id);
    setDeletePatientName(`${patient.firstName} ${patient.lastName}`);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await patientService.deletePatient(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      await loadPatients();
    } catch (err) {
      alert(err.message || 'Failed to delete patient from backend.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users color="var(--primary)" /> Patient Management
          </h1>
          <p className="page-subtitle">
            Manage comprehensive electronic health records, demographics, and clinical history.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <UserPlus size={18} /> Add New Patient
        </button>
      </div>

      <ErrorAlert message={error} onRetry={loadPatients} />

      {/* Search & Filters Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, disease, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-secondary)' }}>Gender:</span>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="select-field"
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Blood:</span>
            <select
              value={filterBlood}
              onChange={(e) => setFilterBlood(e.target.value)}
              className="select-field"
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
            >
              <option value="All">All</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      {loading ? (
        <LoadingSpinner message="Loading hospital patient directory..." />
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description={
            searchQuery
              ? `No patients match your search query "${searchQuery}".`
              : "No patient records exist yet in the database."
          }
          actionLabel="Register First Patient"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Age / Gender</th>
                <th>Blood Group</th>
                <th>Contact</th>
                <th>Current Condition / Disease</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: #{patient.id}
                    </div>
                  </td>
                  <td>
                    {patient.age ? `${patient.age} yrs` : 'N/A'} • {patient.gender || 'Unknown'}
                  </td>
                  <td>
                    <Badge variant="purple">{patient.bloodGroup || 'Unknown'}</Badge>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={13} color="var(--text-muted)" /> {patient.phone || 'N/A'}
                    </div>
                    {patient.email && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={13} /> {patient.email}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--primary)' }}>
                      {patient.disease || 'General checkup'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenView(patient)}
                        className="btn btn-icon btn-secondary"
                        title="View Full Profile"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(patient)}
                        className="btn btn-icon btn-secondary"
                        title="Edit Patient"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(patient)}
                        className="btn btn-icon"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                        title="Delete Patient"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          ADD / EDIT MODAL
          ======================================================== */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={isEditing ? 'Edit Patient Information' : 'Register New Patient'}
        icon={Users}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="input-field"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. John"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="input-field"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Doe"
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                min="0"
                max="130"
                className="input-field"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 35"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="select-field"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="select-field"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0199"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="input-field"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 124 Medical Plaza, New York"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Condition / Primary Complaint</label>
            <input
              type="text"
              className="input-field"
              value={formData.disease}
              onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
              placeholder="e.g. Respiratory Infection, Migraine, Fever"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formSubmitting}
            >
              {formSubmitting ? 'Saving...' : isEditing ? 'Update Patient' : 'Save Patient'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================
          VIEW DETAILS DRAWER / MODAL
          ======================================================== */}
      {selectedPatient && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Patient Profile: ${selectedPatient.firstName} ${selectedPatient.lastName}`}
          icon={HeartPulse}
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'space-between' }}>
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  navigate('/ai-diagnosis', { state: { patient: selectedPatient } });
                }}
                className="btn btn-sm btn-secondary"
                style={{ color: 'var(--primary)' }}
              >
                <Sparkles size={14} /> AI Health Screen
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setIsViewOpen(false);
                    navigate('/appointments');
                  }}
                  className="btn btn-sm btn-primary"
                >
                  <Calendar size={14} /> Schedule Visit
                </button>
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="btn btn-sm btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  fontWeight: 800,
                }}
              >
                {selectedPatient.firstName?.[0]}
                {selectedPatient.lastName?.[0]}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Patient ID: #{selectedPatient.id} • Registered in Hospital System
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  Age & Gender
                </span>
                <strong>
                  {selectedPatient.age || 'N/A'} yrs • {selectedPatient.gender}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  Blood Group
                </span>
                <Badge variant="purple">{selectedPatient.bloodGroup || 'Unknown'}</Badge>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  Phone
                </span>
                <strong>{selectedPatient.phone || 'None recorded'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  Email
                </span>
                <strong>{selectedPatient.email || 'None recorded'}</strong>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                Residential Address
              </span>
              <p style={{ fontSize: '0.88rem' }}>{selectedPatient.address || 'No residential address on file'}</p>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #bae6fd',
              }}
            >
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-hover)', display: 'block' }}>
                Primary Diagnosis / Medical Complaint
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-hover)', marginTop: '2px' }}>
                {selectedPatient.disease || 'Routine Consultation / Checkup'}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
          ======================================================== */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Patient Record Deletion"
        icon={AlertTriangle}
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Are you sure you want to permanently delete patient{' '}
          <strong>{deletePatientName}</strong> (ID #{deleteId})? This action will call the backend
          endpoint <code>DELETE /patients/{deleteId}</code>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(false)}
            className="btn btn-secondary"
            disabled={deleteLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="btn btn-danger"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Patients;
