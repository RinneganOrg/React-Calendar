import moment from "moment";

const addToStartDate = (eventStartDate, index) => {
  const date = new Date(eventStartDate);
  date.setDate(date.getDate() + index);
  const day = new Date(date).getDate();
  const year = new Date(date).getFullYear();
  const month = new Date(date).getMonth() + 1;
  return moment(new Date(`${month}, ${day}, ${year}`)).format("YYYY-MM-DD");
};

const isDayOld = (acc, eventStartDate, diffDayIndex) => {
  return Object.keys(acc).includes(
    addToStartDate(eventStartDate, diffDayIndex)
  );
};

const isDayOldEventOld = (acc, eventStartDate, diffDayIndex, currentEvent) => {
  return Object.values(
    acc[
      `${addToStartDate(
        eventStartDate,
        diffDayIndex > 0 ? diffDayIndex - 1 : diffDayIndex
      )}`
    ]
  ).includes(currentEvent);
};

// if the event is found on the previous day, then set de index to the same from the previous day
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

// if the event isn't found on the previous day, then set the index to the last index of the current day + 1
const addDayOldEventNew = (
  acc,
  eventStartDate,
  diffDayIndex,
  currentEvent,
  startEndDateDiff
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

const addDayNewEventOld = (
  acc,
  eventStartDate,
  diffDayIndex,
  currentEvent,
  startEndDateDiff
) => {
  const res = {
    ...acc,
    [`${addToStartDate(eventStartDate, diffDayIndex)}`]: {
      [`${Object.keys(
        acc[`${addToStartDate(eventStartDate, diffDayIndex - 1)}`]
      ).pop()}`]: currentEvent,
    },
  };
  return res;
};

const addDayNewEventNew = (
  acc,
  eventStartDate,
  diffDayIndex,
  currentEvent,
  startEndDateDiff
) => {
  const res = {
    ...acc,
    [`${addToStartDate(eventStartDate, diffDayIndex)}`]: {
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

const nextFreeIndex = (startEndDateDiff, eventsMatrixDay, eventStartDate) => {
  // will hold the next free index for every day (from startDate to endDate)
  // const freeIndex = [];
  // Array(startEndDateDiff + 1)
  //   .fill(0)
  //   .map((_, index) => {
  //     if (Object.keys(eventsMatrixDay).includes(addToStartDate(eventStartDate, index))) {
  //       freeIndex.push(
  //         parseInt(
  //           Object.keys(eventsMatrixDay[`${addToStartDate(eventStartDate, index)}`]).pop()
  //         ) + 1
  //       );
  //     } else {
  //       freeIndex.push(0);
  //     }
  //     return freeIndex;
  //   });
  // const freeIndexArray = Array(startEndDateDiff + 1)
  //   .fill(0)
  //   .map((_, index) => {
  //     if (Object.keys(eventsMatrixDay).includes(addToStartDate(eventStartDate, index))) {
  //       return (
  //         parseInt(
  //           Object.keys(eventsMatrixDay[`${addToStartDate(eventStartDate, index)}`]).pop()
  //         ) + 1
  //       );
  //     } else {
  //       return 0;
  //     }
  //   });
  // return freeIndexArray.sort().reverse()[0];
  const freeIndex = Array(startEndDateDiff + 1)
    .fill(0)
    .reduce((highestIndex, _, index) => {
      if (
        Object.keys(eventsMatrixDay).includes(
          addToStartDate(eventStartDate, index)
        )
      ) {
        const highestDayIndex =
          parseInt(
            Object.keys(
              eventsMatrixDay[`${addToStartDate(eventStartDate, index)}`]
            ).pop()
          ) + 1;
        return highestDayIndex > highestIndex ? highestDayIndex : highestIndex;
      } else {
        return highestIndex;
      }
    }, 0);
  return freeIndex;
};

export default function eventsMatrix(events) {
  return events.reduce((acc, currentEvent) => {
    const startEndDateDiff =
      (new Date(currentEvent.endDate).getTime() -
        new Date(currentEvent.startDate).getTime()) /
      (1000 * 3600 * 24);
    const diffArray =
      startEndDateDiff > 0
        ? Array(startEndDateDiff + 1).fill(0)
        : Array(1).fill(0);
    let eventStartDate = new Date(currentEvent.startDate);
    diffArray.map(
      (_, diffDayIndex) =>
        (acc = isDayOld(acc, eventStartDate, diffDayIndex)
          ? isDayOldEventOld(acc, eventStartDate, diffDayIndex, currentEvent)
            ? addDayOldEventOld(acc, eventStartDate, diffDayIndex, currentEvent)
            : addDayOldEventNew(
                acc,
                eventStartDate,
                diffDayIndex,
                currentEvent,
                startEndDateDiff
              )
          : isDayNewEventOld(acc, eventStartDate, diffDayIndex, currentEvent)
          ? addDayNewEventOld(
              acc,
              eventStartDate,
              diffDayIndex,
              currentEvent,
              startEndDateDiff
            )
          : addDayNewEventNew(
              acc,
              eventStartDate,
              diffDayIndex,
              currentEvent,
              startEndDateDiff
            ))
    );
    return acc;
  }, {});
}
