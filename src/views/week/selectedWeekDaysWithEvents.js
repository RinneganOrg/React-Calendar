import { makeEventsForHour } from "./makeEventsForHour";

export const selectedWeekDaysWithEvents = (selectedWeek, events) => {
  const selectedWeekDays = Array(175)
    .fill(0)
    .map((_, index) => {
      const currentMonthNoOfDays = new Date(
        selectedWeek.startYear,
        selectedWeek.startMonth,
        0
      ).getDate();
      // TODO simplify
      const year =
        selectedWeek.startYear === selectedWeek.endYear
          ? selectedWeek.startYear
          : currentMonthNoOfDays < selectedWeek.startDay + (index % 7) &&
            selectedWeek.endMonth === 1
          ? selectedWeek.endYear
          : selectedWeek.startYear;
      const month =
        selectedWeek.startMonth === selectedWeek.endMonth
          ? selectedWeek.startMonth
          : currentMonthNoOfDays < selectedWeek.startDay + (index % 7)
          ? selectedWeek.endMonth
          : selectedWeek.startMonth;
      const dayNumber =
        selectedWeek.startMonth === selectedWeek.endMonth
          ? selectedWeek.startDay + (index % 7)
          : selectedWeek.startDay + (index % 7) > currentMonthNoOfDays
          ? (index % 7) - (currentMonthNoOfDays - selectedWeek.startDay)
          : selectedWeek.startDay + (index % 7);
      const hour = Math.trunc(index / 7) - 1;

      const result = {
        year,
        month,
        dayNumber,
        class: "day",
        hour,
        events: makeEventsForHour(year, month, dayNumber, hour, events),
      };
      return result;
    });
  return selectedWeekDays;
};
