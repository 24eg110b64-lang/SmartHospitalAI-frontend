import React from 'react';
import { COMMON_SYMPTOMS } from '../../services/aiService';
import { Plus, Check } from 'lucide-react';

export const SymptomChipSelector = ({ selectedSymptoms = [], onToggleSymptom }) => {
  return (
    <div style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '0.5rem',
        }}
      >
        Quick Select Common Symptoms:
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {COMMON_SYMPTOMS.map((symptom) => {
          const isSelected = selectedSymptoms.some(
            (s) => s.toLowerCase() === symptom.toLowerCase()
          );

          return (
            <button
              type="button"
              key={symptom}
              onClick={() => onToggleSymptom(symptom)}
              className={`ai-chip ${isSelected ? 'selected' : ''}`}
            >
              {isSelected ? <Check size={14} /> : <Plus size={14} />}
              <span>{symptom}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SymptomChipSelector;
