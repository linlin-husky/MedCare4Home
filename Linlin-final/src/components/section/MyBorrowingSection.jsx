import { useState } from "react";
import ReturnModal from "../modal/ReturnModal";
import { fetchReturn } from "../../services";

function MyBorrowingSection({
  username,
  items = {},
  setItems,
  fetchAllItems,
  changePage,
}) {
  const [selectedItem, setSelectedItem] = useState(null);

  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnDate, setReturnDate] = useState("");

  const myBorrowing = Object.values(items).filter((item) => item.borrower === username);

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

  const onReadMore = () => {
    changePage("/borrow/");
  };

  return (
    <>
      <div className="dashboard-section">
        <h3 className="section-title">My Borrowing</h3>
        <ul className="item-list">
          {myBorrowing.length === 0 && (
            <li className="item-empty">Not borrowing any items.</li>
          )}
          {myBorrowing.slice(0, 3).map((item) => (
            <li key={item.id} className="item-row my-borrowing-item">
              <div className="item-row-content">
                <div className="item-row-main">
                  <span className="item-name">{item.name}</span>
                  <span className="item-owner">(From {item.owner})</span>
                  {item.borrowDate && (
                    <span className="item-borrow-date">
                      | Borrowed: {item.borrowDate}
                    </span>
                  )}
                  {item.dueDate && (
                    <span className="item-due-date">| Due: {item.dueDate}</span>
                  )}
                </div>
                <div className="item-row-actions">
                  <button
                    className="item-action-button"
                    aria-label={`Return ${item.name}`}
                    onClick={() => handleReturnClick(item)}
                  >
                    Return
                  </button>
                </div>
              </div>
            </li>
          ))}
          {myBorrowing.length > 3 && <li className="item-ellipsis">...</li>}

        </ul>
        <button
          className="go-button"
          onClick={onReadMore}
          aria-label="Go to the Borrow page to view the borrowed items"
        >
          Go Borrow
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

export default MyBorrowingSection;