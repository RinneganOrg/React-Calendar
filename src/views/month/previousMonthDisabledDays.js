import { MONTHS } from "../../constants";
import { makeEventsForDay } from "./makeEventsForDay";

export const previousMonthDisabledDays = (
  selectedMonthIndex,
  selectedYear,
  events
) => {
  let firstDayOfTheMonthDate = `${selectedMonthIndex + 1} 1 ${selectedYear}`;
  let firstDayOfTheMonthWeekIndex = new Date(firstDayOfTheMonthDate).getDay();
  console.log({ selectedMonthIndex });
  const previousMonthDisabledDays = Array(
    firstDayOfTheMonthWeekIndex === 0 ? 6 : firstDayOfTheMonthWeekIndex - 1 // Sunday is 0 Saturday is 6
  )
    .fill(0)
    .map((_, index) => {
      // check leap year
      const previousMonth =
        selectedMonthIndex > 0 && selectedMonthIndex !== 2
          ? MONTHS[selectedMonthIndex - 1]
          : selectedMonthIndex === 2
          ? selectedYear % 4 === 0
            ? { key: 1, daysInMonth: 29, value: 2, text: "February" }
            : { key: 1, daysInMonth: 28, value: 2, text: "February" }
          : MONTHS[11]; // if current month is Jan previous month is Dec

      const year = selectedMonthIndex > 0 ? selectedYear : selectedYear - 1;
      const month = selectedMonthIndex > 0 ? selectedMonthIndex : 12;
      const dayNumber = previousMonth.daysInMonth - index;
      const result = {
        year,
        month,
        events: makeEventsForDay(year, month, dayNumber, events),
        class: "day day--disabled",
        dayNumber,
      };

      return result;
    })
    .reverse();

  return previousMonthDisabledDays;
};
