import "./coursesCalendar.css";
import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import moment from "moment";
import { months, daysOfTheWeek, views } from "./constants";

/**
 * Will make an array containing last days of previous month, all days of current month and first days of next month
 * depending on when does the first/last day of current month occur during week
 * (if 1 is Monday => no previous month days, 31 is Sunday => no next month days)
 * @param {Number} selectedMonthIndex
 * @returns
 */
const makeEventsForDay = (year, month, dayNumber, events) =>
  events.filter(
    (event) =>
      moment(event.startDate).date() === dayNumber &&
      moment(event.startDate).month() + 1 === month &&
      moment(event.startDate).year() === year
  );

const makeEventsForHour = (year, month, dayNumber, hour, events) =>
  events.filter((event) => {
    const isCorrectDay = moment(event.startDate).date() === dayNumber;
    const isCorrectMonth = moment(event.startDate).month() + 1 === month;
    const isCorrectYear = moment(event.startDate).year() === year;
    const isCorrectHour =
      !event.startHour && hour === -1
        ? true
        : moment(event.startHour, "HH:mm:ss").hour() === hour;
    return isCorrectDay && isCorrectMonth && isCorrectYear && isCorrectHour;
  });

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
        events: makeEventsForDay(year, month, dayNumber, events),
      };

      return result;
    });
  return selectedMonthDays;
};

const selectedWeekDaysWithEvents = (selectedWeek, events) => {
  const selectedWeekDays = Array(175)
    .fill(0)
    .map((_, index) => {
      const currentMonthNoOfDays = new Date(
        selectedWeek.startYear,
        selectedWeek.startMonth,
        0
      ).getDate();
      // TODO simplify
      const year =
        selectedWeek.startYear === selectedWeek.endYear
          ? selectedWeek.startYear
          : currentMonthNoOfDays < selectedWeek.startDay + (index % 7) &&
            selectedWeek.endMonth === 1
          ? selectedWeek.endYear
          : selectedWeek.startYear;
      const month =
        selectedWeek.startMonth === selectedWeek.endMonth
          ? selectedWeek.startMonth
          : currentMonthNoOfDays < selectedWeek.startDay + (index % 7)
          ? selectedWeek.endMonth
          : selectedWeek.startMonth;
      const dayNumber =
        selectedWeek.startMonth === selectedWeek.endMonth
          ? selectedWeek.startDay + (index % 7)
          : selectedWeek.startDay + (index % 7) > currentMonthNoOfDays
          ? (index % 7) - (currentMonthNoOfDays - selectedWeek.startDay)
          : selectedWeek.startDay + (index % 7);
      const hour = Math.trunc(index / 7) - 1;

      const result = {
        year,
        month,
        dayNumber,
        class: "day",
        hour,
        events: makeEventsForHour(year, month, dayNumber, hour, events),
      };
      return result;
    });
  return selectedWeekDays;
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
        events: makeEventsForDay(dayNumber, year, month, events),
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
        events: makeEventsForDay(dayNumber, year, month, events),
      };

      return result;
    });

  return nextMonthDisabledDays;
};

const fillCalendarDays = (
  selectedMonthIndex,
  events,
  selectedYear,
  selectedWeek,
  selectedView
) => {
  const selectedMonthItem = months[selectedMonthIndex];
  const result =
    selectedView === "Month"
      ? [
          ...previousMonthDisabledDays(
            selectedMonthIndex,
            selectedYear,
            events
          ),
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
        ]
      : [...selectedWeekDaysWithEvents(selectedWeek, events)];
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
    ? moment(eventToMove.endHour, "HH:mm:ss").format("HH") -
      moment(eventToMove.startHour, "HH:mm:ss").format("HH")
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
      ? moment(destinationDay.hour, "H").format("HH:mm:ss")
      : null;
  const endHour =
    destinationDay.hour !== -1
      ? moment(destinationDay.hour + hoursDiff, "H").format("HH:mm:ss")
      : null;
  return editEventData({ id, title, startDate, endDate, startHour, endHour });
};
/**
 * getting the date for the first day of the week by subtracting from the day, the week index of that day
  ex: today is wednesday 19 Oct -> Wed has the index 3 (Sun is 0, Sat is 6)
  diff = 19 - 3  + 1 = 17 (Monday date)
 * @param {*} date 
 * @returns 
 */
const firstAndLastDayOfTheWeek = (date) => {
  const currentDay = new Date(date);
  const firstDayOffset =
    currentDay.getDate() -
    currentDay.getDay() +
    (currentDay.getDay() === 0 ? -6 : 1);
  const firstDay = new Date(currentDay.setDate(firstDayOffset));
  // const lastDay = new Date(new Date(currentDay.setDate(firstDayOffset)).setDate(firstDay.getDate() + 6));
  const lastDay = new Date(firstDay);
  lastDay.setDate(lastDay.getDate() + 6);

  return {
    startYear: new Date(firstDay).getFullYear(),
    startMonth: new Date(firstDay).getMonth() + 1,
    startDay: new Date(firstDay).getDate(),
    endYear: new Date(lastDay).getFullYear(),
    endMonth: new Date(lastDay).getMonth() + 1,
    endDay: new Date(lastDay).getDate(),
  };
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
  const [selectedView, setSelectedView] = useState("Month");
  const [selectedMonth, setCurrentMonth] = useState(
    months[new Date().getMonth()]
  );
  const [currentWeek, setCurrentWeek] = useState(
    firstAndLastDayOfTheWeek(new Date())
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [daysOfTheMonth, setDaysOfTheMonth] = useState(
    fillCalendarDays(
      new Date().getMonth(),
      events,
      selectedYear,
      firstAndLastDayOfTheWeek(new Date()),
      selectedView
    )
  );
  let firstDayOfCurrentWeek = new Date(
    `${currentWeek.startYear}/${currentWeek.startMonth}/${currentWeek.startDay}`
  );
  let lastDayOfCurrentWeek = new Date(
    `${currentWeek.endYear}/${currentWeek.endMonth}/${currentWeek.endDay}`
  );

  useEffect(() => {
    console.log("mounted");
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

  const onChangeWeek = (firstDay, lastDay) => {
    setCurrentWeek(firstAndLastDayOfTheWeek(firstDay));
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
    setSelectedYear(new Date().getFullYear());
    const year = new Date().getFullYear();
    if (selectedView === "Month") {
      onChangeMonth(months[new Date().getMonth()], year);
    } else if (selectedView === "Week") {
      const today = firstAndLastDayOfTheWeek(new Date());
      firstDayOfCurrentWeek = new Date(
        `${today.startYear}/${today.startMonth}/${today.startDay}`
      );
      let lastDayOfCurrentWeek = new Date(
        `${today.endYear}/${today.endMonth}/${today.endDay}`
      );
      onChangeWeek(firstDayOfCurrentWeek, lastDayOfCurrentWeek);
    }
  };

  const setEventStyle = (event) => {
    // timed event
    if (event.startHour && event.endHour && event.startDate === event.endDate) {
      return "task task--timed";
    }
    // past full day event
    else if (new Date(event.endDate) < new Date()) {
      return "task task--past-full-day";
    }
    // active full day event
    return "task task--active-full-day";
  };

  const displayWeeks = (currentWeek) => {
    const result =
      currentWeek.startMonth === currentWeek.endMonth
        ? `${months[currentWeek.startMonth - 1].text} ${currentWeek.startYear}`
        : `${months[currentWeek.startMonth - 1].text.slice(0, 3)} ${
            currentWeek.startYear
          } - ${months[currentWeek.endMonth - 1].text.slice(0, 3)} ${
            currentWeek.endYear
          }`;
    return result;
  };

  useEffect(() => {
    console.log("second");
    setDaysOfTheMonth(
      fillCalendarDays(
        selectedMonth.key,
        events,
        selectedYear,
        firstAndLastDayOfTheWeek(
          new Date(
            `${currentWeek.startYear}/${currentWeek.startMonth}/${currentWeek.startDay}`
          )
        ),
        selectedView
      )
    );
  }, [events, currentWeek, selectedMonth.key, selectedYear, selectedView]);

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

      <div className="dropdown">
        <button className="dropwdown-view-btn">{selectedView}</button>
        <div className="dropdown-view-content">
          {views.map((view, index) => (
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
    </div>
  );

  const weekSelector = (
    <div className="calendar-header">
      <button
        className="calendar-header-arrow-btn"
        onClick={() => handleChangePreviousWeek()}
      >
        <img src="https://i.imgur.com/2gqThFI.png" alt="left-arrow" />
      </button>

      <div className="dropdown dropbtn">{displayWeeks(currentWeek)}</div>

      <button
        className="calendar-header-arrow-btn"
        onClick={() => handleChangeNextWeek()}
      >
        <img src="https://i.imgur.com/uambqYY.png" alt="right-arrow" />
      </button>
      <button
        onClick={() => handleToday()}
        className="calendar-header-today-btn"
      >
        Today
      </button>

      <div className="dropdown">
        <button className="dropwdown-view-btn">{selectedView}</button>
        <div className="dropdown-view-content">
          {views.map((view, index) => (
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
    </div>
  );

  /**
   * Week days names ex: Monday etc
   */
  const daysOfTheWeekIndicators = daysOfTheWeek.map((dayOfTheWeek, i) =>
    selectedView === "Month" ? (
      <span key={`key-${i}`} className="day-name">
        {dayOfTheWeek}
      </span>
    ) : (
      <span key={`key-${i}`} className="day-name">
        {dayOfTheWeek} {daysOfTheMonth[i].dayNumber}
      </span>
    )
  );

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

  const onDragEndWeekView = (dragResult) => {
    const { source, destination } = dragResult;
    // if destination is not droppable or source is the same as destination, it will be kept in place
    if (!destination || destination?.droppableId === source?.droppableId) {
      return;
    }
    // make copy to make it safe to mutate, the source won't be changed
    const allDaysCurrentWeek = daysOfTheMonth.slice();
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
    setDaysOfTheMonth(allDaysCurrentWeek);
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
                    dayOfTheMonth.month - 1,
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

  const hours = Array(25)
    .fill(0)
    .map((_, index) =>
      index === 0 ? (
        <div className="dayWeekView"></div>
      ) : index - 1 < 12 ? (
        <div className="dayWeekView">{index - 1} am</div>
      ) : index - 1 === 12 ? (
        <div className="dayWeekView">{index - 1} pm</div>
      ) : (
        <div className="dayWeekView">{index - 13} pm</div>
      )
    );

  const hourCells = daysOfTheMonth.map((dayOfTheMonth, dayIndex) => {
    return (
      <section>
        <Droppable droppableId={`${dayIndex}`} key={`key-${dayIndex}`}>
          {(provided) => (
            <div
              className="dayWeekView"
              {...provided.droppableProps}
              ref={provided.innerRef}
              onClick={() => {
                handleCreate(
                  dayOfTheMonth.year,
                  dayOfTheMonth.month - 1,
                  dayOfTheMonth.dayNumber
                );
              }}
            >
              <div>{provided.placeholder}</div>
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
          )}
        </Droppable>
      </section>
    );
  });

  return selectedView === "Month" ? (
    <DragDropContext onDragEnd={onDragEndMonthView}>
      <div className="calendar-container">
        {monthSelector}
        <div className="calendar">
          {daysOfTheWeekIndicators}
          {dayCells}
        </div>
        <ModalPopUp></ModalPopUp>
      </div>
    </DragDropContext>
  ) : (
    <DragDropContext onDragEnd={onDragEndWeekView}>
      <div className="calendar-container">
        {weekSelector}
        <div className="hours-weekdays-wrapper">
          <div className="hours">
            <div className="day-name"></div>
            {hours}
          </div>
          <div className="calendarWeekView">
            {daysOfTheWeekIndicators}
            {hourCells}
          </div>
        </div>
        <ModalPopUp></ModalPopUp>
      </div>
    </DragDropContext>
  );
};

export default CoursesCalendar;
