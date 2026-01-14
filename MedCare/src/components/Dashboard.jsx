import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import * as api from '../services/api.js';

function Dashboard({ user, navigateTo }) {
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
        const appts = await api.getAppointments();
        if (appts && Array.isArray(appts.appointments)) {
          setAppointments(appts.appointments);
        } else if (Array.isArray(appts)) {
          setAppointments(appts);
        }

        const meds = await api.getMedications();
        if (meds && Array.isArray(meds.medications)) {
          setMedications(meds.medications);
        } else if (Array.isArray(meds)) {
          setMedications(meds);
        }

        const vitals = await api.getVitals('weight');
        const vList = vitals && (vitals.vitals || vitals);
        if (Array.isArray(vList)) {
          const weights = vList.map(v => v.value);
          if (weights.length > 0) setWeightData(weights);
        }

        const tests = await api.getMedicalTests();
        const tList = tests && (tests.tests || tests);
        if (Array.isArray(tList)) {
          setMedicalTests(tList);
        }

      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchData();
  }, [user]); // Re-fetch if user changes (e.g. login)

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
      date: dateTime
    })
      .then(() => {
        setShowAddModal(false);
        setNewAppt({ title: '', time: '', location: '', date: new Date().toISOString().split('T')[0] });
        // Refresh appointments
        api.getAppointments()
          .then(data => setAppointments(data.appointments || []))
          .catch(err => console.error('Failed to load appointments', err));
      })
      .catch(err => alert(err.message));
  };

  // Find upcoming test
  const upcomingTest = medicalTests.find(t => t.status === 'scheduled') || medicalTests[0];

  return (
    <div className="dashboard-container">
      {/* Top Row */}
      <div className="dashboard-row">

        {/* Appointment Card */}
        <div
          className="metric-card appointment-card"
          onClick={() => navigateTo('calendar')}
          style={{ cursor: 'pointer' }}
          title="Go to Calendar"
        >
          <div className="card-header-clean">
            <h3>Upcoming Appointment</h3>
            <button
              className="dashboard-add-btn"
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
          style={{ cursor: 'pointer' }}
          title="Manage Prescriptions"
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
              <svg viewBox="0 0 24 24" fill="#ff6b6b" width="60" height="60">
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

          <div className="test-item" onClick={() => navigateTo('tests')} style={{ cursor: 'pointer' }}>
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
            {/* Simple SVG Line Chart */}
            <svg viewBox="0 0 300 150" className="simple-line-chart">
              <path
                d="M0,100 L25,90 L50,110 L75,80 L100,85 L125,70 L150,90 L175,75 L200,85 L225,60 L250,90 L275,30 L300,100"
                fill="none"
                stroke="#9b59b6"
                strokeWidth="2"
              />
              <circle cx="275" cy="30" r="4" fill="white" stroke="#9b59b6" strokeWidth="2" />
              {/* Second Line */}
              <path
                d="M0,120 L25,115 L50,125 L75,100 L100,110 L125,95 L150,100 L175,90 L200,110 L225,115 L250,100 L275,120 L300,110"
                fill="none"
                stroke="#1abc9c"
                strokeWidth="2"
              />
            </svg>
            <div className="chart-months">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
            </div>
          </div>
        </div>

      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Appointment</h3>
            <form onSubmit={handleAddAppointment}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newAppt.title}
                  onChange={e => setNewAppt({ ...newAppt, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newAppt.date}
                  onChange={e => setNewAppt({ ...newAppt, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={newAppt.time}
                  onChange={e => setNewAppt({ ...newAppt, time: e.target.value })}
                  required
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
