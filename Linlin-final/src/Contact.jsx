import "./Contact.css";
import Button from "./Button";

function Contact({ changePage }) {
  return (
    <div>
      <h2 className="page-title">Contact Us</h2>

      <div className="contactpage__content--others">
        <p>
          Have a question about our Lend and Borrow Tracker?
          We're here to help you keep track of what you've lent or borrowed — quickly, easily, and intelligently.
          Need assistance or have feedback? Reach out to us anytime!
        </p>

        <p>
          Whether you're curious about upcoming features, need help tracking your items, or have questions about your
          account, our team is here to assist you. Feel free to reach us through the following channels:
        </p>
      </div>

      <p className="contactpage__content"> Phone: +1 (555) 123-4567</p>
      <p className="contactpage__content"> Email: support@lendborrowtracker.org</p>
      <p className="contactpage__content">
        Visit Us: 12 Silk Lane, PO Box 222, Boston, MA 02474
      </p>
      <p className="contactpage__content">
        Hours: Open Daily : 10:00 AM to 6:00 PM
      </p>
      <p className="contactpage__content">
        Mailing Inquiries: Lend and Borrow Tracker, PO Box 222, Boston, MA 02474
      </p>
      <p className="contactpage__content">
        Follow us on Instagram:{" "}
        <a href="https://instagram.com/lendborrowtracker">@lendborrowtracker</a>
      </p>
      <p className="contactpage__content">
        You can also visit our FAQ page for quick answers to common questions!
      </p>

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

export default Contact;