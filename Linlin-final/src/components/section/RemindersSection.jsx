import "./RemindersSection.css";

const Reminder = ({ items, username }) => {
  const today = new Date();
  const itemList = Object.values(items || {});
  const dueSoon = itemList.filter(
    (item) =>
      item.borrower === username &&
      item.dueDate &&
      new Date(item.dueDate) > today &&
      (new Date(item.dueDate) - today) / (1000 * 60 * 60 * 24) <= 7
  );

  const overdue = itemList.filter(
    (item) =>
      item.borrower === username &&
      item.dueDate &&
      new Date(item.dueDate) < today
  );

  return (
    <div className="reminder-section">
      <h2>Reminders for Borrower</h2>
      <p className="reminder-content">
        Note: Please return borrowed items by their due dates to avoid overdue
        status.
      </p>
      {overdue.length > 0 && (
        <ul className="reminder-list">
          {overdue.map((item) => (
            <li key={item.id} className="reminder-item overdue">
              <div className="reminder-row">
                <span className="reminder-name">
                  <strong>Item:</strong> {item.name}
                </span>
                <span className="item-owner">(Owner: {item.owner})</span>
                <span className="reminder-due">
                  <strong>Return Due Date:</strong> {item.dueDate}
                </span>
                <span className="reminder-overdue">Overdue!</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {dueSoon.length > 0 ? (
        <ul className="reminder-list">
          {dueSoon.map((item) => (
            <li key={item.id} className="reminder-item">
              <div className="reminder-row">
                <span className="reminder-name">
                  <strong>Item:</strong> {item.name}
                </span>
                <span className="item-owner">(Owner: {item.owner})</span>
                <span className="reminder-due">
                  <strong>Return Due Date:</strong> {item.dueDate}
                </span>
                <span className="reminder-due-soon">Due Soon!</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="reminder-empty">No items due soon.</div>
      )}
    </div>
  );
};

export default Reminder;