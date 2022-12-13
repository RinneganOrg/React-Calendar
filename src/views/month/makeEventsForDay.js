import moment from "moment";

/**
 * Will make an array containing last days of previous month, all days of current month and first days of next month
 * depending on when does the first/last day of current month occur during week
 * (if 1 is Monday => no previous month days, 31 is Sunday => no next month days)
 * @param {Number} selectedMonthIndex
 * @returns
 */
export const makeEventsForDay = (year, month, dayNumber, events) =>
  events.filter((event) => {
    return (
      moment(event.startDate).date() === dayNumber &&
      moment(event.startDate).month() + 1 === month &&
      moment(event.startDate).year() === year
    );
  });
