import { useEffect, useState } from 'react';
import { ACTIONS } from '../reducers/appReducer.js';
import * as api from '../services/api.js';
import { formatDate, getTrustScoreColor, validateEmail } from '../utils/helpers.js';
import './ProfileEdit.css';

function ProfileEdit({ state, dispatch, navigateTo }) {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  function loadProfile() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.getUserProfile()
      .then(data => {
        setProfile(data);
        setFormData({
          displayName: data.displayName || '',
          email: data.email || '',
          phone: data.phone || ''
        });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to load profile' });
      });
  }

  function validateForm() {
    const newErrors = {};

    if (formData.email) {
      const emailErrors = validateEmail(formData.email);
      if (emailErrors.length > 0) {
        newErrors.email = emailErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.updateUserProfile(formData)
      .then(data => {
        setProfile(prev => ({ ...prev, ...data }));
        setIsEditing(false);
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Profile updated!' });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to update profile' });
      });
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  const trustClass = getTrustScoreColor(profile.trustScore);

  return (
    <div className="profile-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigateTo('dashboard')}>
          ← Back to Dashboard
        </button>
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="profile-content">
        <section className="trust-section">
          <div className="trust-card">
            <div className={'trust-circle ' + trustClass}>
              <span className="trust-number">{profile.trustScore}</span>
            </div>
            <span className={'trust-label ' + trustClass}>{profile.badge?.badge}</span>
          </div>

          <div className="trust-stats">
            {profile.familyMembers && profile.familyMembers.length > 0 ? (
              profile.familyMembers.map((member, index) => (
                <div key={index} className="stat">
                  <span className="stat-value">{member.relation}</span>
                  <span className="stat-label">{member.name}</span>
                </div>
              ))
            ) : (
              <div className="stat">
                <span className="stat-value">0</span>
                <span className="stat-label">Family Members</span>
              </div>
            )}

            {isEditing && (
              <div className="add-family-member-container" style={{ gridColumn: '1 / -1', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.875rem', color: '#666' }}>Add Family Member</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Name"
                    id="new-member-name"
                    className="form-input"
                    style={{ padding: '8px', fontSize: '0.875rem' }}
                  />
                  <select
                    id="new-member-relation"
                    className="form-input"
                    style={{ padding: '8px', fontSize: '0.875rem', backgroundColor: 'white' }}
                    defaultValue=""
                  >
                    <option value="" disabled>Relation</option>
                    <option value="Parent">Parent</option>
                    <option value="Kid">Kid</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Partner">Partner</option>
                  </select>
                  <button
                    type="button"
                    className="edit-button"
                    style={{ padding: '8px 15px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                    onClick={() => {
                      const nameEl = document.getElementById('new-member-name');
                      const relEl = document.getElementById('new-member-relation');
                      const name = nameEl.value.trim();
                      const relation = relEl.value.trim();

                      if (!name || !relation) {
                        return dispatch({ type: ACTIONS.SET_ERROR, payload: 'Please enter name and relation' });
                      }

                      const newMember = { name, relation, age: 0 };
                      const updatedMembers = [...(profile.familyMembers || []), newMember];

                      console.log('Frontend: Sending update', updatedMembers);
                      api.updateUserProfile({ familyMembers: updatedMembers }).then(data => {
                        console.log('Frontend: Update success', data);
                        setProfile(prev => ({ ...prev, ...data }));
                        nameEl.value = '';
                        relEl.value = '';
                      }).catch(err => {
                        console.error('Frontend: Update failed', err);
                        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to add member: ' + (err.message || 'Unknown error') });
                      });
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="member-since">Member since {formatDate(profile.memberSince)}</p>
        </section>

        <section className="details-section">
          {isEditing ? (
            <form className="profile-form" onSubmit={handleSubmit}>
              <h2 className="section-title">Edit Profile</h2>

              <div className="form-group">
                <label htmlFor="profile-username" className="form-label">Username</label>
                <input
                  type="text"
                  id="profile-username"
                  className="form-input"
                  value={profile.username}
                  disabled
                />
                <p className="field-hint">Username cannot be changed</p>
              </div>

              <div className="form-group">
                <label htmlFor="profile-displayName" className="form-label">Display Name</label>
                <input
                  type="text"
                  id="profile-displayName"
                  name="displayName"
                  className="form-input"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Your display name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email" className="form-label">Email</label>
                <input
                  type="email"
                  id="profile-email"
                  name="email"
                  className={'form-input' + (errors.email ? ' error' : '')}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <ul className="field-errors">
                    {errors.email.map((error, i) => (
                      <li key={i} className="field-error">{error}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="profile-phone" className="form-label">Phone</label>
                <input
                  type="tel"
                  id="profile-phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      displayName: profile.displayName || '',
                      email: profile.email || '',
                      phone: profile.phone || ''
                    });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <h2 className="section-title">Profile Details</h2>

              <dl className="details-list">
                <div className="detail-item">
                  <dt>Username</dt>
                  <dd>@{profile.username}</dd>
                </div>
                <div className="detail-item">
                  <dt>Display Name</dt>
                  <dd>{profile.displayName || 'Not set'}</dd>
                </div>
                <div className="detail-item">
                  <dt>Email</dt>
                  <dd>{profile.email || 'Not set'}</dd>
                </div>
                <div className="detail-item">
                  <dt>Phone</dt>
                  <dd>{profile.phone || 'Not set'}</dd>
                </div>
              </dl>

              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ProfileEdit;

