import React from "react";
import Hour from "./Hour";

const Hours = ({ weekHours, handleCreate, handleEdit, eventsMatrix, weekEventsMatrix }) => {
  return weekHours.map((hour, hourIndex) => (
    <Hour {...{ hourIndex, handleCreate, hour, handleEdit, eventsMatrix, weekEventsMatrix }} key={hourIndex} />
  ));
};

export default Hours;