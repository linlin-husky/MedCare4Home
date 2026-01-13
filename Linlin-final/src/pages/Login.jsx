import { useState } from "react";
import "./Login.css";

const Login = ({ onLogin, loginError, loginSuccess, onClose }) => {
  const [username, setUsername] = useState("");

  const handleChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(username);
      if (onClose && loginSuccess) {
        setTimeout(() => {
          onClose();
        }, 800);
      }
    }
  };

  return (
    <div className="login-form-container">
      <h3 className="login-title">Login</h3>
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="login-username" className="login-label">
          Username *:
          <input
            className="login-input"
            id="login-username"
            type="text"
            name="username"
            value={username}
            onChange={handleChange}
          />
        </label>
        <p className="required-indicator">* indicates a required field.</p>
        {loginError && <div className="error-message">{loginError}</div>}
        {loginSuccess && <div className="success-message">{loginSuccess}</div>}
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default Login;