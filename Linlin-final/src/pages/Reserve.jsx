import { useState } from "react";
import ModifyReserveModal from "../components/modal/ModifyReserveModal";
import Pagination from "../components/Pagination";
import { fetchModifyReserve, fetchBorrowNowFromReserve, fetchCancelReserve } from "../services";

function Reserve({
  username,
  items = {},
  setItems,
  fetchAllItems,
  changePage,
}) {
  const [reserveFilter, setReserveFilter] = useState("all");
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const filteredItems = myReserving.filter(
    (item) => reserveFilter === "all" || item.category === reserveFilter
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIdx, endIdx);

  const handleModifyReserveClick = (item) => {
    setModifyReserveItem(item);
    setModifyReserveStartDate(item.reservation.startDate);
    setModifyReserveDueDate(item.reservation.dueDate);
    setShowModifyReserveForm(true);
  };

  const handleModifyReserveSubmit = (e) => {
    e.preventDefault();
    fetchModifyReserve(modifyReserveItem.id, username, modifyReserveStartDate, modifyReserveDueDate)
      .then(() => fetchAllItems().then(setItems))
      .finally(() => {
        setShowModifyReserveForm(false);
        setModifyReserveItem(null);
        setModifyReserveStartDate("");
        setModifyReserveDueDate("");
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

  return (
    <>
      <div className="reserve-page">
        <div className="reserve-header-row">
          <button
            className="back-button"
            onClick={() => changePage("/dashboard/")}
          >
            Back to Dashboard
          </button>
          <h2 className="reserve-title">All Reserved Items</h2>
        </div>

        <div
          className="filter-controls"
        >
          <button
            className={
              reserveFilter === "all" ? "filter-item active" : "filter-item"
            }
            onClick={() => setReserveFilter("all")}
          >
            ✔ All Reserve
          </button>
          {[
            ...new Set(
              myReserving.map((item) => item.category).filter(Boolean)
            ),
          ].map((category) => (
            <button
              key={category}
              className={
                reserveFilter === category
                  ? "filter-item active"
                  : "filter-item"
              }
              onClick={() => setReserveFilter(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        <ul className="reserve-gallery">
          {filteredItems.length === 0 ? (
            <li className="item-empty">Not borrowing any items.</li>
          ) : (
            <>
              {paginatedItems.map((item) => (
                <li key={item.id} className="item-row">
                  <span className="item-name">Item Name: {item.name}</span>
                  {item.description && (
                    <div className="item-description">
                      Description: {item.description}
                    </div>
                  )}
                  {item.reservation && item.reservation.username && (
                    <span className="item-reserved">
                      {" "}
                      (Reserved by: {item.reservation.username})
                    </span>
                  )}
                  {item.lendDate && (
                    <span className="item-lend-date">
                      {" | Lend Date: "}
                      {item.lendDate}
                    </span>
                  )}
                  {item.expectedReturnDate && (
                    <span className="item-due-date">
                      {" | Expected Return: "}
                      {item.expectedReturnDate}
                    </span>
                  )}
                  {item.dueDate && (
                    <span className="item-due-date">
                      {" | Due: "}
                      {item.dueDate}
                    </span>
                  )}
                  <div className="item-action-row">
                    <div className="item-row-actions">
                      <button
                        className="item-action-button"
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
            </>
          )}
        </ul>
        {filteredItems.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
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

export default Reserve;