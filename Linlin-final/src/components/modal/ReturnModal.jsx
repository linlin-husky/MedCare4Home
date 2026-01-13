function ReturnModal({
  item,
  returnDate,
  onReturnDateChange,
  onSubmit,
  onCancel,
  className,
  formError,
}) {
  if (!item) return null;
  return (
    <div className={`modal-overlay${className ? ` ${className}` : ""}`}>
      <div className="modal-content">
        <h3>Return Item</h3>
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="item">Item:</label>
            <input id="item" type="text" value={item.name} disabled />
          </div>
          <div>
            <label htmlFor="return-date">Return Date:</label>
            <input
              id="return-date"
              type="date"
              value={returnDate}
              onChange={onReturnDateChange}
            />
          </div>
          {formError && <div className="form-error">{formError}</div>}
          <div className="return-action-buttons">
            <button type="submit">Confirm Return</button>
            <button type="button" onClick={onCancel} >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReturnModal;