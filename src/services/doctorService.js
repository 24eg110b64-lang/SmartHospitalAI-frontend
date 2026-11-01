import { apiClient } from './api';

export const doctorService = {
  /**
   * Fetch all doctors
   * Endpoint: GET /doctors
   */
  async getAllDoctors() {
    const response = await apiClient.get('/doctors');
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Fetch doctor by ID
   * Endpoint: GET /doctors/{id}
   */
  async getDoctorById(id) {
    const response = await apiClient.get(`/doctors/${id}`);
    return response.data;
  },

  /**
   * Add new doctor
   * Endpoint: POST /doctors
   */
  async createDoctor(doctorData) {
    const payload = {
      doctorName: doctorData.doctorName?.trim() || '',
      specialization: doctorData.specialization?.trim() || '',
      experience: Number(doctorData.experience) || 0,
      qualification: doctorData.qualification?.trim() || '',
      phone: doctorData.phone?.trim() || '',
      email: doctorData.email?.trim() || '',
      availability: doctorData.availability?.trim() || 'Available',
      consultationFee: Number(doctorData.consultationFee) || 0.0,
    };
    const response = await apiClient.post('/doctors', payload);
    return response.data;
  },

  /**
   * Update existing doctor
   * Endpoint: PUT /doctors/{id}
   */
  async updateDoctor(id, doctorData) {
    const payload = {
      id: Number(id),
      doctorName: doctorData.doctorName?.trim() || '',
      specialization: doctorData.specialization?.trim() || '',
      experience: Number(doctorData.experience) || 0,
      qualification: doctorData.qualification?.trim() || '',
      phone: doctorData.phone?.trim() || '',
      email: doctorData.email?.trim() || '',
      availability: doctorData.availability?.trim() || 'Available',
      consultationFee: Number(doctorData.consultationFee) || 0.0,
    };
    const response = await apiClient.put(`/doctors/${id}`, payload);
    return response.data;
  },

  /**
   * Delete doctor
   * Endpoint: DELETE /doctors/{id}
   */
  async deleteDoctor(id) {
    const response = await apiClient.delete(`/doctors/${id}`);
    return response.data;
  },
};

export default doctorService;
