import "./Privacy.css";
import Button from "./Button";

function Privacy({ changePage }) {
  return (
    <div>
      <h2 className="page-title">Lend and Borrow Tracker Privacy Policy</h2>
      <p className="privacy-update">Last updated: April 19, 2025</p>

      <div className="privacy__contents">
        <p className="privacy__content">
          At Lend and Borrow Tracker, your privacy matters to us. This Privacy Policy
          explains how we gather, use, and share your personal information when
          you visit or interact with our website.
        </p>

        <p className="privacy__content">
          By accessing or using the Site, you consent to the way we collect and
          handle your information as described in this Privacy Policy. We use
          your personal data solely to operate, maintain, and enhance the Site
          experience.
        </p>

        <h3 className="privacy-subtitle">Information Collection and Use</h3>
        <p className="privacy__content">
          As you interact with our Site, we may request some personal
          details—such as your name or email address—that can be used to
          identify or reach out to you. This type of information is referred to
          as "Personal Information."
        </p>

        <h3 className="privacy-subtitle">Log Data</h3>
        <p className="privacy__content">
          Similar to many other websites, we automatically receive and record
          information your browser provides whenever you visit our Site—this is
          known as "Log Data."
        </p>

        <h3 className="privacy-subtitle">Communications</h3>
        <p className="privacy__content">
          We might use your Personal Information to share newsletters,
          promotional offers, or important updates about our services. If you'd
          rather not receive these messages, you can unsubscribe at any time.
        </p>

        <h3 className="privacy-subtitle">Cookies</h3>
        <p className="privacy__content">
          Cookies are small data files stored on your device that may include an
          anonymous unique identifier. We use cookies to collect information and
          improve your experience on the Site.
        </p>
        <p className="privacy__content">
          You can set your browser to block all cookies or alert you when
          cookies are being sent. Keep in mind, though, that disabling cookies
          may affect how certain parts of the Site work.
        </p>

        <h3 className="privacy-subtitle">Security</h3>
        <p className="privacy__content">
          Protecting your Personal Information is important to us. That said, no
          method of internet transmission or electronic storage is entirely
          foolproof. While we do our best to use industry-standard safeguards,
          we can't promise complete security.
        </p>

        <h3 className="privacy-subtitle">Changes to This Privacy Policy</h3>
        <p className="privacy__content">
          We may revise this Privacy Policy occasionally, and any updates will
          become effective as soon as they're posted on this page.
        </p>

        <h3 className="privacy-subtitle">Contact Us</h3>
        <p className="privacy__content">
          If you have any questions about this Privacy Policy, feel free to
          reach out to us at: <strong>linlin@gmail.com</strong>.
        </p>
      </div>

      <Button
        className="skip-button"
        onClick={() => {
          changePage("/");
        }}
        visual="link"
      >
        Back to homepage
      </Button>
    </div>
  );
}

export default Privacy;