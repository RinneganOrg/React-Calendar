import React, { useState, useEffect } from "react";
import ViewSelector from "../ViewSelector";
import { DragDropContext } from "react-beautiful-dnd";
import { DAYS_OF_THE_WEEK, MONTHS } from "../../constants";
import Days from "./Days";
import { makeIntervalToFetchMonthEvents } from "./makeIntervalToFetchMonthEvents";
import { fillCalendarDays } from "./fillCalendarDays";
import moment from "moment";
import { removeDraggedEvent, addDroppedEvent } from "../helpers";
import { makeInterval } from "../week/makeInterval";

const Month = ({
  viewNames,
  setSelectedView,
  ModalPopUp,
  handleEdit,
  events,
  fetchEventsByInterval,
  editEventData,
  handleOpenModal,
  makeDefaultEvent,
}) => {
  // change startDate and endDate for the dropped event
  const updateEventDatesMonthView = (
    eventToMove,
    destinationDay,
    editEventData
  ) => {
    const { id, title } = eventToMove;
    const daysDiff =
      new Date(eventToMove.endDate).getTime() -
      new Date(eventToMove.startDate).getTime();
    const startDate = moment([
      destinationDay.year,
      destinationDay.month - 1,
      destinationDay.dayNumber,
    ]).format("YYYY-MM-DD");
    const endDate = moment(new Date(startDate).getTime() + daysDiff).format(
      "YYYY-MM-DD"
    );
    return editEventData({ id, title, startDate, endDate });
  };

  /**
   * Move the event to different destination at selected position or keep it in place
   * (will not reorder if source is the same as destination)
   * ex: source has droppableId: 1 and index: 0, destination has droppableId: 3 and index: 1
   * [{name: 1, events: [a,b]}, {name: 2, events: [*a,b]}, {name: 3, events: [a,b]},
   * {name: 4, events: [a,*a,b]}, {name: 5, events: [a,b]}]
   * @param {Object} dragResult
   * @param {Object} dragResult.destination
   * @param {String} dragResult.destination.droppableId
   * @param {Number} dragResult.destination.index
   * @param {Object} dragResult.source
   * @param {String} dragResult.source.droppableId
   * @param {Number} dragResult.source.index
   * @returns
   */
  const onDragEndMonthView = (dragResult) => {
    const { source, destination } = dragResult;
    // if destination is not droppable or source is the same as destination, it will be kept in place
    if (!destination || destination?.droppableId === source?.droppableId) {
      return;
    }
    // make copy to make it safe to mutate, the source won't be changed
    const allDaysCurrentMonth = daysOfTheMonth.slice();
    const sourceDay = allDaysCurrentMonth[source.droppableId];
    const destinationDay = allDaysCurrentMonth[destination.droppableId];
    const eventToMove = sourceDay.events[source.index];
    // replacing item in array is safe to mutate,
    // it won't change the original source
    allDaysCurrentMonth[source.droppableId] = {
      ...sourceDay,
      events: removeDraggedEvent(sourceDay, source),
    };
    allDaysCurrentMonth[destination.droppableId] = {
      ...destinationDay,
      events: addDroppedEvent(destinationDay, eventToMove, destination),
    };
    updateEventDatesMonthView(eventToMove, destinationDay, editEventData);
    setDaysOfTheMonth(allDaysCurrentMonth);
  };

  const daysOfTheWeekIndicators = DAYS_OF_THE_WEEK.map((dayOfTheWeek, i) => (
    <span key={`key-${i}`} className="day-name">
      {dayOfTheWeek}
    </span>
  ));

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setCurrentMonth] = useState(
    MONTHS[new Date().getMonth()]
  );
  const [daysOfTheMonth, setDaysOfTheMonth] = useState(
    fillCalendarDays(new Date().getMonth(), events, selectedYear)
  );

  const setNextYear = () => {
    const year = selectedYear + 1;
    setSelectedYear(year);
    onChangeMonth(MONTHS[0], year);
  };
  const setPreviousYear = () => {
    const year = selectedYear - 1;
    setSelectedYear(year);
    onChangeMonth(MONTHS[11], year);
  };
  const onChangeMonth = (monthSelection, year) => {
    setCurrentMonth(monthSelection);
    fetchEventsByInterval(
      makeIntervalToFetchMonthEvents(monthSelection, year, events)
    );
  };
  const handleChangePreviousMonth = () => {
    selectedMonth.key > 0
      ? onChangeMonth(MONTHS[selectedMonth.key - 1], selectedYear)
      : setPreviousYear();
  };
  const handleChangeNextMonth = () => {
    selectedMonth.key < 11
      ? onChangeMonth(MONTHS[selectedMonth.key + 1], selectedYear)
      : setNextYear();
  };
  const handleToday = () => {
    setSelectedYear(new Date().getFullYear());
    const year = new Date().getFullYear();
    onChangeMonth(MONTHS[new Date().getMonth()], year);
  };
  const handleCreate = (year, month, day) => {
    makeDefaultEvent(makeInterval(year, month, day, year, month, day));
    handleOpenModal();
  };

  const displayMonth = (
    <div className="dropdown">
      <button className="dropbtn">
        {selectedMonth.text} {selectedYear}
      </button>
      <div className="dropdown-content">
        {MONTHS.map((month, index) => (
          <p
            key={`key-${index}`}
            onClick={() => onChangeMonth(MONTHS[month.key], selectedYear)}
            className="dropdown-content-btn"
          >
            {month.text} {selectedYear}
          </p>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    fetchEventsByInterval(
      makeIntervalToFetchMonthEvents(selectedMonth, selectedYear, events)
    );
  }, []);

  useEffect(() => {
    setDaysOfTheMonth(
      fillCalendarDays(selectedMonth.key, events, selectedYear)
    );
  }, [events, selectedMonth.key, selectedYear]);

  return (
    <div>
      <DragDropContext onDragEnd={onDragEndMonthView}>
        <div className="calendar-container">
          <ViewSelector
            {...{ selectedView: "Month", viewNames, setSelectedView }}
            handleChangePrevious={handleChangePreviousMonth}
            handleChangeNext={handleChangeNextMonth}
            handleToday={handleToday}
          >
            {displayMonth}
          </ViewSelector>
          <div className="calendar">
            {daysOfTheWeekIndicators}
            <Days {...{ daysOfTheMonth, handleCreate, handleEdit }} />
          </div>
          <ModalPopUp />
        </div>
      </DragDropContext>
    </div>
  );
};

export default Month;
