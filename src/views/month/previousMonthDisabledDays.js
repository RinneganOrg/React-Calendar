import { MONTHS } from "../../constants";
import { makeEventsForDay } from "./makeEventsForDay";

export const previousMonthDisabledDays = (
  selectedMonthIndex,
  selectedYear,
  events
) => {
  let firstDayOfTheMonthDate = `${selectedMonthIndex + 1} 1 ${selectedYear}`;
  let firstDayOfTheMonthWeekIndex = new Date(firstDayOfTheMonthDate).getDay();
  const previousMonthDisabledDays = Array(
    firstDayOfTheMonthWeekIndex === 0 ? 6 : firstDayOfTheMonthWeekIndex - 1 // Sunday is 0 Saturday is 6
  )
    .fill(0)
    .map((_, index) => {
      const previousMonth =
        selectedMonthIndex > 0 ? MONTHS[selectedMonthIndex - 1] : MONTHS[11]; // if current month is Jan previous month is Dec

      const year = selectedMonthIndex > 0 ? selectedYear : selectedYear - 1;
      const month = selectedMonthIndex > 0 ? selectedMonthIndex : 12;
      const dayNumber = previousMonth.daysInMonth - index;

      const result = {
        year,
        month,
        events: makeEventsForDay(dayNumber, year, month, events),
        class: "day day--disabled",
        dayNumber,
      };

      return result;
    })
    .reverse();

  return previousMonthDisabledDays;
};
