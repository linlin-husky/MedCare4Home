function ReserveModal({
  item,
  reserveStartDate,
  reserveDueDate,
  todayStr,
  weekStr,
  onStartDateChange,
  onDueDateChange,
  onSubmit,
  onCancel,
  className,
  reserveFormError,
}) {
  if (!item) return null;
  return (
    <div className={`modal-overlay${className ? ` ${className}` : ""}`}>
      <div className="modal-content">
        <h3>Reserve Item</h3>
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="item">Item:</label>
            <input id="item" type="text" value={item.name} disabled />
          </div>
          <div>
            <label htmlFor="start-date">Start Date:
              <span className="description-type">
                (required)
              </span>
            </label>
            <input
              id="start-date"
              type="date"
              value={reserveStartDate}
              min={todayStr}
              max={weekStr}
              onChange={onStartDateChange}
            />
            <span className="date-note">
              (Within 7 days from today)
            </span>
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
              value={reserveDueDate}
              min={reserveStartDate || todayStr}
              onChange={onDueDateChange}
            />
          </div>
          {reserveFormError && <div className="form-error">{reserveFormError}</div>}
          <div className="modal-button-row">
            <button type="submit">Confirm Reserve</button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReserveModal;