import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
// @material-ui/core
import { withStyles } from "@material-ui/core/styles";
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import WorkIcon from '@material-ui/icons/Work';
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import GridContainer from "components/Grid/GridContainer.js";
// core components
import GridItem from "components/Grid/GridItem.js";
import HoursWorked from "components/Toggl/HoursWorked";
import LatestItems from "components/Toggl/LatestItems";
import Statistic from "components/Toggl/stats";
import _ from "lodash";
import moment from 'moment';
import React, { Component } from "react";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
import { getAllStats, getLatestEntries, getMonthlyStats, getWeeklyStats, getYearlyStats } from 'utils/overtimeChartsHelper';
import overtimeHelper from 'utils/overtimeHelper';
import { completedTasksChart, dailySalesChart, dailyTimesheets, emailsSubscriptionChart } from "variables/charts.js";

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
      },
      thisWeek: {
        labels: [],
        series: []
      },
      open: false
    };
  }


  async componentDidMount() {
    this.setState({ latestItems: await getLatestEntries() });

    const { chartData: weeklyChart, totalLastWeek, totalThisWeek } = await getWeeklyStats();
    const { chartData: monthlyChart, totalLastMonth, totalThisMonth } = await getMonthlyStats();
    const { chartData: yearlyChart, totalLastYear, totalThisYear } = await getYearlyStats();

    this.setState({ thisWeek: weeklyChart, totalLastWeek: totalLastWeek, totalThisWeek: totalThisWeek });
    this.setState({ thisMonth: monthlyChart, totalThisMonth: totalThisMonth, totalLastMonth: totalLastMonth });
    this.setState({ yearToDate: yearlyChart, totalThisYear: totalThisYear, totalLastYear: totalLastYear });
    this.setState({ allTime: await getAllStats() });
  }

  compareWithLastYear(thisWeek = 0, lastWeek = 0, classes) {
    if (thisWeek === 0 && lastWeek === 0)
      return (<CardBody>
        <h4 className={classes.cardTitle}> This year </h4>{" "}
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
      {evolution} in comparison with the previous period.{" "}
    </p>);

    return (<CardBody>
      <h4 className={classes.cardTitle}> This year </h4>{" "}
      {abc}
    </CardBody>)
  }

  compareWithLastMonth(thisWeek = 0, lastWeek = 0, classes) {
    if (thisWeek === 0 && lastWeek === 0)
      return (<CardBody>
        <h4 className={classes.cardTitle}> This month </h4>{" "}
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
      {evolution} in comparison with the previous period.{" "}
    </p>);

    return (<CardBody>
      <h4 className={classes.cardTitle}> This month </h4>{" "}
      {abc}
    </CardBody>)
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
      {evolution} in comparison with the previous period.{" "}
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

    this.setState({ [name]: value });
  }

  render() {
    const { classes } = this.props;
    const {
      latestItems,
      thisWeek,
      yearToDate,
      thisMonth,
      allTime,
      totalLastWeek,
      totalThisWeek,
      totalLastMonth,
      totalThisMonth,
      totalThisYear,
      totalLastYear,
      open } = this.state;

    const dailyTimesheetsOptions = {
      ...dailyTimesheets.options,
      high: Math.max.apply(null, _(thisWeek.series).max(y => _(y).max())) + 2,
      low: Math.min.apply(null, _(thisWeek.series).min(y => _(y).min())) - 2
    }

    const revisedDailyTimesheets = {
      ...dailyTimesheets,
      options: dailyTimesheetsOptions
    }

    const monthlyTimesheetsOptions = {
      ...dailySalesChart.options,
      high: Math.max.apply(null, _(thisMonth.series).max(y => _(y).max())) + 2,
      low: Math.min.apply(null, _(thisMonth.series).min(y => _(y).min())) - 2
    }

    const revisedMonthlyTimesheets = {
      ...dailySalesChart,
      options: monthlyTimesheetsOptions
    }

    const totalToday = thisWeek && thisWeek.length > 1 && thisWeek.series[1][moment().day()] || 0;

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
                    InputLabelProps={{ shrink: true }}
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
            <Statistic title="today" value={(totalToday || 0).toFixed(2)}>
              {" "}
            </Statistic>{" "}
          </GridItem>{" "}
          <GridItem xs={12} sm={6} md={3}>
            <Statistic title="this week" value={(totalThisWeek || 0).toFixed(2)}>
              {" "}
            </Statistic>{" "}
          </GridItem>{" "}
          <GridItem xs={12} sm={6} md={3}>
            <Statistic title="this month" value={(totalThisMonth || 0).toFixed(2)}>
              {" "}
            </Statistic>{" "}
          </GridItem>{" "}
          <GridItem xs={12} sm={6} md={3}>
            <Statistic title="this year" value={(totalThisYear || 0).toFixed(2)}>
              {" "}
            </Statistic>{" "}
          </GridItem > {" "}
        </GridContainer > {" "}
        < GridContainer >
          <GridItem xs={12} sm={12} md={4}>
            <Card chart>
              <CardHeader color="success">
                <ChartistGraph
                  className="ct-chart"
                  data={thisWeek}
                  type="Line"
                  options={revisedDailyTimesheets.options}
                  listener={revisedDailyTimesheets.animation}
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
                  options={revisedMonthlyTimesheets.options}
                  listener={revisedMonthlyTimesheets.animation}
                />{" "}
              </CardHeader>
              {" "}
              {this.compareWithLastMonth(totalThisMonth, totalLastMonth, classes)}
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
              {this.compareWithLastYear(totalThisYear, totalLastYear, classes)}
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
        </GridContainer > {" "}
        < GridContainer >
          <GridItem xs={12} sm={12} md={6}>
            <CustomTabs
              title="Tasks:"
              headerColor="primary"
              tabs={[
                {
                  tabName: "Hours worked",
                  tabIcon: WorkIcon,
                  tabContent: <HoursWorked data={latestItems}> </HoursWorked>
                }
              ]}
            />{" "}
          </GridItem>{" "}
          <GridItem xs={12} sm={12} md={6}>
            <LatestItems data={latestItems}> </LatestItems>{" "}
          </GridItem>{" "}
        </GridContainer > {" "}
      </div >
    );
  }
}

export default withStyles(newStyles)(Dashboard);
