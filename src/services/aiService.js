import { aiClient } from './api';

export const COMMON_SYMPTOMS = [
  'fever',
  'high temperature',
  'cough',
  'shortness of breath',
  'sore throat',
  'chest pain',
  'chest tightness',
  'severe headache',
  'migraine',
  'stomach ache',
  'acidity',
  'nausea',
  'vomiting',
  'skin rash',
  'itching',
  'joint pain',
  'swollen joints',
  'fatigue',
  'dizziness',
  'sneezing',
];

export const DISEASE_METADATA = {
  'Fever': {
    specialist: 'General Physician',
    urgency: 'Medium',
    color: '#3b82f6',
    advice: [
      'Maintain adequate hydration with water and electrolyte solutions.',
      'Monitor body temperature every 4 hours.',
      'Seek urgent care if temperature exceeds 103°F (39.4°C) or lasts > 3 days.',
    ],
  },
  'Respiratory Infection': {
    specialist: 'Pulmonologist',
    urgency: 'High',
    color: '#06b6d4',
    advice: [
      'Rest in an upright position to ease breathing.',
      'Use a humidifier or inhale warm steam.',
      'Immediately seek emergency care if experiencing blue lips, extreme breathlessness, or persistent chest pressure.',
    ],
  },
  'Migraine': {
    specialist: 'Neurologist',
    urgency: 'Medium',
    color: '#8b5cf6',
    advice: [
      'Rest in a quiet, dark room away from bright screens and noise.',
      'Apply a cold or warm compress to forehead or neck.',
      'Keep a migraine trigger diary (caffeine, sleep patterns, stress).',
    ],
  },
  'Gastric Problem': {
    specialist: 'Gastroenterologist',
    urgency: 'Low',
    color: '#f59e0b',
    advice: [
      'Consume small, bland meals and avoid spicy or oily foods.',
      'Stay hydrated with warm water or herbal teas.',
      'Avoid lying down immediately after meals.',
    ],
  },
  'Skin Condition': {
    specialist: 'Dermatologist',
    urgency: 'Low',
    color: '#ec4899',
    advice: [
      'Avoid scratching or applying harsh soaps to the affected area.',
      'Keep the area clean, dry, and lightly moisturized.',
      'Document any changes in rash spread, color, or swelling.',
    ],
  },
  'Chest Pain': {
    specialist: 'Cardiologist',
    urgency: 'Critical',
    color: '#ef4444',
    advice: [
      'CRITICAL: If chest pain radiates to arm, jaw, neck, or accompanied by shortness of breath, call emergency services immediately.',
      'Do not engage in physical exertion.',
      'Rest seated in a relaxed posture while seeking prompt medical evaluation.',
    ],
  },
  'Joint Problem': {
    specialist: 'Orthopedic Specialist',
    urgency: 'Medium',
    color: '#10b981',
    advice: [
      'Follow the RICE protocol: Rest, Ice, Compression, and Elevation.',
      'Avoid heavy weight-bearing on the painful joint.',
      'Perform gentle mobility exercises only if pain permits.',
    ],
  },
};

export const aiService = {
  /**
   * Send symptoms to Python Flask AI microservice: POST /predict
   * @param {string} symptoms
   */
  async predictSymptoms(symptoms) {
    if (!symptoms || !symptoms.trim()) {
      throw new Error('Please enter or select at least one symptom.');
    }

    const response = await aiClient.post('/predict', {
      symptoms: symptoms.trim(),
    });

    const data = response.data;
    const diseaseInfo = DISEASE_METADATA[data.prediction] || {
      specialist: data.specialist || 'General Physician',
      urgency: 'Medium',
      color: '#0284c7',
      advice: ['Consult a medical specialist for a thorough diagnosis.'],
    };

    return {
      symptoms: data.symptoms,
      prediction: data.prediction,
      confidence: data.confidence,
      specialist: data.specialist || diseaseInfo.specialist,
      urgency: diseaseInfo.urgency,
      color: diseaseInfo.color,
      advice: diseaseInfo.advice,
      timestamp: new Date().toISOString(),
    };
  },
};

export default aiService;
