import "assets/css/material-dashboard-react.css?v=1.8.0";
import "chartist/dist/chartist.min.css";
import "font-awesome/css/font-awesome.min.css";
import { createBrowserHistory } from "history";
// core components
import Admin from "layouts/Admin.js";
import "material-icons/iconfont/material-icons.css";
import React from "react";
import ReactDOM from "react-dom";
import { Redirect, Route, Router, Switch } from "react-router-dom";

const hist = createBrowserHistory();

ReactDOM.render(
  <Router history={hist}>
    <Switch>
      <Route path="" component={Admin} />
      <Redirect from="" to="/dashboard" />
    </Switch>
  </Router>,
  document.getElementById("root")
);
