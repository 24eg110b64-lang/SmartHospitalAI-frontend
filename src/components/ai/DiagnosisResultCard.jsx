import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  Stethoscope,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DiagnosisResultCard = ({ result, onScheduleWithSpecialist }) => {
  const navigate = useNavigate();

  if (!result) return null;

  const {
    symptoms,
    prediction,
    confidence,
    specialist,
    urgency = 'Medium',
    advice = [],
    timestamp,
  } = result;

  const getUrgencyBadge = (u) => {
    switch (u?.toLowerCase()) {
      case 'critical':
        return <span className="badge badge-danger">Critical Attention</span>;
      case 'high':
        return <span className="badge badge-warning">High Priority</span>;
      default:
        return <span className="badge badge-info">Standard Care</span>;
    }
  };

  return (
    <div className="ai-glow-card">
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(2, 132, 199, 0.2)',
          paddingBottom: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              AI Clinical Prediction Result
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Model: TF-IDF Logistic Classifier (95.6% Test Accuracy)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getUrgencyBadge(urgency)}
          {timestamp && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={12} /> {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Primary Result Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Predicted Condition */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.15rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Identified Pattern / Disease
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {prediction}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Analyzed: "{symptoms}"
          </div>
        </div>

        {/* Confidence Meter */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.15rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Model Confidence
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>
              {confidence}%
            </span>
          </div>

          <div className="confidence-bar-bg">
            <div
              className="confidence-bar-fill"
              style={{
                width: `${Math.min(confidence, 100)}%`,
                backgroundColor: confidence > 75 ? '#10b981' : confidence > 50 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            High statistical alignment with training corpus
          </span>
        </div>

        {/* Recommended Specialist */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.15rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Consultation Specialist
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--accent-purple)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginTop: '0.25rem',
            }}
          >
            <Stethoscope size={20} />
            {specialist}
          </div>
          <button
            onClick={() => onScheduleWithSpecialist ? onScheduleWithSpecialist(specialist) : navigate('/appointments')}
            className="btn btn-sm btn-outline"
            style={{ marginTop: '0.75rem', width: '100%', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
          >
            <Calendar size={14} /> Book with {specialist}
          </button>
        </div>
      </div>

      {/* Suggested Care Advice */}
      {advice && advice.length > 0 && (
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.2rem 1.4rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            marginBottom: '1rem',
          }}
        >
          <h4
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <CheckCircle2 size={16} color="var(--primary)" />
            Clinical Guidance & Pre-Consultation Care
          </h4>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {advice.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Prominent Medical AI Disclaimer */}
      <div className="disclaimer-banner">
        <ShieldAlert size={24} style={{ flexShrink: 0, marginTop: '2px', color: '#b45309' }} />
        <div>
          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#78350f' }}>
            IMPORTANT CLINICAL DECISION ASSISTANCE NOTICE:
          </strong>
          This output is an automated Machine Learning prediction intended solely as preliminary clinical support and triage guidance. It is <strong>NOT</strong> a certified medical diagnosis. Always consult a qualified physician for comprehensive evaluation, diagnosis, and prescription.
        </div>
      </div>
    </div>
  );
};

export default DiagnosisResultCard;
