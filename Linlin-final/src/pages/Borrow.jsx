import { useState } from "react";
import ReturnModal from "../components/modal/ReturnModal";
import Pagination from "../components/Pagination";
import { fetchReturn } from "../services";
import "./Borrow.css";

function Borrow({ username, items = {}, setItems, fetchAllItems, changePage }) {
  const [borrowFilter, setBorrorFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnDate, setReturnDate] = useState("");

  const myBorrowing = Object.values(items).filter((item) => item.borrower === username);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const filteredItems = myBorrowing.filter(
    (item) => borrowFilter === "all" || item.category === borrowFilter
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIdx, endIdx);

  const handleReturnClick = (item) => {
    setSelectedItem(item);
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setReturnDate(`${yyyy}-${mm}-${dd}`);
    setShowReturnForm(true);
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    fetchReturn(selectedItem.id, returnDate)
      .then(() => fetchAllItems().then(setItems));
    setShowReturnForm(false);
    setSelectedItem(null);
    setReturnDate("");
  };

  return (
    <>
      <div className="borrow-page">
        <div className="borrow-header-row">
          <button
            className="back-button"
            onClick={() => changePage("/dashboard/")}
          >
            Back to Dashboard
          </button>
        </div>
        <h2 className="borrow-title">All Borrowed Items</h2>
        <div
          className="filter-controls"
        >
          <button
            className={
              borrowFilter === "all" ? "filter-item active" : "filter-item"
            }
            onClick={() => setBorrorFilter("all")}
          >
            ✔ All Borrow
          </button>
          {[
            ...new Set(
              myBorrowing.map((item) => item.category).filter(Boolean)
            ),
          ].map((category) => (
            <button
              key={category}
              className={
                borrowFilter === category ? "filter-item active" : "filter-item"
              }
              onClick={() => setBorrorFilter(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        <ul className="borror-gallery">
          {myBorrowing.filter(
            (item) => borrowFilter === "all" || item.category === borrowFilter
          ).length === 0 ? (
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
                  {item.borrower && (
                    <span className="item-borrower">
                      {" "}
                      (Borrowed by: {item.borrower})
                    </span>
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
                    <button
                      className="item-action-button"
                      onClick={() => handleReturnClick(item)}
                      aria-label={`Return ${item.name}`}
                    >
                      Return
                    </button>
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
        <button
          className="go-to-reserve-page-button"
          onClick={() => changePage("/reserve/")}
        >
          Go to Reserve Page
        </button>
      </div>

      <ReturnModal
        item={selectedItem}
        returnDate={returnDate}
        onReturnDateChange={(e) => setReturnDate(e.target.value)}
        onSubmit={handleReturnSubmit}
        onCancel={() => setShowReturnForm(false)}
        className={showReturnForm && selectedItem ? undefined : "modal-hidden"}
      />
    </>
  );
}

export default Borrow;