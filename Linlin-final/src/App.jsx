import { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./Home";
import About from "./About";
import Privacy from "./Privacy";
import FAQ from "./FAQ";
import Contact from "./Contact";
import Social from "./Social";
import ThemeButton from "./ThemeButton";
import Dashboard from "./pages/Dashboard";
import Lend from "./pages/Lend";
import Borrow from "./pages/Borrow";
import Reserve from "./pages/Reserve";
import Discovery from "./pages/Discovery";
import AdminReview from "./pages/AdminReview";

import { fetchSignup, fetchLogin, fetchSession, fetchLogout, fetchAllItems } from "./services";
import { CLIENT, SERVER, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';

import "./App.css";

function App() {
  const [items, setItems] = useState({});
  const [page, setPage] = useState(document.location.pathname || "/");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(true);

  const [loginSuccess, setLoginSuccess] = useState("");

  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  const handleSignup = (username, email) => {
    fetchSignup(username, email)
      .then((data) => {
        if (data && data.username && !data.error) {
          setSignupSuccess(data.message || SUCCESS_MESSAGES.SIGNUP_SUCCESS);
          setSignupError("");
        } else {
          setSignupError(data.error || "Signup failed");
          setSignupSuccess("");
        }
      })
      .catch((err) => {
        setSignupError(
          err.error === "user-exists"
            ? "User already exists. Please log in."
            : ERROR_MESSAGES[err.error] || "Signup failed"
        );
        setSignupSuccess("");
      });
  };

  const handleLogin = (username) => {
    fetchLogin(username)
      .then((data) => {
        if (data && !data.error) {
          setIsLoggedIn(true);
          setShowLogin(false);
          setUsername(username);
          setPage("/dashboard/");
          changePage("/dashboard/");
          fetchAllItems().then((data) => setItems(data || {}));
          setLoginError("");
          setLoginSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
        } else {
          setLoginError(data.error || "Unknown error");
          setLoginSuccess("");
        }
      })
      .catch((error) => {
        if (error.error === CLIENT.NETWORK_ERROR) {
          setLoginError(ERROR_MESSAGES[CLIENT.NETWORK_ERROR]);
        } else if (error.error === SERVER.AUTH_INSUFFICIENT) {
          setLoginError(ERROR_MESSAGES[SERVER.AUTH_INSUFFICIENT]);
        } else {
          setLoginError(ERROR_MESSAGES[error.error] || error.message || ERROR_MESSAGES.default);
        }
        setLoginSuccess("");
      });
  };

  const handleLogout = () => {
    fetchLogout().finally(() => {
      setIsLoggedIn(false);
      setShowLogin(true);
      setUsername("");
      setPage("/");
      setLoginSuccess("");
      changePage("/");
    });
  };

  const clearSignupMessages = () => {
    setSignupSuccess("");
    setSignupError("");
  };

  const clearLoginMessages = () => {
    setLoginError("");
    setLoginSuccess("");
  }

  const onClose = () => {
    setShowLogin(false);
  };

  const changePage = useCallback(
    (pathname) => {
      if (pathname !== page) {
        window.history.pushState(null, "", pathname);
        setPage(pathname);
        setSignupSuccess("");
        setSignupError("");
      }
    },
    [page]
  );

  useEffect(() => {
    fetchSession()
      .then((data) => {
        if (data && data.username) {
          setIsLoggedIn(true);
          setShowLogin(false);
          setUsername(data.username);
          fetchAllItems().then((data) => setItems(data || {}));
          if (page === "/" || page === "") {
            changePage("/dashboard/");
          }
        } else {
          setIsLoggedIn(false);
          setShowLogin(true);
          setUsername("");
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        setShowLogin(true);
        setUsername("");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, changePage]);

  useEffect(() => {
    function handlePageLoad() {
      setPage(document.location.pathname);
    }

    window.addEventListener("popstate", handlePageLoad);

    return () => {
      window.removeEventListener("popstate", handlePageLoad);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn && (page === "/" || page === "")) {
      changePage("/dashboard/");
    }
  }, [isLoggedIn, page, changePage]);

  if (loading) {
    return (
      <div className="app">
        <Header changePage={changePage} />
        <div className="load-indicator">Loading...</div>
        <Footer className="footer" changePage={changePage} />
      </div>
    );
  }

  return (
    <div className="app">
      <Header changePage={changePage} />
      <ThemeButton />
      <main id="main" />
      {page === "/" && showLogin && (
        <>
          <Home
            onLogin={handleLogin}
            onClose={onClose}
            loginError={loginError}
            loginSuccess={loginSuccess}
            onSignup={handleSignup}
            signupError={signupError}
            signupSuccess={signupSuccess}
            changePage={changePage}
            clearSignupMessages={clearSignupMessages}
            clearLoginMessages={clearLoginMessages}
          />
        </>
      )}
      {isLoggedIn && (
        <>
          {page === "/dashboard/" && (
            <Dashboard
              username={username}
              items={items}
              setItems={setItems}
              fetchAllItems={fetchAllItems}
              onLogout={handleLogout}
              changePage={changePage}
            />
          )}
          {page === "/lend/" && (
            <Lend
              username={username}
              items={items}
              setItems={setItems}
              fetchAllItems={fetchAllItems}
              changePage={changePage}
            />
          )}
          {page === "/borrow/" && (
            <Borrow
              username={username}
              items={items}
              setItems={setItems}
              fetchAllItems={fetchAllItems}
              changePage={changePage}
            />
          )}
          {page === "/reserve/" && (
            <Reserve
              username={username}
              items={items}
              setItems={setItems}
              fetchAllItems={fetchAllItems}
              changePage={changePage}
            />
          )}
          {page === "/discovery/" && (
            <Discovery
              username={username}
              items={items}
              setItems={setItems}
              fetchAllItems={fetchAllItems}
              changePage={changePage}
            />
          )}
          {page === "/admin-review/" && <AdminReview changePage={changePage} />}
        </>
      )}
      {!isLoggedIn && ["/lend/", "/borrow/", "/discovery/"].includes(page) && (
        <>
          <div className="error-message">
            Please log in to access this page.
          </div>
          <button
            className="back-login-button"
            onClick={() => changePage("/")}
          >
            Back to Login
          </button>
        </>
      )}
      {page === "/about/" && <About changePage={changePage} />}
      {page === "/privacy/" && <Privacy changePage={changePage} />}
      {page === "/faq/" && <FAQ changePage={changePage} />}
      {page === "/contact/" && <Contact changePage={changePage} />}
      {page === "/social/" && <Social changePage={changePage} />}
      <Footer className="footer" changePage={changePage} />
    </div>
  );
}

export default App;