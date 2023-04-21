const startDateEventStartDateIntervalDiff = (interval, event) => {
  const intervalStartTime = new Date(interval.startDate).getTime();
  const eventStartTime = new Date(event.startDate).getTime();
  const result = (intervalStartTime - eventStartTime) / (1000 * 3600 * 24);
  // return result > -7 ? result : -7;
  return result;
};

const currentEventWeekIndex = (event) => {
  const result =
    new Date(event.startDate).getDay() === 0
      ? 6
      : new Date(event.startDate).getDay() - 1;
  return result;
};

export const recursiveEventsInInterval = (event, selectedInterval) => {
  const eventStartDate = new Date(event.startDate);
  if (event.recursive === "weekly") {
    eventStartDate.setTime(
      eventStartDate.getTime() +
        (startDateEventStartDateIntervalDiff(selectedInterval, event) +
          currentEventWeekIndex(event)) *
          24 *
          3600 *
          1000
    );
    eventStartDate.setTime(eventStartDate.getTime() + 24 * 3600 * 1000);
  } else if (event.recursive === "monthly") {
    eventStartDate.setTime(
      eventStartDate.getTime() +
        (startDateEventStartDateIntervalDiff(selectedInterval, event) +
          currentEventWeekIndex(event)) *
          24 *
          3600 *
          1000
    );
    const intervalMonth =
      new Date(selectedInterval.startDate).getDate() === 1
        ? new Date(selectedInterval.startDate).getMonth()
        : new Date(selectedInterval.startDate).getMonth() === 11
        ? 0
        : new Date(selectedInterval.startDate).getMonth() + 1;
    eventStartDate.setMonth(intervalMonth);
  } else if (event.recursive === "annually") {
    const intervalYear =
      new Date(selectedInterval.startDate).getDate() === 1 ||
      new Date(eventStartDate).getMonth() ===
        new Date(selectedInterval.startDate).getMonth()
        ? new Date(selectedInterval.startDate).getFullYear()
        : new Date(selectedInterval.startDate).getMonth() === 11
        ? new Date(selectedInterval.startDate).getFullYear() + 1
        : new Date(selectedInterval.startDate).getFullYear();
    eventStartDate.setFullYear(intervalYear);
  }

  return (
    new Date(event.startDate).getTime() <
      new Date(selectedInterval.endDate).getTime() &&
    new Date(selectedInterval.startDate).getTime() <
      new Date(eventStartDate).getTime() &&
    new Date(eventStartDate).getTime() <
      new Date(selectedInterval.endDate).getTime()
  );
};
