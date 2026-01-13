import { useState, useEffect } from "react";
import BorrowModal from "../components/modal/BorrowModal";
import ReserveModal from "../components/modal/ReserveModal";
import Pagination from "../components/Pagination";
import { fetchBorrow, fetchReserve } from "../services";
import "./Discovery.css";

function Discovery({
  username,
  items = {},
  setItems,
  fetchAllItems,
  changePage,
}) {
  const [discoveryFilter, setDiscoveryFilter] = useState("all");
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

  const myDiscovering = Object.values(items).filter(
    (item) =>
      item.owner !== username &&
      !item.borrower &&
      (!item.reservation || !item.reservation.username)
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const filteredItems = myDiscovering.filter(
    (item) => discoveryFilter === "all" || item.category === discoveryFilter
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIdx, endIdx);

  const handleBorrowClick = (item) => {
    setSelectedItem(item);
    setBorrowDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setShowBorrowForm(true);
  };

  const handleBorrowSubmit = (e) => {
    e.preventDefault();
    fetchBorrow(itemId, borrower, borrowDate, dueDate)
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

  const handleReserveSubmit = (e) => {
    e.preventDefault();
    fetchReserve(reserveItem.id, username, reserveStartDate, reserveDueDate)
      .then(() => fetchAllItems().then(setItems));
    setShowReserveForm(false);
    setReserveItem(null);
    setReserveStartDate("");
    setReserveDueDate("");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [discoveryFilter]);

  return (
    <>
      <div className="discovery-page">
        <div className="discovery-header-row">
          <button
            className="back-button"
            onClick={() => changePage("/dashboard/")}
          >
            Back to Dashboard
          </button>
        </div>
        <h2 className="discovery-title">Discover All Items</h2>
        <div className="filter-controls">
          <button
            className={
              discoveryFilter === "all" ? "filter-item active" : "filter-item"
            }
            onClick={() => setDiscoveryFilter("all")}
          >
            ✔ All Discovery
          </button>
          {[
            ...new Set(
              myDiscovering.map((item) => item.category).filter(Boolean)
            ),
          ].map((category) => (
            <button
              key={category}
              className={
                discoveryFilter === category
                  ? "filter-item active"
                  : "filter-item"
              }
              onClick={() => setDiscoveryFilter(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        <ul className="discovery-gallery">
          {myDiscovering.filter(
            (item) =>
              discoveryFilter === "all" || item.category === discoveryFilter
          ).length === 0 ? (
            <li className="item-empty">Not Discovering any items.</li>
          ) : (
            paginatedItems.map((item) => (
              <li key={item.id} className="item-row">
                <span className="item-name">Item Name: {item.name}</span>
                {item.description && (
                  <div className="item-description">
                    Description: {item.description}
                  </div>
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
                <div className="item-row-actions">
                  <button
                    className="item-action-button"
                    aria-label={`Borrow ${item.name}`}
                    onClick={() => handleBorrowClick(item)}
                  >
                    Borrow
                  </button>
                  <button
                    className="reserve-button"
                    aria-label={`Reserve ${item.name}`}
                    onClick={() => handleReserveClick(item)}
                  >
                    Reserve
                  </button>
                </div>
              </li>
            ))
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

      <BorrowModal
        item={selectedItem}
        borrowDate={borrowDate}
        dueDate={dueDate}
        onBorrowDateChange={(e) => setBorrowDate(e.target.value)}
        onDueDateChange={(e) => setDueDate(e.target.value)}
        onSubmit={handleBorrowSubmit}
        onCancel={() => setShowBorrowForm(false)}
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
        onCancel={() => setShowReserveForm(false)}
        className={showReserveForm && reserveItem ? undefined : "modal-hidden"}
      />
    </>
  );
}

export default Discovery;