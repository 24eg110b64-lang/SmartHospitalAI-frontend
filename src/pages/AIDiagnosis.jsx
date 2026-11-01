import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  Activity,
  Stethoscope,
  Send,
  RotateCcw,
  History,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import { aiService, COMMON_SYMPTOMS } from '../services/aiService';
import { patientService } from '../services/patientService';
import SymptomChipSelector from '../components/ai/SymptomChipSelector';
import DiagnosisResultCard from '../components/ai/DiagnosisResultCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { AI_BASE_URL } from '../services/api';

export const AIDiagnosis = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientNameInput, setPatientNameInput] = useState('');

  const [symptomsText, setSymptomsText] = useState('');
  const [selectedChips, setSelectedChips] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Load patients on mount
  useEffect(() => {
    patientService
      .getAllPatients()
      .then((data) => {
        setPatients(data);
        // If state passed from patient view
        if (location.state?.patient) {
          const p = location.state.patient;
          setSelectedPatientId(p.id);
          setPatientNameInput(`${p.firstName} ${p.lastName}`);
          if (p.disease) {
            setSymptomsText(p.disease.toLowerCase());
          }
        }
      })
      .catch((err) => console.warn('Could not prefetch patients for AI form:', err));
  }, [location.state]);

  // Handle chip toggle
  const handleToggleChip = (symptom) => {
    let updated;
    if (selectedChips.includes(symptom)) {
      updated = selectedChips.filter((s) => s !== symptom);
    } else {
      updated = [...selectedChips, symptom];
    }
    setSelectedChips(updated);
    setSymptomsText(updated.join(', '));
  };

  // When text changes directly
  const handleTextChange = (e) => {
    const val = e.target.value;
    setSymptomsText(val);

    // Sync chips that match words
    const lower = val.toLowerCase();
    const active = COMMON_SYMPTOMS.filter((s) => lower.includes(s.toLowerCase()));
    setSelectedChips(active);
  };

  // Patient dropdown change
  const handlePatientSelect = (e) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    if (id) {
      const p = patients.find((pat) => pat.id === Number(id));
      if (p) {
        setPatientNameInput(`${p.firstName} ${p.lastName}`);
        if (p.disease && !symptomsText) {
          setSymptomsText(p.disease.toLowerCase());
        }
      }
    } else {
      setPatientNameInput('');
    }
  };

  // Submit AI Prediction
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptomsText.trim()) {
      setError('Please provide one or more symptoms for the AI model to analyze.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const predictionData = await aiService.predictSymptoms(symptomsText);

      const enriched = {
        ...predictionData,
        patientName: patientNameInput || 'General Patient',
        patientId: selectedPatientId || null,
      };

      setResult(enriched);
      setHistory((prev) => [enriched, ...prev.slice(0, 4)]);
    } catch (err) {
      setError(
        err.message ||
          `Failed to get prediction from AI service at ${AI_BASE_URL}. Ensure Flask app.py is running on port 5000.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptomsText('');
    setSelectedChips([]);
    setResult(null);
    setError('');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Sparkles color="var(--primary)" /> AI Clinical Decision Support & Diagnosis
          </h1>
          <p className="page-subtitle">
            Machine Learning symptom pattern matching, preliminary disease screening, and specialist triage routing.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Brain size={16} color="var(--primary)" />
          <span>Flask ML Service: <strong style={{ color: 'var(--text-main)' }}>{AI_BASE_URL}</strong></span>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={handleAnalyze} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: result ? '1.1fr 1fr' : '1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Input Form Box */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity size={18} color="var(--primary)" /> Patient Symptom Input
            </h3>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.75rem' }}
            >
              <RotateCcw size={13} /> Reset Form
            </button>
          </div>

          <form onSubmit={handleAnalyze}>
            {/* Patient Selector */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Select Registered Patient (Optional)</label>
                <select
                  className="select-field"
                  value={selectedPatientId}
                  onChange={handlePatientSelect}
                >
                  <option value="">-- Non-Registered / Walk-in --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} (#{p.id} - {p.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Patient Display Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={patientNameInput}
                  onChange={(e) => setPatientNameInput(e.target.value)}
                  placeholder="e.g. Jane Doe or Walk-in"
                />
              </div>
            </div>

            {/* Quick Symptom Chips */}
            <SymptomChipSelector
              selectedSymptoms={selectedChips}
              onToggleSymptom={handleToggleChip}
            />

            {/* Symptom Input Textarea */}
            <div className="form-group">
              <label className="form-label">
                Detailed Symptoms <span className="required">*</span>
              </label>
              <textarea
                rows={4}
                className="textarea-field"
                required
                value={symptomsText}
                onChange={handleTextChange}
                placeholder="Describe patient's chief complaints (e.g. severe headache with nausea, or fever with high temperature and persistent dry cough)..."
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tip: Enter multiple symptoms separated by commas. The AI model extracts key clinical n-grams.
              </span>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !symptomsText.trim()}
                style={{ flex: 1, padding: '0.85rem' }}
              >
                {loading ? (
                  'Analyzing with Machine Learning...'
                ) : (
                  <>
                    <Send size={16} /> Run Clinical AI Prediction
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Model Specification Info */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                Classification Scope:
              </strong>
              Trained on 7 distinct healthcare classes: <em>Fever, Respiratory Infection, Migraine, Gastric Problem, Skin Condition, Chest Pain, Joint Problem</em>.
            </div>
          </div>
        </div>

        {/* Diagnosis Result Display */}
        <div>
          {loading && (
            <div className="card">
              <LoadingSpinner message="Consulting Python Flask ML model..." />
            </div>
          )}

          {result && !loading && (
            <DiagnosisResultCard
              result={result}
              onScheduleWithSpecialist={(specialist) => {
                navigate('/appointments');
              }}
            />
          )}

          {/* Session History */}
          {history.length > 0 && !loading && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title">
                  <History size={16} color="var(--text-secondary)" /> Recent Screening History (This Session)
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.84rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--primary)' }}>{item.prediction}</strong>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                        ({item.confidence}%)
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        "{item.symptoms}"
                      </div>
                    </div>
                    <span className="badge badge-primary">{item.specialist}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDiagnosis;
