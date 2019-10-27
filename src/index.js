import React from "react";
import ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
import { Router, Route, Switch, Redirect } from "react-router-dom";

// core components
import Admin from "layouts/Admin.js";

import "font-awesome/css/font-awesome.min.css";
import "material-icons/iconfont/material-icons.css";
import "chartist/dist/chartist.min.css";

import "assets/css/material-dashboard-react.css?v=1.8.0";

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
