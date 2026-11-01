import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  UserPlus,
  PlusCircle,
  Activity,
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

// Register ChartJS modules
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        patientService.getAllPatients().catch((err) => {
          console.warn('Patients fetch failed:', err);
          return [];
        }),
        doctorService.getAllDoctors().catch((err) => {
          console.warn('Doctors fetch failed:', err);
          return [];
        }),
        appointmentService.getAllAppointments().catch((err) => {
          console.warn('Appointments fetch failed:', err);
          return [];
        }),
      ]);

      setPatients(patientsRes);
      setDoctors(doctorsRes);
      setAppointments(appointmentsRes);
    } catch (err) {
      setError('Unable to load full hospital dashboard data. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats
  const totalPatients = patients.length;
  const totalDoctors = doctors.length;
  const totalAppointments = appointments.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(
    (a) => a.appointmentDate === todayStr
  ).length;

  const scheduledCount = appointments.filter((a) => {
    const s = a.status?.toLowerCase();
    return s === 'scheduled' || s === 'pending';
  }).length;

  const completedCount = appointments.filter(
    (a) => a.status?.toLowerCase() === 'completed'
  ).length;

  const cancelledCount = appointments.filter(
    (a) => a.status?.toLowerCase() === 'cancelled'
  ).length;

  // Recent patients (last 5)
  const recentPatients = [...patients].slice(-5).reverse();

  // Upcoming appointments (sort by date if possible, take top 5)
  const upcomingAppointments = [...appointments]
    .filter((a) => a.status?.toLowerCase() !== 'completed' && a.status?.toLowerCase() !== 'cancelled')
    .slice(0, 5);

  // Doughnut chart data (Status distribution)
  const doughnutData = {
    labels: ['Scheduled / Pending', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [scheduledCount || 0, completedCount || 0, cancelledCount || 0],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Monthly appointments bar chart
  const monthlyData = {};
  appointments.forEach((a) => {
    if (a.appointmentDate && a.appointmentDate.length >= 7) {
      const month = a.appointmentDate.substring(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  const currentMonthKey = todayStr.substring(0, 7);
  if (!sortedMonths.includes(currentMonthKey)) {
    sortedMonths.push(currentMonthKey);
    monthlyData[currentMonthKey] = monthlyData[currentMonthKey] || 0;
  }

  const barChartData = {
    labels: sortedMonths.length > 0 ? sortedMonths : ['Current Month'],
    datasets: [
      {
        label: 'Appointments',
        data: sortedMonths.length > 0 ? sortedMonths.map((m) => monthlyData[m] || 0) : [0],
        backgroundColor: '#0284c7',
        borderRadius: 6,
      },
    ],
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating clinical intelligence..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Activity color="var(--primary)" /> Hospital Executive Dashboard
          </h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.username || 'Staff'}</strong>. Real-time patient triage, staff workload & AI diagnostics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={() => navigate('/appointments')} className="btn btn-primary">
            <PlusCircle size={16} /> New Appointment
          </button>
          <button onClick={() => navigate('/ai-diagnosis')} className="btn btn-secondary">
            <Sparkles size={16} color="var(--primary)" /> Run AI Diagnosis
          </button>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={loadData} />

      {/* KPI Stat Cards (4 Main Requirements) */}
      <div className="stat-card-grid">
        <StatCard
          title="Total Registered Patients"
          value={totalPatients}
          icon={Users}
          variant="primary"
          subtext="Active hospital medical registry"
          onClick={() => navigate('/patients')}
        />
        <StatCard
          title="Total Medical Specialists"
          value={totalDoctors}
          icon={Stethoscope}
          variant="purple"
          subtext="Staff across all hospital depts"
          onClick={() => navigate('/doctors')}
        />
        <StatCard
          title="Today's Appointments"
          value={todayAppointments}
          icon={Calendar}
          variant="secondary"
          subtext={`Scheduled for ${todayStr}`}
          onClick={() => navigate('/appointments')}
        />
        <StatCard
          title="Pending / Scheduled"
          value={scheduledCount}
          icon={Clock}
          variant="warning"
          subtext={`${completedCount} completed, ${cancelledCount} cancelled`}
          onClick={() => navigate('/appointments')}
        />
      </div>

      {/* AI Health Microservice Feature Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0369a1 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              color: '#38bdf8',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={14} /> AI Decision Support Active
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.45rem' }}>
            Machine Learning Symptom & Triage Classifier
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            Automated screening powered by TF-IDF vectorization and Logistic Regression (95.65% test accuracy). Screen patient symptoms instantly and auto-route to designated medical specialists.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/ai-diagnosis')}
            className="btn"
            style={{
              backgroundColor: '#38bdf8',
              color: '#0f172a',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
            }}
          >
            Analyze Symptoms <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={18} color="var(--primary)" /> Appointment Status Breakdown
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Total: {totalAppointments}
            </span>
          </div>

          <div style={{ maxHeight: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {totalAppointments > 0 ? (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' },
                  },
                }}
              />
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No appointment records yet.</p>
            )}
          </div>
        </div>

        {/* Monthly Appointment Trends */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={18} color="var(--secondary)" /> Monthly Patient Visit Volume
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Historical trends
            </span>
          </div>

          <div style={{ height: '250px' }}>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                  },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Tables: Recent Patients & Upcoming Appointments */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Patients */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Users size={18} color="var(--primary)" /> Recent Patients
            </h3>
            <button
              onClick={() => navigate('/patients')}
              className="btn btn-sm btn-outline"
            >
              View All ({totalPatients})
            </button>
          </div>

          {recentPatients.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Age / Gender</th>
                    <th>Condition / Disease</th>
                    <th>Blood Group</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>
                        {p.firstName} {p.lastName}
                      </td>
                      <td>
                        {p.age} yrs • {p.gender}
                      </td>
                      <td>
                        <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                          {p.disease || 'General'}
                        </span>
                      </td>
                      <td>
                        <Badge variant="purple">{p.bloodGroup || 'N/A'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
              No patients registered yet. Click 'Patients' to add the first one.
            </p>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={18} color="var(--secondary)" /> Upcoming Appointments
            </h3>
            <button
              onClick={() => navigate('/appointments')}
              className="btn btn-sm btn-outline"
            >
              View All ({totalAppointments})
            </button>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>
                        {a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'N/A'}
                      </td>
                      <td>
                        {a.doctor ? a.doctor.doctorName : 'N/A'}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {a.appointmentDate} • {a.appointmentTime}
                      </td>
                      <td>
                        <Badge status={a.status}>{a.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
              No upcoming appointments. Click 'New Appointment' to schedule.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
