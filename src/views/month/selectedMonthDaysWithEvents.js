import { makeEventsForDay } from "./makeEventsForDay";
import { pastEventsConfig } from "./pastEventsConfig";

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
        pastEventsConfig: pastEventsConfig(year, month, dayNumber, events),
        events: makeEventsForDay(year, month, dayNumber, events),
      };

      return result;
    });
  return selectedMonthDays;
};
