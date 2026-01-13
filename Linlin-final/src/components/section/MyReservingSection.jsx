import { useState } from "react";
import ModifyReserveModal from "../modal/ModifyReserveModal";
import { fetchModifyReserve, fetchBorrowNowFromReserve, fetchCancelReserve } from "../../services";
import "./MyReservingSection.css";

function MyReservingSection({
  username,
  items = {},
  setItems,
  fetchAllItems,
  changePage,
}) {

  const [showModifyReserveForm, setShowModifyReserveForm] = useState(false);
  const [modifyReserveItem, setModifyReserveItem] = useState(null);
  const [modifyReserveStartDate, setModifyReserveStartDate] = useState("");
  const [modifyReserveDueDate, setModifyReserveDueDate] = useState("");

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

  const myReserving = Object.values(items).filter(
    (item) => item.reservation && item.reservation.username === username
  );

  const [modifyReserveFormError, setModifyReserveFormError] = useState("");

  const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(dateStr) &&
      date instanceof Date &&
      !isNaN(date) &&
      dateStr === date.toISOString().slice(0, 10)
    );
  };

  const handleModifyReserveClick = (item) => {
    setModifyReserveItem(item);
    setModifyReserveStartDate(item.reservation.startDate);
    setModifyReserveDueDate(item.reservation.dueDate);
    setShowModifyReserveForm(true);
  };

  const handleModifyReserveSubmit = (e) => {
    e.preventDefault();
    setModifyReserveFormError("");

    if (!isValidDate(modifyReserveStartDate)) {
      setModifyReserveFormError("Start date is invalid.");
      return;
    }
    if (!isValidDate(modifyReserveDueDate)) {
      setModifyReserveFormError("Due date is invalid.");
      return;
    }
    if (new Date(modifyReserveDueDate) <= new Date(modifyReserveStartDate)) {
      setModifyReserveFormError("Due date must be after start date.");
      return;
    }

    fetchModifyReserve(modifyReserveItem.id, username, modifyReserveStartDate, modifyReserveDueDate)
      .then(() => {
        return fetchAllItems().then(setItems);
      })
      .then(() => {
        setShowModifyReserveForm(false);
        setModifyReserveItem(null);
        setModifyReserveStartDate("");
        setModifyReserveDueDate("");
      })
      .catch((err) => {
        setModifyReserveFormError(err.message || err.error || "Unknown error occurred.");
      });
  };

  const handleBorrowNowFromReserve = () => {
    if (!modifyReserveItem) return;
    fetchBorrowNowFromReserve(modifyReserveItem.id, username, modifyReserveDueDate)
      .then(() => fetchAllItems().then(setItems))
      .finally(() => {
        setShowModifyReserveForm(false);
        setModifyReserveItem(null);
        setModifyReserveStartDate("");
        setModifyReserveDueDate("");
      });
  };

  const handleCancelReserveClick = (item) => {
    fetchCancelReserve(item.id)
      .then(() => fetchAllItems().then(setItems));
  };

  const onReadMore = () => {
    changePage("/reserve/");
  };

  return (
    <>
      <div className="dashboard-section">
        <h3 className="section-title">My Reserving</h3>
        <ul className="item-list">
          {myReserving.length === 0 && (
            <li className="item-empty">No items reserved.</li>
          )}
          {myReserving.slice(0, 3).map((item) => (
            <li key={item.id} className="item-row my-reserving-item">
              <div className="item-row-content">
                <div className="item-row-main">
                  <span className="item-name">Item Name: {item.name}</span>
                  <span className="item-owner">(Owner: {item.owner})</span>
                  {`${item.name}`.length + `${item.owner}`.length < 10 &&
                    item.description && (
                      <span className="item-description">
                        Description: {item.description}
                      </span>
                    )}
                  {item.lendDate && (
                    <span className="item-lend-date">
                      | Lend Date: {item.lendDate}
                    </span>
                  )}
                  {item.reservation && item.reservation.startDate && (
                    <span className="item-reserve-dates">
                      | Start: {item.reservation.startDate}
                    </span>
                  )}
                  {item.reservation && item.reservation.dueDate && (
                    <span className="item-reserve-dates">
                      | Due: {item.reservation.dueDate}
                    </span>
                  )}
                  {item.expectedReturnDate && (
                    <span className="item-due-date">
                      | Expected Return: {item.expectedReturnDate}
                    </span>
                  )}
                </div>
                <div className="item-row-actions">
                  <button
                    className="item-action-button"
                    aria-label={`Modify ${item.name}`}
                    onClick={() => handleModifyReserveClick(item)}
                  >
                    Modify
                  </button>
                  <button
                    className="item-action-button"
                    onClick={() => handleCancelReserveClick(item)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </li>
          ))}
          {myReserving.length > 3 && <li className="item-ellipsis">...</li>}
        </ul>
        <button
          className="go-button"
          onClick={onReadMore}
          aria-label="Go to the reserve page to view the reserved items"
        >
          Go Reserve
        </button>

      </div>
      <ModifyReserveModal
        item={modifyReserveItem}
        startDate={modifyReserveStartDate}
        dueDate={modifyReserveDueDate}
        todayStr={todayStr}
        weekStr={weekStr}
        onStartDateChange={(e) => setModifyReserveStartDate(e.target.value)}
        onDueDateChange={(e) => setModifyReserveDueDate(e.target.value)}
        onSubmit={handleModifyReserveSubmit}
        modifyReserveFormError={modifyReserveFormError}
        onBorrowNow={handleBorrowNowFromReserve}
        onCancel={() => {
          setShowModifyReserveForm(false);
          setModifyReserveItem(null);
          setModifyReserveStartDate("");
          setModifyReserveDueDate("");
        }}
        className={
          showModifyReserveForm && modifyReserveItem
            ? undefined
            : "modal-hidden"
        }
      />
    </>
  );
}

export default MyReservingSection;