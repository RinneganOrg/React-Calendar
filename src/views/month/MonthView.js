import React, { useState, useEffect } from "react";
import ViewSelector from "../ViewSelector";
import { DragDropContext } from "react-beautiful-dnd";
import { DAYS_OF_THE_WEEK_MONTH_VIEW, MONTHS } from "../../constants";
import Days from "./Days";
import { makeIntervalToFetchMonthEvents } from "./makeIntervalToFetchMonthEvents";
import { fillCalendarDays } from "./fillCalendarDays";
import moment from "moment";
import { removeDraggedEvent, addDroppedEvent } from "../helpers";
import { makeInterval } from "../week/makeInterval";
import eventsMatrix from "./eventsMatrix";

const Month = ({
  viewNames,
  setSelectedView,
  ModalPopUp,
  handleEdit,
  normalEvents,
  recursiveEvents,
  fetchEventsByInterval,
  editEventData,
  handleOpenModal,
  makeDefaultEvent,
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setCurrentMonth] = useState(
    MONTHS[new Date().getMonth()]
  );
  const [allEvents, setAllEvents] = useState([]);
  // const [selectedInterval, setSelectedInterval] = useState(
  //   makeIntervalToFetchMonthEvents(selectedMonth, selectedYear, allEvents)
  // );

  useEffect(() => {
    const selectedInterval = makeIntervalToFetchMonthEvents(
      selectedMonth,
      selectedYear,
      allEvents
    );
    console.log("selected Interval", new Date(selectedInterval.startDate))
    
    const startDateEventStartDateIntervalDiff = (interval, event) => {
      const intervalStartTime = new Date(interval.startDate).getTime();
      const eventStartTime = new Date(event.startDate).getTime();
      const result = (intervalStartTime - eventStartTime) / (1000 * 3600 * 24);
      // return result > -7 ? result : -7;
      return result;
    };

    const currentEventWeekIndex = (event) => {
      const result =
        new Date(event.startDate).getDay() === 0
          ? 6
          : new Date(event.startDate).getDay() - 1;
      return result;
    };

    const startDateEndDateDiff = (event) => {
      const result =
        (new Date(event.endDate).getTime() -
          new Date(event.startDate).getTime()) /
        (1000 * 3600 * 24);
      return result;
    };

    const calc = (event) => {
      const eventStartDate = new Date(event.startDate);
      if (event.recursive === "weekly") {
        eventStartDate.setTime(
          eventStartDate.getTime() +
            (startDateEventStartDateIntervalDiff(selectedInterval, event) +
              currentEventWeekIndex(event)) *
              24 *
              3600 *
              1000
        );
        eventStartDate.setTime(eventStartDate.getTime() + 24 * 3600 * 1000);
      } else if (event.recursive === "monthly") {
        eventStartDate.setTime(
          eventStartDate.getTime() +
            (startDateEventStartDateIntervalDiff(selectedInterval, event) +
              currentEventWeekIndex(event)) *
              24 *
              3600 *
              1000
        );
        const intervalMonth =
          new Date(selectedInterval.startDate).getDate() === 1
            ? new Date(selectedInterval.startDate).getMonth()
            : new Date(selectedInterval.startDate).getMonth() === 11
            ? 0
            : new Date(selectedInterval.startDate).getMonth() + 1;
        eventStartDate.setMonth(intervalMonth);
      } else if (event.recursive === "annually") {
        const intervalYear =
          new Date(selectedInterval.startDate).getDate() === 1 ||
          new Date(eventStartDate).getMonth() ===
            new Date(selectedInterval.startDate).getMonth()
            ? new Date(selectedInterval.startDate).getFullYear()
            : new Date(selectedInterval.startDate).getMonth() === 11
            ? new Date(selectedInterval.startDate).getFullYear() + 1
            : new Date(selectedInterval.startDate).getFullYear();
        eventStartDate.setFullYear(intervalYear);
      }

      return (
        new Date(event.startDate).getTime() <
          new Date(selectedInterval.endDate).getTime() &&
        new Date(selectedInterval.startDate).getTime() <
          new Date(eventStartDate).getTime() &&
        new Date(eventStartDate).getTime() <
          new Date(selectedInterval.endDate).getTime()
      );
    };

    const relevantRecursiveEvents = recursiveEvents.filter((event) =>
      calc(event)
    );

    const makeStartDate = (currentEvent) => {
      const eventStartDate = new Date(currentEvent.startDate);
      const eventEndDate = new Date(currentEvent.endDate);

      eventStartDate.setTime(
        eventStartDate.getTime() +
          (startDateEventStartDateIntervalDiff(selectedInterval, currentEvent) >
          0
            ? startDateEventStartDateIntervalDiff(
                selectedInterval,
                currentEvent
              ) + currentEventWeekIndex(currentEvent)
            : 0) *
            24 *
            3600 *
            1000
      );
      return { eventStartDate, eventEndDate };
    };

    const recursiveFunctions = {
      weekly(currentEvent) {
        const { eventStartDate, eventEndDate } = makeStartDate(currentEvent);
        const generatedRecursiveEvents = [];
        eventStartDate.setTime(eventStartDate.getTime());
        eventEndDate.setTime(
          eventStartDate.getTime() +
            startDateEndDateDiff(currentEvent) * 24 * 3600 * 1000
        );
        generatedRecursiveEvents.push({
          ...currentEvent,
          startDate: moment(eventStartDate).format("YYYY-MM-DD"),
          endDate: moment(eventEndDate).format("YYYY-MM-DD"),
        });
        do {
          eventStartDate.setTime(
            eventStartDate.getTime() + 7 * 24 * 3600 * 1000
          );
          // By default, the time is set to 00:00, but in the last weekend of every october the clocks are set back one hour (and that would put the events on the previous day, if we don't change the default hour)
          eventStartDate.setHours(1,0,0,0);
          eventEndDate.setTime(
            eventStartDate.getTime() +
              startDateEndDateDiff(currentEvent) * 24 * 3600 * 1000
          );
          console.log({eventStartDate})
          generatedRecursiveEvents.push({
            ...currentEvent,
            startDate: moment(eventStartDate).format("YYYY-MM-DD"),
            endDate: moment(eventEndDate).format("YYYY-MM-DD"),
          });
        } while (
          new Date(selectedInterval.startDate).getTime() <
            new Date(eventStartDate).getTime() &&
          new Date(eventStartDate).getTime() <
            new Date(selectedInterval.endDate).getTime()
        );
        return generatedRecursiveEvents;
      },
      monthly(currentEvent) {
        const eventStartDate = new Date(currentEvent.startDate);
        const eventEndDate = new Date(currentEvent.endDate);
        const intervalStartDate = new Date(selectedInterval.startDate);
        const intervalMonthAndYear =
          intervalStartDate.getDate() === 1
            ? {
                month: intervalStartDate.getMonth(),
                year: intervalStartDate.getFullYear(),
              }
            : intervalStartDate.getMonth() === 11
            ? { month: 0, year: intervalStartDate.getFullYear() + 1 }
            : {
                month: intervalStartDate.getMonth() + 1,
                year: intervalStartDate.getFullYear(),
              };
        eventStartDate.setMonth(intervalMonthAndYear.month);
        eventStartDate.setFullYear(intervalMonthAndYear.year);

        eventEndDate.setTime(
          eventStartDate.getTime() +
            startDateEndDateDiff(currentEvent) * 24 * 3600 * 1000
        );
        return [
          {
            ...currentEvent,
            startDate: moment(eventStartDate).format("YYYY-MM-DD"),
            endDate: moment(eventEndDate).format("YYYY-MM-DD"),
          },
        ];
      },
      annually(currentEvent) {
        const eventStartDate = new Date(currentEvent.startDate);
        const eventEndDate = new Date(currentEvent.endDate);
        const intervalStartDate = new Date(selectedInterval.startDate);

        const intervalYear =
          intervalStartDate.getDate() === 1 ||
          new Date(eventStartDate).getMonth() === intervalStartDate.getMonth()
            ? intervalStartDate.getFullYear()
            : intervalStartDate.getMonth() === 11
            ? intervalStartDate.getFullYear() + 1
            : intervalStartDate.getFullYear();

        eventStartDate.setFullYear(intervalYear);
        eventEndDate.setTime(
          eventStartDate.getTime() +
            startDateEndDateDiff(currentEvent) * 24 * 3600 * 1000
        );

        return [
          {
            ...currentEvent,
            startDate: moment(eventStartDate).format("YYYY-MM-DD"),
            endDate: moment(eventEndDate).format("YYYY-MM-DD"),
          },
        ];
      },
    };

    const allRecursiveEvents = relevantRecursiveEvents.reduce(
      (acc, currentEvent) => {
        return [
          ...acc,
          ...recursiveFunctions[currentEvent.recursive](currentEvent),
        ];
      },
      []
    );

    console.log({ relevantRecursiveEvents, allRecursiveEvents });
    setAllEvents([...normalEvents, ...allRecursiveEvents]);
  }, [normalEvents, recursiveEvents]);

  const updateEventDatesMonthView = (
    eventToMove,
    destinationDay,
    editEventData
  ) => {
    const { id, title, startHour, endHour } = eventToMove;
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
    return editEventData({ id, title, startDate, endDate, startHour, endHour });
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

  const daysOfTheWeekIndicators = DAYS_OF_THE_WEEK_MONTH_VIEW.map(
    (dayOfTheWeek, i) => (
      <span key={`key-${i}`} className="day-name">
        {dayOfTheWeek}
      </span>
    )
  );

  const [daysOfTheMonth, setDaysOfTheMonth] = useState(
    fillCalendarDays(new Date().getMonth(), allEvents, selectedYear)
  );
  const [eventsMatrixState, setEventsMatrixState] = useState(
    eventsMatrix(allEvents)
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
      makeIntervalToFetchMonthEvents(monthSelection, year, [])
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
      makeIntervalToFetchMonthEvents(selectedMonth, selectedYear, [])
    );
  }, []);

  useEffect(() => {
    setDaysOfTheMonth(
      fillCalendarDays(selectedMonth.key, allEvents, selectedYear)
    );
  }, [allEvents, selectedMonth.key, selectedYear]);

  useEffect(() => {
    setEventsMatrixState(eventsMatrix(allEvents));
  }, [allEvents]);
  console.log({eventsMatrixState})

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
            <Days
              {...{
                daysOfTheMonth,
                handleCreate,
                handleEdit,
                eventsMatrix: eventsMatrixState,
              }}
            />
          </div>
          <ModalPopUp />
        </div>
      </DragDropContext>
    </div>
  );
};

export default Month;
