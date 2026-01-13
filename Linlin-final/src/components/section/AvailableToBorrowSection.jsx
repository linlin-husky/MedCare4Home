import { useState } from "react";
import BorrowModal from "../modal/BorrowModal";
import ReserveModal from "../modal/ReserveModal";
import { fetchBorrow, fetchReserve } from "../../services";

function AvailableToBorrowSection({
  username,
  items = {},
  setItems,
  fetchAllItems,
  changePage,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [borrowDate, setBorrowDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showBorrowForm, setShowBorrowForm] = useState(false);

  const [showReserveForm, setShowReserveForm] = useState(false);
  const [reserveStartDate, setReserveStartDate] = useState("");
  const [reserveDueDate, setReserveDueDate] = useState("");
  const [reserveItem, setReserveItem] = useState(null);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const weekFromToday = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const weekY = weekFromToday.getFullYear();
  const weekM = String(weekFromToday.getMonth() + 1).padStart(2, "0");
  const weekD = String(weekFromToday.getDate()).padStart(2, "0");
  const weekStr = `${weekY}-${weekM}-${weekD}`;

  const availableToBorrow = Object.values(items).filter(
    (item) =>
      item.owner !== username &&
      !item.borrower &&
      (!item.reservation || !item.reservation.username)
  );

  const handleBorrowClick = (item) => {
    setSelectedItem(item);
    setBorrowDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setShowBorrowForm(true);
  };


  function isValidDate(dateStr) {
    const date = new Date(dateStr);
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(dateStr) &&
      date instanceof Date &&
      !isNaN(date) &&
      dateStr === date.toISOString().slice(0, 10)
    );
  }

  const [borrowFormError, setBorrowFormError] = useState("");
  const handleBorrowSubmit = (e) => {
    e.preventDefault();
    const borrow = borrowDate.trim();
    const due = dueDate.trim();

    if (!isValidDate(borrow)) {
      setBorrowFormError("Borrow Date is invalid.");
      return;
    }
    if (!isValidDate(due)) {
      setBorrowFormError("Due Date is invalid.");
      return;
    }
    if (new Date(due) <= new Date(borrow)) {
      setBorrowFormError("Due Date must be after Borrow Date.");
      return;
    }
    setBorrowFormError("");
    fetchBorrow(selectedItem.id, username, borrowDate, dueDate)
      .then(() => fetchAllItems().then(setItems));
    setShowBorrowForm(false);
    setSelectedItem(null);
    setBorrowDate("");
    setDueDate("");
  };

  const handleReserveClick = (item) => {
    setReserveItem(item);
    setReserveStartDate("");
    setReserveDueDate("");
    setShowReserveForm(true);
  };

  const [reserveFormError, setReserveFormError] = useState("");

  const handleReserveSubmit = (e) => {
    e.preventDefault();
    setReserveFormError("");
    fetchReserve(reserveItem.id, username, reserveStartDate, reserveDueDate)
      .then(() => {
        return fetchAllItems().then(setItems);
      })
      .then(() => {
        setShowReserveForm(false);
        setReserveItem(null);
        setReserveStartDate("");
        setReserveDueDate("");
      })
      .catch((err) => {
        setReserveFormError(err?.error || "Failed to reserve item.");
      });
  };

  const onReadMore = () => {
    changePage("/discovery/");
  };

  return (
    <>
      <div className="dashboard-section">
        <h3 className="section-title">Available to Borrow</h3>
        <ul className="item-list">
          {availableToBorrow.length === 0 && (
            <li className="item-empty">No items available.</li>
          )}
          {availableToBorrow.slice(0, 3).map((item) => (
            <li key={item.id} className="item-row my-available-to-borrow-item">
              <div className="item-row-content">
                <div className="item-row-main">
                  <span className="item-name">{item.name}</span>
                  <span className="item-owner">(Owner: {item.owner})</span>
                </div>
                <div className="item-row-actions">
                  <button
                    className="item-action-button"
                    aria-label={`Borrow ${item.name}`}
                    onClick={() => handleBorrowClick(item)}
                  >
                    Borrow
                  </button>
                  <button
                    className="item-action-button"
                    aria-label={`Reserve ${item.name}`}
                    onClick={() => handleReserveClick(item)}
                  >
                    Reserve
                  </button>
                </div>
              </div>
            </li>
          ))}
          {availableToBorrow.length > 3 && (
            <li className="item-ellipsis">...</li>
          )}

        </ul>
        <button
          className="go-button"
          onClick={onReadMore}
          aria-label="Go to the discover page to borrow and reserve available items"
        >
          Go Discover
        </button>
      </div>

      <BorrowModal
        item={selectedItem}
        borrowDate={borrowDate}
        dueDate={dueDate}
        onBorrowDateChange={(e) => setBorrowDate(e.target.value)}
        onDueDateChange={(e) => setDueDate(e.target.value)}
        onSubmit={handleBorrowSubmit}
        borrowFormError={borrowFormError}
        onCancel={() => {
          setShowBorrowForm(false);
          setBorrowFormError("");
        }}
        className={showBorrowForm && selectedItem ? undefined : "modal-hidden"}
      />

      <ReserveModal
        item={reserveItem}
        reserveStartDate={reserveStartDate}
        reserveDueDate={reserveDueDate}
        todayStr={todayStr}
        weekStr={weekStr}
        onStartDateChange={(e) => setReserveStartDate(e.target.value)}
        onDueDateChange={(e) => setReserveDueDate(e.target.value)}
        onSubmit={handleReserveSubmit}
        reserveFormError={reserveFormError}
        onCancel={() => setShowReserveForm(false)}
        className={showReserveForm && reserveItem ? undefined : "modal-hidden"}
      />
    </>
  );
}

export default AvailableToBorrowSection;