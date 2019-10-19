import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Table from "../Table/Table.js";
import Card from "../Card/Card.js";
import CardHeader from "../Card/CardHeader.js";
import CardBody from "../Card/CardBody.js";
import _ from 'lodash';
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import TagFacesIcon from '@material-ui/icons/TagFaces';

class LatestItems extends Component {
    formatDate(dateString) {
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        const date = new Date(dateString);
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }

    formatTime(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return hDisplay + mDisplay + sDisplay;
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB')
    }

    render() {
        const { data, classes } = this.props;
        var latestItemsFormatted = _(data)
            .map(x => {
                const { start, end, client, description } = x;
                return [this.formatDateTime(start), this.formatDateTime(end), client, description];
            })
            .take(6)
            .value();

        return (
            <Card>
                <CardHeader color="warning">
                    <h4 className={classes.cardTitleWhite}>Latest Entries</h4>
                    <p className={classes.cardCategoryWhite}>
                        Most recent entries on {this.formatDateTime(new Date())}
                    </p>
                </CardHeader>
                <CardBody>
                    <Table
                        tableHeaderColor="warning"
                        tableHead={["Start", "End", "Client", "Description"]}
                        tableData={latestItemsFormatted}
                    />
                </CardBody>
            </Card>);
    }
}

export default withStyles(styles)(LatestItems);
