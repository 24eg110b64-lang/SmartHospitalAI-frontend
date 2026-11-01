import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Users,
  Stethoscope,
  TrendingUp,
  PieChart,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
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

import { doctorService } from '../services/doctorService';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import StatCard from '../components/common/StatCard';

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

export const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [d, p, a] = await Promise.all([
        doctorService.getAllDoctors(),
        patientService.getAllPatients(),
        appointmentService.getAllAppointments(),
      ]);
      setDoctors(d);
      setPatients(p);
      setAppointments(a);
    } catch (err) {
      setError(err.message || 'Unable to generate statistical hospital reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Compute Metrics
  const scheduledCount = appointments.filter(
    (a) => a.status?.toLowerCase() === 'scheduled' || a.status?.toLowerCase() === 'pending'
  ).length;

  const completedCount = appointments.filter(
    (a) => a.status?.toLowerCase() === 'completed'
  ).length;

  const cancelledCount = appointments.filter(
    (a) => a.status?.toLowerCase() === 'cancelled'
  ).length;

  // Appointment Status Chart
  const statusChartData = {
    labels: ['Scheduled', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [scheduledCount, completedCount, cancelledCount],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Monthly Appointments Bar Chart
  const monthlyCounts = {};
  appointments.forEach((a) => {
    if (a.appointmentDate && a.appointmentDate.length >= 7) {
      const month = a.appointmentDate.substring(0, 7);
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    }
  });

  const months = Object.keys(monthlyCounts).sort();
  const monthlyData = {
    labels: months.length > 0 ? months : ['No Data'],
    datasets: [
      {
        label: 'Visits Count',
        data: months.length > 0 ? months.map((m) => monthlyCounts[m]) : [0],
        backgroundColor: '#0284c7',
        borderRadius: 6,
      },
    ],
  };

  // Doctors by Specialization
  const specializationCounts = {};
  doctors.forEach((d) => {
    const spec = d.specialization || 'General Physician';
    specializationCounts[spec] = (specializationCounts[spec] || 0) + 1;
  });
  const specLabels = Object.keys(specializationCounts);
  const specData = {
    labels: specLabels.length > 0 ? specLabels : ['General'],
    datasets: [
      {
        label: 'Doctors',
        data: specLabels.length > 0 ? specLabels.map((s) => specializationCounts[s]) : [0],
        backgroundColor: '#7c3aed',
        borderRadius: 6,
      },
    ],
  };

  // Patient Disease Distribution
  const diseaseCounts = {};
  patients.forEach((p) => {
    const d = p.disease || 'Uncategorized';
    diseaseCounts[d] = (diseaseCounts[d] || 0) + 1;
  });
  const diseaseLabels = Object.keys(diseaseCounts).slice(0, 6);
  const diseaseChartData = {
    labels: diseaseLabels.length > 0 ? diseaseLabels : ['None'],
    datasets: [
      {
        data: diseaseLabels.length > 0 ? diseaseLabels.map((d) => diseaseCounts[d]) : [0],
        backgroundColor: ['#0284c7', '#0d9488', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Doctors,${doctors.length}\n` +
      `Total Patients,${patients.length}\n` +
      `Total Appointments,${appointments.length}\n` +
      `Scheduled Visits,${scheduledCount}\n` +
      `Completed Visits,${completedCount}\n` +
      `Cancelled Visits,${cancelledCount}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_hospital_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingSpinner message="Calculating clinical metrics & report graphs..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart3 color="var(--primary)" /> Hospital Reports & Analytics
          </h1>
          <p className="page-subtitle">
            Clinical throughput, doctor specialization distribution, visit volume and operational efficiency.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={loadAll} />

      {/* KPI Stats Grid */}
      <div className="stat-card-grid">
        <StatCard
          title="Total Doctors"
          value={doctors.length}
          icon={Stethoscope}
          variant="purple"
          subtext="Active staff physicians"
        />
        <StatCard
          title="Total Patients"
          value={patients.length}
          icon={Users}
          variant="primary"
          subtext="Enrolled medical records"
        />
        <StatCard
          title="Total Appointments"
          value={appointments.length}
          icon={Calendar}
          variant="secondary"
          subtext="Lifetime scheduled consultations"
        />
        <StatCard
          title="Completed Consultations"
          value={completedCount}
          icon={CheckCircle2}
          variant="success"
          subtext={`${((completedCount / (appointments.length || 1)) * 100).toFixed(1)}% fulfillment rate`}
        />
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Appointment Status Doughnut */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <PieChart size={18} color="var(--primary)" /> Consultation Status Breakdown
            </h3>
          </div>
          <div style={{ height: '260px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* Monthly Trend Bar */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={18} color="var(--secondary)" /> Monthly Visit Volume
            </h3>
          </div>
          <div style={{ height: '260px' }}>
            <Bar
              data={monthlyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
        </div>

        {/* Doctor Specialization Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Stethoscope size={18} color="var(--accent-purple)" /> Staff by Medical Specialty
            </h3>
          </div>
          <div style={{ height: '260px' }}>
            <Bar
              data={specData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Patient Disease Top Categories */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Users size={18} color="var(--warning)" /> Top Presenting Conditions
            </h3>
          </div>
          <div style={{ height: '260px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut
              data={diseaseChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
