import moment from "moment";

const addToStartDate = (eventStartDate, index) => {
  const day = new Date(eventStartDate).getDate() + index;
  const year = new Date(eventStartDate).getFullYear();
  const month = new Date(eventStartDate).getMonth() + 1;
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
  // const res = {
  //   ...acc,
  //   [`${addToStartDate(eventStartDate, diffDayIndex)}`]: {
  //     ...acc[`${addToStartDate(eventStartDate, diffDayIndex)}`],
  //     [parseInt(
  //       Object.keys(
  //         acc[`${addToStartDate(eventStartDate, diffDayIndex)}`]
  //       ).pop()
  //     ) + 1]: currentEvent,
  //   },
  // };
  return res;
};

const addDayNewEventOld = (acc, eventStartDate, diffDayIndex, currentEvent, startEndDateDiff) => {
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
  currentEvent,
  startEndDateDiff
) => {
  const res = {
    ...acc,
    [`${addToStartDate(eventStartDate, diffDayIndex)}`]: {
      [nextFreeIndex(startEndDateDiff, acc, eventStartDate)]: currentEvent,
      // 0: currentEvent,
    },
  };
  return res;
};

const isDayNewEventOld = (acc, eventStartDate, index) => {
  const a = acc[`${addToStartDate(eventStartDate, index - 1)}`];
  return a;
};

const nextFreeIndex = (startEndDateDiff, acc, eventStartDate) => {
  // will hold the next free index for every day (from startDate to endDate)
  const freeIndex = [];
  Array(startEndDateDiff + 1)
    .fill(0)
    .map((_, index) => {
      // Object.keys(acc).includes(addToStartDate(eventStartDate, index))
      //   ? freeIndex.push(
      //       parseInt(
      //         Object.keys(acc[`${addToStartDate(eventStartDate, index)}`]).pop()
      //       ) + 1
      //     )
      //   : freeIndex.push(0)
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

export default function eventsMatrix(events) {
  return events.reduce((acc, currentEvent) => {
    const startEndDateDiff =
      new Date(currentEvent.endDate).getDate() -
      new Date(currentEvent.startDate).getDate();
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
          : isDayNewEventOld(acc, eventStartDate, diffDayIndex)
          ? addDayNewEventOld(acc, eventStartDate, diffDayIndex, currentEvent, startEndDateDiff)
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
