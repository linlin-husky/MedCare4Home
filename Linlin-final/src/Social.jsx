import "./Social.css";
import Button from "./Button";

function Social({ changePage }) {
  return (
    <div>
      <h2 className="page-title">Connect with Us via Social Media</h2>
      <p className="socialpage__content">
        {" "}
        Welcome to follow us on social networks and stay up to date with the
        latest news:
      </p>
      <ul className="socialpage__list">
        <li className="socialpage__list--detail">
          {" "}
          1. TikTok: @lendborrowtracker
        </li>
        <li className="socialpage__list--detail">
          {" "}
          2. Whatsapp: +1 (222)222 222
        </li>
        <li className="socialpage__list--detail">
          {" "}
          3. Instagram: @lendborrowtracker
        </li>
        <li className="socialpage__list--detail">
          {" "}
          4. Facebook: LendBorrowTracker
        </li>
        <li className="socialpage__list--detail">
          {" "}
          5. Wechat Public Account: LendBorrowTracker
        </li>
      </ul>

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

export default Social;