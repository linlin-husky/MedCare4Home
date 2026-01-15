import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import * as api from '../services/api.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="dashboard-error">
          <h3>Something went wrong in the Dashboard.</h3>
          <p>Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}


function Dashboard(props) {
  return (
    <ErrorBoundary>
      <DashboardContent {...props} />
    </ErrorBoundary>
  );
}

function DashboardContent({ user, navigateTo, selectedUsername }) { // Receive selectedUsername prop
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [medicalTests, setMedicalTests] = useState([]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculate current week's days (Mon-Sun)
  const getWeekDays = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sun, 1 is Mon
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  };

  const weekDays = getWeekDays();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const appts = await api.getAppointments(selectedUsername);
        if (appts && Array.isArray(appts.appointments)) {
          setAppointments(appts.appointments);
        } else if (Array.isArray(appts)) {
          setAppointments(appts);
        }

        const meds = await api.getMedications(selectedUsername);
        if (meds && Array.isArray(meds.medications)) {
          setMedications(meds.medications);
        } else if (Array.isArray(meds)) {
          setMedications(meds);
        }

        const vitals = await api.getVitals('weight', selectedUsername);
        const vList = vitals && (vitals.vitals || vitals);
        if (Array.isArray(vList)) {
          const weights = vList.map(v => v.value);
          if (weights.length > 0) setWeightData(weights);
          else setWeightData([]);
        } else {
          setWeightData([]);
        }

        const tests = await api.getMedicalTests(selectedUsername);
        const tList = tests && (tests.tests || tests);
        if (Array.isArray(tList)) {
          setMedicalTests(tList);
        } else {
          setMedicalTests([]);
        }

      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchData();
  }, [user, selectedUsername]); // Re-fetch if user or selectedUsername changes

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppt, setNewAppt] = useState({
    title: '',
    time: '',
    location: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddAppointment = (e) => {
    e.preventDefault();
    const dateTime = new Date(`${newAppt.date}T${newAppt.time || '12:00'}`);

    api.createAppointment({
      title: newAppt.title,
      location: newAppt.location,
      date: dateTime,
      username: selectedUsername
    })
      .then(() => {
        setShowAddModal(false);
        setNewAppt({ title: '', time: '', location: '', date: new Date().toISOString().split('T')[0] });
        // Refresh appointments
        api.getAppointments(selectedUsername)
          .then(data => setAppointments(data.appointments || []))
          .catch(err => console.error('Failed to load appointments', err));
      })
      .catch(err => alert(err.message));
  };

  // Find upcoming test
  const upcomingTest = medicalTests.find(t => t.status === 'scheduled') || medicalTests[0];




  useEffect(() => {
    const fetchFamilyWeights = async () => {
      if (!user) return;

      const members = [{ username: user.username, displayName: 'Me', color: '#9b59b6' }];
      if (user.familyMembers) {
        const colors = ['#1abc9c', '#e67e22', '#3498db', '#e74c3c'];
        user.familyMembers.forEach((m, idx) => {
          if (m.username) {
            members.push({
              username: m.username,
              displayName: m.name,
              color: colors[idx % colors.length]
            });
          }
        });
      }

      const weightMap = {};

      // Fetch for all members
      await Promise.all(members.map(async (member) => {
        try {
          const vitals = await api.getVitals('weight', member.username);
          const vList = vitals && (vitals.vitals || vitals);
          if (Array.isArray(vList)) {
            // Sort by date
            const sorted = vList.sort((a, b) => new Date(a.date) - new Date(b.date));
            // Keep last 6 months or sufficient data points
            weightMap[member.username] = {
              data: sorted,
              color: member.color,
              name: member.displayName
            };
          }
        } catch (e) {
          console.error(`Failed to fetch weight for ${member.username}`, e);
        }
      }));

      setFamilyWeightData(weightMap);
    };

    fetchFamilyWeights();
  }, [user]); // Re-run if user changes (e.g. login)

  // Chart Rendering Helpers
  const renderChartLines = () => {
    try {
      // 1. Determine Global Min/Max for Scales
      let allPoints = [];
      Object.values(familyWeightData).forEach(entry => {
        if (entry.data) allPoints = [...allPoints, ...entry.data];
      });

      if (allPoints.length === 0) return null;

      const values = allPoints.map(p => p.value);
      const dates = allPoints.map(p => new Date(p.date).getTime());

      const minVal = Math.min(...values) * 0.9;
      const maxVal = Math.max(...values) * 1.1;
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);

      // Check for division by zero if only 1 data point
      const valRange = maxVal - minVal || 10;
      const dateRange = maxDate - minDate || 1;

      const width = 300;
      const height = 150;
      const padding = 10;

      return Object.entries(familyWeightData).map(([username, entry]) => {
        if (!entry.data || entry.data.length === 0) return null;

        const points = entry.data.map(d => {
          const x = ((new Date(d.date).getTime() - minDate) / dateRange) * (width - 2 * padding) + padding;
          const y = height - (((d.value - minVal) / valRange) * (height - 2 * padding) + padding); // Invert Y
          return `${x},${y}`;
        }).join(' ');

        // Last point for dot
        const last = entry.data[entry.data.length - 1];
        const lastX = ((new Date(last.date).getTime() - minDate) / dateRange) * (width - 2 * padding) + padding;
        const lastY = height - (((last.value - minVal) / valRange) * (height - 2 * padding) + padding);

        return (
          <g key={username}>
            <path
              d={`M${points}`}
              fill="none"
              stroke={entry.color}
              strokeWidth="2"
            />
            <circle cx={lastX} cy={lastY} r="3" fill="white" stroke={entry.color} strokeWidth="2" />
          </g>
        );
      });
    } catch (err) {
      console.error("Error rendering chart:", err);
      return null;
    }
  };

  const chartLegend = () => {
    return (
      <div className="chart-legend" style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {Object.values(familyWeightData).map(entry => (
          <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }}></div>
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div className="dashboard-header-row">
          {/* Profile selector moved to App Header */}
        </div>
      </div>

      {/* Top Row */}
      <div className="dashboard-row">

        {/* Appointment Card */}
        <div
          className="metric-card appointment-card"
          onClick={() => navigateTo('calendar')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo('calendar')}
          role="button"
          tabIndex="0"
          style={{ cursor: 'pointer' }}
          title="Go to Calendar"
          aria-label="Go to Calendar"
        >
          <div className="card-header-clean">
            <h3>Upcoming Appointment</h3>
            <button
              className="dashboard-add-btn"
              aria-label="Add Appointment"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddModal(true);
              }}
            >+</button>
          </div>

          <div className="appointment-main">
            <div className="time-display">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {appointments.filter(appt => {
              const apptDate = new Date(appt.date);
              return apptDate.getDate() === selectedDate.getDate() &&
                apptDate.getMonth() === selectedDate.getMonth() &&
                apptDate.getFullYear() === selectedDate.getFullYear();
            }).length > 0 ? (
              appointments.filter(appt => {
                const apptDate = new Date(appt.date);
                return apptDate.getDate() === selectedDate.getDate() &&
                  apptDate.getMonth() === selectedDate.getMonth() &&
                  apptDate.getFullYear() === selectedDate.getFullYear();
              }).map((appt, i) => (
                <div key={i}>
                  <div className="appt-title">{appt.title}</div>
                  <div className="appt-loc">@ {appt.location}</div>
                </div>
              ))
            ) : (
              <div className="appt-title">No appointments</div>
            )}
          </div>

          <div className="calendar-strip">
            {weekDays.map((date, index) => {
              const isSelected = date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth();
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              return (
                <div
                  key={index}
                  className={`day-box ${isSelected ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(date);
                  }}
                >
                  <span className="day-name">{dayNames[date.getDay()]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Medication Reminder */}
        <div
          className="metric-card medication-card"
          onClick={() => navigateTo('manage-prescriptions')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo('manage-prescriptions')}
          role="button"
          tabIndex="0"
          style={{ cursor: 'pointer' }}
          title="Manage Prescriptions"
          aria-label="Manage Prescriptions"
        >
          <div className="card-header-clean">
            <div className="blue-accent-bar"></div>
            <h3>Medication Reminder</h3>
          </div>

          <div className="medication-list">
            {medications.map((med, idx) => (
              <div key={idx} className="medication-item">
                <div className={`med-icon icon-${med.icon || 'pill'}`}></div>
                <div className="med-info">
                  <div className="med-name">{med.name}</div>
                  <div className="med-dose">{med.dosage || med.dose}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-row">

        {/* Profile Card */}
        <div className="metric-card profile-card">
          <div className="profile-image-container">
            <div className="profile-avatar">
              {/* Placeholder Avatar */}
              <svg viewBox="0 0 24 24" fill="#ff6b6b" width="60" height="60" role="img" aria-label="Profile Avatar">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>

          <h2 className="profile-name">{user ? user.displayName : 'Guest'}</h2>

          <div className="profile-stats">
            <div className="p-stat">
              <div className="p-val">{user?.weight || 110} lb</div>
              <div className="p-lbl">Weight</div>
            </div>
            <div className="p-stat">
              <div className="p-val">{user?.height || "5'4"}</div>
              <div className="p-lbl">Height</div>
            </div>
            <div className="p-stat">
              <div className="p-val">{user?.bmi || 20}</div>
              <div className="p-lbl">BMI</div>
            </div>
          </div>

          <div
            className="test-item"
            onClick={() => navigateTo('tests')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo('tests')}
            role="button"
            tabIndex="0"
            style={{ cursor: 'pointer' }}
            aria-label="View Medical Tests"
          >
            <div className="test-status-dot"></div>
            <div className="test-info">
              <div className="test-name">
                {upcomingTest ? upcomingTest.testName : 'No upcoming tests'}
              </div>
              <div className="test-desc">
                {upcomingTest ? (upcomingTest.notes || upcomingTest.category) : 'Check back later'}
              </div>
            </div>
            <div className="test-cycle">
              {upcomingTest && upcomingTest.testDate
                ? new Date(upcomingTest.testDate).toLocaleDateString()
                : ''}
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="metric-card chart-card">
          <div className="card-header-clean">
            <div className="blue-accent-bar"></div>
            <h3>Family Weight</h3>
          </div>

          <div className="chart-area">
            {/* Dynamic SVG Line Chart */}
            <svg viewBox="0 0 300 150" className="simple-line-chart">
              {renderChartLines()}
            </svg>
            {chartLegend()}
          </div>
        </div>

      </div>

      {/* Motivational Quote */}


      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Appointment</h3>
            <form onSubmit={handleAddAppointment}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newAppt.title}
                  onChange={e => setNewAppt({ ...newAppt, title: e.target.value })}
                  required
                  aria-required="true"
                />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={newAppt.date}
                  onChange={e => setNewAppt({ ...newAppt, date: e.target.value })}
                  required
                  aria-required="true"
                />
              </div>
              <div className="form-group">
                <label>Time *</label>
                <input
                  type="time"
                  value={newAppt.time}
                  onChange={e => setNewAppt({ ...newAppt, time: e.target.value })}
                  required
                  aria-required="true"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newAppt.location}
                  onChange={e => setNewAppt({ ...newAppt, location: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



export default Dashboard;
