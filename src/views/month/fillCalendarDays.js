import { previousMonthDisabledDays } from "./previousMonthDisabledDays";
import { nextMonthDisabledDays } from "./nextMonthDisabledDays";
import { selectedMonthDaysWithEvents } from "./selectedMonthDaysWithEvents";
import { MONTHS } from "../../constants";

export const fillCalendarDays = (selectedMonthIndex, events, selectedYear) => {
  // check leap year
  const selectedMonthItem =
    selectedMonthIndex === 1
      ? selectedYear % 4 === 0
        ? { key: 1, daysInMonth: 29, value: 2, text: "February" }
        : { key: 1, daysInMonth: 28, value: 2, text: "February" }
      : MONTHS[selectedMonthIndex];
  const result = [
    ...previousMonthDisabledDays(selectedMonthIndex, selectedYear, events),
    ...selectedMonthDaysWithEvents(
      selectedMonthItem,
      selectedYear,
      selectedMonthIndex,
      events
    ),
    ...nextMonthDisabledDays(
      selectedMonthItem,
      selectedMonthIndex,
      selectedYear,
      events
    ),
  ];
  return result;
};
