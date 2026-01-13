import { useReducer, useEffect } from 'react';
import { ACTIONS, initialState, appReducer } from '../reducers/appReducer.js';
import * as api from './services/api.js';
import { CLIENT, SERVER, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants.js';
import Sidebar from './components/Sidebar.jsx';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import Calendar from './components/Calendar.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import SuccessMessage from './components/SuccessMessage.jsx';
import './App.css';

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    checkSession();
  }, []);

  function checkSession() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.fetchSession()
      .then(userData => {
        dispatch({ type: ACTIONS.SET_USER, payload: userData });
      })
      .catch(() => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      });
  }

  function handleLogin(username) {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    api.login(username)
      .then(userData => {
        dispatch({ type: ACTIONS.SET_USER, payload: userData });
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: SUCCESS_MESSAGES.LOGIN_SUCCESS });
      })
      .catch(err => {
        const errorMsg = ERROR_MESSAGES[err.error] || err.message || ERROR_MESSAGES.default;
        dispatch({ type: ACTIONS.SET_ERROR, payload: errorMsg });
      });
  }

  function handleRegister(formData) {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    api.register(formData.username, formData.displayName, formData.email, formData.phone)
      .then(userData => {
        dispatch({ type: ACTIONS.SET_USER, payload: userData });
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: SUCCESS_MESSAGES.SIGNUP_SUCCESS });
      })
      .catch(err => {
        const errorMsg = ERROR_MESSAGES[err.error] || err.message || ERROR_MESSAGES.default;
        dispatch({ type: ACTIONS.SET_ERROR, payload: errorMsg });
      });
  }

  function handleLogout() {
    api.logout()
      .then(() => {
        dispatch({ type: ACTIONS.LOGOUT });
      })
      .catch(() => {
        dispatch({ type: ACTIONS.LOGOUT });
      });
  }

  function navigateTo(page) {
    dispatch({ type: ACTIONS.SET_PAGE, payload: page });
  }

  function clearMessages() {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    dispatch({ type: ACTIONS.CLEAR_SUCCESS });
  }

  if (!state.isLoggedIn && state.currentPage !== 'register') {
    return <LoginForm onLogin={handleLogin} onSwitchToRegister={() => navigateTo('register')} error={state.error} />;
  }

  if (!state.isLoggedIn && state.currentPage === 'register') {
    return <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => navigateTo('login')} error={state.error} success={state.success} />;
  }

  return (
    <div className="app">
      <Sidebar currentPage={state.currentPage} navigateTo={navigateTo} />

      <main className="main-content">
        <header className="top-bar">
          <div className="user-info">
            {state.user && <span>Welcome, <b>{state.user.displayName}</b></span>}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </header>

        {state.isLoading && <LoadingSpinner />}
        {state.error && <ErrorMessage message={state.error} onClose={clearMessages} />}
        {state.success && <SuccessMessage message={state.success} onClose={clearMessages} />}

        {state.currentPage === 'dashboard' && <Dashboard user={state.user} />}
        {state.currentPage === 'calendar' && <Calendar user={state.user} />}
        {/* Placeholder for other pages */}
        {state.currentPage !== 'dashboard' && state.currentPage !== 'calendar' && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>{state.currentPage.toUpperCase().replace('-', ' ')}</h2>
            <p>This feature is under development.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
