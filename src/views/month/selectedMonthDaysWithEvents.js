import { makeEventsForDay } from "./makeEventsForDay";

export const selectedMonthDaysWithEvents = (
  selectedMonthItem,
  selectedYear,
  selectedMonthIndex,
  events
) => {
  const selectedMonthDays = Array(selectedMonthItem.daysInMonth)
    .fill(0)
    .map((_, index) => {
      const year = selectedYear;
      const month = selectedMonthIndex + 1;
      const dayNumber = index + 1;

      const result = {
        year,
        month,
        dayNumber,
        class: "day",
        events: makeEventsForDay(year, month, dayNumber, events),
      };

      return result;
    });
  return selectedMonthDays;
};
