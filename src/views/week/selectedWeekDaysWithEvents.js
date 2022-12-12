import { makeEventsForHour } from "./makeEventsForHour";

export const selectedWeekDaysWithEvents = (selectedWeek, events) => {
  const selectedWeekDays = Array(200)
    .fill(0)
    .map((_, index) => {
      const currentMonthNoOfDays = new Date(
        selectedWeek.startYear,
        selectedWeek.startMonth,
        0
      ).getDate();
      const isSameYear = selectedWeek.startYear === selectedWeek.endYear;
      const isNextYear =
        currentMonthNoOfDays < selectedWeek.startDay + ((index % 8) - 1) &&
        selectedWeek.endMonth === 1;

      const year = isSameYear
        ? selectedWeek.startYear
        : isNextYear
        ? selectedWeek.endYear
        : selectedWeek.startYear;

      const isSameMonth = selectedWeek.startMonth === selectedWeek.endMonth;
      const isNextMonth =
        currentMonthNoOfDays < selectedWeek.startDay + ((index % 8) - 1);

      const month = isSameMonth
        ? selectedWeek.startMonth
        : isNextMonth
        ? selectedWeek.endMonth
        : selectedWeek.startMonth;

      const dayNumber = isSameMonth
        ? selectedWeek.startDay + ((index % 8) - 1)
        : isNextMonth
        ? (index % 8) - 1 - (currentMonthNoOfDays - selectedWeek.startDay)
        : selectedWeek.startDay + ((index % 8) - 1);

      const hour = Math.trunc(index / 8) - 1;

      const result =
        index % 8 === 0
          ? hour >= 0
            ? { hour }
            : {}
          : {
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

// export const selectedWeekDaysWithEvents = (selectedWeek, events) => {
//   const selectedWeekDays = Array(175)
//     .fill(0)
//     .map((_, index) => {
//       const currentMonthNoOfDays = new Date(
//         selectedWeek.startYear,
//         selectedWeek.startMonth,
//         0
//       ).getDate();
//       const isSameYear = selectedWeek.startYear === selectedWeek.endYear;
//       const isNextYear =
//         currentMonthNoOfDays < selectedWeek.startDay + (index % 7) &&
//         selectedWeek.endMonth === 1;

//       const year = isSameYear
//         ? selectedWeek.startYear
//         : isNextYear
//         ? selectedWeek.endYear
//         : selectedWeek.startYear;

//       const isSameMonth = selectedWeek.startMonth === selectedWeek.endMonth;
//       const isNextMonth =
//         currentMonthNoOfDays < selectedWeek.startDay + (index % 7 );

//       const month = isSameMonth
//         ? selectedWeek.startMonth
//         : isNextMonth
//         ? selectedWeek.endMonth
//         : selectedWeek.startMonth;

//       const dayNumber = isSameMonth
//         ? selectedWeek.startDay + (index % 7 )
//         : isNextMonth
//         ? (index % 7 ) - (currentMonthNoOfDays - selectedWeek.startDay)
//         : selectedWeek.startDay + (index % 7 );

//       const hour = Math.trunc(index / 7 ) - 1;

//       const result = {
//         year,
//         month,
//         dayNumber,
//         class: "day",
//         hour,
//         events: makeEventsForHour(year, month, dayNumber, hour, events),
//       };
//       return result;
//     });
//   return selectedWeekDays;
// };
