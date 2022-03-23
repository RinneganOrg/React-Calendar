import './coursesCalendar.css';
import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

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
  { key: 11, daysInMonth: 31, value: 12, text: "December" }
];
const daysOfTheWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const allEvents = [
  {id: 'project', content: 'Projects', className: 'task task--warning'},
  {id: 'design-sprint', content: 'Design Sprint', className: 'task task--danger'},
  {id: 'product-checkup', content: 'Product Checkup 1', className: 'task task--primary'},
]

/**
 * Will make an array containing last days of previous month, all days of current month and first days of next month
 * depending on when does the first/last day of current month occur during week 
 * (if 1 is Monday => no previous month days, 31 is Sunday => no next month days)
 * @param {Number} selectedMonthIndex 
 * @returns 
 */
const fillCalendarDays = (selectedMonthIndex) => {
  let selectedMonthItem = months[selectedMonthIndex];

  const selectedMonthDays1 = Array(selectedMonthItem.daysInMonth)
    .fill(0)
    .map((day, i) => ({
      dayNumber: i + 1,
      class: "day",
      month: selectedMonthIndex + 1,
      events: []
    }))

    const [day1, day2, ...rest] = selectedMonthDays1;
    const selectedMonthDays2 = {...day1, events: allEvents.slice(0, 1 + Math.floor(Math.random() * 3))};
    const selectedMonthDays3 = {...day2, events: allEvents.slice(0, 1 + Math.floor(Math.random() * 3))};
    const selectedMonthDays = [selectedMonthDays2, selectedMonthDays3, ...rest];

  let firstDayOfTheMonthDate = `${selectedMonthIndex + 1} 1 2022`;
  let firstDayOfTheMonthWeekIndex = new Date(firstDayOfTheMonthDate).getDay();

  const previousMonthDisabledDays = Array(
    firstDayOfTheMonthWeekIndex === 0 ? 6 : firstDayOfTheMonthWeekIndex - 1 // Sunday is 0 Saturday is 6
  )
    .fill(0)
    .map((previousMonthDisabledDay, i) => {
      const previousMonth = selectedMonthIndex > 0 ? months[selectedMonthIndex - 1] : months[11]; // if current month is Jan previous month is Dec

      return {
        dayNumber: previousMonth.daysInMonth - i,
        class: "day day--disabled",
        month: selectedMonthIndex,
        events: []
      }
    });

  let lastDayOfTheMonthDate = `${selectedMonthIndex + 1} ${selectedMonthItem.daysInMonth} 2022`;
  let lastDayOfTheMonthWeekIndex = new Date(lastDayOfTheMonthDate).getDay();

  let nextMonthDisabledDays = Array(7 - lastDayOfTheMonthWeekIndex)
    .fill(0)
    .map((nextMonthDisabledDay, i) => ({
      dayNumber: i + 1,
      class: "day day--disabled",
      month: selectedMonthIndex + 2,
      events: []
    }));

  const result = [
    ...previousMonthDisabledDays.reverse(),
    ...selectedMonthDays,
    ...nextMonthDisabledDays
  ];
  return result;
};

const CoursesCalendar = ({ gymId, userId }) => {
  const [selectedMonth, setCurrentMonth] = useState(
    months[new Date().getMonth()]
  );
  const [daysOfTheMonth, setDaysOfTheMonth] = useState(
    fillCalendarDays(new Date().getMonth())
  );

  const onChangeMonth = (monthSelection) => {
    setCurrentMonth(monthSelection);
    setDaysOfTheMonth(fillCalendarDays(monthSelection.key));
  };

  const monthRadioSelector = (
    <>
      <div className="calendar-header">
        <h1>
          {selectedMonth.text}
          <button>▾</button>
        </h1>
        <p>2022</p>
      </div>
      <div>
        {months.map((month, i) => (
          <span key={`key-${month.key}`}>
            <input
              type="radio"
              value={month.key}
              name="gender"
              checked={month.key === selectedMonth.key}
              onChange={() => onChangeMonth(month)}
            />
            {`${month.text} `}
          </span>
        ))}
      </div>
    </>)
  /**
   * Week days names ex: Monday etc
   */
  const daysOfTheWeekIndicators = daysOfTheWeek.map((dayOfTheWeek, i) => (
    <span key={`key-${i}`} className="day-name">
      {dayOfTheWeek}
    </span>
  ))
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
  
    //remove dragged event from source
    const sourceDay = allDaysCurrentMonth[source.droppableId];
    const eventToMove = sourceDay.events[source.index];
    const updatedSourceEvents = [
      ...sourceDay.events.slice(0, source.index),
      ...sourceDay.events.slice(source.index+1)
    ];

    // add dropped event to destination at desired position
    const destinationDay = allDaysCurrentMonth[destination.droppableId];
    const updatedDestinationEvents = [
      ...destinationDay.events.slice(0, destination.index),
      eventToMove,
      ...destinationDay.events.slice(destination.index)
    ];

    // replacing item in array is safe to mutate, 
    // it won't change the original source
    allDaysCurrentMonth[source.droppableId] = {
      ...sourceDay,
      events: updatedSourceEvents
    };

    allDaysCurrentMonth[destination.droppableId] = {
      ...destinationDay,
      events: updatedDestinationEvents
    };

    setDaysOfTheMonth(allDaysCurrentMonth);
  }

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
            {dayOfTheMonth.dayNumber}
            {provided.placeholder}
            {dayOfTheMonth.events.map((event, eventIndex) => (
              <Draggable key={`key-${eventIndex}`} draggableId={`day-${dayOfTheMonth.dayNumber}-${event.id}`} index={eventIndex}>
                {(provided, snapshot) => (
                  <section
                    className={event.className}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {event.content}
                  </section>
                )}
              </Draggable>
            ))}
          </div>
        </section>
      )}
    </Droppable>
  )})

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="calendar-container">
        {monthRadioSelector}
        <div className="calendar">
          {daysOfTheWeekIndicators}
          {dayCells}
        </div>
      </div>
    </DragDropContext>
  );
};

export default CoursesCalendar;
