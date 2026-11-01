import { apiClient } from './api';

export const patientService = {
  /**
   * Fetch all patients
   * Endpoint: GET /patients
   */
  async getAllPatients() {
    const response = await apiClient.get('/patients');
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Fetch patient by ID
   * Endpoint: GET /patients/{id}
   */
  async getPatientById(id) {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data;
  },

  /**
   * Add new patient
   * Endpoint: POST /patients
   */
  async createPatient(patientData) {
    const payload = {
      firstName: patientData.firstName?.trim() || '',
      lastName: patientData.lastName?.trim() || '',
      age: patientData.age ? Number(patientData.age) : null,
      gender: patientData.gender || 'Other',
      bloodGroup: patientData.bloodGroup || 'Unknown',
      phone: patientData.phone?.trim() || '',
      email: patientData.email?.trim() || '',
      address: patientData.address?.trim() || '',
      disease: patientData.disease?.trim() || '',
    };
    const response = await apiClient.post('/patients', payload);
    return response.data;
  },

  /**
   * Update existing patient
   * Endpoint: PUT /patients/{id}
   */
  async updatePatient(id, patientData) {
    const payload = {
      id: Number(id),
      firstName: patientData.firstName?.trim() || '',
      lastName: patientData.lastName?.trim() || '',
      age: patientData.age ? Number(patientData.age) : null,
      gender: patientData.gender || 'Other',
      bloodGroup: patientData.bloodGroup || 'Unknown',
      phone: patientData.phone?.trim() || '',
      email: patientData.email?.trim() || '',
      address: patientData.address?.trim() || '',
      disease: patientData.disease?.trim() || '',
    };
    const response = await apiClient.put(`/patients/${id}`, payload);
    return response.data;
  },

  /**
   * Delete patient
   * Endpoint: DELETE /patients/{id}
   */
  async deletePatient(id) {
    const response = await apiClient.delete(`/patients/${id}`);
    return response.data;
  },
};

export default patientService;
