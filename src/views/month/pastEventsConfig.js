export const pastEventsConfig = (year, month, dayNumber, events) => {
  const currentDay = new Date(year, month - 1, dayNumber).setDate(
    new Date(year, month - 1, dayNumber).getDate() - 1
  );
  const a = events.filter(
    (event) =>
      (new Date(event.startDate).getDate() === new Date(currentDay).getDate() ||
        new Date(event.endDate).getDate() === new Date(currentDay).getDate() ||
        (new Date(event.startDate).getDate() < new Date(currentDay).getDate() &&
          new Date(event.endDate).getDate() >
            new Date(currentDay).getDate())) &&
      new Date(event.startDate).getMonth() ===
        new Date(currentDay).getMonth() &&
      new Date(event.startDate).getFullYear() ===
        new Date(currentDay).getFullYear()
  );
  return a;
};
