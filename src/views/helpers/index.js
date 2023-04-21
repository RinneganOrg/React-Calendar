import moment from "moment";

export const eventStyle = (event) => {
  // timed event
  if (event.startHour && event.endHour && event.startDate === event.endDate) {
    return "task task--timed";
  }
  // past full day event
  else if (new Date(event.endDate) < new Date()) {
    return "task task--past-full-day";
  }
  // active full day event
  return "task task--active-full-day";
};

//remove dragged event from source
export const removeDraggedEvent = (sourceDay, source) => {
  // if (sourceDay.events[source.index].recursive !== "no") {
  //   sourceDay.events[source.index]["endDateRecursive"] = moment([
  //     sourceDay.year,
  //     sourceDay.month - 1,
  //     sourceDay.dayNumber,
  //   ]).format("YYYY-MM-DD");
  // }
  return [
        ...sourceDay.events.slice(0, source.index),
        ...sourceDay.events.slice(source.index + 1),
      ]
    ;
};

// add dropped event to destination at desired position
export const addDroppedEvent = (destinationDay, eventToMove, destination) => {
  return [
    ...destinationDay.events.slice(0, destination.index),
    eventToMove,
    ...destinationDay.events.slice(destination.index),
  ];
};
