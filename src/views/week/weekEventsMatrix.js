import moment from "moment";

const addToStartDate = (eventStartDate, index) => {
  const day = new Date(eventStartDate).getDate() + index;
  const year = new Date(eventStartDate).getFullYear();
  const month = new Date(eventStartDate).getMonth() + 1;
  return `${moment(new Date(`${month}, ${day}, ${year}`)).format(
    "YYYY-MM-DD"
  )}`;
};

const isDayOld = (acc, eventStartDate, diffDayIndex) => {
  const res = Object.keys(acc).includes(
    addToStartDate(eventStartDate, diffDayIndex)
  );
  return res;
};

const isDayOldEventOld = (acc, eventStartDate, diffDayIndex, currentEvent) => {
  const res = Object.values(
    acc[
      `${addToStartDate(
        eventStartDate,
        diffDayIndex > 0 ? diffDayIndex - 1 : diffDayIndex
      )}`
    ]
  ).includes(currentEvent);
  return res;
};

const addDayOldEventOld = (acc, eventStartDate, diffDayIndex, currentEvent) => {
  const res = {
    ...acc,
    [`${addToStartDate(eventStartDate, diffDayIndex)}`]: {
      ...acc[`${addToStartDate(eventStartDate, diffDayIndex)}`],
      [`${Object.keys(
        acc[`${addToStartDate(eventStartDate, diffDayIndex - 1)}`]
      ).pop()}`]: currentEvent,
    },
  };
  return res;
};

const addDayOldEventNew = (
  acc,
  eventStartDate,
  diffDayIndex,
  startEndDateDiff,
  currentEvent
) => {
  const res = {
    ...acc,
    [`${addToStartDate(eventStartDate, diffDayIndex)}`]: {
      ...acc[`${addToStartDate(eventStartDate, diffDayIndex)}`],
      [nextFreeIndex(startEndDateDiff, acc, eventStartDate)]: currentEvent,
    },
  };
  return res;
};

const isDayNewEventOld = (acc, eventStartDate, index, currentEvent) => {
  const a = acc[`${addToStartDate(eventStartDate, index - 1)}`];
  if (a) {
    return Object.values(a).includes(currentEvent);
  } else {
    return false;
  }
};

const addDayNewEventOld = (acc, eventStartDate, diffDayIndex, currentEvent) => {
  const res = {
    ...acc,
    [`${addToStartDate(eventStartDate, diffDayIndex)}`]: {
      [`${Object.keys(
        acc[`${addToStartDate(eventStartDate, diffDayIndex - 1)}`]
      ).pop()}`]: currentEvent,
      // [nextFreeIndex(startEndDateDiff, acc, eventStartDate)]: currentEvent,
    },
  };
  return res;
};

const addDayNewEventNew = (
  acc,
  eventStartDate,
  diffDayIndex,
  startEndDateDiff,
  currentEvent
) => {
  const res = {
    ...acc,
    [`${addToStartDate(eventStartDate, diffDayIndex)}`]: {
      [nextFreeIndex(startEndDateDiff, acc, eventStartDate)]: currentEvent,
    },
  };
  return res;
};

const nextFreeIndex = (startEndDateDiff, acc, eventStartDate) => {
  // will hold the next free index for every day (from startDate to endDate)
  const freeIndex = [];
  Array(startEndDateDiff + 1)
    .fill(0)
    .map((_, index) => {
      if (Object.keys(acc).includes(addToStartDate(eventStartDate, index))) {
        freeIndex.push(
          parseInt(
            Object.keys(acc[`${addToStartDate(eventStartDate, index)}`]).pop()
          ) + 1
        );
      } else {
        freeIndex.push(0);
      }
      return freeIndex;
    });
  return freeIndex.sort().reverse()[0];
};

export default function weekEventsMatrix(events) {
  const hourEvents = events.filter((event) => event.startHour !== null);
  return hourEvents.reduce((acc, currentEvent) => {
    const startEndDateDiff =
      new Date(currentEvent.endDate).getDate() -
      new Date(currentEvent.startDate).getDate();
    const diffDaysArray =
      startEndDateDiff > 0
        ? Array(startEndDateDiff + 1).fill(0)
        : Array(1).fill(0);
    let eventStartDate = new Date(currentEvent.startDate);
    diffDaysArray.map((_, diffDayIndex) => {
      return (acc = isDayOld(acc, eventStartDate, diffDayIndex)
        ? isDayOldEventOld(acc, eventStartDate, diffDayIndex, currentEvent)
          ? addDayOldEventOld(acc, eventStartDate, diffDayIndex, currentEvent)
          : addDayOldEventNew(
              acc,
              eventStartDate,
              diffDayIndex,
              startEndDateDiff,
              currentEvent
            )
        : isDayNewEventOld(acc, eventStartDate, diffDayIndex, currentEvent)
        ? addDayNewEventOld(acc, eventStartDate, diffDayIndex, currentEvent)
        : addDayNewEventNew(
            acc,
            eventStartDate,
            diffDayIndex,
            startEndDateDiff,
            currentEvent
          ));
    });
    return acc;
  }, {});
}
