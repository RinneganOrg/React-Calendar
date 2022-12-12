import { previousMonthDisabledDays } from "./previousMonthDisabledDays";
import { nextMonthDisabledDays } from "./nextMonthDisabledDays";
import { selectedMonthDaysWithEvents } from "./selectedMonthDaysWithEvents";
import { MONTHS } from "../../constants";

export const fillCalendarDays = (selectedMonthIndex, events, selectedYear) => {
  const selectedMonthItem = MONTHS[selectedMonthIndex];
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