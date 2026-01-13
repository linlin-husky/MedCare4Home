import ProfileMenu from "../components/section/ProfileMenu";
import RemindersSection from "../components/section/RemindersSection";
import MyLendingSection from "../components/section/MyLendingSection";
import MyReservingSection from "../components/section/MyReservingSection";
import MyBorrowingSection from "../components/section/MyBorrowingSection";
import AvailableToBorrowSection from "../components/section/AvailableToBorrowSection";

import "./Dashboard.css";

function Dashboard({
  username,
  items = {},
  setItems,
  fetchAllItems,
  onLogout,
  changePage,
}) {
  return (
    <div className="dashboard-content">
      <h2 className="dashboard-title">Dashboard</h2>
      <div className="dashboard-top-row">
        <div className="dashboard-profile-col">
          <ProfileMenu username={username} onLogout={onLogout} />
        </div>
      </div>
      {username === "admin" && (
        <button
          className="review-all-user-button"
          onClick={() => changePage("/admin-review/")}
        >
          Review All Users
        </button>
      )}
      <RemindersSection username={username} items={items} />
      <div className="dashboard-cards">
        <MyLendingSection
          username={username}
          items={items}
          setItems={setItems}
          fetchAllItems={fetchAllItems}
          changePage={changePage}
        />
        <MyReservingSection
          username={username}
          items={items}
          setItems={setItems}
          fetchAllItems={fetchAllItems}
          changePage={changePage}
        />
        <MyBorrowingSection
          username={username}
          items={items}
          setItems={setItems}
          fetchAllItems={fetchAllItems}
          changePage={changePage}
        />
        <AvailableToBorrowSection
          username={username}
          items={items}
          setItems={setItems}
          fetchAllItems={fetchAllItems}
          changePage={changePage}
        />
      </div>
    </div>
  );
}

export default Dashboard;