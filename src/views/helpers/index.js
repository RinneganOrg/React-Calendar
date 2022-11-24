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

  // // 3 days
  // if(new Date(event.endDate).getDate() - new Date(event.startDate).getDate() === 2) {
  //   return "task event-3-days task--active-full-day"
  // }
  // // 2 days
  // if(new Date(event.endDate).getDate() - new Date(event.startDate).getDate() === 1) {
  //   return "task event-2-days task--active-full-day"
  // }
  // // 1 day
  // if(new Date(event.endDate).getDate() - new Date(event.startDate).getDate() === 0) {
  //   return "task task--active-full-day"
  // }
};

 //remove dragged event from source
export const removeDraggedEvent = (sourceDay, source) => {
  return [
    ...sourceDay.events.slice(0, source.index),
    ...sourceDay.events.slice(source.index + 1),
  ];
};

// add dropped event to destination at desired position
export const addDroppedEvent = (destinationDay, eventToMove, destination) => {
  return [
    ...destinationDay.events.slice(0, destination.index),
    eventToMove,
    ...destinationDay.events.slice(destination.index),
  ];
};
