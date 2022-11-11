import moment from "moment";

export const makeEventsForHour = (year, month, dayNumber, hour, events) =>
  events.filter((event) => {
    const isCorrectDay = moment(event.startDate).date() === dayNumber;
    const isCorrectMonth = moment(event.startDate).month() + 1 === month;
    const isCorrectYear = moment(event.startDate).year() === year;
    const isCorrectHour =
      !event.startHour && hour === -1
        ? true
        : moment(event.startHour, "HH:mm:ss").hour() === hour;
    return isCorrectDay && isCorrectMonth && isCorrectYear && isCorrectHour;
  });
