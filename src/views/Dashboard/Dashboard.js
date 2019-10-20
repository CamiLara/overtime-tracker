import React, { Component } from "react";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { withStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Store from "@material-ui/icons/Store";
import Warning from "@material-ui/icons/Warning";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import AccessTime from "@material-ui/icons/AccessTime";
import Accessibility from "@material-ui/icons/Accessibility";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Tasks from "components/Tasks/Tasks.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Danger from "components/Typography/Danger.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import Statistic from "components/Toggl/stats";
import togglClient from "utils/togglClient";
import LatestItems from "components/Toggl/LatestItems";
import HoursWorked from "components/Toggl/HoursWorked";
import { bugs, website, server } from "variables/general.js";
import _ from "lodash";
import {
  dailyTimesheets,
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart
} from "variables/charts.js";
import { getLatestEntries, getMonthlyStats, getAllStats, getYearlyStats, getWeeklyStats } from 'utils/overtimeChartsHelper';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import NavigationIcon from '@material-ui/icons/Navigation';
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import moment from 'moment';
import overtimeHelper from 'utils/overtimeHelper';
const newStyles = (theme) => {
  return {
    ...styles,
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    dense: {
      marginTop: theme.spacing(2),
    },
  }
}
class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latestItems: [],
      yearToDate: {
        labels: [],
        series: []
      },
      thisMonth: {
        labels: [],
        series: []
      },
      allTime: {
        labels: [],
        series: []
      }
    };
  }


  async componentDidMount() {
    this.setState({ latestItems: await getLatestEntries() });

    const { chartData, totalLastWeek, totalThisWeek } = await getWeeklyStats();
    this.setState({ thisWeek: chartData, totalLastWeek: totalLastWeek, totalThisWeek: totalThisWeek });
    this.setState({ thisMonth: await getMonthlyStats() });
    this.setState({ yearToDate: await getYearlyStats() });
    this.setState({ allTime: await getAllStats() });
  }

  compareWithLastWeek(thisWeek, lastWeek, classes) {
    if (!thisWeek || !lastWeek)
      return (<CardBody>
        <h4 className={classes.cardTitle}> This week </h4>{" "}
      </CardBody>)

    const getPercentageChange = (oldNumber, newNumber) => {
      var decreaseValue = oldNumber - newNumber;
      return (decreaseValue / oldNumber) * 100;
    }

    const isSame = thisWeek === lastWeek;
    const isIncreasing = thisWeek > lastWeek;
    const evolution = isIncreasing ? "increase" : "decrease";
    const rate = getPercentageChange(thisWeek, lastWeek).toFixed(2);

    var abc = (<p className={classes.cardCategory}>
      <span className={classes.successText}>
        <ArrowUpward className={isIncreasing ? classes.upArrowCardCategory : classes.downArrowCardCategory} />
        {rate}%{" "}
      </span>{" "}
      {evolution} in worked time.{" "}
    </p>);

    return (<CardBody>
      <h4 className={classes.cardTitle}> This week </h4>{" "}
      {abc}
    </CardBody>)
  }

  handleClickOpen() {
    this.setState({ open: true });
  }

  async handleClose() {
    this.setState({ open: false });
    const togglImport = new overtimeHelper();
    const { date, overtime } = this.state;
    await togglImport.save({ date: new Date(date), overtime: parseFloat(overtime) });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  render() {
    const { classes } = this.props;
    const { latestItems, thisWeek, yearToDate, thisMonth, allTime, totalLastWeek, totalThisWeek, open } = this.state;


    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Button variant="contained" color="primary" onClick={this.handleClickOpen.bind(this)}><AddIcon /> Register overtime</Button>
          </GridItem>{" "}
          <Dialog open={open} onClose={this.handleClose.bind(this)} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Overtime</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To add overtime, please select a date and enter the amount.
          </DialogContentText>
              <form className={classes.form} noValidate>
                <FormControl className={classes.formControl}>
                  <TextField
                    id="date"
                    label="Date"
                    name="date"
                    type="date"
                    defaultValue={moment().format("YYYY-MM-DD")}
                    className={classes.textField}
                    InputLabelProps={{
                      shrink: true
                    }}
                    onChange={this.handleInputChange.bind(this)}
                  />
                </FormControl>

                <FormControl className={classes.formControl}>
                  <TextField
                    className={classes.textField}
                    id="filled-number"
                    name="overtime"
                    label="Number"
                    type="number"
                    inputProps={{ min: "0", max: "24", step: "0.25" }}
                    InputLabelProps={{
                      shrink: true
                    }}
                    onChange={this.handleInputChange.bind(this)}
                  />
                </FormControl>
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose.bind(this)} color="primary">
                Cancel
          </Button>
              <Button onClick={this.handleClose.bind(this)} color="primary">
                Submit
          </Button>
            </DialogActions>
          </Dialog>
          <GridItem xs={12} sm={6} md={3}>
            <Statistic title="today" value="10">
              {" "}
            </Statistic>{" "}
          </GridItem>{" "}
          <GridItem xs={12} sm={6} md={3}>
            <Statistic title="this week" value="10">
              {" "}
            </Statistic>{" "}
          </GridItem>{" "}
          <GridItem xs={12} sm={6} md={3}>
            <Statistic title="this month" value="10">
              {" "}
            </Statistic>{" "}
          </GridItem>{" "}
          <GridItem xs={12} sm={6} md={3}>
            <Statistic title="this year" value="10">
              {" "}
            </Statistic>{" "}
          </GridItem>{" "}
        </GridContainer>{" "}
        <GridContainer>
          <GridItem xs={12} sm={12} md={4}>
            <Card chart>
              <CardHeader color="success">
                <ChartistGraph
                  className="ct-chart"
                  data={thisWeek}
                  type="Line"
                  options={dailyTimesheets.options}
                  listener={dailyTimesheets.animation}
                />{" "}
              </CardHeader>{" "}
              {" "}

              {this.compareWithLastWeek(totalThisWeek, totalLastWeek, classes)}
            </Card>{" "}
          </GridItem>{" "}
          <GridItem xs={12} sm={12} md={4}>
            <Card chart>
              <CardHeader color="success">
                <ChartistGraph
                  className="ct-chart"
                  data={thisMonth}
                  type="Line"
                  options={dailySalesChart.options}
                  listener={dailySalesChart.animation}
                />{" "}
              </CardHeader>{" "}
              <CardBody>
                <h4 className={classes.cardTitle}> This month </h4>{" "}
                <p className={classes.cardCategory}>
                  <span className={classes.successText}>
                    <ArrowUpward className={classes.upArrowCardCategory} /> 55%{" "}
                  </span>{" "}
                  increase in today sales.{" "}
                </p>{" "}
              </CardBody>{" "}
            </Card>{" "}
          </GridItem>{" "}
          <GridItem xs={12} sm={12} md={4}>
            <Card chart>
              <CardHeader color="warning">
                <ChartistGraph
                  className="ct-chart"
                  data={yearToDate}
                  type="Bar"
                  options={emailsSubscriptionChart.options}
                  responsiveOptions={emailsSubscriptionChart.responsiveOptions}
                  listener={emailsSubscriptionChart.animation}
                />{" "}
              </CardHeader>{" "}
              <CardBody>
                <h4 className={classes.cardTitle}> Year to date </h4>{" "}
                <p className={classes.cardCategory}>
                  {" "}
                  Last Campaign Performance{" "}
                </p>{" "}
              </CardBody>{" "}
            </Card>{" "}
          </GridItem>{" "}
          <GridItem xs={12} sm={12} md={12}>
            <Card chart>
              <CardHeader color="danger">
                <ChartistGraph
                  className="ct-chart"
                  data={allTime}
                  type="Bar"
                  options={completedTasksChart.options}
                  responsiveOptions={completedTasksChart.responsiveOptions}
                  listener={completedTasksChart.animation}
                />{" "}
              </CardHeader>{" "}
              <CardBody>
                <h4 className={classes.cardTitle}> All time </h4>{" "}
                <p className={classes.cardCategory}>
                  {" "}
                  Last Campaign Performance{" "}
                </p>{" "}
              </CardBody>{" "}
            </Card>{" "}
          </GridItem>{" "}
        </GridContainer>{" "}
        <GridContainer>
          <GridItem xs={12} sm={12} md={6}>
            <CustomTabs
              title="Tasks:"
              headerColor="primary"
              tabs={[
                {
                  tabName: "Hours worked",
                  tabIcon: BugReport,
                  tabContent: <HoursWorked data={latestItems}> </HoursWorked>
                },
                {
                  tabName: "Website",
                  tabIcon: Code,
                  tabContent: (
                    <Tasks
                      checkedIndexes={[0]}
                      tasksIndexes={[0, 1]}
                      tasks={website}
                    />
                  )
                },
                {
                  tabName: "Server",
                  tabIcon: Cloud,
                  tabContent: (
                    <Tasks
                      checkedIndexes={[1]}
                      tasksIndexes={[0, 1, 2]}
                      tasks={server}
                    />
                  )
                }
              ]}
            />{" "}
          </GridItem>{" "}
          <GridItem xs={12} sm={12} md={6}>
            <LatestItems data={latestItems}> </LatestItems>{" "}
          </GridItem>{" "}
        </GridContainer>{" "}
      </div >
    );
  }
}

export default withStyles(newStyles)(Dashboard);
