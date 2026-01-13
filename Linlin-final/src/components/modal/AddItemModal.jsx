function AddItemModal({
  newItemName,
  newItemLendDate,
  newItemCategory,
  newItemExpectedReturnDate,
  newItemDescription,
  onNameChange,
  onLendDateChange,
  onCategoryChange,
  onExpectedReturnDateChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
  className,
  modalTitle = "Add New Item",
  buttonText = "Add Item",
  formError,
}) {
  return (
    <div className={`modal-overlay${className ? ` ${className}` : ""}`}>
      <div className="modal-content">
        <h3>{modalTitle}</h3>
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="name">Name:
              <span className="description-type">
                (required)
              </span>
            </label>
            <input
              id="name"
              type="text"
              value={newItemName}
              onChange={onNameChange}
            />
          </div>
          <div>
            <label htmlFor="category">Category:
              <span className="description-type">
                (required)
              </span>
            </label>
            <select
              id="category"
              value={newItemCategory}
              onChange={onCategoryChange}
            >
              <option value="">Select Category</option>
              <option value="Book">Book</option>
              <option value="Game">Game</option>
              <option value="Tool">Tool</option>
              <option value="Kitchenware">Kitchenware</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div>
            <label htmlFor="lend-date">Lend Date:
              <span className="description-type">
                (required)
              </span>
            </label>
            <input
              id="lend-date"
              type="date"
              value={newItemLendDate}
              onChange={onLendDateChange}
            />
          </div>
          <div>
            <label htmlFor="return-date">Expected Return Date:
              <span className="description-type">
                (required)
              </span>
            </label>
            <input
              id="return-date"
              type="date"
              value={newItemExpectedReturnDate}
              onChange={onExpectedReturnDateChange}
            />
          </div>
          <div>
            <label htmlFor="description">Description:
              <span className="description-type">
                (optional)
              </span>
            </label>
            <textarea
              id="description"
              className="item-description"
              value={newItemDescription}
              onChange={onDescriptionChange}
              placeholder="Within 200 characters"
            />
          </div>
          {formError && <div className="form-error">{formError}</div>}
          <div className="modal-button-row">
            <button type="submit">{buttonText}</button>
            <span className="modal-button-spacer" />
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItemModal;