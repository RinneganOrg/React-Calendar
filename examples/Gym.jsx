import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Portal } from 'react-portal'
import { useSelector, useDispatch } from 'react-redux'
import EditButton from '../buttons/EditButton';
import AccessCoursesButton from "../buttons/AccessCoursesButton";
import AccessTrainersButton from "../buttons/AccessTrainersButton";
import Comments from "../comments/Comments";
import GymGraphScatter from "../GymGraphScatter";
import { Image, Menu, Icon, Grid, List, Divider, Header } from 'semantic-ui-react'
import GymBarGraphHorizontal from "../GymBarGraphHorizontal";
import CoursesCalendar from "../CoursesCalendar";
import '../../gymsStyle.css'
import { setGyms } from '../../store/actions/gyms'
import { useAuth } from '../../Utils/context';

const Gym = () => {
  const { gymId } = useParams();
  const dispatch = useDispatch()
  const gymToDisplay = useSelector(state =>
    state.gyms.gyms
      .find(gym => gym._id + '' === gymId)
  )
  const location = useLocation()
  const selectIsToolbarReady = state => state.toolbar
  const { isToolbarReady } = useSelector(selectIsToolbarReady)

  const [selectedMonth, setSelectedMonth] = useState(1)
  const [displayedSection, setDisplayedSection] = useState("reviews")

  const handleChangeCourseBars = (month) => {
    setSelectedMonth(month)
  }
  const changeDisplayedSection = (section) => {
    setDisplayedSection(section)
  }
  let auth = useAuth()
  useEffect(
    () => {
      dispatch(setGyms())
    }
    ,
    []
  )
  return (
    <>
      {gymToDisplay ?
        <>
          <Grid className="gym-grid">
            <Grid.Column width={13} className="gymInformation">
              <Image src={gymToDisplay.image} className="gym-image" />
            </Grid.Column>
            <Grid.Column width={3}>
              <Header as="h1" className="gym-header">{gymToDisplay.name}</Header>
              <Divider />
              <List size="maassive">
                <List.Item className="gym-icon">
                  <Image avatar size="mini" src='https://icon-library.com/images/weight-lifting-icon/weight-lifting-icon-12.jpg' />
                  <List.Content>
                    <List.Header className="list-header-gym">Strenght</List.Header>
                  </List.Content>
                </List.Item>
                <List.Item className="gym-icon">
                  <Image avatar size="mini" src='https://i.pinimg.com/favicons/c6f00f8d1530320fd05c4d4c6f12e5e076d7efa0d1a97956d528c936.png?592630392bec75ce2d448ffa008a719d' />
                  <List.Content>
                    <List.Header className="list-header-gym">Cardio</List.Header>
                  </List.Content>
                </List.Item>
                <List.Item className="gym-icon">
                  <Image avatar size="mini" src='data:image/png;base64,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' />
                  <List.Content>
                    <List.Header className="list-header-gym">Yoga</List.Header>
                  </List.Content>
                </List.Item>
                <List.Item className="gym-icon">
                  <Image avatar size="mini" src='https://cdn.iconscout.com/icon/free/png-256/swimming-man-swim-activity-swimmer-pool-sport-46453.png' />
                  <List.Content>
                    <List.Header className="list-header-gym">Swimming</List.Header>
                  </List.Content>
                </List.Item>
              </List>
            </Grid.Column>
            <Grid.Row>
              <Header as="h5" className="gym-header">{gymToDisplay.description}</Header>
            </Grid.Row>
          </Grid>

          {isToolbarReady &&
            <>
              {document.getElementById("operationSection") ?
                <Portal node={document.getElementById("operationSection")}>
                  <Menu.Item>
                    <EditButton path={location.pathname} />
                  </Menu.Item>
                </Portal> : null}
              <Portal node={document.getElementById("childrenSection")}>
                <Menu.Item>
                  <AccessTrainersButton path={location.pathname} />
                </Menu.Item>
                <Menu.Item>
                  <AccessCoursesButton path={location.pathname} />
                </Menu.Item>
              </Portal>
              <Portal node={document.getElementById("contentSection")}>
                <Menu.Item>
                  <Icon
                    name="calendar alternate outline"
                    size="big"
                    color="black"
                    onClick={() => changeDisplayedSection("calendar")} />
                </Menu.Item>
                <Menu.Item>
                  <Icon
                    name="thumbs up outline"
                    size="big"
                    color="black"
                    onClick={() => changeDisplayedSection("reviews")} />
                </Menu.Item>
                {auth && auth.role === "admin" ?
                  <Menu.Item>
                    <Icon
                      name="chart line"
                      size="big"
                      color="black"
                      onClick={() => changeDisplayedSection("graphs")} />
                  </Menu.Item> : null}
              </Portal>
            </>}
          {displayedSection === "calendar" ?
            <CoursesCalendar gymId={gymId} /> :
            displayedSection === "graphs" ?
              <>
                <GymBarGraphHorizontal gymId={gymId} selectedMonth={selectedMonth} />
                <GymGraphScatter gymId={gymId} handleChangeCourseBars={handleChangeCourseBars} />
              </> :
              <Comments gymId={gymToDisplay._id} />
          }
        </> : null}
    </>
  );
}
export default Gym;