export const firstAndLastDayOfTheWeek = (date) => {
  const currentDay = new Date(date);
  const firstDayOffset =
    currentDay.getDate() -
    currentDay.getDay() +
    (currentDay.getDay() === 0 ? -6 : 1);
  const firstDay = new Date(currentDay.setDate(firstDayOffset));
  const lastDay = new Date(firstDay);
  lastDay.setDate(lastDay.getDate() + 6);

  return {
    startYear: new Date(firstDay).getFullYear(),
    startMonth: new Date(firstDay).getMonth() + 1,
    startDay: new Date(firstDay).getDate(),
    endYear: new Date(lastDay).getFullYear(),
    endMonth: new Date(lastDay).getMonth() + 1,
    endDay: new Date(lastDay).getDate(),
  };
};
