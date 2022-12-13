import React from "react";
import { eventStyle } from "../helpers";
import moment from "moment";

const Popup = ({
  events,
  setIsOpen,
  dayForPopUp,
  monthForPopUp,
  yearForPopUp,
  handleEdit,
}) => {
  const monthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("en-US", {
      month: "short",
    });
  };
  const date = new Date(
    moment(`${yearForPopUp}-${monthForPopUp}-${dayForPopUp}`).format(
      "YYYY-MM-DD"
    )
  );
  date.setUTCHours(0, 0, 0, 0);

  const eventFromPreviousDay = (event) => {
    return new Date(event.endDate) < new Date()
      ? new Date(event.startDate) < new Date(date) && (
          <div className="triangle-left-past"></div>
        )
      : new Date(event.startDate) < new Date(date) && (
          <div className="triangle-left-active"></div>
        );
  };

  const eventExtendedToNextDay = (event) => {
    return new Date(event.endDate) < new Date()
      ? new Date(event.endDate) > new Date(date) && (
          <div className="triangle-right-past"></div>
        )
      : new Date(event.endDate) > new Date(date) && (
          <div className="triangle-right-active"></div>
        );
  };

  return (
    <div className="popup-box" onClick={() => setIsOpen(false)}>
      <div className="box" onClick={(e) => e.stopPropagation()}>
        <button className="pop-up-close-btn" onClick={() => setIsOpen(false)}>
          ⨉
        </button>
        <p className="pop-up-month">
          {monthName(monthForPopUp).toUpperCase()}.
        </p>
        <p className="pop-up-day"> {dayForPopUp}</p>
        {events.map((event, index) => {
          return (
            <div className="line-up" key={index}>
              {eventFromPreviousDay(event)}
              <div
                key={index}
                className={`${eventStyle(event)} pop-up-event`}
                onClick={() => handleEdit(event.id)}
                style={{ borderRadius: "0px" }}
              >
               {event?.startHour} {event.title}
              </div>
              {eventExtendedToNextDay(event)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Popup;
