import { useState } from "react";
import AddItemModal from "../components/modal/AddItemModal";
import Pagination from "../components/Pagination";
import { fetchUpdateItem, fetchCreateItem, fetchDelete } from "../services";
import "./Lend.css";

function Lend({ username, items = {}, setItems, fetchAllItems, changePage }) {


  const [selectedItem, setSelectedItem] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemLendDate, setNewItemLendDate] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemExpectedReturnDate, setNewItemExpectedReturnDate] =
    useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [lendFilter, setLendFilter] = useState("all");

  const today = new Date();
  const getDueDate = (item) => item.dueDate || item.expectedReturnDate;
  const isOverdue = (item) => {
    const due = getDueDate(item);
    if (!due) return false;
    const dueDate = new Date(due);
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return dueDate < todayDate;
  };

  const myLending = Object.values(items).filter((item) => item.owner === username);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const filteredItems = myLending.filter(
    (item) => lendFilter === "all" || item.category === lendFilter
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIdx, endIdx);

  function isValidDate(dateStr) {
    const date = new Date(dateStr);
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(dateStr) &&
      date instanceof Date &&
      !isNaN(date) &&
      dateStr === date.toISOString().slice(0, 10)
    );
  }

  const [formError, setFormError] = useState("");
  const handleAddItemSubmit = (e) => {
    e.preventDefault();

    const name = newItemName.trim();
    const category = newItemCategory.trim();
    const lendDate = newItemLendDate.trim();
    const expectedReturnDate = newItemExpectedReturnDate.trim();
    const description = newItemDescription.trim();


    if (!name) {
      setFormError("Name must not be empty.");
      return;
    }
    if (!category) {
      setFormError("Category is required.");
      return;
    }
    if (!lendDate) {
      setFormError("Lend date is required.");
      return;
    }
    if (!expectedReturnDate) {
      setFormError("Expected return date is required.");
      return;
    }
    if (new Date(expectedReturnDate) <= new Date(lendDate)) {
      setFormError("Expected Return Date must be after Lend Date.");
      return;
    }
    if (!isValidDate(lendDate)) {
      setFormError("Lend Date is invalid.");
      return;
    }
    if (!isValidDate(expectedReturnDate)) {
      setFormError("Expected Return Date is invalid.");
      return;
    }
    if (description.length > 200) {
      setFormError("Description must be within 200 characters.");
      return;
    }

    setFormError("");

    const itemData = {
      name,
      owner: username,
      lendDate,
      category,
      expectedReturnDate,
      description,
    };

    const fetchPromise = selectedItem
      ? fetchUpdateItem(selectedItem.id, itemData)
      : fetchCreateItem(itemData);

    fetchPromise
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          fetchAllItems().then(setItems);
          setShowAddItemForm(false);
          setSelectedItem(null);
          setNewItemName("");
          setNewItemLendDate("");
          setNewItemCategory("");
          setNewItemExpectedReturnDate("");
          setNewItemDescription("");
        } else {
          setFormError(data.error || "Failed to add item.");
        }
      })
      .catch(() => {
        setFormError("Network error. Please try again.");
      });
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const handleDeleteClick = (itemId) => {
    setDeleteId(itemId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    fetchDelete(deleteId)
      .then(() => {
        setShowDeleteModal(false);
        setDeleteId(null);
      })
      .then(() => fetchAllItems().then(setItems));
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <>
      <div className="lend-page">
        <div className="lend-header-row">
          <button
            className="back-button"
            onClick={() => changePage("/dashboard/")}
          >
            Back to Dashboard
          </button>
        </div>
        <div className="lend-header-row">
          <h2 className="lend-title">All Lent Items</h2>
          <button
            className="add-item-button"
            onClick={() => {
              setSelectedItem(null);
              setNewItemName("");
              setNewItemLendDate("");
              setNewItemCategory("");
              setNewItemExpectedReturnDate("");
              setNewItemDescription("");
              setShowAddItemForm(true);
            }}
          >
            Add New Item
          </button>
        </div>

        <div className="filter-controls">
          <button
            className={
              lendFilter === "all" ? "filter-item active" : "filter-item"
            }
            onClick={() => setLendFilter("all")}
          >
            ✔ All lend
          </button>
          {[
            ...new Set(myLending.map((item) => item.category).filter(Boolean)),
          ].map((category) => (
            <button
              key={category}
              className={
                lendFilter === category ? "filter-item active" : "filter-item"
              }
              onClick={() => setLendFilter(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        <ul className="lend-gallery">
          {filteredItems.length === 0 ? (
            <li className="item-empty">Not lending any items.</li>
          ) : (
            <>
              {paginatedItems.map((item) => {
                const overdue = isOverdue(item);
                return (
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
                    {overdue && (
                      <span className="lending-overdue">Overdue!</span>
                    )}
                    <div className="item-action-row">
                      <button
                        className="item-action-button"
                        aria-label={`Modify ${item.name}`}
                        onClick={() => {
                          setSelectedItem(item);
                          setNewItemName(item.name);
                          setNewItemLendDate(item.lendDate || "");
                          setNewItemCategory(item.category || "");
                          setNewItemExpectedReturnDate(
                            item.expectedReturnDate || ""
                          );
                          setNewItemDescription(item.description || "");
                          setShowAddItemForm(true);
                        }}
                      >
                        Modify
                      </button>
                      <button
                        className="item-delete-button"
                        aria-label={`Cancel ${item.name}`}
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        Delete
                      </button>
                      {showDeleteModal && (
                        <div className="modal-overlay">
                          <div className="modal">
                            <div className="modal-header">Confirm Delete Information</div>
                            <div className="modal-body">
                              Are you sure you want to delete this item?
                            </div>
                            <div className="modal-actions">
                              <button className="confirm-button" onClick={confirmDelete}>
                                Confirm
                              </button>
                              <button className="cancel-button" onClick={cancelDelete}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
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
      {(() => {
        const addItemModalClass = showAddItemForm ? undefined : "modal-hidden";
        const isEditing = !!selectedItem;
        const modalTitle = isEditing ? "Modify Item" : "Add New Item";
        const buttonText = isEditing ? "Update Item" : "Add Item";
        return (
          <AddItemModal
            newItemName={newItemName}
            newItemLendDate={newItemLendDate}
            newItemCategory={newItemCategory}
            newItemExpectedReturnDate={newItemExpectedReturnDate}
            newItemDescription={newItemDescription}
            onNameChange={(e) => setNewItemName(e.target.value)}
            onLendDateChange={(e) => setNewItemLendDate(e.target.value)}
            onCategoryChange={(e) => setNewItemCategory(e.target.value)}
            onExpectedReturnDateChange={(e) =>
              setNewItemExpectedReturnDate(e.target.value)
            }
            onDescriptionChange={(e) => setNewItemDescription(e.target.value)}
            formError={formError}
            onSubmit={handleAddItemSubmit}
            onCancel={() => {
              setShowAddItemForm(false);
              setNewItemCategory("");
              setNewItemExpectedReturnDate("");
              setNewItemDescription("");
            }}
            className={addItemModalClass}
            modalTitle={modalTitle}
            buttonText={buttonText}
          />
        );
      })()}
    </>
  );
}

export default Lend;