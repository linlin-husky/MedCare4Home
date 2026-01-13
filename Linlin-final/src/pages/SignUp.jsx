import { useState } from "react";
import "./SignUp.css";

const SignUp = ({ onSignup, signupError, signupSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    if (name === "username") {
      setUsernameError("");
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setEmailError("Please input valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateUsername = (username) => {
    const re = /^[a-zA-Z0-9_]{2,20}$/;
    if (!re.test(username)) {
      setUsernameError("Username must be 2-20 characters and contain only letters, numbers, or underscores.");
      return false;
    }
    setUsernameError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isUsernameValid = validateUsername(formData.username);
    const isEmailValid = validateEmail(formData.email);
    if (!isUsernameValid || !isEmailValid) return;

    onSignup(formData.username, formData.email);
  };

  return (
    <div className="signup-form-container">
      <h3 className="signup-title">Sign Up</h3>
      <form className="signup-form" onSubmit={handleSubmit}>
        <label htmlFor="signup-username" className="signup-label">
          Username *:
          <input
            className="signup-input"
            id="signup-username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={() => validateUsername(formData.username)}
          />
        </label>
        {usernameError && <div className="error">{usernameError}</div>}
        <label htmlFor="signup-email" className="signup-label">
          Email *:
          <input
            className="signup-input"
            id="signup-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => validateEmail(formData.email)}
          />
        </label>
        <p className="required-indicator">* indicates a required field.</p>
        {emailError && <div className="error">{emailError}</div>}
        {signupError && <div className="error">{signupError}</div>}
        {signupSuccess && <div className="success">{signupSuccess}</div>}
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;