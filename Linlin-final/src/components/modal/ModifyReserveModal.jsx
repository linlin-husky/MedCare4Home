function ModifyReserveModal({
  item,
  startDate,
  dueDate,
  todayStr,
  weekStr,
  onStartDateChange,
  onDueDateChange,
  onSubmit,
  onBorrowNow,
  onCancel,
  className,
  modifyReserveFormError,
}) {
  if (!item) return null;

  return (
    <div className={`modal-overlay${className ? ` ${className}` : ""}`}>
      <div className="modal-content">
        <h3>Modify Reservation</h3>
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="item">Item:</label>
            <input id="item" type="text" value={item.name} disabled />
          </div>
          <div>
            <label htmlFor="start-date">Start Date:</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              min={todayStr}
              max={weekStr}
              onChange={onStartDateChange}
            />
            <span className="modal-date-hint">(Within 7 days from today)</span>
          </div>
          <div>
            <label htmlFor="due-date">Due Date:
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              min={startDate || todayStr}
              onChange={onDueDateChange}
            />
          </div>
          {modifyReserveFormError && <div className="form-error">{modifyReserveFormError}</div>}
          <div className="modal-button-row">
            <button type="submit">Save Reservation</button>
            <span className="modal-button-spacer" />
            <button
              type="button"
              onClick={onBorrowNow}
              className="modal-button-success"
            >
              Borrow Now
            </button>
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

export default ModifyReserveModal;