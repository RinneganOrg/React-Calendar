import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { eventStyle } from "../helpers";

const Days = ({daysOfTheMonth, handleCreate, handleEdit}) => {
  return daysOfTheMonth.map((dayOfTheMonth, dayIndex) => {
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
                      className={eventStyle(event)}
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
};

export default Days;
