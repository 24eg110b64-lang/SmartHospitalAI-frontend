import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  CalendarCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';

const initialAppointmentForm = {
  patientId: '',
  doctorId: '',
  appointmentDate: new Date().toISOString().split('T')[0],
  appointmentTime: '10:00',
  status: 'Scheduled',
};

export const Appointments = () => {
  const location = useLocation();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(initialAppointmentForm);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [apptData, patData, docData] = await Promise.all([
        appointmentService.getAllAppointments(),
        patientService.getAllPatients(),
        doctorService.getAllDoctors(),
      ]);

      setAppointments(apptData);
      setPatients(patData);
      setDoctors(docData);

      // Check if routed with doctor or patient prefill
      if (location.state?.doctorId) {
        setFormData((prev) => ({ ...prev, doctorId: location.state.doctorId }));
        setIsModalOpen(true);
      } else if (location.state?.patientId) {
        setFormData((prev) => ({ ...prev, patientId: location.state.patientId }));
        setIsModalOpen(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to load appointments data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredAppointments = appointments.filter((appt) => {
    const patientName = appt.patient
      ? `${appt.patient.firstName || ''} ${appt.patient.lastName || ''}`.toLowerCase()
      : '';
    const doctorName = appt.doctor ? (appt.doctor.doctorName || '').toLowerCase() : '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = patientName.includes(query) || doctorName.includes(query);

    const matchesStatus =
      statusFilter === 'All' ||
      appt.status?.toLowerCase() === statusFilter.toLowerCase();

    let matchesDate = true;
    if (dateFilter === 'Today') {
      matchesDate = appt.appointmentDate === todayStr;
    } else if (dateFilter === 'Upcoming') {
      matchesDate = appt.appointmentDate >= todayStr;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Open Create
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      patientId: patients.length > 0 ? patients[0].id : '',
      doctorId: doctors.length > 0 ? doctors[0].id : '',
      appointmentDate: todayStr,
      appointmentTime: '10:00',
      status: 'Scheduled',
    });
    setIsModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (appt) => {
    setIsEditing(true);
    setEditId(appt.id);
    setFormData({
      patientId: appt.patient?.id || '',
      doctorId: appt.doctor?.id || '',
      appointmentDate: appt.appointmentDate || todayStr,
      appointmentTime: appt.appointmentTime || '10:00',
      status: appt.status || 'Scheduled',
    });
    setIsModalOpen(true);
  };

  // Submit Save
  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      alert('Please fill all appointment details (Patient, Doctor, Date, and Time).');
      return;
    }

    try {
      setFormSubmitting(true);
      if (isEditing) {
        await appointmentService.updateAppointment(editId, formData);
      } else {
        await appointmentService.createAppointment(formData);
      }
      setIsModalOpen(false);
      await loadAll();
    } catch (err) {
      alert(err.message || 'Error saving appointment.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Quick Status Update
  const handleQuickStatus = async (appt, newStatus) => {
    try {
      await appointmentService.updateStatus(appt, newStatus);
      await loadAll();
    } catch (err) {
      alert(err.message || 'Unable to update status.');
    }
  };

  // Delete
  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await appointmentService.deleteAppointment(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      await loadAll();
    } catch (err) {
      alert(err.message || 'Failed to delete appointment.');
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
            <Calendar color="var(--primary)" /> Clinical Appointments
          </h1>
          <p className="page-subtitle">
            Consultation scheduling, physician booking, real-time patient queues and status management.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={18} /> Schedule New Appointment
        </button>
      </div>

      <ErrorAlert message={error} onRetry={loadAll} />

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
            placeholder="Search by patient or doctor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field"
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="select-field"
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
            >
              <option value="All">All Dates</option>
              <option value="Today">Today Only</option>
              <option value="Upcoming">Upcoming (Today &amp; Future)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointment Table */}
      {loading ? (
        <LoadingSpinner message="Retrieving appointment ledger..." />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments scheduled"
          description={
            searchQuery
              ? `No appointments match "${searchQuery}".`
              : "No appointments currently on the calendar."
          }
          actionLabel="Schedule Appointment"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient</th>
                <th>Doctor & Specialty</th>
                <th>Status</th>
                <th>Quick Actions</th>
                <th style={{ textAlign: 'right' }}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appt) => (
                <tr key={appt.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} color="var(--primary)" />
                      {appt.appointmentDate}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                      <Clock size={13} />
                      {appt.appointmentTime}
                    </div>
                  </td>

                  <td>
                    {appt.patient ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {appt.patient.firstName} {appt.patient.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Age: {appt.patient.age || 'N/A'} • {appt.patient.gender} • {appt.patient.phone || 'No phone'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No Patient Assigned</span>
                    )}
                  </td>

                  <td>
                    {appt.doctor ? (
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>
                          {appt.doctor.doctorName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {appt.doctor.specialization}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No Doctor Assigned</span>
                    )}
                  </td>

                  <td>
                    <Badge status={appt.status}>{appt.status}</Badge>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {appt.status?.toLowerCase() !== 'completed' && (
                        <button
                          onClick={() => handleQuickStatus(appt, 'Completed')}
                          className="btn btn-sm"
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                          }}
                          title="Mark visit completed"
                        >
                          <CheckCircle size={12} /> Complete
                        </button>
                      )}

                      {appt.status?.toLowerCase() !== 'cancelled' && (
                        <button
                          onClick={() => handleQuickStatus(appt, 'Cancelled')}
                          className="btn btn-sm"
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            backgroundColor: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                          }}
                          title="Cancel appointment"
                        >
                          <XCircle size={12} /> Cancel
                        </button>
                      )}

                      {appt.status?.toLowerCase() !== 'scheduled' && (
                        <button
                          onClick={() => handleQuickStatus(appt, 'Scheduled')}
                          className="btn btn-sm"
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #fde68a',
                          }}
                          title="Reopen as scheduled"
                        >
                          <RotateCcw size={12} /> Reopen
                        </button>
                      )}
                    </div>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenEdit(appt)}
                        className="btn btn-icon btn-secondary"
                        title="Edit Appointment"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(appt.id)}
                        className="btn btn-icon"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                        title="Delete Appointment"
                      >
                        <Trash2 size={15} />
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
          CREATE / EDIT APPOINTMENT MODAL
          ======================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Modify Appointment Booking' : 'Schedule New Appointment'}
        icon={Calendar}
      >
        <form onSubmit={handleSaveAppointment}>
          {/* Patient Selection */}
          <div className="form-group">
            <label className="form-label">
              Select Patient <span className="required">*</span>
            </label>
            {patients.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--danger)' }}>
                No patients available. Please register a patient first.
              </p>
            ) : (
              <select
                className="select-field"
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} (ID: #{p.id} - {p.disease || 'General'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Doctor Selection */}
          <div className="form-group">
            <label className="form-label">
              Select Doctor / Specialist <span className="required">*</span>
            </label>
            {doctors.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--danger)' }}>
                No doctors available. Please register a doctor first.
              </p>
            ) : (
              <select
                className="select-field"
                required
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.doctorName} ({d.specialization}) - ₹{d.consultationFee}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Appointment Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="input-field"
                required
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Time Slot <span className="required">*</span>
              </label>
              <input
                type="time"
                className="input-field"
                required
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
              />
            </div>
          </div>

          {/* Status Selection */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="select-field"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formSubmitting || patients.length === 0 || doctors.length === 0}
            >
              {formSubmitting ? 'Saving...' : isEditing ? 'Update Booking' : 'Confirm Appointment'}
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
        title="Confirm Appointment Deletion"
        icon={AlertTriangle}
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Are you sure you want to delete appointment #{deleteId}? This will call{' '}
          <code>DELETE /appointments/{deleteId}</code>.
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
            {deleteLoading ? 'Deleting...' : 'Delete Appointment'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
