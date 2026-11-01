import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Award,
  Clock,
  IndianRupee,
  DollarSign,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { doctorService } from '../services/doctorService';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';

const initialDoctorForm = {
  doctorName: '',
  specialization: 'General Physician',
  experience: '',
  qualification: 'MBBS, MD',
  phone: '',
  email: '',
  availability: 'Available (Mon - Fri)',
  consultationFee: 500,
};

const COMMON_SPECIALIZATIONS = [
  'All Specializations',
  'General Physician',
  'Pulmonologist',
  'Neurologist',
  'Gastroenterologist',
  'Dermatologist',
  'Cardiologist',
  'Orthopedic Specialist',
  'Pediatrician',
  'Surgeon',
];

export const Doctors = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('All Specializations');

  // Add / Edit Modal state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(initialDoctorForm);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete Modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDoctorName, setDeleteDoctorName] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load doctors
  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await doctorService.getAllDoctors();
      setDoctors(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve doctors from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  // Filter & Search
  const filteredDoctors = doctors.filter((doc) => {
    const name = (doc.doctorName || '').toLowerCase();
    const spec = (doc.specialization || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = name.includes(query) || spec.includes(query);
    const matchesSpec =
      filterSpecialization === 'All Specializations' ||
      doc.specialization?.toLowerCase() === filterSpecialization.toLowerCase();

    return matchesSearch && matchesSpec;
  });

  // Open Add
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData(initialDoctorForm);
    setIsAddEditOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (doc) => {
    setIsEditing(true);
    setEditId(doc.id);
    setFormData({
      doctorName: doc.doctorName || '',
      specialization: doc.specialization || 'General Physician',
      experience: doc.experience || '',
      qualification: doc.qualification || '',
      phone: doc.phone || '',
      email: doc.email || '',
      availability: doc.availability || 'Available (Mon - Fri)',
      consultationFee: doc.consultationFee || 500,
    });
    setIsAddEditOpen(true);
  };

  // Submit Add / Edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorName.trim() || !formData.specialization.trim()) {
      alert('Doctor name and specialization are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      if (isEditing) {
        await doctorService.updateDoctor(editId, formData);
      } else {
        await doctorService.createDoctor(formData);
      }
      setIsAddEditOpen(false);
      await loadDoctors();
    } catch (err) {
      alert(err.message || 'Error saving doctor record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete
  const handleOpenDelete = (doc) => {
    setDeleteId(doc.id);
    setDeleteDoctorName(doc.doctorName);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await doctorService.deleteDoctor(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      await loadDoctors();
    } catch (err) {
      alert(err.message || 'Failed to delete doctor.');
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
            <Stethoscope color="var(--primary)" /> Doctor & Specialist Directory
          </h1>
          <p className="page-subtitle">
            Physicians, clinical specialists, availability schedules and consultation credentials.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Register New Doctor
        </button>
      </div>

      <ErrorAlert message={error} onRetry={loadDoctors} />

      {/* Filter / Search Bar */}
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
            placeholder="Search by doctor name or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ color: 'var(--text-secondary)' }}>Specialty:</span>
          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="select-field"
            style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
          >
            {COMMON_SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Loading hospital medical staff..." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          description={
            searchQuery
              ? `No doctors match "${searchQuery}".`
              : "No doctor records exist yet in the database."
          }
          actionLabel="Add First Doctor"
          onAction={handleOpenAdd}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div>
                {/* Doctor Head Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'linear-gradient(135deg, #0284c7, #0d9488)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                    }}
                  >
                    {doc.doctorName ? doc.doctorName.replace(/^(Dr\.?|Doctor)\s*/i, '').charAt(0) : 'D'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {doc.doctorName?.startsWith('Dr') ? doc.doctorName : `Dr. ${doc.doctorName}`}
                    </h3>
                    <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {doc.specialization}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {doc.qualification || 'MBBS'}
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    fontSize: '0.82rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>
                      Experience
                    </span>
                    <strong>{doc.experience || 0} years</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>
                      Consult Fee
                    </span>
                    <strong style={{ color: '#059669' }}>₹{doc.consultationFee || 0}</strong>
                  </div>
                </div>

                {/* Contact & Availability */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="var(--primary)" />
                    <span>{doc.availability || 'Available on appointment'}</span>
                  </div>
                  {doc.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      <span>{doc.phone}</span>
                    </div>
                  )}
                  {doc.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1.25rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-light)',
                }}
              >
                <button
                  onClick={() => navigate('/appointments', { state: { doctorId: doc.id } })}
                  className="btn btn-sm btn-primary"
                >
                  <Calendar size={14} /> Book Visit
                </button>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleOpenEdit(doc)}
                    className="btn btn-icon btn-secondary"
                    title="Edit Doctor"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(doc)}
                    className="btn btn-icon"
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                    title="Delete Doctor"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          ADD / EDIT DOCTOR MODAL
          ======================================================== */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={isEditing ? 'Edit Doctor Information' : 'Register New Medical Specialist'}
        icon={Stethoscope}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">
              Doctor Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="input-field"
              required
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              placeholder="e.g. Dr. Rajesh Sharma"
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Specialization <span className="required">*</span>
              </label>
              <select
                className="select-field"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              >
                {COMMON_SPECIALIZATIONS.filter((s) => s !== 'All Specializations').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="70"
                className="input-field"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 12"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Qualification Degrees</label>
              <input
                type="text"
                className="input-field"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. MBBS, MD (Cardiology)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Fee (₹)</label>
              <input
                type="number"
                min="0"
                step="50"
                className="input-field"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                placeholder="e.g. 500"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@hospital.org"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Weekly Availability Schedule</label>
            <input
              type="text"
              className="input-field"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              placeholder="e.g. Mon, Wed, Fri (9:00 AM - 1:00 PM)"
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
              {formSubmitting ? 'Saving...' : isEditing ? 'Update Specialist' : 'Save Specialist'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================
          DELETE CONFIRMATION MODAL
          ======================================================== */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Doctor Deletion"
        icon={AlertTriangle}
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Are you sure you want to permanently remove doctor{' '}
          <strong>{deleteDoctorName}</strong> (ID #{deleteId})? This will call backend endpoint{' '}
          <code>DELETE /doctors/{deleteId}</code>.
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
            {deleteLoading ? 'Deleting...' : 'Delete Doctor'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Doctors;
