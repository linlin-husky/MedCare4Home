import { useEffect, useState } from "react";
import { fetchAllUserDetails } from "../services";
import "./AdminReview.css";

function categorizeItems(items, username) {
  const itemList = Object.values(items);

  return {
    lending: itemList.filter((item) => item.owner === username),
    borrowing: itemList.filter((item) => item.borrower === username),
    reserving: itemList.filter((item) => item.reservation === username),
    available: itemList.filter((item) => !item.borrower && !item.reservation),
  };
}

function AdminReview({ changePage }) {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState({});

  useEffect(() => {
    fetchAllUserDetails()
      .then((data) => {
        setUsers(data.users || []);
        setItems(data.items || {});
      });
  }, []);

  const itemList = Object.values(items);
  const allUsernames = Array.from(
    new Set([
      ...itemList.map((item) => item.owner),
      ...itemList.map((item) => item.borrower).filter(Boolean),
      ...itemList.map((item) => item.reservation).filter(Boolean),
    ])
  );

  const allUsers = allUsernames.map((username) => {
    const userData = users.find((user) => user.username === username);
    return userData || { username, email: "(not registered)" };
  });

  return (
    <div className="admin-review-container">
      <h2>All Users & Their Items</h2>
      <button
        className="back-to-dashboard-button"
        onClick={() => changePage("/dashboard/")}
      >
        Back to Dashboard
      </button>
      <div className="admin-user-grid">
        {allUsers.map((user, index) => {
          const userItems = categorizeItems(items, user.username);
          return (
            <div className="admin-user-section" key={index}>
              <h3>
                {user.username} - {user.email}
              </h3>
              <div>
                <strong>Lending:</strong>
                <ul>
                  {userItems.lending.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
                <strong>Borrowing:</strong>
                <ul>
                  {userItems.borrowing.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
                <strong>Reserving:</strong>
                <ul>
                  {userItems.reserving.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
                <strong>Available to Borrow:</strong>
                <ul>
                  {userItems.available.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminReview;