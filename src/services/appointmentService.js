import { apiClient } from './api';

export const appointmentService = {
  /**
   * Fetch all appointments
   * Endpoint: GET /appointments
   */
  async getAllAppointments() {
    const response = await apiClient.get('/appointments');
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Fetch appointment by ID
   * Endpoint: GET /appointments/{id}
   */
  async getAppointmentById(id) {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Create new appointment
   * Endpoint: POST /appointments
   */
  async createAppointment(data) {
    const payload = {
      patient: { id: Number(data.patientId) },
      doctor: { id: Number(data.doctorId) },
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      status: data.status || 'Scheduled',
    };
    const response = await apiClient.post('/appointments', payload);
    return response.data;
  },

  /**
   * Update existing appointment
   * Endpoint: PUT /appointments/{id}
   */
  async updateAppointment(id, data) {
    const payload = {
      id: Number(id),
      patient: { id: Number(data.patientId) },
      doctor: { id: Number(data.doctorId) },
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      status: data.status,
    };
    const response = await apiClient.put(`/appointments/${id}`, payload);
    return response.data;
  },

  /**
   * Quick update appointment status (e.g. Scheduled -> Completed)
   */
  async updateStatus(appointment, newStatus) {
    const payload = {
      id: appointment.id,
      patient: { id: appointment.patient?.id },
      doctor: { id: appointment.doctor?.id },
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      status: newStatus,
    };
    const response = await apiClient.put(`/appointments/${appointment.id}`, payload);
    return response.data;
  },

  /**
   * Delete appointment
   * Endpoint: DELETE /appointments/{id}
   */
  async deleteAppointment(id) {
    const response = await apiClient.delete(`/appointments/${id}`);
    return response.data;
  },
};

export default appointmentService;
