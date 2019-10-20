import React, { Component } from "react";
import MaterialTable from 'material-table';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { withStyles, makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { blue } from '@material-ui/core/colors';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import PropTypes from 'prop-types';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import SimpleDialog from './EntryImportButton';
import OvertimeHelper from 'utils/overtimeHelper';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green, red } from '@material-ui/core/colors';
import moment from 'moment';
import LinearProgress from '@material-ui/core/LinearProgress';
import Box from '@material-ui/core/Box';


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

class OvertimeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          title: 'Date',
          field: 'date',
          type: 'date',
          defaultSort: 'desc',
          render: rowData => <p>{moment(rowData.date).format("LLLL")}</p>
        },
        {
          title: 'Overtime',
          type: 'numeric',
          field: 'overtime',
        }
      ],
      selectedValue: '',
      open: false
    }
  }

  async componentDidMount() {
    const togglImport = new OvertimeHelper();      
    const data = await togglImport.get();

    this.setState({ data: data });
  }

  async handleClickOpen() {
    this.setState({ loading: true });

    const togglImport = new OvertimeHelper();
    await togglImport.save();
    const data = await togglImport.get();

    this.setState({
      data: data,
      loading: false
    });
  }

  async handleResetOpen() {
    this.setState({ loading: true });
    const togglImport = new OvertimeHelper();
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

          title="Overtime"
          columns={this.state.columns}
          data={this.state.data}
          editable={{
            isEditable: rowData => true,
            isDeletable: rowData => true,
            onRowAdd: newData =>
              new Promise((resolve, reject) => {
                var me = this;
                setTimeout(async () => {
                  {
                    const togglImport = new OvertimeHelper();
                    await togglImport.save(newData);
                    me.setState({ data: await togglImport.get() })
                  }
                  resolve();
                }, 1000);
              }),
            onRowUpdate: (newData, oldData) =>
              new Promise((resolve, reject) => {
                var me = this;
                setTimeout(async () => {
                  {
                    const togglImport = new OvertimeHelper();
                    await togglImport.save(newData);
                    me.setState({ data: await togglImport.get() })
                  }
                  resolve();
                }, 1000);
              }),
            onRowDelete: oldData =>
              new Promise((resolve, reject) => {
                var me = this;
                setTimeout(async () => {
                  {
                    const togglImport = new OvertimeHelper();
                    await togglImport.remove(oldData);
                    me.setState({ data: await togglImport.get() })
                  }
                  resolve();
                }, 1000);
              })
          }}
        />
      </div>
    )
  }
}

export default withStyles(newStyles)(OvertimeList);
