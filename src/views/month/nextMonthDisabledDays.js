import { makeEventsForDay } from "./makeEventsForDay";

export const nextMonthDisabledDays = (
  selectedMonthItem,
  selectedMonthIndex,
  selectedYear,
  events
) => {
  let lastDayOfTheMonthDate = `${selectedMonthIndex + 1} ${
    selectedMonthItem.daysInMonth
  } ${selectedYear}`;
  let lastDayOfTheMonthWeekIndex = new Date(lastDayOfTheMonthDate).getDay();
  const nextMonthDisabledDays = Array(7 - lastDayOfTheMonthWeekIndex)
    .fill(0)
    .map((_, index) => {
      const year = selectedMonthIndex < 11 ? selectedYear : selectedYear + 1;
      const month = selectedMonthIndex < 11 ? selectedMonthIndex + 2 : 1;
      const dayNumber = index + 1;

      const result = {
        year,
        month,
        dayNumber,
        class: "day day--disabled",
        events: makeEventsForDay(dayNumber, year, month, events),
      };

      return result;
    });

  return nextMonthDisabledDays;
};
