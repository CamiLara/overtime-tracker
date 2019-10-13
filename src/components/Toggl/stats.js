import React from "react";
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader.js";
import CardIcon from "../Card/CardIcon.js";
import CardFooter from "../Card/CardFooter.js";
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
import Danger from "components/Typography/Danger.js";
import Warning from "@material-ui/icons/Warning";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
const useStyles = makeStyles(styles);

export default function Statistic({ title, value }) {
    const classes = useStyles();
    return (
        <Card>
            <CardHeader color="warning" stats icon>
                <p className={classes.cardCategory}>Hours worked {title}</p>
                <h3 className={classes.cardTitle}>
                    {value} <small>hours</small>
                </h3>
            </CardHeader>
        </Card>
    );
}

