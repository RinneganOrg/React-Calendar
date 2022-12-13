import "./coursesCalendar.css";
import React, { useState } from "react";
import * as views from "./views";
import { INITIAL_VIEW } from "./constants";

const viewNames = Object.keys(views);

const BestCalendar = ({
  events = [],
  ModalPopUp,
  handleOpenModal,
  fetchEventsByInterval,
  getCurrentEventById,
  makeDefaultEvent,
  editEventData,
}) => {
  const [selectedView, setSelectedView] = useState(INITIAL_VIEW);

  const handleEdit = (eventId) => {
    getCurrentEventById(eventId);
    handleOpenModal();
  };
  const View = views[selectedView];
  return (
    <div>
      <View
        {...{
          selectedView,
          viewNames,
          setSelectedView,
          ModalPopUp,
          handleEdit,
          events,
          fetchEventsByInterval,
          editEventData,
          handleOpenModal,
          makeDefaultEvent,
        }}
      />
    </div>
  );
};

export default BestCalendar;
