import moment from "moment";
import { previousMonthDisabledDays } from "./previousMonthDisabledDays";
import { nextMonthDisabledDays } from "./nextMonthDisabledDays";

export const makeIntervalToFetchMonthEvents = (
  selectedMonth,
  selectedYear,
  events
) => {
  const {
    year: yearForPreviousMonth,
    month: monthForPreviousMonth,
    dayNumber: dayNumberForPreviousMonth,
  } = previousMonthDisabledDays(selectedMonth.key, selectedYear, events)[0] || {};
  const nextDisabledDays = nextMonthDisabledDays(
    selectedMonth,
    selectedMonth.key,
    selectedYear,
    events
  );
  const {
    year: yearForNextMonth,
    month: monthForNextMonth,
    dayNumber: dayNumberForNextMonth,
  } = nextDisabledDays[nextDisabledDays.length - 1];
  return {
    startDate: yearForPreviousMonth ? moment([
      yearForPreviousMonth,
      monthForPreviousMonth - 1,
      dayNumberForPreviousMonth,
    ]) : moment([
      selectedYear,
      selectedMonth.key,
      1,
    ]),
    endDate: moment([
      yearForNextMonth,
      monthForNextMonth - 1,
      dayNumberForNextMonth,
    ]),
  };
};
