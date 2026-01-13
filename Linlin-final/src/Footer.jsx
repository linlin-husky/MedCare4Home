import Button from "./Button";
import { useState } from "react";
import "./Footer.css";
import { fetchSubscribe } from "./services";

function Footer({ changePage }) {

  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [contentTypes, setContentTypes] = useState({ news: false, updates: false, offers: false });
  const [comments, setComments] = useState("");


  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setContentTypes((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contentTypes.news && !contentTypes.updates && !contentTypes.offers) {
      setMessage("Please select at least one type of content.");
      setTimeout(() => setMessage(""), 5000);
      return;
    }
    fetchSubscribe({ contentTypes, comments })
      .then(({ ok, data }) => {
        if (ok) {
          setSubmitted(true);
          setMessage(data.message || "Thanks for subscription!");
          setTimeout(() => setMessage(""), 10000);
          setComments("");
          setContentTypes({ news: false, updates: false, offers: false });
        } else {
          setMessage(data.error || "Subscription failed");
          setTimeout(() => setMessage(""), 10000);
        }
      })
      .catch(() => {
        setMessage("Network error. Please try again later.");
      });
  };

  function goToPage(e) {
    e.preventDefault();
    changePage(e.target.pathname);
  }


  return (
    <footer className="footer">
      <div className="footer__form">
        <h2 className="subscribe__title">Stay up to date on our News!</h2>
        <form className="subscribe__form" onSubmit={handleSubmit}>
          <div className="subscribe__checkboxes">
            <label>
              <input
                className="subscribe__checkbox"
                type="checkbox"
                name="news"
                checked={contentTypes.news}
                onChange={handleCheckboxChange}
              />
              News
            </label>
            <label>
              <input
                className="subscribe__checkbox"
                type="checkbox"
                name="updates"
                checked={contentTypes.updates}
                onChange={handleCheckboxChange}
              />
              Updates
            </label>
            <label>
              <input
                className="subscribe__checkbox"
                type="checkbox"
                name="offers"
                checked={contentTypes.offers}
                onChange={handleCheckboxChange}
              />
              Offers
            </label>
          </div>
          <div className="subscribe__comments">
            <label className="subscribe__comment">
              Comments:
              <textarea
                className="subscribe__textarea"
                name="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={2}
                placeholder="Any feedback or requests?"
              />
            </label>
          </div>
          <Button className="subscribe__submit" type="submit">
            {submitted ? "Subscribed" : "Subscribe"}
          </Button>
        </form>
        {message && <p className="subscribe__message">{message}</p>}
        <p className="subscribe__privacy">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>

      <ul className="footer__list">
        <li className="footer__item">
          <a className="footer__item-link" href="/privacy/" onClick={goToPage}>
            Privacy Policy
          </a>
        </li>
        <li className="footer__item">
          <a className="footer__item-link" href="/faq/" onClick={goToPage}>
            FAQ
          </a>
        </li>
        <li className="footer__item">
          <a className="footer__item-link" href="/contact/" onClick={goToPage}>
            Contact Us
          </a>
        </li>
        <li className="footer__item">
          <a className="footer__item-link" href="/social/" onClick={goToPage}>
            Social Media
          </a>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;