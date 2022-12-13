import React from "react";
import Day from "./Day";

const Days = ({ daysOfTheMonth, handleCreate, handleEdit, eventsMatrix }) => {
  return daysOfTheMonth.map((dayOfTheMonth, dayIndex) => (
    <Day
      {...{ dayIndex, dayOfTheMonth, handleCreate, handleEdit, eventsMatrix }}
      key={dayIndex}
    />
  ));
};

export default Days;
