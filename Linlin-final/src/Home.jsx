import { useState } from "react";
import Button from "./Button";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Card1 from "./images/prophsee-journals-sFTMwH2Tvec-unsplash.jpg";
import Card2 from "./images/elaine-casap-qgHGDbbSNm8-unsplash.jpg";
import Card3 from "./images/sticker-mule-xdDfrh1sAp0-unsplash.jpg";
import Card4 from "./images/simon-maage-KTzZVDjUsXw-unsplash.jpg";
import "./Home.css";

function Home({
  onLogin,
  onClose,
  loginError,
  loginSuccess,
  onSignup,
  signupError,
  signupSuccess,
  changePage,
  clearSignupMessages,
  clearLoginMessages,
}) {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <>
      <h2 className="login-signup-title">Welcome to Lend and Borrow Tracker!</h2>
      <div className="login-signup-toggle">
        <button
          className={showLogin ? "active" : ""}
          onClick={() => {
            clearLoginMessages();
            setShowLogin(true);
          }}
        >
          Login
        </button>
        <button
          className={!showLogin ? "active" : ""}
          onClick={() => {
            clearSignupMessages();
            setShowLogin(false)
          }}
        >
          Sign Up
        </button>
      </div >
      {
        showLogin ? (
          <Login
            onLogin={onLogin}
            loginError={loginError}
            loginSuccess={loginSuccess}
            onClose={onClose}
          />
        ) : (
          <SignUp
            onSignup={onSignup}
            signupError={signupError}
            signupSuccess={signupSuccess}
          />
        )
      }

      <div className="container">
        <h2 className="intro-title">Intro</h2>
      </div>
      <div className="homepage__cards">
        <div className="card">
          <span className="card__title">Track Lent Items</span>
          <p className="card__content">
            Manage your lent items with ease by adding or removing them. Our
            intelligent system helps you keep a clear record of everything
            you've lent out—from books and tools to electronics. We'll also help
            you monitor return statuses and borrower details, so you never lose
            track of your belongings again.
          </p>
          <img
            src={Card1}
            className="content__photo1"
            alt="A hand is holding a white card that reads, 'LIFE IS YOUR CREATION.'"
          />
          <Button
            className="my-button"
            onClick={() => {
              changePage("/about/");
            }}
            type="button"
            visual="button"
          >
            Read more
          </Button>
        </div>
        <div className="card">
          <span className="card__title">Track Borrowed Items</span>
          <p className="card__content">
            Stay on top of the items you've borrowed — from kitchenware and
            tools to books, games and others. Our system helps you remember what
            you've borrowed, who you borrowed it from, and when it's due back,
            so you can return everything on time.
          </p>
          <div className="content__photos">
            <img
              src={Card2}
              className="content__photo2"
              alt="One hand with a bare arm and the other with a gloved hand and sleeve are holding a terra-cotta bowl filled with cherry tomatoes."
            />
            <img
              src={Card3}
              className="content__photo3"
              alt="A hand holds a 'Generosity' sticker between two frosted miniature trees."
            />
            <img
              src={Card4}
              className="content__photo4"
              alt="A person is holding a framed sign with the words 'GIVE. THANKS.' written in black text."
            />
          </div>

          <p className="last-content">
            You will also be reminded when your borrowed items will be due!
          </p>
        </div>
      </div>
    </>
  );
}

export default Home;