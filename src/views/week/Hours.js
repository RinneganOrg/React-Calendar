import React from "react";
import Hour from "./Hour";

const Hours = ({ weekHours, handleCreate, handleEdit, eventsMatrix }) => {
  console.log({weekHours})
  return weekHours.map((hour, hourIndex) => (
    <Hour {...{ hourIndex, handleCreate, hour, handleEdit, eventsMatrix }} key={hourIndex} />
  ));
};

export default Hours;
