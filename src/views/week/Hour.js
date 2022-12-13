import React, { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { eventStyle } from "../helpers";
import moment from "moment";

const Hour = ({
  hourIndex,
  handleCreate,
  hour,
  handleEdit,
  eventsMatrix,
  weekEventsMatrix,
}) => {
  const date = moment(`${hour.year}, ${hour.month}, ${hour.dayNumber}`).format(
    "YYYY-MM-DD"
  );

  const highestIndexWithoutHour = () => {
    const res = eventsMatrix[date]
      ? parseInt(Object.keys(eventsMatrix[date]).sort().reverse()[0])
      : 0;
    return res;
  };

  const highestIndexWithHour = () => {
    const res = weekEventsMatrix[date]
      ? parseInt(Object.keys(weekEventsMatrix[date]).sort().reverse()[0])
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

  const hourIndicatiors = (hour) => {
    return hour >= 0 && `${moment(hour, "HH").format("HH")}:00`;
  };

  const displayHourAndEventTitle = (event) => {
    return event.endHour
      ? `${event.startHour}-${event?.endHour} ${event.title}`
      : `${event.startHour} ${event.title}`;
  };

  const eventsListWithoutHour = hour.events ? (
    hour.events.length === 0 ? (
      []
    ) : (
      Array(highestIndexWithoutHour() + 1)
        .fill(0)
        .map((_, index) => {
          const indexEvent = hour.events
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
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
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
            <section key={`key-${index}`} className="empty-cell"></section>
          );
        })
    )
  ) : (
    <div></div>
  );

  const eventsListWithHour = hour.events ? (
    hour.events.length === 0 ? (
      []
    ) : (
      Array(highestIndexWithHour() + 1)
        .fill(0)
        .map((_, index) => {
          const indexEvent = hour.events
            .map((event) => event.id)
            .indexOf(weekEventsMatrix[date]?.[index]?.id);
          return indexEvent > -1 ? (
            <Draggable
              key={`key-${index}`}
              draggableId={`day-${weekEventsMatrix[date][index].id}`}
              index={indexEvent}
            >
              {(provided) => (
                <section
                  key={`key-ev-${index}`}
                  onClick={() => {
                    handleEdit(weekEventsMatrix[date][index].id);
                  }}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <div
                    className={eventStyle(weekEventsMatrix[date][index])}
                    style={{
                      width: `${makeEventWidth(
                        weekEventsMatrix[date][index]
                      )}%`,
                    }}
                  >
                    {displayHourAndEventTitle(weekEventsMatrix[date][index])}
                  </div>
                </section>
              )}
            </Draggable>
          ) : (
            <section key={`key-${index}`} className="empty-cell"></section>
          );
        })
    )
  ) : (
    <div className="dayWeekView">{hourIndicatiors(hour.hour)}</div>
  );

  const res = hour.events ? (
    hour.hour < 0 ? (
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
            {eventsListWithoutHour}
          </div>
        )}
      </Droppable>
    ) : (
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
              {eventsListWithHour}
            </div>
          )}
        </Droppable>
      </section>
    )
  ) : (
    eventsListWithHour
  );
  return res;
};

export default Hour;
