import React, { useState } from "react";

const months = [
  { key: 0, daysInMonth: 31, value: 1, text: "January" },
  { key: 1, daysInMonth: 28, value: 2, text: "February" },
  { key: 2, daysInMonth: 31, value: 3, text: "March" },
  { key: 3, daysInMonth: 30, value: 4, text: "April" },
  { key: 4, daysInMonth: 31, value: 5, text: "May" },
  { key: 5, daysInMonth: 30, value: 6, text: "June" },
  { key: 6, daysInMonth: 31, value: 7, text: "July" },
  { key: 7, daysInMonth: 31, value: 8, text: "August" },
  { key: 8, daysInMonth: 30, value: 9, text: "September" },
  { key: 9, daysInMonth: 31, value: 10, text: "October" },
  { key: 10, daysInMonth: 30, value: 11, text: "November" },
  { key: 11, daysInMonth: 31, value: 12, text: "December" }
];
const daysOfTheWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const fillCalendarDays = (selectedMonthIndex) => {
  let selectedMonthItem = months[selectedMonthIndex];

  let selectedMonthDays = Array(selectedMonthItem.daysInMonth)
    .fill(0)
    .map((day, i) => ({
      dayNumber: i + 1,
      class: "day",
      month: selectedMonthIndex + 1
    }));

  let firstDayOfTheMonthDate = `${selectedMonthIndex + 1} 1 2021`;
  let firstDayOfTheMonthWeekIndex = new Date(firstDayOfTheMonthDate).getDay();

  const previousMonthDisabledDays = Array(
    firstDayOfTheMonthWeekIndex === 0 ? 6 : firstDayOfTheMonthWeekIndex - 1 // Sunday is 0 Saturday is 6
  )
    .fill(0)
    .map((previousMonthDisabledDay, i) => {
      const previousMonth = selectedMonthIndex > 0 ? months[selectedMonthIndex - 1] : months[11]; // if current month is Jan previous month is Dec

      return {
        dayNumber: previousMonth.daysInMonth - i,
        class: "day day--disabled",
        month: selectedMonthIndex
      }
    });

  let lastDayOfTheMonthDate = `${selectedMonthIndex + 1} ${selectedMonthItem.daysInMonth} 2021`;
  let lastDayOfTheMonthWeekIndex = new Date(lastDayOfTheMonthDate).getDay();

  let nextMonthDisabledDays = Array(7 - lastDayOfTheMonthWeekIndex)
    .fill(0)
    .map((nextMonthDisabledDay, i) => ({
      dayNumber: i + 1,
      class: "day day--disabled",
      month: selectedMonthIndex + 2
    }));

  const result = [
    ...previousMonthDisabledDays.reverse(),
    ...selectedMonthDays,
    ...nextMonthDisabledDays
  ];
  return result;
};

const CoursesCalendar = ({ gymId, userId }) => {
  const [selectedMonth, setCurrentMonth] = useState(
    months[new Date().getMonth()]
  );
  const [daysOfTheMonth, setDaysOfTheMonth] = useState(
    [fillCalendarDays(new Date().getMonth())]
  );

  const onChangeMonth = (monthSelection) => {
    setCurrentMonth(monthSelection);
    setDaysOfTheMonth(fillCalendarDays(monthSelection.key));
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>
          {selectedMonth.text}
          <button>▾</button>
        </h1>
        <p>2021</p>
      </div>
      <div>
        {months.map((month) => (
          <>
            <input
              type="radio"
              value={month.key}
              key={month.key}
              name="gender"
              checked={month.key === selectedMonth.key}
              onClick={() => onChangeMonth(month)}
            />
            {`${month.text} `}
          </>
        ))}
      </div>
      <div className="calendar">
        {daysOfTheWeek.map((dayOfTheWeek, i) => (
          <span key={i} className="day-name">
            {dayOfTheWeek}
          </span>
        ))}

        {daysOfTheMonth.map((dayOfTheMonth, i) => (
          <section
            key={i}
            className={dayOfTheMonth.class}
          >
            <div>{dayOfTheMonth.dayNumber}</div>
          </section>
        ))}
        <section className="task task--warning">Projects</section>
        <section className="task task--danger">Design Sprint</section>
        <section className="task task--primary">
          Product Checkup 1
          <div className="task__detail">
            <h2>Product Checkup 1</h2>
            <p>15-17th November</p>
          </div>
        </section>
        <section className="task task--info">Product Checkup 2</section>
      </div>
    </div>
  );
};

export default CoursesCalendar;
