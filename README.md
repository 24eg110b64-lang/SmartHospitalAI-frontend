# 🏥 SmartHospitalAI - Modern React Frontend

A modern, responsive Healthcare Management and Clinical Intelligence dashboard built with **React**, **Vite**, **React Router v7**, **Chart.js**, and **Lucide Icons**.

This frontend is designed to interface with:
1. **Spring Boot Backend** (`SmartHospitalAI/backend`) running on `http://localhost:8081` (or `8080`).
2. **Python Flask AI Machine Learning Service** (`SmartHospitalAI/ai-service`) running on `http://localhost:5000`.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+ (tested on npm v11)

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `frontend` root (a `.env.example` is provided):
```env
# Spring Boot Backend API Base URL
VITE_API_URL=http://localhost:8081

# Python Flask AI ML Service Base URL
VITE_AI_API_URL=http://localhost:5000
```

### 4. Run Development Server
```bash
npm run dev
```
The application will launch at **`http://localhost:3000`** (or the next available port).

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 📋 Feature Modules & Pages

| Route | Page | Description |
|---|---|---|
| `/login` | **Login Portal** | Secure hospital authentication with demo credentials quick-fill |
| `/dashboard` | **Dashboard** | Total patients, doctors, today's appointments, pending counts, recent patients, upcoming appointments & Chart.js visualizations |
| `/patients` | **Patient Management** | Full CRUD: Search, filter by gender/blood group, add, edit, delete, view electronic health summary |
| `/doctors` | **Doctor Directory** | Search by name/specialty, experience, consultation fee, availability, register and edit specialists |
| `/appointments` | **Appointments** | Patient-doctor visit scheduling, status workflow (Scheduled, Completed, Cancelled), date filtering |
| `/medical-records` | **Medical Records** | Longitudinal patient charts, vital signs (BP, Pulse, Temp, SpO2), allergies, prescriptions, notes, and print view |
| `/ai-diagnosis` | **AI Clinical Support** | Connects to Flask `/predict`: symptom chip selection, ML disease classification, confidence score gauge, specialist triage advice, and medical disclaimer |
| `/reports` | **Reports & Analytics** | Throughput metrics, visit status doughnut chart, monthly volume bar chart, doctor specialty breakdown, CSV export, and print view |
| `/settings` | **Profile & Settings** | User session profile, microservice connectivity latency tests (Spring Boot + Flask), facility metadata |

---

## 🔌 Backend API Endpoints Expected

The frontend connects to the following endpoints in the Spring Boot backend:

### Authentication (`/auth`)
- `POST /auth/login` - Accepts `{ username, password }`, returns `User` object or error message.

### Patients (`/patients`)
- `GET /patients` - Returns `List<Patient>`
- `POST /patients` - Creates and returns `Patient`
- `GET /patients/{id}` - Returns `Patient` by ID
- `PUT /patients/{id}` - Updates and returns `Patient`
- `DELETE /patients/{id}` - Deletes patient by ID

### Doctors (`/doctors`)
- `GET /doctors` - Returns `List<Doctor>`
- `POST /doctors` - Creates and returns `Doctor`
- `GET /doctors/{id}` - Returns `Doctor` by ID
- `PUT /doctors/{id}` - Updates and returns `Doctor`
- `DELETE /doctors/{id}` - Deletes doctor by ID

### Appointments (`/appointments`)
- `GET /appointments` - Returns `List<Appointment>`
- `POST /appointments` - Creates appointment `{ patient: { id }, doctor: { id }, appointmentDate, appointmentTime, status }`
- `GET /appointments/{id}` - Returns `Appointment` by ID
- `PUT /appointments/{id}` - Updates `Appointment`
- `DELETE /appointments/{id}` - Deletes `Appointment` by ID

### AI Service (`http://localhost:5000`)
- `GET /` - Health check status
- `POST /predict` - Accepts `{ symptoms: "..." }`, returns `{ symptoms, prediction, confidence, specialist }`

### Medical Records (Optional Extension)
- `GET /medical-records` / `POST /medical-records` - The frontend provides seamless EHR charts synthesized from patient clinical history and local record storage if not yet implemented on the backend.

---

## 📦 Project Structure

```text
frontend/
├── .env.example
├── .env
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── AuthContext.jsx
    ├── services/
    │   ├── api.js
    │   ├── authService.js
    │   ├── patientService.js
    │   ├── doctorService.js
    │   ├── appointmentService.js
    │   ├── aiService.js
    │   └── medicalRecordService.js
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx
    │   │   └── Sidebar.jsx
    │   ├── common/
    │   │   ├── Badge.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── ErrorAlert.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── Modal.jsx
    │   │   └── StatCard.jsx
    │   └── ai/
    │       ├── DiagnosisResultCard.jsx
    │       └── SymptomChipSelector.jsx
    └── pages/
        ├── AIDiagnosis.jsx
        ├── Appointments.jsx
        ├── Dashboard.jsx
        ├── Doctors.jsx
        ├── Login.jsx
        ├── MedicalRecords.jsx
        ├── Patients.jsx
        ├── Reports.jsx
        └── Settings.jsx
```
