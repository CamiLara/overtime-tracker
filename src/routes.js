import Dashboard from "@material-ui/icons/Dashboard";
import DashboardPage from "views/Dashboard/Dashboard.js";
import UserProfile from "views/Settings/UserProfile.js";
import ImportList from "views/Import/ImportList.js";
import OvertimeList from "views/Overtime/OvertimeList.js";
// core components/views for RTL layout
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import SettingsIcon from '@material-ui/icons/Settings';
import DateRangeIcon from '@material-ui/icons/DateRange';

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: Dashboard,
    component: DashboardPage,
    layout: "/"
  },
  {
    path: "/import",
    name: "Import",
    icon: CloudDownloadIcon,
    component: ImportList,
    layout: "/"
  },
  {
    path: "/overtime",
    name: "Overtime",
    icon: DateRangeIcon,
    component: OvertimeList,
    layout: "/"
  },
  {
    path: "/settings",
    name: "Settings",
    icon: SettingsIcon,
    component: UserProfile,
    layout: "/"
  }
];

export default dashboardRoutes;
