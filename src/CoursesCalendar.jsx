import "./coursesCalendar.css";
import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import moment from "moment";

const months = [
  { key: 0, daysInMonth: 31, value: 1, text: "January" },
  { key: 1, daysInMonth: 28, value: 2, text: "February" },
  { key: 2, daysInMonth: 31, value: 3, text: "March" },
  { key: 3, daysInMonth: 30, value: 4, text: "April" },
  { key: 4, daysInMonth: 31, value: 5, text: "May" },
  { key: 5, daysInMonth: 30, value: 6, text: "June" },
  { key: 6, daysInMonth: 31, value: 7, text: "July" },
  { key: 7, daysInMonth: 31, value: 8, text: "August" },
  { key: 8, daysInMonth: 30, value: 9, text: "September" },
  { key: 9, daysInMonth: 31, value: 10, text: "October" },
  { key: 10, daysInMonth: 30, value: 11, text: "November" },
  { key: 11, daysInMonth: 31, value: 12, text: "December" },
];
const daysOfTheWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/**
 * Will make an array containing last days of previous month, all days of current month and first days of next month
 * depending on when does the first/last day of current month occur during week
 * (if 1 is Monday => no previous month days, 31 is Sunday => no next month days)
 * @param {Number} selectedMonthIndex
 * @returns
 */

const makeEventsForDay = (previousMonthDisabledDay, events) =>
  events.filter(
    (event) =>
      moment(event.startDate).date() === previousMonthDisabledDay.dayNumber &&
      moment(event.startDate).month() + 1 === previousMonthDisabledDay.month &&
      moment(event.startDate).year() === previousMonthDisabledDay.year
  );

const selectedMonthDaysWithEvents = (
  selectedMonthItem,
  selectedYear,
  selectedMonthIndex,
  events
) => {
  const selectedMonthDays = Array(selectedMonthItem.daysInMonth)
    .fill(0)
    .map((_, index) => {
      const year = selectedYear;
      const month = selectedMonthIndex + 1;
      const dayNumber = index + 1;

      const result = {
        year,
        month,
        dayNumber,
        class: "day",
        events: makeEventsForDay({ year, month, dayNumber }, events),
      };

      return result;
    });
  return selectedMonthDays;
};

const previousMonthDisabledDays = (
  selectedMonthIndex,
  selectedYear,
  events
) => {
  let firstDayOfTheMonthDate = `${selectedMonthIndex + 1} 1 ${selectedYear}`;
  let firstDayOfTheMonthWeekIndex = new Date(firstDayOfTheMonthDate).getDay();
  const previousMonthDisabledDays = Array(
    firstDayOfTheMonthWeekIndex === 0 ? 6 : firstDayOfTheMonthWeekIndex - 1 // Sunday is 0 Saturday is 6
  )
    .fill(0)
    .map((_, index) => {
      const previousMonth =
        selectedMonthIndex > 0 ? months[selectedMonthIndex - 1] : months[11]; // if current month is Jan previous month is Dec

      const year = selectedMonthIndex > 0 ? selectedYear : selectedYear - 1;
      const month = selectedMonthIndex > 0 ? selectedMonthIndex : 12;
      const dayNumber = previousMonth.daysInMonth - index;

      const result = {
        year,
        month,
        events: makeEventsForDay({ dayNumber, year, month }, events),
        class: "day day--disabled",
        dayNumber,
      };

      return result;
    })
    .reverse();

  return previousMonthDisabledDays;
};

const nextMonthDisabledDays = (
  selectedMonthItem,
  selectedMonthIndex,
  selectedYear,
  events
) => {
  let lastDayOfTheMonthDate = `${selectedMonthIndex + 1} ${
    selectedMonthItem.daysInMonth
  } ${selectedYear}`;
  let lastDayOfTheMonthWeekIndex = new Date(lastDayOfTheMonthDate).getDay();
  const nextMonthDisabledDays = Array(7 - lastDayOfTheMonthWeekIndex)
    .fill(0)
    .map((_, index) => {
      const year = selectedMonthIndex < 11 ? selectedYear : selectedYear + 1;
      const month = selectedMonthIndex < 11 ? selectedMonthIndex + 2 : 1;
      const dayNumber = index + 1;

      const result = {
        year,
        month,
        dayNumber,
        class: "day day--disabled",
        events: makeEventsForDay({ dayNumber, year, month }, events),
      };

      return result;
    });

  return nextMonthDisabledDays;
};

const fillCalendarDays = (selectedMonthIndex, events, selectedYear) => {
  let selectedMonthItem = months[selectedMonthIndex];

  const result = [
    ...previousMonthDisabledDays(selectedMonthIndex, selectedYear, events),
    ...selectedMonthDaysWithEvents(
      selectedMonthItem,
      selectedYear,
      selectedMonthIndex,
      events
    ),
    ...nextMonthDisabledDays(
      selectedMonthItem,
      selectedMonthIndex,
      selectedYear,
      events
    ),
  ];
  return result;
};

const makeInterval = (
  startYear,
  startMonth,
  startDay,
  endYear,
  endMonth,
  endDay
) => {
  return {
    startDate: moment([startYear, startMonth, startDay]),
    endDate: moment([endYear, endMonth, endDay]),
  };
};

const makeIntervalToFetchMonthEvents = (
  selectedMonth,
  selectedYear,
  events
) => {
  const {
    year: yearForPreviousMonth,
    month: monthForPreviousMonth,
    dayNumber: dayNumberForPreviousMonth,
  } = previousMonthDisabledDays(selectedMonth.key, selectedYear, events)[0];
  const nextDisabledDays = nextMonthDisabledDays(
    selectedMonth,
    selectedMonth.key,
    selectedYear,
    events
  );
  const {
    year: yearForNextMonth,
    month: monthForNextMonth,
    dayNumber: dayNumberForNextMonth,
  } = nextDisabledDays[nextDisabledDays.length - 1];
  return {
    startDate: moment([
      yearForPreviousMonth,
      monthForPreviousMonth - 1,
      dayNumberForPreviousMonth,
    ]),
    endDate: moment([
      yearForNextMonth,
      monthForNextMonth - 1,
      dayNumberForNextMonth,
    ]),
  };
};

//remove dragged event from source
const removeDraggedEvent = (sourceDay, source) => {
  return [
    ...sourceDay.events.slice(0, source.index),
    ...sourceDay.events.slice(source.index + 1),
  ];
};

// add dropped event to destination at desired position
const addDroppedEvent = (destinationDay, eventToMove, destination) => {
  return [
    ...destinationDay.events.slice(0, destination.index),
    eventToMove,
    ...destinationDay.events.slice(destination.index),
  ];
};

// change startDate and endDate for the dropped event
const updateEventDates = (eventToMove, destinationDay, editEventData) => {
  const { id, title } = eventToMove;
  const diff =
    new Date(eventToMove.endDate).getTime() -
    new Date(eventToMove.startDate).getTime();
  const startDate = moment([
    destinationDay.year,
    destinationDay.month - 1,
    destinationDay.dayNumber,
  ]).format("YYYY-MM-DD");
  const endDate = moment(new Date(startDate).getTime() + diff).format(
    "YYYY-MM-DD"
  );
  return editEventData({ id, title, startDate, endDate });
};

const CoursesCalendar = ({
  events = [],
  modalPopUp: ModalPopUp,
  handleOpenModal,
  fetchEventsByInterval,
  getCurrentEventById,
  makeDefaultEvent,
  editEventData,
}) => {
  const [selectedMonth, setCurrentMonth] = useState(
    months[new Date().getMonth()]
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [daysOfTheMonth, setDaysOfTheMonth] = useState(
    fillCalendarDays(new Date().getMonth(), events, selectedYear)
  );

  useEffect(() => {
    fetchEventsByInterval(
      makeIntervalToFetchMonthEvents(selectedMonth, selectedYear, events)
    );
  }, []);

  const onChangeMonth = (monthSelection, year) => {
    setCurrentMonth(monthSelection);
    fetchEventsByInterval(
      makeIntervalToFetchMonthEvents(monthSelection, year, events)
    );
  };

  const setNextYear = () => {
    const year = selectedYear + 1;
    setSelectedYear(year);
    onChangeMonth(months[0], year);
  };
  const setPreviousYear = () => {
    const year = selectedYear - 1;
    setSelectedYear(year);
    onChangeMonth(months[11], year);
  };
  const handleCreate = (year, month, day) => {
    makeDefaultEvent(makeInterval(year, month, day, year, month, day));
    handleOpenModal();
  };
  const handleEdit = (eventId) => {
    getCurrentEventById(eventId);
    handleOpenModal();
  };
  const handleChangePreviousMonth = (selectedMonth, selectedYear) => {
    selectedMonth.key > 0
      ? onChangeMonth(months[selectedMonth.key - 1], selectedYear)
      : setPreviousYear();
  };
  const handleChangeNextMonth = (selectedMonth, selectedYear) => {
    selectedMonth.key < 11
      ? onChangeMonth(months[selectedMonth.key + 1], selectedYear)
      : setNextYear();
  };
  const handleToday = () => {
    setSelectedYear(new Date().getFullYear());
    const year = new Date().getFullYear();
    onChangeMonth(months[new Date().getMonth()], year);
  };
  const setEventStyle = (event) => {
    // timed event
    if (
      event.startHour && event.endHour
    ) {
      return "task task--timed";
    } 
    // past full day event
    else if (new Date(event.endDate) < new Date()) {
      return "task task--past-full-day";
    }
    // active full day event
    return "task task--active-full-day"
  };

  useEffect(() => {
    setDaysOfTheMonth(
      fillCalendarDays(selectedMonth.key, events, selectedYear)
    );
  }, [events, selectedMonth.key, selectedYear]);

  const monthSelector = (
    <div className="calendar-header">
      <button
        className="calendar-header-arrow-btn"
        onClick={() => handleChangePreviousMonth(selectedMonth, selectedYear)}
      >
        <img src="https://i.imgur.com/2gqThFI.png" alt="left-arrow" />
      </button>

      <div className="dropdown">
        <button className="dropbtn">
          {selectedMonth.text} {selectedYear}
        </button>
        <div className="dropdown-content">
          {months.map((month, index) => (
            <p
              key={`key-${index}`}
              onClick={() => onChangeMonth(months[month.key], selectedYear)}
              className="dropdown-content-btn"
            >
              {month.text} {selectedYear}
            </p>
          ))}
        </div>
      </div>

      <button
        className="calendar-header-arrow-btn"
        onClick={() => handleChangeNextMonth(selectedMonth, selectedYear)}
      >
        <img src="https://i.imgur.com/uambqYY.png" alt="right-arrow" />
      </button>
      <button
        onClick={() => handleToday()}
        className="calendar-header-today-btn"
      >
        Today
      </button>
    </div>
  );
  /**
   * Week days names ex: Monday etc
   */
  const daysOfTheWeekIndicators = daysOfTheWeek.map((dayOfTheWeek, i) => (
    <span key={`key-${i}`} className="day-name">
      {dayOfTheWeek}
    </span>
  ));

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
  const onDragEnd = (dragResult) => {
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

    updateEventDates(eventToMove, destinationDay, editEventData);

    setDaysOfTheMonth(allDaysCurrentMonth);
  };

  const dayCells = daysOfTheMonth.map((dayOfTheMonth, dayIndex) => {
    return (
      <Droppable droppableId={`${dayIndex}`} key={`key-${dayIndex}`}>
        {(provided) => (
          <section
            className={dayOfTheMonth.class}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <div>
              <div
                onClick={() => {
                  handleCreate(
                    dayOfTheMonth.year,
                    dayOfTheMonth.month-1,
                    dayOfTheMonth.dayNumber
                  );
                }}
              >
                {dayOfTheMonth.dayNumber}
                {provided.placeholder}
              </div>
              {dayOfTheMonth.events.map((event, eventIndex) => (
                <Draggable
                  key={`key-${eventIndex}`}
                  draggableId={`day-${dayOfTheMonth.dayNumber}-${event.id}`}
                  index={eventIndex}
                >
                  {(provided) => (
                    <section
                      onClick={() => {
                        handleEdit(event.id);
                      }}
                      className={setEventStyle(event)}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                     {event.startHour} {event.title}
                    </section>
                  )}
                </Draggable>
              ))}
            </div>
          </section>
        )}
      </Droppable>
    );
  });

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="calendar-container">
        {monthSelector}
        <div className="calendar">
          {daysOfTheWeekIndicators}
          {dayCells}
        </div>
        <ModalPopUp></ModalPopUp>
      </div>
    </DragDropContext>
  );
};

export default CoursesCalendar;
