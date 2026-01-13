import { useState } from "react";
import AddItemModal from "../modal/AddItemModal";
import { fetchUpdateItem, fetchCreateItem, fetchDelete } from "../../services";
import "./MyLendingSection.css";

function MyLendingSection({
  username,
  items = {},
  setItems,
  fetchAllItems,
  changePage,
}) {

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const [selectedItem, setSelectedItem] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemLendDate, setNewItemLendDate] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemExpectedReturnDate, setNewItemExpectedReturnDate] =
    useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  const myLending = Object.values(items).filter((item) => item.owner === username);

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

  const onAddNewItem = () => {
    setSelectedItem(null);
    setNewItemName("");
    setNewItemLendDate("");
    setNewItemCategory("");
    setNewItemExpectedReturnDate("");
    setNewItemDescription("");
    setShowAddItemForm(true);
  };

  const goLend = () => {
    changePage("/lend/");
  };

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

  return (
    <>
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3 className="section-title">My Lending</h3>
          <button onClick={onAddNewItem} className="add-item-button">
            Add New Item
          </button>
        </div>
        <ul className="item-list">
          {myLending.length === 0 && (
            <li className="item-empty">Not lending any items.</li>
          )}
          {myLending.slice(0, 3).map((item) => {
            const overdue = isOverdue(item);
            return (
              <li
                key={item.id}
                className={`item-row${overdue ? " overdue" : ""}`}
              >
                {editingId === item.id ? (
                  <form className="edit-item-form" onSubmit={handleEditSubmit}>
                    <div className="form-row">
                      <label htmlFor="name">Name:</label>
                      <input
                        id="name"
                        name="name"
                        value={editValues.name}
                        onChange={handleEditChange}
                        placeholder="Name"
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="category">Category:</label>
                      <input
                        id="category"
                        name="category"
                        value={editValues.category}
                        onChange={handleEditChange}
                        placeholder="Category"
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="lend-date">Lend Date:</label>
                      <input
                        id="lend-date"
                        name="lendDate"
                        type="date"
                        value={editValues.lendDate}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="return-date">Expected Return Date:</label>
                      <input
                        id="return-date"
                        name="expectedReturnDate"
                        type="date"
                        value={editValues.expectedReturnDate}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="description">Description:</label>
                      <textarea
                        id="description"
                        name="description"
                        value={editValues.description}
                        onChange={handleEditChange}
                        placeholder="Description"
                        rows={3}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="save-button">
                        Save
                      </button>
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="item-row-content">
                    <div className="item-row-main">
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
                          {" "}
                          | Lend Date: {item.lendDate}
                        </span>
                      )}
                      {item.expectedReturnDate && (
                        <span className="item-due-date">
                          {" "}
                          | Expected Return: {item.expectedReturnDate}
                        </span>
                      )}
                      {item.dueDate && (
                        <span className="item-due-date">
                          {" "}
                          | Due: {item.dueDate}
                        </span>
                      )}
                      {overdue && (
                        <span className="lending-overdue">Overdue!</span>
                      )}
                    </div>
                    <div className="item-row-actions">
                      <button
                        className="modify-button"
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
                        className="delete-button"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          {myLending.length > 3 && <li className="item-ellipsis">...</li>}
        </ul>
        <button
          className="go-button"
          onClick={goLend}
          aria-label="Go to the lend page to lend items"
        >
          Go Lend
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

export default MyLendingSection;