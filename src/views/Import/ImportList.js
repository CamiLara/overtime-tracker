import Button from '@material-ui/core/Button';
import { green } from '@material-ui/core/colors';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles } from "@material-ui/core/styles";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import MaterialTable from 'material-table';
import moment from 'moment';
import React, { Component } from "react";
import TogglImporter from 'utils/togglImport';
import SimpleDialog from './EntryImportButton';


const newStyles = {
  ...styles,
  root: {
    lineHeight: 1,
    padding: 'dense'
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  buttonImport: {
    marginBottom: '10px',
    marginRight: '10px'
  },
  buttonReset: {
    marginBottom: '10px',
    marginRight: '10px'
  },
  sizeSmall: {
    padding: 0
  }
}

class Entry {

  constructor(start, stop, description, duration, tags) {
    this.start = start;
    this.stop = stop;
    this.description = description;
    this.duration = duration;
    this.tags = tags;
  }

  static from(json) {
    return Object.assign(new Entry(), { ...json });
  }
}

class ImportList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          title: 'Start',
          field: 'start',
          defaultSort: 'desc',
          render: rowData => <p>{moment(rowData.start).format("LLLL")}</p>
        },
        {
          title: 'End',
          field: 'end',
          render: rowData => <p>{moment(rowData.end).format("LLLL")}</p>
        },
        { title: 'Project', field: 'project' },
        {
          title: 'Duration',
          field: 'dur',
          render: rowData => {
            var duration = parseFloat(rowData.dur / (1000 * 60 * 60)).toFixed(2);
            return (<p>{duration}</p>)
          }

        },
        { title: 'Description', field: 'description' },
      ],
      selectedValue: '',
      open: false
    }
  }

  async componentDidMount() {
    const togglImport = new TogglImporter();
    const data = await togglImport.get();
    this.setState({
      data: data
    });
  }

  async handleClickOpen() {
    this.setState({ loading: true });

    const togglImport = new TogglImporter();
    await togglImport.import();
    const data = await togglImport.get();

    this.setState({
      data: data,
      loading: false
    });
  }

  async handleResetOpen() {
    this.setState({ loading: true });
    const togglImport = new TogglImporter();
    var removed = await togglImport.reset();
    const data = await togglImport.get();
    this.setState({
      data: data,
      loading: false
    });
  }

  handleClose() {
    this.setState({ open: false });
  }

  render() {
    const { classes } = this.props;
    const { selectedValue, open, loading } = this.state;

    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}><Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Import Toggl data</h4>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <Button variant="contained" className={classes.buttonImport} color="primary" onClick={this.handleClickOpen.bind(this)}>Import</Button>
                  <Button variant="contained" className={classes.buttonReset} color="secondary" onClick={this.handleResetOpen.bind(this)}>Reset</Button>

                  {loading && <LinearProgress />}
                  <SimpleDialog selectedValue={selectedValue} open={open} onClose={this.handleClose.bind(this)} />
                  <MaterialTable
                    className={classes.root}
                    style={{
                      lineHeight: 1,
                      padding: 0
                    }}
                    style={{
                      lineHeight: 1,
                      padding: 'dense'
                    }}
                    cellStyle={{
                      lineHeight: 1,
                      padding: 'dense'
                    }}
                    options={{
                      pageSize: 50,
                      padding: 'dense',
                      style: {
                        lineHeight: 1,
                        padding: 'dense'
                      },
                      headerStyle: {
                      },
                      cellStyle: {
                        lineHeight: 1,
                        padding: 0
                      },
                      rowStyle: {
                        lineHeight: 1,
                        padding: 'dense',
                        height: '10px'
                      }
                    }}

                    title=""
                    columns={this.state.columns}
                    data={this.state.data}
                  />
                </GridItem>
              </GridContainer>
            </CardBody>
          </Card>
          </GridItem>
        </GridContainer></div>
    )
  }
}

export default withStyles(newStyles)(ImportList);
