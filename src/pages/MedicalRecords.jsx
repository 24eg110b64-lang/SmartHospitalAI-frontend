import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  HeartPulse,
  Activity,
  Thermometer,
  Pill,
  Printer,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { medicalRecordService } from '../services/medicalRecordService';
import { patientService } from '../services/patientService';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';

export const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Record View Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // New Note / Record Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formPatientId, setFormPatientId] = useState('');
  const [formBp, setFormBp] = useState('120/80 mmHg');
  const [formHr, setFormHr] = useState('72 bpm');
  const [formTemp, setFormTemp] = useState('98.6 °F');
  const [formSpo2, setFormSpo2] = useState('99%');
  const [formAllergies, setFormAllergies] = useState('None reported');
  const [formNotes, setFormNotes] = useState('');
  const [formDoctor, setFormDoctor] = useState('Attending Physician');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [recordsData, patientsData] = await Promise.all([
        medicalRecordService.getAllRecords(),
        patientService.getAllPatients(),
      ]);
      setRecords(recordsData);
      setPatients(patientsData);
    } catch (err) {
      setError(err.message || 'Unable to load electronic health records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecords = records.filter((r) => {
    const name = (r.patientName || '').toLowerCase();
    const diag = (r.primaryDiagnosis || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || diag.includes(query);
  });

  const handleOpenAdd = () => {
    setFormPatientId(patients.length > 0 ? patients[0].id : '');
    setFormBp('120/80 mmHg');
    setFormHr('72 bpm');
    setFormTemp('98.6 °F');
    setFormSpo2('99%');
    setFormAllergies('None reported');
    setFormNotes('');
    setFormDoctor('Attending Physician');
    setIsAddOpen(true);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!formPatientId) {
      alert('Please select a patient.');
      return;
    }

    const patient = patients.find((p) => p.id === Number(formPatientId));

    try {
      setFormSubmitting(true);
      const payload = {
        patientId: Number(formPatientId),
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Patient',
        age: patient?.age,
        gender: patient?.gender,
        bloodGroup: patient?.bloodGroup,
        primaryDiagnosis: patient?.disease || 'General Medical Note',
        vitals: {
          bloodPressure: formBp,
          heartRate: formHr,
          temperature: formTemp,
          oxygenSaturation: formSpo2,
        },
        allergies: formAllergies,
        clinicalNotes: formNotes || 'Routine clinical review note recorded.',
        doctorNotesBy: formDoctor,
      };

      await medicalRecordService.saveRecord(payload);
      setIsAddOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error saving medical chart note.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileText color="var(--primary)" /> Electronic Medical Records (EMR)
          </h1>
          <p className="page-subtitle">
            Longitudinal patient charts, vital metrics, diagnostic history, and clinical documentation.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Add Clinical Note / Vitals
        </button>
      </div>

      <ErrorAlert message={error} onRetry={loadData} />

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search medical records by patient name or diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Record List */}
      {loading ? (
        <LoadingSpinner message="Accessing clinical documentation..." />
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No clinical charts found"
          description={
            searchQuery
              ? `No medical records match "${searchQuery}".`
              : "No clinical records currently documented."
          }
          actionLabel="Document First Record"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID & Patient</th>
                <th>Primary Diagnosis</th>
                <th>Vitals Summary</th>
                <th>Known Allergies</th>
                <th>Last Evaluated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.patientName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Record #{r.id} • {r.gender} • {r.bloodGroup}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {r.primaryDiagnosis}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      BP: <strong>{r.vitals?.bloodPressure || 'N/A'}</strong> | HR:{' '}
                      <strong>{r.vitals?.heartRate || 'N/A'}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      SpO2: {r.vitals?.oxygenSaturation || '99%'} | Temp: {r.vitals?.temperature || '98.6 °F'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: r.allergies === 'None reported' ? 'var(--text-secondary)' : 'var(--danger)' }}>
                      {r.allergies || 'None'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {r.lastUpdated}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      by {r.doctorNotesBy || 'Attending MD'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedRecord(r);
                        setIsViewOpen(true);
                      }}
                      className="btn btn-sm btn-outline"
                    >
                      <Eye size={14} /> Full Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          FULL CHART MODAL
          ======================================================== */}
      {selectedRecord && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Clinical Health Record: ${selectedRecord.patientName}`}
          icon={FileText}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <button onClick={handlePrint} className="btn btn-sm btn-secondary">
                <Printer size={15} /> Print Chart
              </button>
              <button onClick={() => setIsViewOpen(false)} className="btn btn-sm btn-primary">
                Done
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Vitals Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <div>
                <HeartPulse size={18} color="var(--danger)" style={{ margin: '0 auto 4px' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>BP</span>
                <strong style={{ fontSize: '0.9rem' }}>{selectedRecord.vitals?.bloodPressure}</strong>
              </div>
              <div>
                <Activity size={18} color="var(--primary)" style={{ margin: '0 auto 4px' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Pulse</span>
                <strong style={{ fontSize: '0.9rem' }}>{selectedRecord.vitals?.heartRate}</strong>
              </div>
              <div>
                <Thermometer size={18} color="var(--warning)" style={{ margin: '0 auto 4px' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Temp</span>
                <strong style={{ fontSize: '0.9rem' }}>{selectedRecord.vitals?.temperature}</strong>
              </div>
              <div>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--secondary)', display: 'block' }}>O₂</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>SpO2</span>
                <strong style={{ fontSize: '0.9rem' }}>{selectedRecord.vitals?.oxygenSaturation}</strong>
              </div>
            </div>

            {/* Diagnosis & Allergies */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: '#e0f2fe', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, display: 'block' }}>
                  Primary Assessment
                </span>
                <strong style={{ color: '#0284c7', fontSize: '1rem' }}>{selectedRecord.primaryDiagnosis}</strong>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600, display: 'block' }}>
                  Allergies & Contraindications
                </span>
                <strong style={{ color: '#dc2626', fontSize: '0.95rem' }}>{selectedRecord.allergies}</strong>
              </div>
            </div>

            {/* Prescriptions */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Pill size={16} color="var(--accent-purple)" /> Active Prescriptions & Regimen
              </h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {selectedRecord.prescriptions?.map((p, idx) => (
                  <li key={idx}>
                    <strong>{p.medicine}</strong>: {p.dosage} ({p.duration})
                  </li>
                )) || <li>No medications currently prescribed.</li>}
              </ul>
            </div>

            {/* Clinical Doctor Notes */}
            <div
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Physician Progress Notes
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedRecord.lastUpdated}
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selectedRecord.clinicalNotes}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
                — Documented by {selectedRecord.doctorNotesBy}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          ADD CLINICAL RECORD / VITALS MODAL
          ======================================================== */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Document Patient Chart Note & Vitals"
        icon={HeartPulse}
      >
        <form onSubmit={handleSaveRecord}>
          <div className="form-group">
            <label className="form-label">
              Patient <span className="required">*</span>
            </label>
            <select
              className="select-field"
              required
              value={formPatientId}
              onChange={(e) => setFormPatientId(e.target.value)}
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} (#{p.id} - {p.disease || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Blood Pressure</label>
              <input
                type="text"
                className="input-field"
                value={formBp}
                onChange={(e) => setFormBp(e.target.value)}
                placeholder="120/80 mmHg"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Heart Rate</label>
              <input
                type="text"
                className="input-field"
                value={formHr}
                onChange={(e) => setFormHr(e.target.value)}
                placeholder="72 bpm"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Temperature</label>
              <input
                type="text"
                className="input-field"
                value={formTemp}
                onChange={(e) => setFormTemp(e.target.value)}
                placeholder="98.6 °F"
              />
            </div>
            <div className="form-group">
              <label className="form-label">SpO2 (Oxygen)</label>
              <input
                type="text"
                className="input-field"
                value={formSpo2}
                onChange={(e) => setFormSpo2(e.target.value)}
                placeholder="99%"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Allergies & Reactions</label>
            <input
              type="text"
              className="input-field"
              value={formAllergies}
              onChange={(e) => setFormAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Pollen, None reported"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Progress Notes</label>
            <textarea
              rows={3}
              className="textarea-field"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Clinical evaluation observations, response to therapy, recommendations..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Evaluating Clinician / MD</label>
            <input
              type="text"
              className="input-field"
              value={formDoctor}
              onChange={(e) => setFormDoctor(e.target.value)}
              placeholder="Dr. Rajesh / Attending Physician"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formSubmitting || patients.length === 0}
            >
              {formSubmitting ? 'Recording...' : 'Save to Patient Chart'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicalRecords;
