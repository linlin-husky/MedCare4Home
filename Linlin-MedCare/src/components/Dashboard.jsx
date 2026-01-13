import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ user }) {
  // Mock data for initial view (will eventually fetch from API)
  const [appointments] = useState([
    {
      id: 1,
      title: 'Check up for Yen',
      time: '2:00 PM',
      details: '@ Boston Medical Center',
      date: 'Mon'
    }
  ]);

  const [medications] = useState([
    { name: 'Acetaminophen', dose: '1 pill', icon: 'sun' },
    { name: 'Atorvastatin', dose: '1 pill', icon: 'cloud' },
    { name: 'Januvia', dose: '2 pills', icon: 'moon' }
  ]);

  const [weightData] = useState([150, 145, 140, 138, 142, 137, 135, 140, 145, 150, 140, 80]); // Mock chart data points

  return (
    <div className="dashboard-container">
      {/* Top Row */}
      <div className="dashboard-row">

        {/* Appointment Card */}
        <div className="metric-card appointment-card">
          <div className="card-header-clean">
            <h3>Upcoming Appointment</h3>
            <button className="add-btn">+</button>
          </div>

          <div className="appointment-main">
            <div className="time-display">2:00 PM</div>
            <div className="appt-title">{appointments[0].title}</div>
            <div className="appt-loc">{appointments[0].details}</div>
          </div>

          <div className="calendar-strip">
            <div className="day-box active">
              <span className="day-name">Mon</span>
            </div>
            <div className="day-box"><span className="day-name">Tue</span></div>
            <div className="day-box"><span className="day-name">Wed</span></div>
            <div className="day-box"><span className="day-name">Thu</span></div>
            <div className="day-box"><span className="day-name">Fri</span></div>
            <div className="day-box"><span className="day-name">Sat</span></div>
            <div className="day-box"><span className="day-name">Sun</span></div>
          </div>
        </div>

        {/* Medication Reminder */}
        <div className="metric-card medication-card">
          <div className="card-header-clean">
            <div className="blue-accent-bar"></div>
            <h3>Medication Reminder</h3>
          </div>

          <div className="medication-list">
            {medications.map((med, idx) => (
              <div key={idx} className="medication-item">
                <div className={`med-icon icon-${med.icon}`}></div>
                <div className="med-info">
                  <div className="med-name">{med.name}</div>
                  <div className="med-dose">{med.dose}</div>
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

          <div className="test-item">
            <div className="test-status-dot"></div>
            <div className="test-info">
              <div className="test-name">Cholesterol Testing</div>
              <div className="test-desc">Lorem ipsum is dolorem...</div>
            </div>
            <div className="test-cycle">Monthly</div>
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
    </div>
  );
}

export default Dashboard;
