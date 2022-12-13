import React from "react";

const ViewSelector = ({
  selectedView,
  viewNames,
  setSelectedView,
  handleChangePrevious,
  handleChangeNext,
  handleToday,
  children: displayMonth,
}) => {
  const viewSelect = (
    <div className="dropdown">
      <button className="dropwdown-view-btn">{selectedView}</button>
      <div className="dropdown-view-content">
        {viewNames.map((view, index) => (
          <p
            key={`key-${index}`}
            onClick={() => setSelectedView(view)}
            className="dropdown-content-btn"
          >
            {view}
          </p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="calendar-header">
      <button
        className="calendar-header-arrow-btn"
        onClick={handleChangePrevious}
      >
        <img src="https://i.imgur.com/2gqThFI.png" alt="left-arrow" />
      </button>
      {displayMonth}
      <button className="calendar-header-arrow-btn" onClick={handleChangeNext}>
        <img src="https://i.imgur.com/uambqYY.png" alt="right-arrow" />
      </button>
      <button onClick={handleToday} className="calendar-header-today-btn">
        Today
      </button>
      {viewSelect}
    </div>
  );
};

export default ViewSelector;
