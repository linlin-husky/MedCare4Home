function BorrowModal({
  item,
  borrowDate,
  dueDate,
  onBorrowDateChange,
  onDueDateChange,
  onSubmit,
  onCancel,
  className,
  borrowFormError,
}) {
  if (!item) return null;

  return (
    <div className={`modal-overlay${className ? ` ${className}` : ""}`}>
      <div className="modal-content">
        <h3>Borrow Item</h3>
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="item">Item:</label>
            <input id="item" type="text" value={item.name} disabled />
          </div>
          <div>
            <label htmlFor="borrow-date">Borrow Date:
            </label>
            <input
              id="borrow-date"
              type="date"
              value={borrowDate}
              onChange={onBorrowDateChange}
            />
          </div>
          <div>
            <label htmlFor="due-date">Due Date:
              <span className="description-type">
                (required)
              </span>
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={onDueDateChange}
            />
          </div>
          {borrowFormError && <div className="form-error">{borrowFormError}</div>}
          <div className="modal-button-row">
            <button type="submit">Confirm Borrow</button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BorrowModal;