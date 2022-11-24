import React from 'react'
import { Draggable, Droppable } from "react-beautiful-dnd";
import { eventStyle } from "../helpers";

const Hour = ({hourIndex, handleCreate, hour, handleEdit}) => {
  return (
    <section key={hourIndex}>
      <Droppable droppableId={`${hourIndex}`}>
        {(provided) => (
          <div
            className="dayWeekView"
            {...provided.droppableProps}
            ref={provided.innerRef}
            onClick={() => {
              handleCreate(
                hour.year,
                hour.month - 1,
                hour.dayNumber,
                hour.hour
              );
            }}
          >
            <div>{provided.placeholder}</div>
            {hour.events.map((event, eventIndex) => (
              <Draggable
                key={eventIndex}
                draggableId={`day-${hour.dayNumber}-${event.id}`}
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
        )}
      </Droppable>
    </section>
  );
}

export default Hour