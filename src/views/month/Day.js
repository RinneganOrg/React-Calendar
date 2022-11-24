import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { eventStyle } from "../helpers";
import moment from "moment";

const Day = ({
  dayIndex,
  dayOfTheMonth,
  handleCreate,
  handleEdit,
  eventsMatrix,
}) => {
  const date = moment(
    `${dayOfTheMonth.year}, ${dayOfTheMonth.month}, ${dayOfTheMonth.dayNumber}`
  ).format("YYYY-MM-DD");

  const highestIndex = () => {
    const res = eventsMatrix[date]
      ? parseInt(Object.keys(eventsMatrix[date]).sort().reverse()[0])
      : 0;
    return res;
  };
  const makeEventWidth = (event) => {
    const width =
      (new Date(event.endDate).getDate() -
        new Date(event.startDate).getDate() +
        1) *
        100 +
      5.5 *
        (new Date(event.endDate).getDate() -
          new Date(event.startDate).getDate());
    return width;
  };
// console.log({eventsMatrix})
  const eventsList =
    dayOfTheMonth.events.length === 0
      ? []
      : Array(highestIndex() + 1)
          .fill(0)
          .map((_, index) => {
            const indexEvent = dayOfTheMonth.events
              .map((event) => event.id)
              .indexOf(eventsMatrix[date]?.[index]?.id);
            return indexEvent > -1 ? (
              <Draggable
                key={`key-${index}`}
                draggableId={`day-${eventsMatrix[date][index].id}`}
                index={indexEvent}
              >
                {(provided) => (
                  <section
                    key={`key-ev-${index}`}
                    onClick={() => {
                      handleEdit(eventsMatrix[date][index].id);
                    }}
                    // className={eventStyle(eventsMatrix[date][index])}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    // style={{width: "300px"}}
                    // style={{"--my-custom": "300px"}}
                  >
                    <div
                      className={eventStyle(eventsMatrix[date][index])}
                      style={{
                        width: `${makeEventWidth(eventsMatrix[date][index])}%`,
                      }}
                    >
                      {eventsMatrix[date][index].title}
                    </div>
                  </section>
                )}
              </Draggable>
            ) : (
              <section key={`key-${index}`} className="empty-cell">
               
              </section>
            );
          });

  return (
    <Droppable droppableId={`${dayIndex}`} key={`key-drop-${dayIndex}`}>
      {(provided) => (
        <section
          key={`section-${dayIndex}`}
          className={dayOfTheMonth.class}
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          <div key={`key-${dayIndex}`}>
            <div
              key={`key-div-${dayIndex}`}
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
            {eventsList}
            {/* {dayOfTheMonth.events.map((event, eventIndex) => (
              <Draggable
                key={`key-${eventIndex}`}
                draggableId={`day-${dayOfTheMonth.dayNumber}-${event.id}`}
                index={eventIndex}
                // index={parseInt(
                //   Object.keys(eventsMatrix[event.startDate]).find(
                //     (key) => eventsMatrix[event.startDate][key].id === event.id
                //   )
                // )}
              >
                {(provided) => (
                  // fct(event, provided)
                  <section
                    onClick={() => {
                      handleEdit(event.id);
                    }}
                    className={eventStyle(event)}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {event.startHour} {event.title}
                  </section>
                )}
              </Draggable>
            ))} */}
          </div>
        </section>
      )}
    </Droppable>
  );
};

export default Day;
