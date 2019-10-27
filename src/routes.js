import Dashboard from "@material-ui/icons/Dashboard";
import DashboardPage from "views/Dashboard/Dashboard.js";
import UserProfile from "views/UserProfile/UserProfile.js";
import TableList from "views/TableList/TableList.js";
import Typography from "views/Typography/Typography.js";
import Projects from "views/Projects/ProjectList.js";
import Maps from "views/Maps/Maps.js";
import NotificationsPage from "views/Notifications/Notifications.js";
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
    component: TableList,
    layout: "/"
  },
  {
    path: "/overtime",
    name: "Overtime",
    icon: DateRangeIcon,
    component: Projects,
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
