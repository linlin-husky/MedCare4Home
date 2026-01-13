import { useReducer, useEffect } from 'react';
import { ACTIONS, initialState, appReducer } from './reducers/appReducer.js';
import * as api from './services/api.js';
import Header from './components/Header.jsx';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import ItemInventory from './components/ItemInventory.jsx';
import ItemForm from './components/ItemForm.jsx';
import ItemDetail from './components/ItemDetail.jsx';
import LendingList from './components/LendingList.jsx';
import LendingForm from './components/LendingForm.jsx';
import LendingDetail from './components/LendingDetail.jsx';
import BorrowingList from './components/BorrowingList.jsx';
import PendingRequests from './components/PendingRequests.jsx';
import PublicLibrary from './components/PublicLibrary.jsx';
import BorrowRequest from './components/BorrowRequest.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import ProfileEdit from './components/ProfileEdit.jsx';
import UserProfile from './components/UserProfile.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import SuccessMessage from './components/SuccessMessage.jsx';
import './App.css';

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    let pollInterval;
    if (state.isLoggedIn) {
      pollInterval = setInterval(() => {
        api.getUnreadActivityCount()
          .then(data => {
            dispatch({ type: ACTIONS.SET_UNREAD_COUNT, payload: data.count });
          })
          .catch(() => {});
      }, 30000);
    }
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [state.isLoggedIn]);

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
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Welcome back, ' + userData.displayName + '!' });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Login failed' });
      });
  }

  function handleRegister(formData) {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    api.register(formData.username, formData.displayName, formData.email, formData.phone)
      .then(userData => {
        dispatch({ type: ACTIONS.SET_USER, payload: userData });
        dispatch({ type: ACTIONS.SET_SUCCESS, payload: 'Registration successful! Welcome, ' + userData.displayName + '!' });
      })
      .catch(err => {
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Registration failed' });
      });
  }

  function handleLogout() {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    api.logout()
      .then(() => {
        dispatch({ type: ACTIONS.LOGOUT });
      })
      .catch(() => {
        dispatch({ type: ACTIONS.LOGOUT });
      });
  }

  function navigateTo(page, data) {
    dispatch({ type: ACTIONS.SET_PAGE, payload: page });
    if (data) {
      if (data.item) dispatch({ type: ACTIONS.SET_SELECTED_ITEM, payload: data.item });
      if (data.lending) dispatch({ type: ACTIONS.SET_SELECTED_LENDING, payload: data.lending });
    }
  }

  function clearMessages() {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    dispatch({ type: ACTIONS.CLEAR_SUCCESS });
  }

  function renderPage() {
    switch (state.currentPage) {
      case 'login':
        return (
          <LoginForm 
            onLogin={handleLogin}
            onSwitchToRegister={() => navigateTo('register')}
          />
        );
      
      case 'register':
        return (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => navigateTo('login')}
          />
        );
      
      case 'dashboard':
        return (
          <Dashboard
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
          />
        );
      
      case 'inventory':
        return (
          <ItemInventory
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
          />
        );
      
      case 'item-form':
        return (
          <ItemForm
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
            item={state.selectedItem}
          />
        );
      
      case 'item-detail':
        return (
          <ItemDetail
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
            item={state.selectedItem}
          />
        );
      
      case 'lendings':
        return (
          <LendingList
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
          />
        );
      
      case 'lending-form':
        return (
          <LendingForm
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
            item={state.selectedItem}
          />
        );
      
      case 'lending-detail':
        return (
          <LendingDetail
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
            lending={state.selectedLending}
          />
        );
      
      case 'borrowings':
        return (
          <BorrowingList
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
          />
        );
      
      case 'pending-requests':
        return (
          <PendingRequests
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
          />
        );
      
      case 'public-library':
        return (
          <PublicLibrary
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
          />
        );
      
      case 'borrow-request':
        return (
          <BorrowRequest
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
            item={state.selectedItem}
          />
        );
      
      case 'activity':
        return (
          <ActivityFeed
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
          />
        );
      
      case 'profile':
        return (
          <ProfileEdit
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
          />
        );
      
      case 'user-profile':
        return (
          <UserProfile
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
          />
        );
      
      case 'admin':
        return (
          <AdminPanel
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
          />
        );
      
      default:
        return (
          <Dashboard
            state={state}
            dispatch={dispatch}
            navigateTo={navigateTo}
          />
        );
    }
  }

  return (
    <div className="app">
      {state.isLoggedIn && (
        <Header
          user={state.user}
          unreadCount={state.unreadCount}
          currentPage={state.currentPage}
          onLogout={handleLogout}
          navigateTo={navigateTo}
        />
      )}
      
      <main className="main-content">
        {state.isLoading && <LoadingSpinner />}
        
        {state.error && (
          <ErrorMessage message={state.error} onClose={clearMessages} />
        )}
        
        {state.success && (
          <SuccessMessage message={state.success} onClose={clearMessages} />
        )}
        
        {renderPage()}
      </main>
      
      <footer className="app-footer">
        <p>INFO6250 Project - Created by Nishal</p>
      </footer>
    </div>
  );
}

export default App;
