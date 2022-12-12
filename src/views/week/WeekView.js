import React, { useState, useEffect } from "react";
import ViewSelector from "../ViewSelector";
import { DragDropContext } from "react-beautiful-dnd";
import { DAYS_OF_THE_WEEK_MONTH_VIEW, DAYS_OF_THE_WEEK_WEEK_VIEW, MONTHS } from "../../constants";
import { firstAndLastDayOfTheWeek } from "./firstAndLastDayOfTheWeek";
import { selectedWeekDaysWithEvents } from "./selectedWeekDaysWithEvents";
import Hours from "./Hours";
import { makeInterval } from "./makeInterval";
import { removeDraggedEvent, addDroppedEvent } from "../helpers";
import moment from "moment";
import eventsMatrix from "../month/eventsMatrix";
// import weekEventsMatrix from "./weekEventsMatrix"

const Week = ({
  viewNames,
  setSelectedView,
  ModalPopUp,
  handleEdit,
  events = [],
  fetchEventsByInterval,
  editEventData,
  handleOpenModal,
  makeDefaultEvent
}) => {
  const fullDayEvents = events.filter((event) => event.startHour === null)
  const updateEventDatesWeekView = (
    eventToMove,
    destinationDay,
    editEventData
  ) => {
    const { id, title } = eventToMove;
    const daysDiff =
      new Date(eventToMove.endDate).getTime() -
      new Date(eventToMove.startDate).getTime();
    const hoursDiff = eventToMove.endHour
      ? moment(eventToMove.endHour, "HH:mm").format("HH") -
        moment(eventToMove.startHour, "HH:mm").format("HH")
      : 1;
    const startDate = moment([
      destinationDay.year,
      destinationDay.month - 1,
      destinationDay.dayNumber,
    ]).format("YYYY-MM-DD");
    const endDate = moment(new Date(startDate).getTime() + daysDiff).format(
      "YYYY-MM-DD"
    );
    const startHour =
      destinationDay.hour !== -1
        ? moment(destinationDay.hour, "H").format("HH:mm")
        : null;
    const endHour =
      destinationDay.hour !== -1 && eventToMove.endHour
        ? moment(destinationDay.hour + hoursDiff, "H").format("HH:mm")
        : null;
    return editEventData({ id, title, startDate, endDate, startHour, endHour });
  };

  const onDragEndWeekView = (dragResult) => {
    const { source, destination } = dragResult;
    // if destination is not droppable or source is the same as destination, it will be kept in place
    if (!destination || destination?.droppableId === source?.droppableId) {
      return;
    }
    // make copy to make it safe to mutate, the source won't be changed
    const allDaysCurrentWeek = weekHours.slice();
    const sourceDay = allDaysCurrentWeek[source.droppableId];
    const destinationDay = allDaysCurrentWeek[destination.droppableId];
    const eventToMove = sourceDay.events[source.index];
    // replacing item in array is safe to mutate,
    // it won't change the original source
    allDaysCurrentWeek[source.droppableId] = {
      ...sourceDay,
      events: removeDraggedEvent(sourceDay, source),
    };
    allDaysCurrentWeek[destination.droppableId] = {
      ...destinationDay,
      events: addDroppedEvent(destinationDay, eventToMove, destination),
    };
    updateEventDatesWeekView(eventToMove, destinationDay, editEventData);
    setWeekHours(allDaysCurrentWeek);
  };

  const fillCalendarDays = (events, selectedWeek) => {
    const result = [...selectedWeekDaysWithEvents(selectedWeek, events)];
    return result;
  };

  const [selectedWeek, setSelectedWeek] = useState(
    firstAndLastDayOfTheWeek(new Date())
  );
  const [weekHours, setWeekHours] = useState(
    fillCalendarDays(events, firstAndLastDayOfTheWeek(new Date()))
  );
  const [eventsMatrixState, setEventsMatrixState] = useState(
    eventsMatrix(fullDayEvents)
  );
  // const [weekEventsMatrixState, setWeekEventsMatrixState] = useState(
  //   weekEventsMatrix(events)
  // );
  const hourEvents = events.filter((event) => event.startHour !== null);

  const daysOfTheWeekIndicators = DAYS_OF_THE_WEEK_WEEK_VIEW.map((dayOfTheWeek, i) => {
   return i === 0 ? <span className="day-name" key={i}></span>: <span key={`key-${i}`} className="day-name">
      {dayOfTheWeek} {weekHours[i].dayNumber}
    </span>
  });

  // const daysOfTheWeekIndicators = DAYS_OF_THE_WEEK_MONTH_VIEW.map((dayOfTheWeek, i) => {
  //   return i === 0 ? <span className="day-name"></span>: <span key={`key-${i}`} className="day-name">
  //      {dayOfTheWeek} {weekHours[i-1].dayNumber}
  //    </span>
  //  });

  let firstDayOfCurrentWeek = new Date(
    `${selectedWeek.startYear}/${selectedWeek.startMonth}/${selectedWeek.startDay}`
  );
  let lastDayOfCurrentWeek = new Date(
    `${selectedWeek.endYear}/${selectedWeek.endMonth}/${selectedWeek.endDay}`
  );
  const onChangeWeek = (firstDay, lastDay) => {
    setSelectedWeek(firstAndLastDayOfTheWeek(firstDay));
    fetchEventsByInterval(
      makeInterval(
        new Date(firstDay).getFullYear(),
        new Date(firstDay).getMonth(),
        new Date(firstDay).getDate(),
        new Date(lastDay).getFullYear(),
        new Date(lastDay).getMonth(),
        new Date(lastDay).getDate()
      )
    );
  };
  const handleChangePreviousWeek = () => {
    firstDayOfCurrentWeek = new Date(
      firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() - 7)
    );
    lastDayOfCurrentWeek = new Date(
      lastDayOfCurrentWeek.setDate(lastDayOfCurrentWeek.getDate() - 7)
    );
    onChangeWeek(firstDayOfCurrentWeek, lastDayOfCurrentWeek);
  };
  const handleChangeNextWeek = () => {
    firstDayOfCurrentWeek = new Date(
      firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() + 7)
    );
    lastDayOfCurrentWeek = new Date(
      lastDayOfCurrentWeek.setDate(lastDayOfCurrentWeek.getDate() + 7)
    );
    onChangeWeek(firstDayOfCurrentWeek, lastDayOfCurrentWeek);
  };

  const handleToday = () => {
    const today = firstAndLastDayOfTheWeek(new Date());
    firstDayOfCurrentWeek = new Date(
      `${today.startYear}/${today.startMonth}/${today.startDay}`
    );
    let lastDayOfCurrentWeek = new Date(
      `${today.endYear}/${today.endMonth}/${today.endDay}`
    );
    onChangeWeek(firstDayOfCurrentWeek, lastDayOfCurrentWeek);
  };

  const handleCreate = (year, month, day, startHour) => {
    makeDefaultEvent({
      ...makeInterval(year, month, day, year, month, day),
      startHour: moment(startHour, "HH:mm"),
    });
    handleOpenModal();
  };

  const displayWeeks = (selectedWeek) => {
    const result =
      selectedWeek.startMonth === selectedWeek.endMonth
        ? `${MONTHS[selectedWeek.startMonth - 1].text} ${
            selectedWeek.startYear
          }`
        : `${MONTHS[selectedWeek.startMonth - 1].text.slice(0, 3)} ${
            selectedWeek.startYear
          } - ${MONTHS[selectedWeek.endMonth - 1].text.slice(0, 3)} ${
            selectedWeek.endYear
          }`;
    return result;
  };

  useEffect(() => {
    fetchEventsByInterval(
      makeInterval(
        selectedWeek.startYear,
        selectedWeek.startMonth - 1,
        selectedWeek.startDay,
        selectedWeek.endYear,
        selectedWeek.endMonth - 1,
        selectedWeek.endDay
      )
    );
  }, []);
  useEffect(() => {
    setWeekHours(
      fillCalendarDays(
        events,
        firstAndLastDayOfTheWeek(
          new Date(
            `${selectedWeek.startYear}/${selectedWeek.startMonth}/${selectedWeek.startDay}`
          )
        )
      )
    );
  }, [events, selectedWeek]);

  useEffect(() => {
    setEventsMatrixState(eventsMatrix(events));
    // setWeekEventsMatrixState(weekEventsMatrix(events))
  }, [events]);

  const hourIndicators = Array(25)
    .fill(0)
    .map((_, index) =>
      index === 0 ? (
        <div key={index} className="dayWeekView"></div>
      ) : index - 1 < 12 ? (
        <div key={index} className="dayWeekView">
          {index - 1} am
        </div>
      ) : index - 1 === 12 ? (
        <div key={index} className="dayWeekView">
          {index - 1} pm
        </div>
      ) : (
        <div key={index} className="dayWeekView">
          {index - 13} pm
        </div>
      )
    );
  
  return (
    <div>
      <DragDropContext onDragEnd={onDragEndWeekView}>
        <div className="calendar-container">
          <ViewSelector
            {...{ selectedView: "Week", viewNames, setSelectedView }}
            handleChangePrevious={handleChangePreviousWeek}
            handleChangeNext={handleChangeNextWeek}
            handleToday={handleToday}
          >
            <div className="dropdown dropbtn">{displayWeeks(selectedWeek)}</div>
          </ViewSelector>
          <div className="hours-weekdays-wrapper">
            {/* <div className="hours">
              <div className="day-name"></div>
              {hourIndicators}
            </div> */}
            <div className="calendarWeekView">
              {daysOfTheWeekIndicators}
              <Hours {...{ weekHours, handleCreate, handleEdit,  eventsMatrix: eventsMatrix(fullDayEvents), weekEventsMatrix: eventsMatrix(hourEvents) }} />
            </div>
          </div>
          <ModalPopUp />
        </div>
      </DragDropContext>
    </div>
  );
};

export default Week;
